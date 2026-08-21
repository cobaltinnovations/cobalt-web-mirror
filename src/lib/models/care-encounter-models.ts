import { AppointmentModel, AppointmentTimeStatusId, ATTENDANCE_STATUS_ID } from './appointments';

export enum CareEncounterStatusId {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
	CANCELED = 'CANCELED',
}

export enum CareEncounterCancellationReasonId {
	PATIENT_REQUESTED = 'PATIENT_REQUESTED',
	NO_LONGER_NEEDED = 'NO_LONGER_NEEDED',
	UNABLE_TO_REACH_PATIENT = 'UNABLE_TO_REACH_PATIENT',
	SCHEDULING_CONFLICT = 'SCHEDULING_CONFLICT',
	DUPLICATE_BOOKING = 'DUPLICATE_BOOKING',
	OTHER = 'OTHER',
}

export enum CareEncounterSortColumnId {
	APPOINTMENT_DATE = 'APPOINTMENT_DATE',
	PATIENT_NAME = 'PATIENT_NAME',
	STATUS = 'STATUS',
	CREATED = 'CREATED',
	LAST_UPDATED = 'LAST_UPDATED',
}

export enum CareEncounterAssignmentScopeId {
	ALL = 'ALL',
	SELF = 'SELF',
	UNASSIGNED = 'UNASSIGNED',
}

export interface CareEncounterCancellationReasonModel {
	careEncounterCancellationReasonId: CareEncounterCancellationReasonId;
	description: string;
	displayOrder: number;
	freeformTextRequired: boolean;
}

export interface CareEncounterAttendanceStatusModel {
	attendanceStatusId: ATTENDANCE_STATUS_ID;
	description: string;
}

interface CareEncounterBaseModel {
	careEncounterId: string;
	appointmentId: string;
	accountId: string;
	careNavigatorAccountId?: string;
	careNavigatorDisplayName?: string;
	careEncounterStatusId: CareEncounterStatusId;
	careEncounterStatusDisplayLabel: string;
	patientFullName: string;
	appointmentDate: string;
	appointmentDateDescription: string;
	notes?: string;
	closedAt?: string;
	closedAtDescription?: string;
	closedByAccountId?: string;
	canceledByAccountId?: string;
	careEncounterCancellationReasonId?: CareEncounterCancellationReasonId;
	careEncounterCancellationReasonOtherText?: string;
	createdByAccountId: string;
	lastUpdatedByAccountId: string;
	created: string;
	createdDescription: string;
	createdDate: string;
	createdDateDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
}

export interface CareEncounterAppointmentModel {
	appointmentId: string;
	providerId: string;
	appointmentTypeId?: string;
	attendanceStatusId: ATTENDANCE_STATUS_ID;
	appointmentTimeStatusId: AppointmentTimeStatusId;
	title: string;
	startTime: string;
	startTimeDescription: string;
	endTime: string;
	endTimeDescription: string;
	timeZone: string;
	canceledForReschedule: boolean;
	canceled?: boolean;
}

export interface CareEncounterListModel extends CareEncounterBaseModel {
	appointment: CareEncounterAppointmentModel;
}

export interface CareEncounterModel extends CareEncounterBaseModel {
	emailAddress?: string;
	appointment: AppointmentModel;
	appointmentHistory: AppointmentModel[];
}
