import { httpSingleton } from '@/lib/singletons/http-singleton';
import { TopicCenterModel } from '@/lib/models';

export const topicCenterService = {
	getTopicCenterById(topicCenterId: string) {
		return httpSingleton.orchestrateRequest<{ topicCenter: TopicCenterModel }>({
			method: 'GET',
			url: `/topic-centers/${topicCenterId}`,
		});
	},
};
