import { AccountModel } from './account';
import { PatientOrderScreeningSession, ScreeningSessionResult } from './screening-models';

export interface PatientOrderCountModel {
	activePatientOrderCount: number;
	activePatientOrderCountDescription: string;
}

export interface ActivePatientOrderCountModel {
	count: number;
	countDescription: string;
}

export interface PatientOrderModel {
	patientOrderId: string;
	patientOrderStatusId?: PatientOrderStatusId;
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
	callbackPhoneNumber?: string;
	callbackPhoneNumberDescription?: string;
	preferredContactHours?: string;
	comments?: string;
	ccRecipients?: string;
	lastActiveMedicationOrderSummary?: string;
	medications?: string;
	recentPsychotherapeuticMedications?: string;
	episodeEndedAt?: string;
	episodeEndedAtDescription?: string;
	episodeDurationInDays?: number;
	episodeDurationInDaysDescription?: string;

	// MHIC specific
	patientAddress?: PatientAddressModel;
	patientOrderDiagnoses?: PatientOrderDiagnosesModel[];
	patientOrderMedications?: PatientOrderMedicationModel[];
	patientOrderOutreaches?: PatientOrderOutreachModel[];
	patientOrderNotes?: PatientOrderNoteModel[];
	patientOrderScreeningStatusId: PatientOrderScreeningStatusId;
	screeningSession?: PatientOrderScreeningSession;
	screeningSessionResult?: ScreeningSessionResult;
}

export enum PatientOrderStatusId {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
	ARCHIVED = 'ARCHIVED',
	DELETED = 'DELETED',
}

export enum PatientOrderScreeningStatusId {
	NOT_SCREENED = 'NOT_SCREENED',
	IN_PROGRESS = 'IN_PROGRESS',
	SCHEDULED = 'SCHEDULED',
	COMPLETE = 'COMPLETE',
}

export enum PatientOrderPanelTypeId {
	ALL = 'ALL',
	NEW = 'NEW',
	NEED_ASSESSMENT = 'NEED_ASSESSMENT',
	SCHEDULED = 'SCHEDULED',
	SAFETY_PLANNING = 'SAFETY_PLANNING',
	SPECIALTY_CARE = 'SPECIALTY_CARE',
	BHP = 'BHP',
	CLOSED = 'CLOSED',
}

export interface PatientAddressModel {
	addressId: string;
	countryCode: string;
	locality: string;
	postalCode: string;
	postalName: string;
	region: string;
	streetAddress1: string;
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
}

export interface PatientOrderClosureReasonModel {
	patientOrderClosureReasonId: string;
	description: string;
}
