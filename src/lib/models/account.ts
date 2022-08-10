// https://github.com/Penn-Medicine-CHCI/cobalt-api/blob/master/src/main/java/com/cobaltplatform/api/model/db/AccountSource.java#L18
export enum AccountSourceId {
	COBALT_SSO = 'COBALT_SSO',
	ANONYMOUS = 'ANONYMOUS',
}

export interface AccountModel {
	accountId: string;
	capabilities?: Record<string, AccountInstitutionCapabilities>;
	providerId?: string;
	institutionId: string;
	accountSourceId?: AccountSourceId;
	emailAddress?: string;
	epicPatientCreatedByCobalt: boolean;
	epicPatientId?: string;
	epicPatientIdType?: string;
	firstName?: string;
	lastName?: string;
	displayName?: string;
	phoneNumber?: string;
	timeZone: string;
	locale: string;
	consentFormAccepted?: boolean;
	consentFormAcceptedDate?: string;
	consentFormAcceptedDateDescription?: string;
	created: string;
	createdDescription: string;
	lastUpdated?: string;
	lastUpdatedDescription?: string;
	roleId: string;
	sourceSystemId: string;
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
