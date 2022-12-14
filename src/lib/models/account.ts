// https://github.com/Penn-Medicine-CHCI/cobalt-api/blob/master/src/main/java/com/cobaltplatform/api/model/db/AccountSource.java#L18
export enum AccountSourceId {
	COBALT_SSO = 'COBALT_SSO',
	ANONYMOUS = 'ANONYMOUS',
	EMAIL_PASSWORD = 'EMAIL_PASSWORD',
	MYCHART = 'MYCHART',
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
	capabilities?: Record<string, AccountInstitutionCapabilities>;
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
	insuranceId?: string;
	languageCode?: string;
	lastName?: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	locale: string;
	phoneNumber?: string;
	phoneNumberDescription?: string;
	providerId?: string;
	raceId?: string;
	roleId: string;
	sourceSystemId: string;
	timeZone: string;
}

export interface AccountInstitutionCapabilities {
	viewNavAdminAvailableContent: boolean;
	viewNavAdminGroupSession: boolean;
	viewNavAdminGroupSessionRequest: boolean;
	viewNavAdminMyContent: boolean;
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
