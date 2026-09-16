import { ScreeningSessionDestinationId, ScreeningSessionDestinationResultId } from '@/lib/models';
import { getScreeningSessionDestinationWithSessionId } from './screening-utils';

it('adds the completed screening session ID to its destination context', () => {
	const screeningSessionDestination = {
		screeningSessionDestinationId: ScreeningSessionDestinationId.APPOINTMENT_BOOKING_CONFIRMATION,
		screeningSessionDestinationResultId: ScreeningSessionDestinationResultId.SUCCESS,
		context: {
			providerId: 'provider-id',
		},
	};

	expect(getScreeningSessionDestinationWithSessionId(screeningSessionDestination, 'screening-session-id')).toEqual({
		screeningSessionDestinationId: ScreeningSessionDestinationId.APPOINTMENT_BOOKING_CONFIRMATION,
		screeningSessionDestinationResultId: ScreeningSessionDestinationResultId.SUCCESS,
		context: {
			providerId: 'provider-id',
			screeningSessionId: 'screening-session-id',
		},
	});
});
