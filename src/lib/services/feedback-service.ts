import { httpSingleton } from '@/lib/singletons/http-singleton';

export const feedbackService = {
	submitFeedback(emailAddress: string, feedback: string) {
		return httpSingleton.orchestrateRequest<any>({
			method: 'post',
			url: '/feedback',
			data: { emailAddress, feedback },
		});
	},
};
