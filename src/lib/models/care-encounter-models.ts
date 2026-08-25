import { AppointmentModel, AppointmentTimeStatusId, ATTENDANCE_STATUS_ID } from './appointments';
import { MessageStatusId, MessageTypeId, ScheduledMessageStatusId } from './integrated-care-models';

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

export interface CareEncounterNoteModel {
	careEncounterNoteId: string;
	careEncounterId: string;
	note: string;
	createdByAccountId: string;
	createdByAccountDisplayName?: string;
	lastUpdatedByAccountId: string;
	lastUpdatedByAccountDisplayName?: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
}

export enum CareEncounterScheduledMessageTypeId {
	FOLLOW_UP = 'FOLLOW_UP',
}

export enum ScheduledMessageSourceId {
	SYSTEM = 'SYSTEM',
	MANUAL = 'MANUAL',
}

export interface CareEncounterScheduledMessageTypeModel {
	careEncounterScheduledMessageTypeId: CareEncounterScheduledMessageTypeId;
	description: string;
	displayOrder: number;
	supportedMessageTypeIds: MessageTypeId[];
}

export interface CareEncounterScheduledMessageModel {
	careEncounterScheduledMessageId: string;
	careEncounterId: string;
	careEncounterScheduledMessageTypeId: CareEncounterScheduledMessageTypeId;
	careEncounterScheduledMessageTypeDescription: string;
	scheduledMessageId: string;
	scheduledMessageStatusId: ScheduledMessageStatusId;
	scheduledMessageStatusDescription: string;
	scheduledMessageSourceId: ScheduledMessageSourceId;
	scheduledByAccountId?: string;
	scheduledByAccountDisplayName?: string;
	messageId: string;
	scheduledAtDate: string;
	scheduledAtTime: string;
	timeZone: string;
	scheduledAt: string;
	scheduledAtDescription: string;
	processedAt?: string;
	processedAtDescription?: string;
	canceledAt?: string;
	canceledAtDescription?: string;
	erroredAt?: string;
	erroredAtDescription?: string;
	messageStatusId?: MessageStatusId;
	messageStatusDescription?: string;
	sentAt?: string;
	sentAtDescription?: string;
	deliveredAt?: string;
	deliveredAtDescription?: string;
	deliveryFailedAt?: string;
	deliveryFailedAtDescription?: string;
	deliveryFailedReason?: string;
	complaintRegisteredAt?: string;
	complaintRegisteredAtDescription?: string;
	recipientEmailAddress: string;
	customEmailText: string;
	emailSubject: string;
	emailContentHtml: string;
	emailBody: string;
	editable: boolean;
	cancelable: boolean;
	deleted: boolean;
	deletedAt?: string;
	deletedAtDescription?: string;
	deletedByAccountId?: string;
	deletedByAccountDisplayName?: string;
	createdByAccountId: string;
	createdByAccountDisplayName?: string;
	lastUpdatedByAccountId: string;
	lastUpdatedByAccountDisplayName?: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
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
	canceledAt?: string;
	canceledAtDescription?: string;
	canceledByAccountId?: string;
	canceledByAccountDisplayName?: string;
	cancellationReason?: string;
}

export interface CareEncounterListModel extends CareEncounterBaseModel {
	appointment: CareEncounterAppointmentModel;
}

export interface CareEncounterModel extends CareEncounterBaseModel {
	emailAddress?: string;
	careEncounterNotes: CareEncounterNoteModel[];
	notesEditable: boolean;
	careEncounterScheduledMessages: CareEncounterScheduledMessageModel[];
	appointment: AppointmentModel;
	appointmentHistory: AppointmentModel[];
}
