import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	ContentDurationFilterModel,
	ContentTypeFilterModel,
	ResourceLibraryContentModel,
	TagGroupModel,
	TagModel,
} from '@/lib/models';
import { buildQueryParamUrl } from '@/lib/utils';

export const resourceLibraryService = {
	getResourceLibrary() {
		return httpSingleton.orchestrateRequest<{
			contentsByTagGroupId: Record<string, ResourceLibraryContentModel[]>;
			tagGroups: TagGroupModel[];
			tagsByTagId: Record<string, TagModel>;
		}>({
			method: 'GET',
			url: '/resource-library',
		});
	},
	searchResourceLibrary(queryParameters?: { searchQuery?: string; pageNumber?: number; pageSize?: number }) {
		return httpSingleton.orchestrateRequest<{
			findResult: {
				contents: ResourceLibraryContentModel[];
				totalCount: number;
				totalCountDescription: string;
			};
			tagsByTagId: Record<string, TagModel>;
		}>({
			method: 'GET',
			url: buildQueryParamUrl('/resource-library/search', queryParameters),
		});
	},
	getResourceLibraryContentByTagGroupId(
		tagGroupId: string,
		queryParameters?: {
			pageNumber?: number;
			pageSize?: number;
			tagId?: string[];
			contentTypeId?: string[];
			contentDurationId?: string[];
			searchQuery?: string;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			findResult: {
				contents: ResourceLibraryContentModel[];
				totalCount: number;
				totalCountDescription: string;
			};
			tagGroup: TagGroupModel;
			tagsByTagId: Record<string, TagModel>;
		}>({
			method: 'GET',
			url: buildQueryParamUrl(`/resource-library/tag-groups/${tagGroupId}`, queryParameters),
		});
	},
	getResourceLibraryContentByTagId(
		tagId: string,
		queryParameters?: {
			pageNumber?: number;
			pageSize?: number;
			contentTypeId?: string[];
			contentDurationId?: string[];
			searchQuery?: string;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			findResult: {
				contents: ResourceLibraryContentModel[];
				totalCount: number;
				totalCountDescription: string;
			};
			tag: TagModel;
			tagGroup: TagGroupModel;
			tagsByTagId: Record<string, TagModel>;
		}>({
			method: 'GET',
			url: buildQueryParamUrl(`/resource-library/tags/${tagId}`, queryParameters),
		});
	},
	getResourceLibraryFiltersByTagGroupId(tagGroupId: string) {
		return httpSingleton.orchestrateRequest<{
			contentTypes: ContentTypeFilterModel[];
			contentDurations: ContentDurationFilterModel[];
			tags: TagModel[];
		}>({
			method: 'GET',
			url: `/resource-library/tag-group-filters/${tagGroupId}`,
		});
	},
	getResourceLibraryFiltersByTagId(tagId: string) {
		return httpSingleton.orchestrateRequest<{
			contentTypes: ContentTypeFilterModel[];
			contentDurations: ContentDurationFilterModel[];
		}>({
			method: 'GET',
			url: `/resource-library/tag-filters/${tagId}`,
		});
	},
};
