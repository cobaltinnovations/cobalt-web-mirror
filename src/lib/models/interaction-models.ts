export interface InteractionInstance {
	interactionInstanceId: string;
	interactionId: string;
	startDateTime: string;
	startDateTimeDescription: string;
	timeZone: string;
	completedFlag: boolean;

	// Intentionally typed like this.
	// We don’t know all possible object properties.
	// They can and will change drastically over time.
	metadata: Record<string, any>;
	hipaaCompliantMetadata: Record<string, any>;

	caseNumber: string;
}

export interface InteractionOption {
	interactionOptionId: string;
	interactionId: string;
	optionDescription: string;
	optionResponse: string;
	finalFlag: boolean;
	optionOrder: number;
	optionUrl: string;
}

export interface InteractionOptionAction {
	interactionOptionActionId: string;
	interactionOptionId: string;
	interactionInstanceId: string;
	accountId: string;
	description: string;
	descriptionAsHtml: string;
	created: string;
	createdDescription: string;
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
