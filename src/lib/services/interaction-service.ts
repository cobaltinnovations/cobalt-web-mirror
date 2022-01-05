import { httpSingleton } from '@/lib/singletons/http-singleton';

interface PostInteractionResponseBody {
	interactionOptionId: string;
	interactionId: string;
	optionDescription: string;
	optionResponse: string;
	finalFlag: boolean;
	optionOrder: number;
	optionUrl: string;
}

export const interactionService = {
	postInteraction(interactionInstanceId: string, interactionOptionId: string) {
		return httpSingleton.orchestrateRequest<PostInteractionResponseBody>({
			method: 'post',
			url: `/interaction/${interactionInstanceId}/option/${interactionOptionId}`,
		});
	},
};
