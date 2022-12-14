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
};
