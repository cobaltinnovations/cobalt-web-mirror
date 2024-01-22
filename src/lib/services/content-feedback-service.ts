import { CONTENT_FEEDBACK_TYPE_ID, ContentFeedback } from '@/lib/models';
import { httpSingleton } from '@/lib/singletons';

export const contentFeedbackService = {
	createContentFeedback(data: {
		contentId: string;
		contentFeedbackTypeId: CONTENT_FEEDBACK_TYPE_ID;
		message?: string;
	}) {
		return httpSingleton.orchestrateRequest<{ contentFeedback: ContentFeedback }>({
			method: 'POST',
			url: '/content-feedbacks',
			data,
		});
	},
	updateContentFeedback(
		contentFeedbackId: string,
		data: { contentFeedbackTypeId: CONTENT_FEEDBACK_TYPE_ID; message?: string }
	) {
		return httpSingleton.orchestrateRequest<{ contentFeedback: ContentFeedback }>({
			method: 'PUT',
			url: `/content-feedbacks/${contentFeedbackId}`,
			data,
		});
	},
};
