export interface PatientOrderCountModel {
	activePatientOrderCount: number;
	activePatientOrderCountDescription: string;
}

export interface PatientOrderModel {
	associatedDiagnosis: string;
	billingProviderDisplayName: string;
	billingProviderFirstName: string;
	billingProviderId: string;
	billingProviderLastName: string;
	callbackPhoneNumber: string;
	callbackPhoneNumberDescription: string;
	comments: string;
	encounterDepartmentId: string;
	encounterDepartmentName: string;
	episodeDurationInDays: number;
	episodeDurationInDaysDescription: string;
	orderAgeInMinutes: number;
	orderAgeInMinutesDescription: string;
	orderDate: string;
	orderDateDescription: string;
	orderId: string;
	orderingProviderDisplayName: string;
	orderingProviderFirstName: string;
	orderingProviderLastName: string;
	patientAddressId: string;
	patientBirthSexId: string;
	patientBirthdate: string;
	patientBirthdateDescription: string;
	patientDisplayName: string;
	patientFirstName: string;
	patientId: string;
	patientIdType: string;
	patientLastName: string;
	patientMrn: string;
	patientOrderId: string;
	patientOrderStatusId: string;
	primaryPayorId: string;
	primaryPayorName: string;
	primaryPlanId: string;
	primaryPlanName: string;
	reasonForReferral: string;
	referringPracticeName: string;
	routing: string;
}
