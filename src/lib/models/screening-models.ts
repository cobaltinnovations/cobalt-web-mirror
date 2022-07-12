export interface ScreeningSession {
	screeningSessionId: string;
	screeningFlowVersionId: string;
	targetAccountId: string;
	createdByAccountId: string;
	completed: boolean;
	crisisIndicated: boolean;
	promptForPhoneNumber: boolean;
	created: string;
	createdDescription: string;
	nextScreeningQuestionContextId?: string;
	screeningSessionDestination?: ScreeningSessionDestination;
}

export enum ScreeningSessionDestinationId {
	CRISIS = 'CRISIS',
	ONE_ON_ONE_PROVIDER_LIST = 'ONE_ON_ONE_PROVIDER_LIST',
}

export interface ScreeningSessionDestination {
	screeningSessionDestinationId: ScreeningSessionDestinationId;
	context: Record<string, unknown>;
}

export enum ScreeningAnswerFormatId {
	SINGLE_SELECT = 'SINGLE_SELECT',
	MULTI_SELECT = 'MULTI_SELECT',
	FREEFORM_TEXT = 'FREEFORM_TEXT',
}

export enum ScreeningAnswerContentHintId {
	NONE = 'NONE',
	FIRST_NAME = 'FIRST_NAME',
	LAST_NAME = 'LAST_NAME',
	FULL_NAME = 'FULL_NAME',
	PHONE_NUMBER = 'PHONE_NUMBER',
	EMAIL_ADDRESS = 'EMAIL_ADDRESS',
}

export interface ScreeningQuestion {
	screeningQuestionId: string;
	screeningVersionId: string;
	screeningAnswerFormatId: ScreeningAnswerFormatId;
	screeningAnswerContentHintId: ScreeningAnswerContentHintId;
	introText?: string;
	questionText: string;
	minimumAnswerCount: number;
	minimumAnswerCountDescription: string;
	maximumAnswerCount: number;
	maximumAnswerCountDescription: string;
	displayOrder: number;
}

export interface ScreeningAnswerOption {
	screeningAnswerOptionId: string;
	screeningQuestionId: string;
	answerOptionText?: string;
	displayOrder: number;
}

export interface ScreeningAnswer {
	screeningAnswerId: string;
	screeningAnswerOptionId: string;
	screeningSessionAnsweredScreeningQuestionId: string;
	createdByAccountId: string;
	text?: string;
	created: string;
	createdDescription: string;
}
