import { httpSingleton } from '@/lib/singletons/http-singleton';

export const interactionService = {
	postInteraction(interactionInstanceId: string, interactionOptionId: string) {
		return httpSingleton.orchestrateRequest<any>({
			method: 'post',
			url: `/interaction/${interactionInstanceId}/option/${interactionOptionId}`,
		});
	},
};
