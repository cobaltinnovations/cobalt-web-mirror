export interface ScreeningSession {
	screeningSessionId: string;
	screeningFlowVersionId: string;
	targetAccountId: string;
	createdByAccountId: string;
	completed: boolean;
	skipped: boolean;
	crisisIndicated: boolean;
	created: string;
	createdDescription: string;
	nextScreeningQuestionContextId?: string;
	screeningSessionDestination?: ScreeningSessionDestination;
}

export interface ScreeningFlowVersion {
	screeningFlowVersionId: string;
	screeningFlowId: string;
	initialScreeningId: string;
	phoneNumberRequired: boolean;
	skippable: boolean;
	versionNumber: number;
}

export enum ScreeningSessionDestinationId {
	CRISIS = 'CRISIS',
	ONE_ON_ONE_PROVIDER_LIST = 'ONE_ON_ONE_PROVIDER_LIST',
	CONTENT_LIST = 'CONTENT_LIST',
	GROUP_SESSION_LIST = 'GROUP_SESSION_LIST',
	IC_PATIENT_SCREENING_SESSION_RESULTS = 'IC_PATIENT_SCREENING_SESSION_RESULTS',
	IC_MHIC_SCREENING_SESSION_RESULTS = 'IC_MHIC_SCREENING_SESSION_RESULTS',
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
	footerText?: string;
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
	freeformSupplement?: boolean;
	freeformSupplementText?: string;
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

export type ScreeningAnswerSelection = Pick<ScreeningAnswer, 'screeningAnswerOptionId' | 'text'>;

export enum ScreeningImageId {
	Appointment = 'APPOINTMENT',
	ConnectedToCare = 'CONNECTED_TO_CARE',
	ConnectingToCare = 'CONNECTING_TO_CARE',
	FeelingRecently = 'FEELING_RECENTLY',
	Goals = 'GOALS',
	KeepGoing = 'KEEP_GOING',
	NextAppointmentScheduled = 'NEXT_APPOINTMENT_SCHEDULED',
	Resources = 'RESOURCES',
	Safety = 'SAFETY',
	ScreeningComplete = 'SCREENING_COMPLETE',
	ScreeningToDo = 'SCREENING_TO_DO',
	Welcome = 'WELCOME',
}

export interface ScreeningQuestionPrompt {
	screeningConfirmationPromptId: string;
	screeningImageId?: ScreeningImageId;
	text: string;
	actionText: string;
}

export interface ScreeningQuestionContextResponse {
	previousScreeningQuestionContextId: string;
	previouslyAnswered: boolean;
	screeningQuestion: ScreeningQuestion;
	screeningAnswerOptions: ScreeningAnswerOption[];
	screeningAnswers: ScreeningAnswer[];
	screeningFlowVersion: ScreeningFlowVersion;
	screeningSessionDestination: ScreeningSessionDestination;
	preQuestionScreeningConfirmationPrompt?: ScreeningQuestionPrompt;
}
