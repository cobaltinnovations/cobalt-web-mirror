import { AppointmentModel } from './appointments';

export enum CareEncounterStatusId {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
	CANCELED = 'CANCELED',
}

export enum CareEncounterSortColumnId {
	APPOINTMENT_DATE = 'APPOINTMENT_DATE',
	PATIENT_NAME = 'PATIENT_NAME',
	STATUS = 'STATUS',
	CREATED = 'CREATED',
	LAST_UPDATED = 'LAST_UPDATED',
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
