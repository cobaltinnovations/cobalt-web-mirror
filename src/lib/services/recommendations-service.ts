import { httpSingleton } from '@/lib/singletons/http-singleton';
import { Content, GroupSessionModel, GroupSessionRequestModel, Tag } from '@/lib/models';

interface GetRecommendationsResponse {
	groupSessions: GroupSessionModel[];
	groupSessionRequests: GroupSessionRequestModel[];
	contents: Content[];
	tagsByTagId: Record<string, Tag>;
}

export const recommendationsService = {
	getRecommendations(accountId: string) {
		return httpSingleton.orchestrateRequest<GetRecommendationsResponse>({
			method: 'get',
			url: `/accounts/${accountId}/recommendations`,
		});
	},
};
