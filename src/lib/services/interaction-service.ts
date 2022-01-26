import { httpSingleton } from '@/lib/singletons/http-singleton';
import { InteractionInstance, InteractionOption, InteractionOptionAction } from '@/lib/models';

interface PostInteractionResponseBody {
	interactionOption: InteractionOption;
}

interface GetInteractionInstancesResponseBody {
	interactionOptions: InteractionOption[];
	interactionInstance: InteractionInstance;
	interactionOptionActions: InteractionOptionAction[];
}

export const interactionService = {
	postInteraction(interactionInstanceId: string, interactionOptionId: string) {
		return httpSingleton.orchestrateRequest<PostInteractionResponseBody>({
			method: 'post',
			url: `/interaction/${interactionInstanceId}/option/${interactionOptionId}`,
		});
	},
	getInteractionInstances(interactionId: string) {
		return httpSingleton.orchestrateRequest<GetInteractionInstancesResponseBody>({
			method: 'get',
			url: `/interaction-instances/${interactionId}`,
		});
	},
	postInteractionOptionActions(data: { interactionInstanceId: string; interactionOptionId: string }) {
		return httpSingleton.orchestrateRequest<PostInteractionResponseBody>({
			method: 'post',
			url: '/interaction-option-actions',
			data,
		});
	},
};
