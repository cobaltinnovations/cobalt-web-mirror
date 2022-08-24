export interface Institution {
	anonymousEnabled: boolean;
	calendarDescription: string;
	covidContent: string;
	crisisContent: string;
	emailEnabled: boolean;
	emailSignupEnabled: boolean;
	institutionId: string;
	privacyContent: string;
	contentScreeningFlowId?: string;
	providerTriageScreeningFlowId: string;
	requireConsentForm: boolean;
	ssoEnabled: boolean;
	supportEnabled: boolean;
	wellBeingContent: string;
}

export interface AccountSource {
	accountSourceId: string;
	description: string;
	ssoUrl: string;
}
