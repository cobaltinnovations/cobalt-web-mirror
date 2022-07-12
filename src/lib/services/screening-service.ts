import {
	ScreeningAnswer,
	ScreeningAnswerOption,
	ScreeningQuestion,
	ScreeningSession,
	ScreeningSessionDestination,
} from '@/lib/models';
import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils/url-utils';

type ScreeningSessionParams = {
	screeningFlowId: string;
	targetAccountId?: string | null;
};

export const screeningService = {
	getScreeningSessionsByFlowId(params: ScreeningSessionParams) {
		if (typeof params.targetAccountId !== 'string') {
			delete params.targetAccountId;
		}

		return httpSingleton.orchestrateRequest<{ screeningSessions: ScreeningSession[] }>({
			method: 'get',
			url: buildQueryParamUrl('/screening-sessions', params),
		});
	},

	createScreeningSession(data: ScreeningSessionParams) {
		return httpSingleton.orchestrateRequest<{ screeningSession: ScreeningSession }>({
			method: 'post',
			url: '/screening-sessions',
			data,
		});
	},

	getScreeningQuestionContext(screeningQuestionContextId: string) {
		return httpSingleton.orchestrateRequest<{
			previousScreeningQuestionContextId: string;
			screeningQuestion: ScreeningQuestion;
			screeningAnswerOptions: ScreeningAnswerOption[];
			screeningAnswers: ScreeningAnswer[];
			screeningSessionDestination: ScreeningSessionDestination;
		}>({
			method: 'get',
			url: `/screening-question-contexts/${screeningQuestionContextId}`,
		});
	},
};
