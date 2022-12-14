import { httpSingleton } from '@/lib/singletons/http-singleton';
import { ResourceLibraryContentModel, TagGroupModel, TagModel } from '@/lib/models';
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
			searchQuery?: string;
			pageNumber?: number;
			pageSize?: number;
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
			searchQuery?: string;
			pageNumber?: number;
			pageSize?: number;
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
};
