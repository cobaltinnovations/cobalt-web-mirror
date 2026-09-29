import { CRISIS_RESOURCES } from './crisis-resources';
import { CrisisResourceTypeId } from './lib/models';

it('shows only emergency contacts in the local crisis UI', () => {
	expect(CRISIS_RESOURCES).toHaveLength(3);
	expect(CRISIS_RESOURCES.every((resource) => resource.crisisResourceTypeId === CrisisResourceTypeId.CRISIS_CONTACT)).toBe(true);
});
