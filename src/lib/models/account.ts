import { FeatureId } from './institution';

// https://github.com/Penn-Medicine-CHCI/cobalt-api/blob/master/src/main/java/com/cobaltplatform/api/model/db/AccountSource.java#L18
export enum AccountSourceId {
	COBALT_SSO = 'COBALT_SSO',
	ANONYMOUS = 'ANONYMOUS',
	EMAIL_PASSWORD = 'EMAIL_PASSWORD',
	MYCHART = 'MYCHART',
}

export enum LoginDestinationId {
	COBALT_PATIENT = 'COBALT_PATIENT',
	IC_PATIENT = 'IC_PATIENT',
	IC_PANEL = 'IC_PANEL',
}

export interface AccountModel {
	accountId: string;
	accountSourceId?: AccountSourceId;
	address?: {
		addressId: string;
		countryCode?: string;
		locality?: string;
		postalCode?: string;
		postalName?: string;
		region?: string;
		streetAddress1?: string;
		streetAddress2?: string;
	};
	betaStatusId?: string;
	birthSexId?: string;
	birthdate?: string;
	birthdateDescription?: string;
	consentFormAccepted: false;
	consentFormAcceptedDate?: string;
	consentFormAcceptedDateDescription?: string;
	countryCode?: string;
	created: string;
	createdDescription: string;
	displayName?: string;
	emailAddress?: string;
	epicPatientCreatedByCobalt: boolean;
	epicPatientId?: string;
	epicPatientIdType?: string;
	ethnicityId?: string;
	firstName?: string;
	genderIdentityId?: string;
	institutionId: string;
	institutionLocationId: string;
	insuranceId?: string;
	jobTitle?: string;
	languageCode?: string;
	lastName?: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	locale: string;
	loginDestinationId: LoginDestinationId;
	phoneNumber?: string;
	phoneNumberDescription?: string;
	providerId?: string;
	raceId?: string;
	roleId: string;
	sourceSystemId: string;
	timeZone: string;
	accountCapabilityFlags: {
		canEditIcSafetyPlanning: boolean;
		canEditIcTriages: boolean;
		canImportIcPatientOrders: boolean;
		canViewIcReports: boolean;
		canAdministerIcDepartments: boolean;
		canAdministerContent: boolean; // My Content / Available Content admin tabs
		canAdministerGroupSessions: boolean; // Group Session admin tab
		canViewAnalytics: boolean; // Analytics admin tab
		canViewProviderReports: boolean; // Reports admin tab
		canViewStudyInsights: boolean;
		canViewProviderReportAppointments: boolean; // PROVIDER_APPOINTMENTS report option in dropdown
		canViewProviderReportAppointmentsEap: boolean; // PROVIDER_APPOINTMENTS_EAP report option in dropdown
		canViewProviderReportAppointmentCancelations: boolean; // `PROVIDER_APPOINTMENT_CANCELATIONS` report option in dropdown
		canViewProviderReportUnusedAvailability: boolean; // `PROVIDER_UNUSED_AVAILABILITY` report option in dropdown
		canManageCareResources: boolean;
	};
}

export interface AccountQuestionModel {
	question: string;
	responses: string;
}

export enum BetaFeatureId {
	SWITCHBOARD = 'SWITCHBOARD',
}

export enum BetaStatusId {
	UNKNOWN = 'UNKNOWN',
	ENABLED = 'ENABLED',
	DISABLED = 'DISABLED',
}

export interface BetaFeature {
	betaFeatureId: BetaFeatureId;
	betaFeatureAlertStatusId: BetaStatusId;
	description: string;
}

export interface AccountSupportRole {
	supportRoleId: string;
	description: string;
}

export interface AccountFeature {
	featureId: FeatureId;
	name: string;
}
