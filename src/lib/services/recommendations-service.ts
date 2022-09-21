import { httpSingleton } from '@/lib/singletons/http-singleton';
import { GroupSessionModel, GroupSessionRequestModel } from '@/lib/models';
import { Content } from '@/lib/models';

interface getRecommendationsResponse {
	groupSessions: GroupSessionModel[];
	groupSessionRequests: GroupSessionRequestModel[];
	contents: Content[];
}

export const recommendationsService = {
	getRecommendations(accountId: string) {
		return httpSingleton.orchestrateRequest<getRecommendationsResponse>({
			method: 'get',
			url: `/accounts/${accountId}/recommendations`,
		});
	},
};
