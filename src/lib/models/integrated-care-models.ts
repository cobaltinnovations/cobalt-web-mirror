import { AccountModel } from './account';
import { ROLE_ID } from './roles';
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
	patientOrderIntakeWantsServicesStatusId: PatientOrderIntakeWantsServicesStatusId;
	patientOrderIntakeLocationStatusId: PatientOrderIntakeLocationStatusId;
	patientOrderIntakeInsuranceStatusId: PatientOrderIntakeInsuranceStatusId;
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
	patientUniqueId?: string;
	patientUniqueIdType?: string;
	patientBirthSexId?: string;
	patientBirthdate?: string;
	patientBirthdateDescription?: string;

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

	inPersonCareRadius?: number;
	inPersonCareRadiusDescription?: string;
	inPersonCareRadiusDistanceUnitId?: string;
	inPersonCareRadiusWithDistanceUnitDescription?: string;

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
	patientOrderIntakeScreeningStatusId: PatientOrderIntakeScreeningStatusId;
	patientOrderIntakeScreeningStatusDescription?: string;
	patientOrderScreeningStatusId: PatientOrderScreeningStatusId;
	patientOrderScreeningStatusDescription?: string;
	screeningSession?: ScreeningSession;
	screeningSessionResult?: ScreeningSessionResult;
	intakeScreeningSession?: ScreeningSession;
	intakeScreeningSessionResult?: ScreeningSessionResult;
	patientOrderClosureReasonId?: PatientOrderClosureReasonId;
	patientOrderClosureReasonDescription?: string;
	patientOrderScheduledScreeningId?: string;
	patientOrderScheduledScreeningScheduledDateTime?: string;
	patientOrderScheduledScreeningScheduledDateTimeDescription?: string;
	patientOrderScheduledScreeningCalendarUrl?: string;
	patientOrderVoicemailTasks: PatientOrderVoicemailTask[];
	patientOrderTriageOverrideReasonDescription?: string;
	patientOrderTriageOverrideReasonId?: PatientOrderIntakeScreeningStatusId;
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
	mostRecentOutreachDateTimeDescription?: string;
	mostRecentTotalOutreachDateTime: string;
	mostRecentTotalOutreachDateTimeDescription: string;
	patientOrderCareTypeId?: PatientOrderCareTypeId;
	patientOrderCareTypeDescription?: string;

	mostRecentIntakeScreeningSessionId?: string;
	mostRecentIntakeScreeningSessionCreatedAt?: string;
	mostRecentIntakeScreeningSessionCreatedAtDescription?: string;
	mostRecentIntakeScreeningSessionCreatedByAccountId?: string;
	mostRecentIntakeScreeningSessionCreatedByAccountRoleId?: ROLE_ID;
	mostRecentIntakeScreeningSessionCreatedByAccountFirstName?: string;
	mostRecentIntakeScreeningSessionCreatedByAccountLastName?: string;
	mostRecentIntakeScreeningSessionCreatedByAccountDisplayName?: string;
	mostRecentIntakeScreeningSessionCreatedByAccountDisplayNameWithLastFirst?: string;
	mostRecentIntakeScreeningSessionCompleted?: boolean;
	mostRecentIntakeScreeningSessionCompletedAt?: string;
	mostRecentIntakeScreeningSessionCompletedAtDescription?: string;
	mostRecentIntakeScreeningSessionByPatient?: boolean;

	mostRecentScreeningSessionId: string;
	mostRecentScreeningSessionCreatedByAccountId: string;
	mostRecentScreeningSessionCreatedByAccountFirstName: string;
	mostRecentScreeningSessionCreatedByAccountLastName: string;
	mostRecentScreeningSessionCreatedByAccountDisplayName: string;
	mostRecentScreeningSessionCreatedByAccountDisplayNameWithLastFirst: string;
	mostRecentScreeningSessionCreatedByAccountRoleId: ROLE_ID;
	mostRecentScreeningSessionCompleted: boolean;
	mostRecentScreeningSessionCompletedAt: string;
	mostRecentScreeningSessionCompletedAtDescription: string;
	mostRecentScreeningSessionCreatedAtDescription: string;

	patientDemographicsAccepted?: boolean;
	patientDemographicsCompleted?: boolean;
	patientAddressRegionAccepted?: boolean;
	patientDemographicsConfirmed?: boolean;
	patientDemographicsConfirmedAt?: string;
	patientDemographicsConfirmedAtDescription?: string;
	patientDemographicsConfirmedByAccountId?: string;

	// Consent to mental health care
	patientOrderConsentStatusId: PatientOrderConsentStatusId;
	patientConsented?: boolean;
	patientConsentedByAccountId?: string;
	patientConsentedAt?: string;
	patientConsentedAtDescription?: string;

	// Insurance
	primaryPayorId?: string;
	primaryPayorName?: string;
	primaryPlanName?: string;
	primaryPlanId?: string;
	primaryPlanAccepted?: boolean;

	// Scheduled appointment through connect-with-support
	appointmentId?: string;
	appointmentStartTime?: string;
	appointmentStartTimeDescription?: string;
	providerId?: string;
	providerName?: string;

	patientAgeOnOrderDate: number;
	patientAgeOnOrderDateDescription: string;

	patientOrderCarePreferenceId?: string;

	// New for checkin
	patientOrderResourceCheckInResponseStatusId: PatientOrderResourceCheckInResponseStatusId;
	patientOrderResourceCheckInResponseStatusDescription: string;
	resourceCheckInScheduledMessageGroupId?: string;
	resourceCheckInResponseNeeded?: boolean;
	resourceCheckInScheduledAtDateTime?: string;
	resourceCheckInScheduledAtDateTimeDescription?: string;

	// Do we need another outreach?
	outreachFollowupNeeded?: boolean;

	mostRecentScreeningSessionAppearsAbandoned?: boolean;
	mostRecentIntakeScreeningSessionAppearsAbandoned?: boolean;
}

export enum PatientOrderIntakeScreeningStatusId {
	NOT_SCREENED = 'NOT_SCREENED',
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETE = 'COMPLETE',
}

export enum PatientOrderViewTypeId {
	NEED_ASSESSMENT = 'NEED_ASSESSMENT',
	SCHEDULED = 'SCHEDULED',
	SUBCLINICAL = 'SUBCLINICAL',
	MHP = 'MHP',
	SPECIALTY_CARE = 'SPECIALTY_CARE',
	CLOSED = 'CLOSED',
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
	REFERRED_TO_SPECIALTY_CARE_ENGAGED = 'REFERRED_TO_SPECIALTY_CARE_ENGAGED',
	REFERRED_TO_SPECIALTY_CARE_NOT_ENGAGED = 'REFERRED_TO_SPECIALTY_CARE_NOT_ENGAGED',
	REFERRED_TO_SPECIALTY_CARE_ENGAGEMENT_UNKNOWN = 'REFERRED_TO_SPECIALTY_CARE_ENGAGEMENT_UNKNOWN',
	REFERRED_TO_PCP = 'REFERRED_TO_PCP',
	LOST_TO_FOLLOWUP = 'LOST_TO_FOLLOWUP',
	DECLINED_CARE = 'DECLINED_CARE',
	INELIGIBLE_FOR_IC = 'INELIGIBLE_FOR_IC',
	REFERRED_TO_QUARTET = 'REFERRED_TO_QUARTET',
}

export enum PatientOrderTriageStatusId {
	NOT_TRIAGED = 'NOT_TRIAGED',
	SPECIALTY_CARE = 'SPECIALTY_CARE',
	SUBCLINICAL = 'SUBCLINICAL',
	MHP = 'MHP',
}

export enum PatientOrderIntakeWantsServicesStatusId {
	UNKNOWN = 'UNKNOWN',
	YES = 'YES',
	NO = 'NO',
}

export enum PatientOrderIntakeLocationStatusId {
	UNKNOWN = 'UNKNOWN',
	INVALID = 'INVALID',
	VALID = 'VALID',
}

export enum PatientOrderIntakeInsuranceStatusId {
	UNKNOWN = 'UNKNOWN',
	INVALID = 'INVALID',
	VALID = 'VALID',
	CHANGED_RECENTLY = 'CHANGED_RECENTLY',
}

export enum PatientOrderTriageOverrideReasonId {
	NOT_OVERRIDDEN = 'NOT_OVERRIDDEN',
	PATIENT_PREFERENCE = 'PATIENT_PREFERENCE',
	HIGHER_LEVEL_OF_CARE_REQUIRED = 'HIGHER_LEVEL_OF_CARE_REQUIRED',
	PATIENT_REQUESTED_RESOURCES = 'PATIENT_REQUESTED_RESOURCES',
	CLINICAL_REVIEW_WITH_BHS = 'CLINICAL_REVIEW_WITH_BHS',
	CLINICAL_REVIEW_WITH_PSYCHIATRIST = 'CLINICAL_REVIEW_WITH_PSYCHIATRIST',
	PCP_REQUEST = 'PCP_REQUEST',
	OTHER = 'OTHER',
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

export enum PatientOrderResourceCheckInResponseStatusId {
	NONE = 'NONE',
	APPOINTMENT_SCHEDULED = 'APPOINTMENT_SCHEDULED',
	APPOINTMENT_ATTENDED = 'APPOINTMENT_ATTENDED',
	NEED_FOLLOWUP = 'NEED_FOLLOWUP',
	NO_LONGER_NEED_CARE = 'NO_LONGER_NEED_CARE',
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

export enum PatientOrderFilterFlagTypeId {
	NONE = 'NONE',
	PATIENT_BELOW_AGE_THRESHOLD = 'PATIENT_BELOW_AGE_THRESHOLD',
	MOST_RECENT_EPISODE_CLOSED_WITHIN_DATE_THRESHOLD = 'MOST_RECENT_EPISODE_CLOSED_WITHIN_DATE_THRESHOLD',
	NO_INTEREST = 'NO_INTEREST',
	LOCATION_INVALID = 'LOCATION_INVALID',
	LOCATION_CHANGED_RECENTLY = 'LOCATION_CHANGED_RECENTLY',
	INSURANCE_INVALID = 'INSURANCE_INVALID',
	CONSENT_REJECTED = 'CONSENT_REJECTED',
	NEEDS_SAFETY_PLANNING = 'NEEDS_SAFETY_PLANNING',
	NEEDS_RESOURCES = 'NEEDS_RESOURCES',
	SESSION_ABANDONED = 'SESSION_ABANDONED',
}

export enum PatientOrderResourcingStatusId {
	UNKNOWN = 'UNKNOWN',
	NONE_NEEDED = 'NONE_NEEDED',
	NEEDS_RESOURCES = 'NEEDS_RESOURCES',
	SENT_RESOURCES = 'SENT_RESOURCES',
}

export enum PatientOrderResourcingTypeId {
	NONE = 'NONE',
	PHONE_CALL = 'PHONE_CALL',
	MYCHART_MESSAGE = 'MYCHART_MESSAGE',
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

export enum PatientOrderConsentStatusId {
	UNKNOWN = 'UNKNOWN',
	CONSENTED = 'CONSENTED',
	REJECTED = 'REJECTED',
}

export enum PatientOrderSortColumnId {
	ORDER_DATE = 'ORDER_DATE',
	PATIENT_FIRST_NAME = 'PATIENT_FIRST_NAME',
	PATIENT_LAST_NAME = 'PATIENT_LAST_NAME',
	MOST_RECENT_SCREENING_SESSION_COMPLETED_AT = 'MOST_RECENT_SCREENING_SESSION_COMPLETED_AT',
	MOST_RECENT_OUTREACH_DATE_TIME = 'MOST_RECENT_OUTREACH_DATE_TIME',
	MOST_RECENT_SCHEDULED_SCREENING_SCHEDULED_DATE_TIME = 'MOST_RECENT_SCHEDULED_SCREENING_SCHEDULED_DATE_TIME',
	EPISODE_CLOSED_AT = 'EPISODE_CLOSED_AT',
	PRACTICE = 'PRACTICE',
	INSURANCE = 'INSURANCE',
	OUTREACH_NUMBER = 'OUTREACH_NUMBER',
	EPISODE_LENGTH = 'EPISODE_LENGTH',
}

export enum SortDirectionId {
	ASCENDING = 'ASCENDING',
	DESCENDING = 'DESCENDING',
}

export enum SortNullsId {
	NULLS_FIRST = 'NULLS_FIRST',
	NULLS_LAST = 'NULLS_LAST',
}

export enum PatientOrderCarePreferenceId {
	NO_PREFERENCE = 'NO_PREFERENCE',
	TELEHEALTH = 'TELEHEALTH',
	IN_PERSON = 'IN_PERSON',
}

export enum MessageStatusId {
	ENQUEUED = 'ENQUEUED', // Waiting to leave Cobalt
	SENT = 'SENT', // Left Cobalt, turned over to vendor for delivery attempt - not sure if delivered or not yet
	DELIVERED = 'DELIVERED', // Confirmed with vendor that delivery occurred
	DELIVERY_FAILED = 'DELIVERY_FAILED', // Confirmed with vendor that delivery failed
	ERROR = 'ERROR', // Failed before ever leaving Cobalt (e.g. vendor rejected send attempt)
}

export enum MessageTypeId {
	EMAIL = 'EMAIL',
	SMS = 'SMS',
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
	patientUniqueId: string;
	patientUniqueIdType: string;
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
		emailToAddresses: string[];
		institutionId: string;
		messageId: string;
		messageStatusDescription: string;
		messageStatusId: MessageStatusId;
		messageTypeDescription: string;
		messageTypeId: MessageTypeId;
		patientOrderScheduledMessageId: string;
		processedAt: string;
		processedAtDescription: string;
		scheduledMessageId: string;
		scheduledMessageStatusId: ScheduledMessageStatusId;
		sentAt: string;
		sentAtDescription: string;
		smsToNumber: string;
		smsToNumberDescription: string;
		scheduledAtDate: string;
	}[];
	scheduledAtDateTimeHasPassed: boolean;
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
