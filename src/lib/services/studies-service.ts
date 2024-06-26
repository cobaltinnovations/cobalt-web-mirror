import { httpSingleton } from '@/lib/singletons/http-singleton';

export interface StudyOnboardingResponse {
	onboardingDestinationUrl: string;
	permittedAccountSourceIds: string[];
}

export const studyService = {
	fetchStudyOnboarding(studyIdOrUrlName: string) {
		return httpSingleton.orchestrateRequest<StudyOnboardingResponse>({
			method: 'get',
			url: `/studies/${studyIdOrUrlName}/onboarding`,
		});
	},
};
