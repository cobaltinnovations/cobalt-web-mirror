import { httpSingleton } from '@/lib/singletons/http-singleton';
import { Content, ContentDuration, ContentType, Tag, TagGroup } from '@/lib/models';
import { buildQueryParamUrl } from '@/lib/utils';

export const resourceLibraryService = {
	getResourceLibrary() {
		return httpSingleton.orchestrateRequest<{
			contentsByTagGroupId: Record<string, Content[]>;
			tagGroups: TagGroup[];
			tagsByTagId: Record<string, Tag>;
		}>({
			method: 'GET',
			url: '/resource-library',
		});
	},
	searchResourceLibrary(queryParameters?: { searchQuery?: string; pageNumber?: number; pageSize?: number }) {
		return httpSingleton.orchestrateRequest<{
			findResult: {
				contents: Content[];
				totalCount: number;
				totalCountDescription: string;
			};
			tagsByTagId: Record<string, Tag>;
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
				contents: Content[];
				totalCount: number;
				totalCountDescription: string;
			};
			tagGroup: TagGroup;
			tagsByTagId: Record<string, Tag>;
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
				contents: Content[];
				totalCount: number;
				totalCountDescription: string;
			};
			tag: Tag;
			tagGroup: TagGroup;
			tagsByTagId: Record<string, Tag>;
		}>({
			method: 'GET',
			url: buildQueryParamUrl(`/resource-library/tags/${tagId}`, queryParameters),
		});
	},
	getResourceLibraryFiltersByTagGroupId(tagGroupId: string) {
		return httpSingleton.orchestrateRequest<{
			contentTypes: ContentType[];
			contentDurations: ContentDuration[];
			tags: Tag[];
		}>({
			method: 'GET',
			url: `/resource-library/tag-group-filters/${tagGroupId}`,
		});
	},
	getResourceLibraryFiltersByTagId(tagId: string) {
		return httpSingleton.orchestrateRequest<{
			contentTypes: ContentType[];
			contentDurations: ContentDuration[];
		}>({
			method: 'GET',
			url: `/resource-library/tag-filters/${tagId}`,
		});
	},
	getResourceLibraryContentTypes() {
		return httpSingleton.orchestrateRequest<{
			contentTypes: ContentType[];
		}>({
			method: 'GET',
			url: `/resource-library/content-types`,
		});
	},
	getResourceLibraryRecommendedContent(queryParameters?: {
		tagId?: string[];
		contentTypeId?: string[];
		contentDurationId?: string[];
		pageNumber?: number;
		pageSize?: number;
	}) {
		return httpSingleton.orchestrateRequest<{
			tagsByTagId: Record<string, Tag>;
			contentDurations: ContentDuration[];
			contentTypes: ContentType[];
			tagGroups: TagGroup[];
			findResult: {
				contents: Content[];
				totalCount: number;
				totalCountDescription: string;
			};
		}>({
			method: 'GET',
			url: buildQueryParamUrl('/resource-library/recommended', queryParameters),
		});
	},
};
