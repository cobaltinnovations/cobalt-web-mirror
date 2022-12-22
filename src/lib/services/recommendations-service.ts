import { httpSingleton } from '@/lib/singletons/http-singleton';
import { GroupSessionModel, GroupSessionRequestModel, ResourceLibraryContentModel, TagModel } from '@/lib/models';

interface getRecommendationsResponse {
	groupSessions: GroupSessionModel[];
	groupSessionRequests: GroupSessionRequestModel[];
	contents: ResourceLibraryContentModel[];
	tagsByTagId: Record<string, TagModel>;
}

export const recommendationsService = {
	getRecommendations(accountId: string) {
		return httpSingleton.orchestrateRequest<getRecommendationsResponse>({
			method: 'get',
			url: `/accounts/${accountId}/recommendations`,
		});
	},
};
