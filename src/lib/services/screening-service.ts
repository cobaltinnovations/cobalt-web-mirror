import {
	ScreeningAnswer,
	ScreeningFlowVersion,
	ScreeningQuestionContextResponse,
	ScreeningSession,
	ScreeningSessionDestination,
} from '@/lib/models';
import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils/url-utils';

type ScreeningFlowParams = {
	screeningFlowId?: string;
	targetAccountId?: string | null;
	screeningFlowVersionId?: string;
	patientOrderId?: string;
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
			nextScreeningQuestionContextId?: string;
			screeningSessionDestination?: ScreeningSessionDestination;
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
		}>({
			method: 'GET',
			url: `/screening-flows/${screeningFlowId}/session-fully-completed`,
		});
	},
};
