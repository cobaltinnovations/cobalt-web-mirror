import { AccountModel } from './account';
import { ScreeningSession, ScreeningSessionResult } from './screening-models';

export interface PatientOrderCountModel {
	activePatientOrderCount: number;
	activePatientOrderCountDescription: string;
}

export interface OpenPatientOrderCountModel {
	openPatientOrderCount: number;
	openPatientOrderCountDescription: string;
}

export interface PatientOrderModel {
	patientOrderId: string;
	patientOrderTriageStatusId: PatientOrderTriageStatusId;
	patientOrderStatusDescription: string;
	patientOrderDispositionId: PatientOrderDispositionId;
	patientOrderDispositionDescription: string;
	patientAccountId?: string;
	patientAddressId?: string;
	panelAccountId?: string;
	panelAccountFirstName: string;
	panelAccountLastName: string;
	panelAccountDisplayName: string;
	panelAccountDisplayNameWithLastFirst: string;
	encounterDepartmentId?: string;
	encounterDepartmentIdType?: string;
	encounterDepartmentName?: string;
	referringPracticeId?: string;
	referringPracticeIdType?: string;
	referringPracticeName?: string;
	orderingProviderId?: string;
	orderingProviderIdType?: string;
	orderingProviderLastName?: string;
	orderingProviderFirstName?: string;
	orderingProviderMiddleName?: string;
	orderingProviderDisplayName?: string;
	billingProviderId?: string;
	billingProviderIdType?: string;
	billingProviderLastName?: string;
	billingProviderFirstName?: string;
	billingProviderMiddleName?: string;
	billingProviderDisplayName?: string;
	patientLastName?: string;
	patientFirstName?: string;
	patientDisplayName?: string;
	patientMrn?: string;
	patientId?: string;
	patientIdType?: string;
	patientBirthSexId?: string;
	patientBirthdate?: string;
	patientBirthdateDescription?: string;
	primaryPayorId?: string;
	primaryPayorName?: string;
	primaryPlanId?: string;
	primaryPlanName?: string;
	orderDate?: string;
	orderDateDescription?: string;
	orderAgeInMinutes?: number;
	orderAgeInMinutesDescription?: string;
	orderId?: string;
	routing?: string;
	reasonForReferral?: string;
	associatedDiagnosis?: string;
	patientPhoneNumber?: string;
	patientPhoneNumberDescription?: string;
	preferredContactHours?: string;
	comments?: string;
	ccRecipients?: string;
	lastActiveMedicationOrderSummary?: string;
	medications?: string;
	recentPsychotherapeuticMedications?: string;
	episodeClosedAt?: string;
	episodeClosedAtDescription?: string;
	episodeClosedByAccountId?: string;
	episodeDurationInDays?: number;
	episodeDurationInDaysDescription?: string;
	patientEthnicityId: string;
	patientRaceId: string;
	patientGenderIdentityId: string;
	patientLanguageCode: string;
	patientEmailAddress: string;
	patientAccount?: AccountModel;

	// MHIC specific
	patientAddress?: PatientAddressModel;
	patientOrderDiagnoses?: PatientOrderDiagnosesModel[];
	patientOrderMedications?: PatientOrderMedicationModel[];
	patientOrderOutreaches?: PatientOrderOutreachModel[];
	patientOrderTriageGroups?: PateintOrderTriageGroupModel[];
	patientOrderNotes?: PatientOrderNoteModel[];
	patientOrderScreeningStatusId: PatientOrderScreeningStatusId;
	patientOrderScreeningStatusDescription?: string;
	screeningSession?: ScreeningSession;
	screeningSessionResult?: ScreeningSessionResult;
	patientOrderClosureReasonId?: PatientOrderClosureReasonId;
	patientOrderClosureReasonDescription?: string;
	patientOrderScheduledScreeningId?: string;
	patientOrderScheduledScreeningScheduledDateTime?: string;
	patientOrderScheduledScreeningScheduledDateTimeDescription?: string;
	patientOrderScheduledScreeningCalendarUrl?: string;
	patientOrderVoicemailTasks: PatientOrderVoicemailTask[];
	crisisIndicated?: boolean;
	crisisIndicatedAt?: string;
	crisisIndicatedAtDescription?: string;
	patientBelowAgeThreshold?: boolean;
	mostRecentEpisodeClosedAt: string;
	mostRecentEpisodeClosedAtDescription: string;
	mostRecentEpisodeClosedWithinDateThreshold: boolean;
	patientOrderScheduledMessageGroups: PatientOrderScheduledMessageGroup[];
	connectedToSafetyPlanningAt?: string;
	connectedToSafetyPlanningAtDescription?: string;
	patientOrderAssignmentStatusId?: PatientOrderAssignmentStatusId;
	patientOrderResponseStatusId?: PatientOrderResponseStatusId;
	patientOrderSafetyPlanningStatusId?: PatientOrderSafetyPlanningStatusId;
	patientOrderResourcingStatusId?: PatientOrderResourcingStatusId;
	resourcesSentAt?: string;
	resourcesSentAtDescription?: string;
	resourcesSentNote?: string;
	outreachCount?: number;
	outreachCountDescription?: string;
	totalOutreachCount?: number;
	totalOutreachCountDescription?: string;
	patientOrderCareTypeId?: PatientOrderCareTypeId;
	patientOrderCareTypeDescription?: string;
	mostRecentScreeningSessionId: string;
	mostRecentScreeningSessionCreatedByAccountId: string;
	mostRecentScreeningSessionCreatedByAccountFirstName: string;
	mostRecentScreeningSessionCreatedByAccountLastName: string;
	mostRecentScreeningSessionCreatedByAccountDisplayName: string;
	mostRecentScreeningSessionCreatedByAccountDisplayNameWithLastFirst: string;
	mostRecentScreeningSessionCompleted: boolean;
	mostRecentScreeningSessionCompletedAt: string;
	mostRecentScreeningSessionCompletedAtDescription: string;

	// Scheduled appointment through connect-with-support
	appointmentId?: string;
	appointmentStartTime?: string;
	appointmentStartTimeDescription?: string;
	providerId?: string;
	providerName?: string;
}

export enum PatientOrderCareTypeId {
	UNSPECIFIED = 'UNSPECIFIED',
	SUBCLINICAL = 'SUBCLINICAL',
	SPECIALTY = 'SPECIALTY',
	COLLABORATIVE = 'COLLABORATIVE',
	SAFETY_PLANNING = 'SAFETY_PLANNING',
}

export enum PatientOrderClosureReasonId {
	NOT_CLOSED = 'NOT_CLOSED',
	INELIGIBLE_DUE_TO_INSURANCE = 'INELIGIBLE_DUE_TO_INSURANCE',
	REFUSED_CARE = 'REFUSED_CARE',
	TRANSFERRED_TO_SAFETY_PLANNING = 'TRANSFERRED_TO_SAFETY_PLANNING',
	SCHEDULED_WITH_SPECIALTY_CARE = 'SCHEDULED_WITH_SPECIALTY_CARE',
	SCHEDULED_WITH_BHP = 'SCHEDULED_WITH_BHP',
}

export enum PatientOrderTriageStatusId {
	NEEDS_ASSESSMENT = 'NEEDS_ASSESSMENT',
	SPECIALTY_CARE = 'SPECIALTY_CARE',
	SUBCLINICAL = 'SUBCLINICAL',
	BHP = 'BHP',
}

export enum PatientOrderAssignmentStatusId {
	UNASSIGNED = 'UNASSIGNED',
	ASSIGNED = 'ASSIGNED',
}

export enum PatientOrderOutreachStatusId {
	NO_OUTREACH = 'NO_OUTREACH',
	HAS_OUTREACH = 'HAS_OUTREACH',
}

export enum PatientOrderResponseStatusId {
	WAITING_FOR_RESPONSE = 'WAITING_FOR_RESPONSE',
	NOT_WAITING_FOR_RESPONSE = 'NOT_WAITING_FOR_RESPONSE',
}

export enum PatientOrderScreeningStatusId {
	NOT_SCREENED = 'NOT_SCREENED',
	IN_PROGRESS = 'IN_PROGRESS',
	SCHEDULED = 'SCHEDULED',
	COMPLETE = 'COMPLETE',
}

export enum PatientOrderDispositionId {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
	ARCHIVED = 'ARCHIVED',
}

export enum PatientOrderSafetyPlanningStatusId {
	UNKNOWN = 'UNKNOWN',
	NONE_NEEDED = 'NONE_NEEDED',
	NEEDS_SAFETY_PLANNING = 'NEEDS_SAFETY_PLANNING',
	CONNECTED_TO_SAFETY_PLANNING = 'CONNECTED_TO_SAFETY_PLANNING',
}

export enum PatientOrderResourcingStatusId {
	UNKNOWN = 'UNKNOWN',
	NONE_NEEDED = 'NONE_NEEDED',
	NEEDS_RESOURCES = 'NEEDS_RESOURCES',
	SENT_RESOURCES = 'SENT_RESOURCES',
}

export enum PatientOrderTriageSourceId {
	COBALT = 'COBALT',
	MANUALLY_SET = 'MANUALLY_SET',
}

export enum ScheduledMessageStatusId {
	PENDING = 'PENDING',
	PROCESSED = 'PROCESSED',
	CANCELED = 'CANCELED',
	ERROR = 'ERROR',
}

export interface PatientAddressModel {
	addressId: string;
	countryCode: string;
	locality: string;
	postalCode: string;
	postalName: string;
	region: string;
	streetAddress1: string;
	streetAddress2: string;
}

export interface PatientOrderDiagnosesModel {
	patientOrderDiagnosisId: string;
	patientOrderId: string;
	diagnosisId: string;
	diagnosisIdType: string;
	diagnosisName: string;
}

export interface PatientOrderMedicationModel {
	patientOrderMedicationId: string;
	patientOrderId: string;
	medicationId: string;
	medicationIdType: string;
	medicationName: string;
}

export interface PatientOrderNoteModel {
	account: AccountModel;
	accountId: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	note: string;
	patientOrderId: string;
	patientOrderNoteId: string;
}

export interface PatientOrderOutreachModel {
	account: AccountModel;
	accountId: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	note: string;
	outreachDate: string;
	outreachDateDescription: string;
	outreachDateTime: string;
	outreachDateTimeDescription: string;
	outreachTime: string;
	outreachTimeDescription: string;
	patientOrderId: string;
	patientOrderOutreachId: string;
	patientOrderOutreachResultId: string;
}

export interface PateintOrderTriageGroupModel {
	patientOrderTriageSourceId: PatientOrderTriageSourceId;
	patientOrderCareTypeId: PatientOrderCareTypeId;
	patientOrderCareTypeDescription: string;
	patientOrderFocusTypes: {
		patientOrderFocusTypeId: string;
		patientOrderFocusTypeDescription: string;
		reasons: string[];
	}[];
}

export interface PatientOrderClosureReasonModel {
	patientOrderClosureReasonId: string;
	description: string;
}

export interface PatientOrderAutocompleteResult {
	patientMrn: string;
	patientId: string;
	patientIdType: string;
	patientFirstName: string;
	patientLastName: string;
	patientDisplayName: string;
	patientDisplayNameWithLastFirst: string;
	patientPhoneNumber: string;
	patientPhoneNumberDescription: string;
}

export interface PatientOrderScheduledMessageGroup {
	patientOrderScheduledMessageGroupId: string;
	patientOrderScheduledMessageTypeId: string;
	patientOrderScheduledMessageTypeDescription: string;
	scheduledMessageSourceId: string;
	patientOrderId: string;
	scheduledAtDate: string;
	scheduledAtDateDescription: string;
	scheduledAtTime: string;
	scheduledAtTimeDescription: string;
	scheduledAtDateTime: string;
	scheduledAtDateTimeDescription: string;
	timeZone: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	patientOrderScheduledMessages: {
		patientOrderScheduledMessageId: string;
		scheduledMessageId: string;
		scheduledMessageStatusId: ScheduledMessageStatusId;
		messageTypeId: string;
		messageTypeDescription: string;
	}[];
}

export type PatientOrderCountsByPatientOrderTriageStatusId = Record<
	PatientOrderTriageStatusId,
	{
		patientOrderCountDescription: string;
		patientOrderCount: number;
	}
>;

export interface PatientOrderScheduledScreening {
	patientOrderScheduledScreeningId: string;
	patientOrderId: string;
	accountId: string;
	scheduledDateTime: string;
	scheduledDateTimeDescription: string;
	canceled: boolean;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	canceledAt?: string;
	canceledAtDescription?: string;
}

export interface PatientOrderVoicemailTask {
	completed: boolean;
	created: string;
	createdByAccountId: string;
	createdDescription: string;
	createdByAccountFirstName: string;
	createdByAccountLastName: string;
	createdByAccountDisplayName: string;
	createdByAccountDisplayNameWithLastFirst: string;
	completedByAccountFirstName?: string;
	completedByAccountLastName?: string;
	completedByAccountDisplayName?: string;
	completedByAccountDisplayNameWithLastFirst?: string;
	deleted: boolean;
	lastUpdated: string;
	lastUpdatedDescription: string;
	message: string;
	patientOrderId: string;
	patientOrderVoicemailTaskId: string;
}
