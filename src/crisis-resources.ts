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
	{
		crisisResourceTypeId: CrisisResourceTypeId.NON_EMERGENCY_SUPPORT,
		title: 'Learn about EASE Clinic',
		description: 'Expedited, non-emergency mental health support for eligible UPHS employees.',
		href: '/referrals/ease-clinic',
		institutionIds: ['COBALT'],
	},
];
