import { Provider } from './provider';
import { AppointmentModel } from './appointments';

export interface GroupEvent {
	groupEventId: string;
	groupEventTypeId: string;
	name: string;
	description: string;
	startTime: string;
	startTimeDescription: string;
	localStartDate: string;
	localStartTime: string;
	endTime: string;
	endTimeDescription: string;
	localEndDate: string;
	localEndTime: string;
	durationInMinutes: number;
	durationInMinutesDescription: string;
	timeDescription: string;
	timeZone: string;
	seats: number;
	seatsDescription: string;
	seatsAvailable: number;
	seatsAvailableDescription: string;
	imageUrl: string;
	provider?: Provider;
	appointment?: AppointmentModel;
}
