import { shouldPromptForInstitutionLocation } from './onboarding-utils';

describe('institution location onboarding', () => {
	it('prompts an account that has not selected or declined an employer', () => {
		expect(
			shouldPromptForInstitutionLocation({
				institutionLocationId: '',
				promptedForInstitutionLocation: false,
			})
		).toBe(true);
	});

	it('does not prompt an account with a saved employer', () => {
		expect(
			shouldPromptForInstitutionLocation({
				institutionLocationId: 'institution-location-id',
				promptedForInstitutionLocation: false,
			})
		).toBe(false);
	});

	it('does not prompt an account that previously declined', () => {
		expect(
			shouldPromptForInstitutionLocation({
				institutionLocationId: '',
				promptedForInstitutionLocation: true,
			})
		).toBe(false);
	});
});
