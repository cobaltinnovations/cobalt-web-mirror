export interface PatientOrderCountModel {
	activePatientOrderCount: number;
	activePatientOrderCountDescription: string;
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
}

export enum PatientOrderStatusId {
	NEW = 'NEW',
	AWAITING_SCREENING = 'AWAITING_SCREENING',
	SCREENING_IN_PROGRESS = 'SCREENING_IN_PROGRESS',
	AWAITING_MHIC_SCHEDULING = 'AWAITING_MHIC_SCHEDULING',
	AWAITING_PROVIDER_SCHEDULING = 'AWAITING_PROVIDER_SCHEDULING',
	AWAITING_SAFETY_PLANNING = 'AWAITING_SAFETY_PLANNING',
	SCHEDULED_WITH_MHIC = 'SCHEDULED_WITH_MHIC',
	SCHEDULED_WITH_PROVIDER = 'SCHEDULED_WITH_PROVIDER',
	NEEDS_FURTHER_ASSESSMENT = 'NEEDS_FURTHER_ASSESSMENT',
	CONNECTED_TO_CARE = 'CONNECTED_TO_CARE',
	LOST_CONTACT = 'LOST_CONTACT',
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
