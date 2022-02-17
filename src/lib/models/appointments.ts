import { Provider } from '@/lib/models/provider';
import { AccountModel } from '@/lib/models/account';

export interface AppointmentType {
	appointmentTypeId: string;
	schedulingSystemId: string;
	acuityAppointmentTypeId?: number;
	epicVisitTypeId?: string;
	epicVisitTypeIdType?: string;
	durationInMinutes: number;
	durationInMinutesDescription: string;
	name: string;
	visitTypeId: string;
	hexColor: string;
}

export interface EpicDepartment {
	departmentId: string;
	departmentIdType: string;
	epicDepartmentId: string;
	name: string;
}

export enum VideoconferencePlatformId {
	BLUEJEANS = 'BLUEJEANS',
	EXTERNAL = 'EXTERNAL',
	TELEPHONE = 'TELEPHONE',
}

export interface AppointmentModel {
	appointmentId: string;
	accountId: string;
	acuityAppointmentId: number;
	bluejeansMeetingId: number;
	name: string;
	startTime: string;
	startTimeDescription: string;
	localStartDate: string;
	localStartTime: string;
	endTime: string;
	endTimeDescription: string;
	durationInMinutes: number;
	durationInMinutesDescription: string;
	timeDescription: string;
	timeZone: string;
	videoconferenceUrl: string;
	videoconferencePlatformId: VideoconferencePlatformId;
	phoneNumberDescription: string;
	canceled: boolean;
	canceledAt: string;
	canceledAtDescription: string;
	created: string;
	createdDescription: string;
	provider?: Partial<Provider>;
	account?: AccountModel;
	appointmentReason?: AppointmentReason;
	appointmentDescription: string;
}

export enum AppointmentReasonType {
	Initial = 'MHIC_SELF_SCHEDULE_INITIAL',
	FollowUp = 'MHIC_SELF_SCHEDULE_FOLLOWUP',
	NotSpecfied = 'NOT_SPECIFIED',
}

export interface AppointmentReason {
	appointmentReasonId: string;
	appointmentReasonTypeId: AppointmentReasonType;
	institutionId: string;
	description: string;
	color: string;
}

export interface FollowupModel {
	followupId: string;
	accountId: string;
	createdByAccountId: string;
	providerId: string;
	provider?: Partial<Provider>;
	appointmentReasonId: string;
	followupDate: string;
	followupDateDescription: string;
	canceled: boolean;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	account: AccountModel;
	appointmentReason: AppointmentReason;
}
