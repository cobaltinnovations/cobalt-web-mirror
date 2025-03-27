export interface ScreeningFlow {
	screeningFlowId: string;
	institutionId: string;
	screeningFlowTypeId: ScreeningFlowTypeId;
	activeScreeningFlowVersionId: string;
	name: string;
	createdByAccountId: string;
}

export interface ScreeningSession {
	screeningSessionId: string;
	screeningFlowVersionId: string;
	createdByAccountId: string;
	targetAccountId: string;
	patientOrderId: string;
	completed: boolean;
	completedAt: string;
	completedAtDescription: string;
	skipped: boolean;
	skippedAt: string;
	skippedAtDescription: string;
	crisisIndicated: boolean;
	crisisIndicatedAt: string;
	crisisIndicatedAtDescription: string;
	created: string;
	createdDescription: string;
	nextScreeningQuestionContextId?: string;
	screeningSessionDestination?: ScreeningSessionDestination;
}

export enum ScreeningFlowSkipTypeId {
	SKIP = 'SKIP',
	EXIT = 'EXIT',
}

export interface ScreeningFlowVersion {
	initialScreeningId: string;
	phoneNumberRequired: boolean;
	screeningFlowId: string;
	screeningFlowSkipTypeId: ScreeningFlowSkipTypeId;
	screeningFlowVersionId: string;
	skippable: boolean;
	versionNumber: number;
}

export enum ScreeningFlowTypeId {
	CUSTOM = 'CUSTOM',
	PROVIDER_TRIAGE = 'PROVIDER_TRIAGE',
	CONTENT_TRIAGE = 'CONTENT_TRIAGE',
	PROVIDER_INTAKE = 'PROVIDER_INTAKE',
	INTEGRATED_CARE = 'INTEGRATED_CARE',
	INTEGRATED_CARE_INTAKE = 'INTEGRATED_CARE_INTAKE',
	FEATURE = 'FEATURE',
	GROUP_SESSION_INTAKE = 'GROUP_SESSION_INTAKE',
	ONBOARDING = 'ONBOARDING',
	COURSE_UNIT = 'COURSE_UNIT',
}

export enum ScreeningSessionDestinationResultId {
	SUCCESS = 'SUCCESS',
	FAILURE = 'FAILURE',
}

export enum ScreeningSessionDestinationId {
	CRISIS = 'CRISIS',
	ONE_ON_ONE_PROVIDER_LIST = 'ONE_ON_ONE_PROVIDER_LIST',
	CONTENT_LIST = 'CONTENT_LIST',
	GROUP_SESSION_LIST = 'GROUP_SESSION_LIST',
	GROUP_SESSION_DETAIL = 'GROUP_SESSION_DETAIL',
	IC_PATIENT_SCREENING_SESSION_RESULTS = 'IC_PATIENT_SCREENING_SESSION_RESULTS',
	IC_MHIC_SCREENING_SESSION_RESULTS = 'IC_MHIC_SCREENING_SESSION_RESULTS',
	IC_PATIENT_CLINICAL_SCREENING = 'IC_PATIENT_CLINICAL_SCREENING',
	HOME = 'HOME',
	MENTAL_HEALTH_PROVIDER_RECOMMENDATIONS = 'MENTAL_HEALTH_PROVIDER_RECOMMENDATIONS',
	IC_MHIC_CLINICAL_SCREENING = 'IC_MHIC_CLINICAL_SCREENING',
	INSTITUTION_REFERRAL = 'INSTITUTION_REFERRAL',
	INSTITUTION_REFERRER_DETAIL = 'INSTITUTION_REFERRER_DETAIL',
	NONE = 'NONE',
}

export interface ScreeningSessionDestination {
	screeningSessionDestinationId: ScreeningSessionDestinationId;
	context: Record<string, unknown>;
	screeningSessionDestinationResultId: ScreeningSessionDestinationResultId;
}

export enum ScreeningAnswerFormatId {
	SINGLE_SELECT = 'SINGLE_SELECT',
	MULTI_SELECT = 'MULTI_SELECT',
	FREEFORM_TEXT = 'FREEFORM_TEXT',
	CARD_SORT = 'CARD_SORT',
	REORDER = 'REORDER',
}

export enum ScreeningAnswerContentHintId {
	NONE = 'NONE',
	FIRST_NAME = 'FIRST_NAME',
	LAST_NAME = 'LAST_NAME',
	FULL_NAME = 'FULL_NAME',
	PHONE_NUMBER = 'PHONE_NUMBER',
	EMAIL_ADDRESS = 'EMAIL_ADDRESS',
	INTEGER = 'INTEGER',
	FREEFORM_TEXT = 'FREEFORM_TEXT',
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
	preferAutosubmit: boolean;
	displayOrder: number;
	screeningQuestionSubmissionStyleId: ScreeningQuestionSubmissionStyleId;
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

export interface ScreeningConfirmationPrompt {
	screeningConfirmationPromptId: string;
	screeningImageId?: ScreeningImageId;
	text: string;
	titleText?: string;
	actionText: string;
}

export interface ScreeningQuestionContextResponse {
	previousScreeningQuestionContextId?: string;
	screening: {
		screeningId: string;
		name: string;
		activeScreeningVersionId: string;
		created: string;
		createdDescription: string;
	};
	screeningSession: ScreeningSession;
	screeningQuestion: ScreeningQuestion;
	screeningAnswerOptions: ScreeningAnswerOption[];
	screeningAnswers: ScreeningAnswer[];
	screeningSessionDestination: ScreeningSessionDestination;
	screeningFlowVersion: ScreeningFlowVersion;
	preQuestionScreeningConfirmationPrompt?: ScreeningConfirmationPrompt;
	previouslyAnswered: boolean;
}

export interface ScreeningSessionResult {
	screeningFlowId?: string;
	screeningFlowName?: string;
	screeningFlowVersionId?: string;
	screeningFlowVersionNumber?: number;
	screeningSessionScreeningResults?: ScreeningSessionScreeningResult[];
}

export interface ScreeningScore {
	overallScore?: number;
	personalAccomplishmentScore?: number;
	depersonalizationScore?: number;
	emotionalExhaustionScore?: number;
}

export interface ScreeningSessionScreeningResult {
	screeningVersionId?: string;
	screeningId?: string;
	screeningVersionNumber?: number;
	screeningTypeId?: string;
	screeningName?: string;
	screeningScore?: ScreeningScore;
	belowScoringThreshold?: boolean;
	screeningQuestionResults?: ScreeningQuestionResult[];
}

export interface ScreeningQuestionResult {
	screeningQuestionId?: string;
	screeningQuestionIntroText?: string;
	screeningQuestionText?: string;
	screeningAnswerResults?: ScreeningAnswerResult[];
}

export interface ScreeningAnswerResult {
	screeningAnswerId?: string;
	screeningAnswerOptionId?: string;
	answerOptionText?: string;
	text?: string;
	score?: number;
}

export interface ScreeningAnswersMessage {
	displayTypeId: ScreeningAnswersDisplayTypeId;
	message: string;
}

export interface ScreeningAnswersQuestionResult {
	correctnessIndicatorId: ScreeningAnswersCorrectnessIndicatorId;
	displayTypeId: ScreeningAnswersDisplayTypeId;
}

export enum ScreeningAnswersCorrectnessIndicatorId {
	CORRECT = 'CORRECT',
	INCORRECT = 'INCORRECT',
}

export enum ScreeningAnswersDisplayTypeId {
	DEFAULT = 'DEFAULT',
	PRIMARY = 'PRIMARY',
	SECONDARY = 'SECONDARY',
	SUCCESS = 'SUCCESS',
	DANGER = 'DANGER',
	WARNING = 'WARNING',
	INFO = 'INFO',
	DARK = 'DARK',
	LIGHT = 'LIGHT',
}

export enum ScreeningQuestionSubmissionStyleId {
	NEXT = 'NEXT',
	SUBMIT = 'SUBMIT',
}
