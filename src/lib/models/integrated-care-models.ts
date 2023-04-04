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
	patientOrderStatusId: PatientOrderStatusId;
	patientOrderStatusDescription: string;
	patientOrderDispositionId: PatientOrderDispositionId;
	patientOrderDispositionDescription: PatientOrderDisposition;
	patientAccountId?: string;
	patientAddressId?: string;
	panelAccountId?: string;
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
	patientOrderSafetyPlanningStatusId?: PatientOrderSafetyPlanningStatusId;
	patientOrderResourcingStatusId?: PatientOrderResourcingStatusId;
	resourcesSentAt?: string;
	resourcesSentAtDescription?: string;
	resourcesSentNote?: string;
}

enum PatientOrderClosureReasonId {
	NOT_CLOSED = 'NOT_CLOSED',
	INELIGIBLE_DUE_TO_INSURANCE = 'INELIGIBLE_DUE_TO_INSURANCE',
	REFUSED_CARE = 'REFUSED_CARE',
	TRANSFERRED_TO_SAFETY_PLANNING = 'TRANSFERRED_TO_SAFETY_PLANNING',
	SCHEDULED_WITH_SPECIALTY_CARE = 'SCHEDULED_WITH_SPECIALTY_CARE',
	SCHEDULED_WITH_BHP = 'SCHEDULED_WITH_BHP',
}

export enum PatientOrderStatusId {
	'PENDING' = 'PENDING',
	'NEEDS_ASSESSMENT' = 'NEEDS_ASSESSMENT',
	SCHEDULED = 'SCHEDULED',
	SAFETY_PLANNING = 'SAFETY_PLANNING',
	SPECIALTY_CARE = 'SPECIALTY_CARE',
	SUBCLINICAL = 'SUBCLINICAL',
	BHP = 'BHP',
}

export interface PatientOrderStatus {
	patientOrderStatusId: PatientOrderStatusId;
	description: string;
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
	NEEDS_RESOURCES = 'NEEDS_RESOURCES',
	SENT_RESOURCES = 'SENT_RESOURCES',
}

export interface PatientOrderDisposition {
	patientOrderDispositionId: PatientOrderDispositionId;
	description: string;
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
	patientOrderFocusTypeId: string;
	patientOrderFocusTypeDescription: string;
	patientOrderCareTypeId: string;
	patientOrderCareTypeDescription: string;
	reasons: string[];
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
		scheduledMessageStatusId: string;
		messageTypeId: string;
		messageTypeDescription: string;
	}[];
}

export type PatientOrderCountsByPatientOrderStatusId = Record<
	PatientOrderStatusId,
	{
		patientOrderCountDescription: string;
		patientOrderCount: number;
	}
>;
