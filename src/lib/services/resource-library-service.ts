import { httpSingleton } from '@/lib/singletons/http-singleton';
import { ResourceLibraryContentModel, TagGroupModel, TagModel } from '@/lib/models';

export const resourceLibraryService = {
	getResourceLibrary() {
		return httpSingleton.orchestrateRequest<{
			contentsByTagGroupId: Record<string, ResourceLibraryContentModel[]>;
			tagGroups: TagGroupModel[];
			tags: TagModel[];
		}>({
			method: 'GET',
			url: '/resource-library',
		});
	},
};
