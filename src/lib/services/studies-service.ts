import { httpSingleton } from '@/lib/singletons/http-singleton';
import { RecordingPreferenceId } from '@/lib/models';

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
	updateAccountPreferences(data: { username: string; recordingPreferenceId: RecordingPreferenceId }) {
		return httpSingleton.orchestrateRequest<void>({
			method: 'PUT',
			url: '/studies/update-account-preferences',
			data,
		});
	},
};
