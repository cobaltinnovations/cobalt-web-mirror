import { AppointmentModel, GroupSessionModel } from '@/lib/models';
import { GroupSessionReservationModel } from './group-session-models';

export enum CALENDAR_EVENT_TYPE_ID {
	APPOINTMENT = 'APPOINTMENT',
	GROUP_SESSION_RESERVATION = 'GROUP_SESSION_RESERVATION',
}

export interface CalendarEventGroupsModel {
	date: string;
	calendarEvents: CalendarEventGroupModel[];
}

export interface CalendarEventGroupModel {
	calendarEventTypeId: CALENDAR_EVENT_TYPE_ID;
	appointment?: AppointmentModel;
	groupSession?: GroupSessionModel;
	groupSessionReservation?: GroupSessionReservationModel;
}
