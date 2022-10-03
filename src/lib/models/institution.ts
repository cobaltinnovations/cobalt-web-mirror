export interface Institution {
	anonymousEnabled: boolean;
	contactUsEnabled: boolean;
	calendarDescription: string;
	contentScreeningFlowId?: string;
	covidContent: string;
	crisisContent: string;
	emailEnabled: boolean;
	emailSignupEnabled: boolean;
	groupSessionsScreeningFlowId?: string;
	immediateAccessEnabled: boolean;
	institutionId: string;
	privacyContent: string;
	providerTriageScreeningFlowId: string;
	requireConsentForm: boolean;
	ssoEnabled: boolean;
	ga4MeasurementId: string;
	supportEmailAddress: string;
	supportEnabled: boolean;
	wellBeingContent: string;
}

export interface AccountSource {
	accountSourceId: string;
	description: string;
	ssoUrl: string;
}
