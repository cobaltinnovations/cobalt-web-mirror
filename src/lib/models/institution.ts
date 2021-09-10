export interface Institution {
	anonymousEnabled: boolean;
	calendarDescription: string;
	covidContent: string;
	crisisContent: string;
	emailEnabled: boolean;
	institutionId: string;
	privacyContent: string;
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
