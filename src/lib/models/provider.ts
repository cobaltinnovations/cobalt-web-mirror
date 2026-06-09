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

export interface ProviderVisitType {
	visitTypeId: string;
	description: string;
}

export interface LogicalAvailability {
	logicalAvailabilityId: string;
	providerId: string;
	logicalAvailabilityTypeId: 'OPEN' | 'BLOCK';
	recurrenceTypeId: 'DAILY';
	startDateTime: string;
	startDateTimeDescription: string;
	endDate: string;
	endDateDescription: string;
	endTime: string;
	endTimeDescription: string;
	recurSunday: boolean;
	recurMonday: boolean;
	recurTuesday: boolean;
	recurWednesday: boolean;
	recurThursday: boolean;
	recurFriday: boolean;
	recurSaturday: boolean;
	appointmentTypes: AppointmentType[];
	descriptionComponents: string[];
}

export interface PaymentType {
	paymentTypeId: string;
	description: string;
}

export interface AvailabilityTimeSlot {
	appointmentParticipantStatusCodesByAppointmentTypeId?: Record<string, string>;
	appointmentStatusCodesByAppointmentTypeId?: Record<string, string>;
	appointmentTypeIds: string[];
	epicAppointmentFhirId?: string;
	epicDepartmentId?: string;
	slotStatusCodesByAppointmentTypeId?: Record<string, string>;
	status: string;
	time: string;
	timeDescription: string;
}

export interface SupportRole {
	supportRoleId: SupportRoleId;
	description: string;
}

enum ClinicBookingPreferenceId {
	DIRECT = 'DIRECT',
	NONE = 'NONE',
}

export interface Clinic {
	clinicId: string;
	description: string;
	institutionId: string;
	showIntakeAssessmentPrompt: boolean;
	clinicBookingPreferenceId: ClinicBookingPreferenceId;
}

export interface Provider {
	fullyBooked: boolean;
	providerId: string;
	institutionId?: string;
	schedulingSystemId: string;
	epicProviderId?: string;
	epicProviderIdType?: string;
	name: string;
	title?: string;
	entity?: string;
	clinic?: string;
	license?: string;
	specialty?: string;
	imageUrl: string;
	isDefaultImageUrl?: boolean;
	timeZone?: string;
	locale?: string;
	tags?: string[];
	times: AvailabilityTimeSlot[];
	supportRoles?: SupportRole[];
	appointmentTypeIds: string[];
	supportRolesDescription: string;
	phoneNumber?: string;
	formattedPhoneNumber?: string;
	phoneNumberRequiredForAppointment?: boolean;
	paymentFundingDescriptions?: string[];
	intakeAssessmentIneligible?: boolean;
	intakeAssessmentRequired: boolean;
	skipIntakePrompt?: boolean;
	treatmentDescription?: string;
	emailAddress?: string;
	bio?: string;
	bioUrl?: string;
	displayPhoneNumberOnlyForBooking: boolean;
	description?: string;
	urlName?: string;
}

export interface Specialty {
	description: string;
	specialtyId: string;
}

type UUID = string;
type ISODate = string; // e.g. "2026-06-05"
type ISOTime = string; // e.g. "09:00"
type ISODateTime = string; // e.g. "2026-06-05T09:00"

export enum ProviderSearchResultTypeId {
	PROVIDER = 'PROVIDER',
	CLINIC = 'CLINIC',
}

export enum ProviderAppointmentModalityId {
	PHONE = 'PHONE',
	IN_PERSON = 'IN_PERSON',
	VIRTUAL = 'VIRTUAL',
}

export interface AppointmentModality {
	appointmentModalityId: ProviderAppointmentModalityId;
	availability: { date: string; times: AvailabilityTimeSlot[] }[];
	description: string;
}

export enum ProviderAppointmentSelectionTypeId {
	APPOINTMENT_PREDETERMINED = 'APPOINTMENT_PREDETERMINED',
	APPOINTMENT_UNDETERMINED = 'APPOINTMENT_UNDETERMINED',
	APPOINTMENT_BY_PHONE = 'APPOINTMENT_BY_PHONE',
}

export interface ProviderSearchResponse {
	providers: ProviderSearchResultModel[];
}

export interface ProviderSearchResultModel {
	providerSearchResultTypeId: ProviderSearchResultTypeId;
	providerSearchResultId: UUID;

	providerId: UUID | null;
	clinicId: UUID | null;
	institutionId: string | null;

	name: string | null;
	title: string | null;
	description: string | null;
	treatmentDescription: string | null;
	imageUrl: string | null;
	formattedPhoneNumber: string | null;

	supportedAppointmentModalities: ProviderAppointmentModality[];
	appointmentSelectionTypeId: ProviderAppointmentSelectionTypeId;
	appointmentDescription: string | null;
	firstAvailableAppointment: FirstAvailableAppointmentModel | null;
	hasMoreAppointments: boolean;
}

export interface ProviderAppointmentModality {
	appointmentModalityId: ProviderAppointmentModalityId;
	description: string;
}

export interface FirstAvailableAppointmentModel {
	date: ISODate;
	time: ISOTime;
	dateTime: ISODateTime;
	timeDescription: string;

	appointmentTypeId: UUID | null;
	appointmentTypeIds: UUID[] | null;
	appointmentDescription: string | null;
	assessmentId: UUID | null;
	epicDepartmentId: UUID | null;
	epicAppointmentFhirId: string | null;
}
