import { httpSingleton } from '@/lib/singletons/http-singleton';
import { GroupEvent, GroupSessionModel } from '@/lib/models';
import { Content } from '@/lib/models';

interface getRecommendationsResponse {
	groupSessions: GroupSessionModel[];
	groupEvents: GroupEvent[];
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
