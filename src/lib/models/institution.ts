export interface Institution {
	institutionId: string;
	providerTriageScreeningFlowId?: string;
	contentScreeningFlowId?: string;
	groupSessionsScreeningFlowId?: string;
	description: string;
	/** @deprecated */
	crisisContent?: string;
	/** @deprecated */
	privacyContent?: string;
	/** @deprecated */
	covidContent?: string;
	requireConsentForm?: boolean;
	/** @deprecated */
	consentFormContent?: string;
	calendarDescription?: string;
	supportEnabled?: boolean;
	/** @deprecated */
	wellBeingContent?: string;
	/** @deprecated */
	ssoEnabled?: boolean;
	/** @deprecated */
	emailEnabled?: boolean;
	emailSignupEnabled: boolean;
	/** @deprecated */
	anonymousEnabled?: boolean;
	supportEmailAddress: boolean;
	immediateAccessEnabled: boolean;
	contactUsEnabled: boolean;
	ga4MeasurementId?: string;
}

export enum ACOUNT_SOURCE_ID {
	ANONYMOUS = 'ANONYMOUS',
	EMAIL_PASSWORD = 'EMAIL_PASSWORD',
}

export enum ACCOUNT_SOURCE_DISPLAY_STYLE_ID {
	PRIMARY = 'PRIMARY',
	SECONDARY = 'SECONDARY',
	TERTIARY = 'TERTIARY',
}

export interface AccountSource {
	accountSourceDisplayStyleId: ACCOUNT_SOURCE_DISPLAY_STYLE_ID;
	accountSourceId: ACOUNT_SOURCE_ID | string;
	authenticationDescription: string;
	description: string;
	ssoUrl?: string;
}
