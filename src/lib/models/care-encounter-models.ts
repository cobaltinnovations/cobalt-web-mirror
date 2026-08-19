import { AppointmentModel } from './appointments';

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

export interface CareEncounterCancellationReasonModel {
	careEncounterCancellationReasonId: CareEncounterCancellationReasonId;
	description: string;
	displayOrder: number;
	freeformTextRequired: boolean;
}

export interface CareEncounterModel {
	careEncounterId: string;
	appointmentId: string;
	accountId: string;
	careEncounterStatusId: CareEncounterStatusId;
	careEncounterStatusDisplayLabel: string;
	patientFullName: string;
	appointmentDate: string;
	appointmentDateDescription: string;
	notes?: string;
	closedAt?: string;
	closedAtDescription?: string;
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
	appointment: AppointmentModel;
}
