export enum QUESTION_TYPE {
	DROPDOWN = 'DROPDOWN',
	CHECKBOX = 'CHECKBOX',
	RADIO = 'RADIO',
	QUAD = 'QUAD',
	TEXT = 'TEXT',
	DATE = 'DATE',
	COBALT_STUDENT_ID = 'COBALT_STUDENT_ID',
	PHONE_NUMBER = 'PHONE_NUMBER',
}

export interface Assessment {
	assessmentType: string;
	question: AssessmentQuestion;
	assessmentPrompt?: string;
	sessionId: string;
	assessmentId: string;
	nextQuestionId?: string;
	previousQuestionId?: string;
	previousSessionId?: string;
	assessmentProgress: number;
	assessmentProgressTotal: number;
	bookingAllowed?: boolean;
}

export interface PersonalizationQuestion {
	answers: PersonalizationAnswer[];
	label: string;
	questionId: string;
	questionType: 'CHECKBOX' | 'HORIZONTAL_CHECKBOX' | 'TEXT';
	selectedAnswers: {
		answerId: string;
		answerText?: string;
	}[];
}

export interface PersonalizationAnswer {
	answerId: string;
	label: string;
	question?: PersonalizationQuestion;
}

export interface PersonalizationChoice {
	questionId: string;
	selectedAnswers: { answerId: string }[];
}

export interface PersonalizationDetails {
	assessmentQuestions: PersonalizationQuestion[];
}

export interface AssessmentQuestion {
	questionId: string;
	fontSizeId?: string;
	questionTitle: string;
	questionType: QUESTION_TYPE | string;
	answers: QuestionAnswerOption[];
	selectedAnswerIds: string[];
	selectedAssessmentAnswers: SelectedQuestionAnswer[];
}

export interface SelectedQuestionAnswer {
	answerId: string;
	answerText?: string;
}

export interface QuestionAnswerOption {
	answerId: string;
	answerDescription: string;
	isCrisis: boolean;
	isCall: boolean;
}

export interface AssessmentRecommendation {
	level: string;
	score: number;
	sessionId: string;
}

export interface AssessmentScore {
	isCrisis: boolean;
	isCall: boolean;
	topRecommendation: AssessmentRecommendation;
	// add other (optional?) recommendations
	// not sure if they're needed yet
}

export interface RecommendationLevel {
	recommendationLevelId: string;
	description: string;
}
