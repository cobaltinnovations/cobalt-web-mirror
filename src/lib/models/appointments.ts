import { Provider } from '@/lib/models/provider';
import { AccountModel } from '@/lib/models/account';
import { ScreeningSessionResult } from './screening-models';

export enum ATTENDANCE_STATUS_ID {
	UNKNOWN = 'UNKNOWN',
	MISSED = 'MISSED',
	CANCELED = 'CANCELED',
	ATTENDED = 'ATTENDED',
}

export enum AppointmentTimeStatusId {
	SCHEDULED = 'SCHEDULED',
	IN_SESSION = 'IN_SESSION',
	PASSED = 'PASSED',
}

export enum BookingExperienceId {
	V1 = 'V1',
	V2 = 'V2',
}

export enum SchedulingSystemId {
	NONE = 'NONE',
	ACUITY = 'ACUITY',
	EPIC = 'EPIC',
	EPIC_FHIR = 'EPIC_FHIR',
	COBALT = 'COBALT',
}

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
	hexColor?: string;
	assessmentId?: string;
	screeningFlowId?: string | null;
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
	careEncounterId?: string;
	screeningSessionId?: string;
	screeningSessionResult?: ScreeningSessionResult;
	appointmentReasonId?: string;
	createdByAccountId?: string;
	firstName?: string;
	lastName?: string;
	emailAddress?: string;
	contactPhoneNumber?: string;
	contactPhoneNumberDescription?: string;
	appointmentTypeId: string;
	intakeAssessmentId?: string;
	acuityAppointmentId?: number;
	bluejeansMeetingId?: number;
	groupEventId?: string;
	groupEventTypeId?: string;
	name?: string;
	title?: string;
	subtitle?: string;
	startTime: string;
	startTimeDescription: string;
	localStartDate: string;
	localStartTime: string;
	endTime: string;
	endTimeDescription: string;
	localEndDate?: string;
	localEndTime?: string;
	durationInMinutes: number;
	durationInMinutesDescription: string;
	timeDescription: string;
	timeZone: string;
	videoconferenceUrl: string;
	videoconferencePlatformId: VideoconferencePlatformId;
	schedulingSystemId?: SchedulingSystemId;
	phoneNumber?: string;
	phoneNumberDescription?: string;
	canceled: boolean;
	canceledAt?: string;
	canceledAtDescription?: string;
	canceledByAccountId?: string;
	canceledByAccountDisplayName?: string;
	cancellationReason?: string;
	created: string;
	createdDescription: string;
	provider?: Partial<Provider>;
	account?: AccountModel;
	appointmentReason?: AppointmentReason;
	appointmentDescription: string;
	appointmentType?: AppointmentType;
	attendanceStatusId: ATTENDANCE_STATUS_ID;
	appointmentTimeStatusId: AppointmentTimeStatusId;
	canceledForReschedule: boolean;
	rescheduledAppointmentId?: string;
	patientOrderId?: string;
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
