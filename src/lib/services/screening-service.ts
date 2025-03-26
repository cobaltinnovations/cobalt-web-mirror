import {
	ScreeningAnswer,
	ScreeningAnswersMessage,
	ScreeningAnswersQuestionResult,
	ScreeningFlow,
	ScreeningFlowTypeId,
	ScreeningFlowVersion,
	ScreeningQuestion,
	ScreeningQuestionContextResponse,
	ScreeningSession,
	ScreeningSessionDestination,
	ScreeningType,
} from '@/lib/models';
import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils/url-utils';

type ScreeningFlowParams = {
	screeningFlowId?: string;
	targetAccountId?: string | null;
	screeningFlowVersionId?: string;
	patientOrderId?: string;
	groupSessionId?: string;
	metadata?: {
		modifiedAssessment?: boolean;
	};
};

export const screeningService = {
	getScreeningSessionsByFlowId(params: ScreeningFlowParams) {
		if (typeof params.targetAccountId !== 'string') {
			delete params.targetAccountId;
		}

		return httpSingleton.orchestrateRequest<{ screeningSessions: ScreeningSession[] }>({
			method: 'get',
			url: buildQueryParamUrl('/screening-sessions', params),
		});
	},

	getScreeningFlowVersionsByFlowId(params: ScreeningFlowParams) {
		return httpSingleton.orchestrateRequest<{
			activeScreeningFlowVersionId: string;
			screeningFlowVersions: ScreeningFlowVersion[];
		}>({
			method: 'get',
			url: buildQueryParamUrl('/screening-flow-versions', params),
		});
	},

	getScreeningFlowsByFlowTypeId(screeningFlowTypeId: ScreeningFlowTypeId) {
		return httpSingleton.orchestrateRequest<{
			screeningFlows: ScreeningFlow[];
		}>({
			method: 'get',
			url: `/screening-flows?screeningFlowTypeId=${screeningFlowTypeId}`,
		});
	},

	getInitialScreeningQuestionsByFlowVersionId(screeningFlowVersionId: string) {
		return httpSingleton.orchestrateRequest<{
			screeningQuestions: ScreeningQuestion[];
		}>({
			method: 'get',
			url: `/screening-flow-versions/${screeningFlowVersionId}/initial-screening-questions`,
		});
	},

	skipScreeningFlowVersion(screeningFlowVersionId: string) {
		return httpSingleton.orchestrateRequest<{
			screeningSession: ScreeningSession;
		}>({
			method: 'post',
			url: `/screening-flow-versions/${screeningFlowVersionId}/skip`,
		});
	},

	createScreeningSession(data: ScreeningFlowParams) {
		return httpSingleton.orchestrateRequest<{ screeningSession: ScreeningSession }>({
			method: 'post',
			url: '/screening-sessions',
			data,
		});
	},

	getScreeningQuestionContext(screeningQuestionContextId?: string) {
		return httpSingleton.orchestrateRequest<ScreeningQuestionContextResponse>({
			method: 'get',
			url: `/screening-question-contexts/${screeningQuestionContextId || ''}`,
		});
	},

	skipScreeningQuestionContext(screeningQuestionContextId: string) {
		return httpSingleton.orchestrateRequest<{
			screeningSession: ScreeningSession;
		}>({
			method: 'post',
			url: `/screening-question-contexts/${screeningQuestionContextId}/skip`,
		});
	},

	answerQuestion(
		screeningQuestionContextId: string,
		answers: Pick<ScreeningAnswer, 'screeningAnswerOptionId' | 'text'>[],
		force?: boolean
	) {
		return httpSingleton.orchestrateRequest<{
			screeningAnswers: ScreeningAnswer[];
			messages?: ScreeningAnswersMessage[];
			questionResultsByScreeningQuestionId?: Record<string, ScreeningAnswersQuestionResult>;
			nextScreeningQuestionContextId?: string;
			screeningSessionDestination?: ScreeningSessionDestination;
			screeningSession: ScreeningSession;
		}>({
			method: 'post',
			url: '/screening-answers',
			data: {
				screeningQuestionContextId,
				answers,
				force,
			},
		});
	},

	getScreeningFlowCompletionStatusByScreeningFlowId(screeningFlowId: string) {
		return httpSingleton.orchestrateRequest<{
			sessionFullyCompleted: boolean;
			sessionFullyCompletedAt: string;
			sessionFullyCompletedAtDescription: string;
		}>({
			method: 'GET',
			url: `/screening-flows/${screeningFlowId}/session-fully-completed`,
		});
	},

	getPossibleScreeningTypesForFlowVersionId(screeningFlowVersionId: string) {
		return httpSingleton.orchestrateRequest<{
			screeningType: ScreeningType[];
		}>({
			method: 'GET',
			url: `/screening-flow-versions/${screeningFlowVersionId}/screening-types`,
		});
	},
};
