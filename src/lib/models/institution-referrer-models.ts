export interface InstitutionReferrerResultScreenBooking {
	path?: string;
	featureId?: string;
	pageTitle?: string;
	pageDescription?: string;
	providerId?: string;
	clinicIds?: string[];
	appointmentTypeIds?: string[];
}

export interface InstitutionReferrerResultScreen {
	title?: string;
	subtitle?: string;
	recommendation: string;
	bodyHtml?: string;
	noteHtml?: string;
	buttonText?: string;
	booking?: InstitutionReferrerResultScreenBooking;
}

export interface InstitutionReferrerMetadata {
	screening?: {
		fullscreen?: boolean;
		title?: string;
		instructionsHtml?: string;
	};
	resultScreens?: Record<string, InstitutionReferrerResultScreen>;
}

export interface InstitutionReferrer {
	institutionReferrerId: string;
	fromInstitutionId: string;
	toInstitutionId: string;
	urlName: string;
	title: string;
	description: string;
	pageContent: string;
	ctaTitle: string;
	ctaDescription: string;
	intakeScreeningFlowId: string;
	metadata?: InstitutionReferrerMetadata;
}

export interface InstitutionFeatureInstitutionReferrer {
	institutionFeatureInstitutionReferrerId: string;
	institutionFeatureId: string;
	institutionReferrerId: string;
	ctaTitle: string;
	ctaDescription: string;
}
