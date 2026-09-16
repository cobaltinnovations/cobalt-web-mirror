import { ScreeningSessionDestination } from '@/lib/models';

export const getScreeningSessionDestinationWithSessionId = (
	screeningSessionDestination: ScreeningSessionDestination,
	screeningSessionId: string
): ScreeningSessionDestination => {
	return {
		...screeningSessionDestination,
		context: {
			...screeningSessionDestination.context,
			screeningSessionId,
		},
	};
};
