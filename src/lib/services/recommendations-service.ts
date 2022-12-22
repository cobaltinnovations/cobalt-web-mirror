import { httpSingleton } from '@/lib/singletons/http-singleton';
import { GroupSessionModel, GroupSessionRequestModel, ResourceLibraryContentModel } from '@/lib/models';

interface getRecommendationsResponse {
	groupSessions: GroupSessionModel[];
	groupSessionRequests: GroupSessionRequestModel[];
	contents: ResourceLibraryContentModel[];
}

export const recommendationsService = {
	getRecommendations(accountId: string) {
		return httpSingleton.orchestrateRequest<getRecommendationsResponse>({
			method: 'get',
			url: `/accounts/${accountId}/recommendations`,
		});
	},
};
