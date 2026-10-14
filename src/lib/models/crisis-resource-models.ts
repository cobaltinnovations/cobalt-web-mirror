export enum CrisisResourceTypeId {
	CRISIS_CONTACT = 'CRISIS_CONTACT',
	NON_EMERGENCY_SUPPORT = 'NON_EMERGENCY_SUPPORT',
}

interface CrisisResourceBase {
	title: string;
	description: string;
	institutionIds?: string[];
}

export type CrisisContactResource = CrisisResourceBase & {
	crisisResourceTypeId: CrisisResourceTypeId.CRISIS_CONTACT;
	href: `tel:${string}` | `sms:${string}`;
};

export type CrisisNonEmergencyResource = CrisisResourceBase & {
	crisisResourceTypeId: CrisisResourceTypeId.NON_EMERGENCY_SUPPORT;
	href: `/${string}`;
};

export type CrisisResource = CrisisContactResource | CrisisNonEmergencyResource;
