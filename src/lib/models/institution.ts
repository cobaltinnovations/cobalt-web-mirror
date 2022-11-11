import { AccountSourceId } from './account';

export interface Institution {
	additionalNavigationItems: AdditionalNavigationItem[];
	anonymousEnabled: boolean;
	contactUsEnabled: boolean;
	contentScreeningFlowId?: string;
	emailSignupEnabled: boolean;
	ga4MeasurementId?: string;
	groupSessionsScreeningFlowId?: string;
	immediateAccessEnabled: boolean;
	institutionId: string;
	integratedCareEnabled: boolean;
	integratedCareScreeningFlowId?: string;
	name: string;
	providerTriageScreeningFlowId?: string;
	requireConsentForm: boolean;
	supportEmailAddress: string;
	supportEnabled: boolean;
}

export interface AdditionalNavigationItem {
	url: string;
	name: string;
	iconName: string;
}

export enum AccountSourceDisplayStyleId {
	PRIMARY = 'PRIMARY',
	SECONDARY = 'SECONDARY',
	TERTIARY = 'TERTIARY',
}

export interface AccountSource {
	accountSourceDisplayStyleId: AccountSourceDisplayStyleId;
	accountSourceId: AccountSourceId;
	authenticationDescription: string;
	description: string;
	ssoUrl?: string;
}
