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
}

export interface InstitutionFeatureInstitutionReferrer {
	institutionFeatureInstitutionReferrerId: string;
	institutionFeatureId: string;
	institutionReferrerId: string;
	ctaTitle: string;
	ctaDescription: string;
}
