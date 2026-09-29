import { CrisisResource, CrisisResourceTypeId } from '@/lib/models';

export const CRISIS_RESOURCES: CrisisResource[] = [
	{
		crisisResourceTypeId: CrisisResourceTypeId.CRISIS_CONTACT,
		title: 'Call 911',
		description: '24/7 Emergency',
		href: 'tel:911',
	},
	{
		crisisResourceTypeId: CrisisResourceTypeId.CRISIS_CONTACT,
		title: 'Call 988',
		description: 'Suicide & Crisis Lifeline',
		href: 'tel:988',
	},
	{
		crisisResourceTypeId: CrisisResourceTypeId.CRISIS_CONTACT,
		title: 'Text 741741',
		description: '24/7 Crisis Text Line',
		href: 'sms:741741',
	},
	// EASE Clinic is temporarily unavailable from crisis surfaces.
];
