import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	Assessment,
	AssessmentScore,
	Provider,
	RecommendationLevel,
	SupportRoleId,
	SelectedQuestionAnswer,
	PersonalizationDetails,
	PersonalizationChoice,
} from '@/lib/models';

export interface AssessmentResponse {
	assessment: Assessment;
}

export interface PersonalizationAssessmentResponse {
	assessment: PersonalizationDetails;
}

export interface SubmitAssessmentQuestionData {
	assessmentAnswers: SelectedQuestionAnswer[];
	questionId: string;
	sessionId: string;
}

export interface SupportRoleOption {
	supportRoleId: SupportRoleId;
	description: string;
}

export interface AssessmentScoreResponse {
	defaultSupportRoleId: SupportRoleId;
	providers: Provider[];
	recommendationLevel: RecommendationLevel;
	supportRoleOptions: SupportRoleOption[];
	scores?: AssessmentScore;
}

export const assessmentService = {
	/* ----------------------------------------------------------- */
	/* Intro assessment */
	/* ----------------------------------------------------------- */
	getPersonalizationDetails() {
		return httpSingleton.orchestrateRequest<PersonalizationAssessmentResponse>({
			method: 'get',
			url: '/assessment/personalize',
		});
	},

	setPersonalizationDetails(choices: PersonalizationChoice[]) {
		return httpSingleton.orchestrateRequest<PersonalizationAssessmentResponse>({
			method: 'POST',
			url: '/assessment/personalize',
			data: { choices },
		});
	},

	/* ----------------------------------------------------------- */
	/* Intro assessment */
	/* ----------------------------------------------------------- */
	getIntroAssessmentQuestion(questionId: string | null, sessionId: string | null) {
		let url = '/assessment/intro';
		if (questionId) url = `/assessment/intro?questionId=${questionId}&sessionId=${sessionId}`;

		return httpSingleton.orchestrateRequest<AssessmentResponse>({
			method: 'get',
			url: url,
		});
	},
	submitIntroAssessmentQuestion(data: SubmitAssessmentQuestionData) {
		return httpSingleton.orchestrateRequest<AssessmentResponse>({
			method: 'put',
			url: '/assessment/intro',
			data,
		});
	},

	/* ----------------------------------------------------------- */
	/* Evidence assessment */
	/* ----------------------------------------------------------- */
	getEvidenceAssessmentQuestion(questionId: string | null, sessionId: string | null) {
		let url = '/assessment/evidence';
		if (questionId) url = `/assessment/evidence?questionId=${questionId}&sessionId=${sessionId}`;

		return httpSingleton.orchestrateRequest<AssessmentResponse>({
			method: 'get',
			url: url,
		});
	},
	submitEvidenceAssessmentQuestion(data: SubmitAssessmentQuestionData) {
		return httpSingleton.orchestrateRequest<AssessmentResponse>({
			method: 'put',
			url: '/assessment/evidence',
			data,
		});
	},

	/* ----------------------------------------------------------- */
	/* Intake assessment */
	/* ----------------------------------------------------------- */
	getIntakeAssessmentQuestion({
		providerId,
		questionId,
		sessionId,
		groupSessionId,
		appointmentTypeId,
	}: {
		providerId?: string;
		questionId?: string;
		sessionId?: string;
		groupSessionId?: string;
		appointmentTypeId?: string;
	}) {
		if (providerId && groupSessionId) {
			throw new Error('Only provide a providerId or a groupSessionId, not both.');
		}

		const searchParams = new URLSearchParams();

		if (providerId) {
			searchParams.set('providerId', providerId);
		}

		if (groupSessionId) {
			searchParams.set('groupSessionId', groupSessionId);
		}

		if (questionId) {
			searchParams.set('questionId', questionId);
		}

		if (sessionId) {
			searchParams.set('sessionId', sessionId);
		}

		if (appointmentTypeId) {
			searchParams.set('appointmentTypeId', appointmentTypeId);
		}

		return httpSingleton.orchestrateRequest<AssessmentResponse>({
			method: 'get',
			url: `/assessment/intake?${searchParams.toString()}`,
		});
	},
	submitIntakeAssessmentAnswer(data: SubmitAssessmentQuestionData) {
		return httpSingleton.orchestrateRequest<AssessmentResponse>({
			method: 'put',
			url: '/assessment/intake',
			data,
		});
	},

	/* ----------------------------------------------------------- */
	/* Evidence assessment score & provider list */
	/* ----------------------------------------------------------- */
	getEvidenceAssessmentScore(date: string, supportRoleId?: SupportRoleId) {
		const params = new URLSearchParams({
			date,
		});

		if (supportRoleId) {
			params.set('supportRoleId', supportRoleId);
		}

		return httpSingleton.orchestrateRequest<AssessmentScoreResponse>({
			method: 'get',
			url: `/assessment/evidence/score?${params.toString()}`,
		});
	},
};
