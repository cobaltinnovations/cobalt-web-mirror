import { httpSingleton } from '@/lib/singletons/http-singleton';

export const feedbackService = {
	submitFeedback(data: { emailAddress: string; feedbackTypeId: string; feedback: string }) {
		return httpSingleton.orchestrateRequest<any>({
			method: 'post',
			url: '/feedback',
			data,
		});
	},
};
