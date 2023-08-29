import { httpSingleton } from '@/lib/singletons/http-singleton';
import { FaqModel, FaqTopicModel } from '../models/faq-models';

export const faqsService = {
	getFaqTopics() {
		return httpSingleton.orchestrateRequest<{
			faqTopics: FaqTopicModel[];
			faqsByFaqTopicId: Record<string, FaqModel[]>;
		}>({
			method: 'GET',
			url: '/faq-topics',
		});
	},
	getFaqDetail(faqUrlName: string) {
		return httpSingleton.orchestrateRequest<{
			faqTopic: FaqTopicModel;
			faq: FaqModel;
		}>({
			method: 'GET',
			url: `/faqs/${faqUrlName}`,
		});
	},
};
