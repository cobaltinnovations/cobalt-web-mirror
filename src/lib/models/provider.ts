import { AppointmentType } from './appointments';

// https://github.com/Penn-Medicine-CHCI/cobalt-api/blob/master/src/main/java/com/cobaltplatform/api/model/db/SupportRole.java#L18
export enum SupportRoleId {
	Peer = 'PEER',
	Coach = 'COACH',
	CareManager = 'CARE_MANAGER',
	Clinician = 'CLINICIAN',
	Psychiatrist = 'PSYCHIATRIST',
	Chaplain = 'CHAPLAIN',
	MHIC = 'MHIC',
}

export interface ProviderAvailability {
	availability: string;
	description: string;
}

export interface LogicalAvailability {
	logicalAvailabilityId: string;
	providerId: string;
	startDateTime: string;
	startDateTimeDescription: string;
	endDateTime: string;
	endDateTimeDescription: string;
	appointmentTypes: AppointmentType[];
}

export interface PaymentType {
	paymentTypeId: string;
	description: string;
}

export interface AvailabilityTimeSlot {
	appointmentTypeIds: string[];
	epicDepartmentId?: string;
	status: string;
	time: string;
	timeDescription: string;
}

export interface SupportRole {
	supportRoleId: SupportRoleId;
	description: string;
}

export interface Clinic {
	clinicId: string;
	description: string;
	institutionId: string;
	showIntakeAssessmentPrompt: boolean;
}

export interface Provider {
	fullyBooked: boolean;
	providerId: string;
	institutionId: string;
	schedulingSystemId: string;
	epicProviderId?: string;
	epicProviderIdType?: string;
	name: string;
	title: string;
	entity: string;
	clinic: string;
	license: string;
	specialty: string;
	imageUrl: string;
	isDefaultImageUrl: boolean;
	timeZone: string;
	locale: string;
	tags: string[];
	times: AvailabilityTimeSlot[];
	supportRoles: SupportRole[];
	appointmentTypeIds: string[];
	supportRolesDescription: string;
	phoneNumberRequiredForAppointment?: boolean;
	paymentFundingDescriptions?: string[];
	intakeAssessmentIneligible?: boolean;
	intakeAssessmentRequired: boolean;
	skipIntakePrompt: boolean;
	treatmentDescription?: string;
	emailAddress?: string;
	bioUrl?: string;
}

export interface Specialty {
	description: string;
	specialtyId: string;
}
