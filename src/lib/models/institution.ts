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
	userSubmittedContentEnabled: boolean;
	userSubmittedGroupSessionEnabled: boolean;
	userSubmittedGroupSessionRequestEnabled: boolean;
	institutionId: string;
	integratedCareEnabled: boolean;
	integratedCareScreeningFlowId?: string;
	name: string;
	providerTriageScreeningFlowId?: string;
	requireConsentForm: boolean;
	supportEmailAddress: string;
	supportEnabled: boolean;
	recommendedContentEnabled: boolean;
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

export enum INSTITUTION_BLURB_TYPE_ID {
	INTRO = 'INTRO',
	TEAM = 'TEAM',
	ABOUT = 'ABOUT',
}

export interface InstitutionBlurb {
	institutionBlurbId: string;
	institutionId: string;
	institutionBlurbTypeId: INSTITUTION_BLURB_TYPE_ID;
	title: string;
	description: string;
	shortDescription: string;
	institutionTeamMembers: InstitutionTeamMember[];
}

export interface InstitutionTeamMember {
	institutionTeamMemberId: string;
	institutionId: string;
	title: string;
	name: string;
	imageUrl: string;
}
