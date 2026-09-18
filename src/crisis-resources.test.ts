import { CRISIS_RESOURCES } from './crisis-resources';
import { CrisisResourceTypeId } from './lib/models';

it('scopes the local EASE referral to the Cobalt parent institution', () => {
	const easeReferral = CRISIS_RESOURCES.find(
		(resource) => resource.crisisResourceTypeId === CrisisResourceTypeId.NON_EMERGENCY_SUPPORT
	);

	expect(easeReferral).toEqual(
		expect.objectContaining({
			href: '/referrals/ease-clinic',
			institutionIds: ['COBALT'],
		})
	);
});
