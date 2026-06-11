import { AppointmentType } from './appointments';
import { ScreeningSessionDestinationId } from './screening-models';

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
	treatmentDescription?: string;
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
	appointmentBookingLevelId: string;
	appointmentDescription?: string;
	appointmentSelectionTypeId: ProviderAppointmentSelectionTypeId;
	clinicId?: string;
	description?: string;
	firstAvailableAppointment?: FirstAvailableAppointmentModel;
	formattedPhoneNumber?: string;
	hasMoreAppointments: boolean;
	imageUrl?: string;
	institutionId?: string;
	name?: string;
	phoneNumber: string;
	phoneNumberDescription: string;
	providerId?: string;
	providerSearchResultId?: string;
	providerSearchResultTypeId: ProviderSearchResultTypeId;
	screeningRequirement: ScreeningRequirement;
	supportedAppointmentModalities: ProviderAppointmentModality[];
	title?: string;
	treatmentDescription?: string;
}

interface ScreeningRequirement {
	appointmentBookingRequirementsDestinationId: ScreeningSessionDestinationId;
	screeningFlowId: string;
	screeningRequired: boolean;
	screeningSatisfied: boolean;
}

export interface ProviderAppointmentModality {
	appointmentModalityId: ProviderAppointmentModalityId;
	description: string;
}

export interface FirstAvailableAppointmentModel {
	date: string;
	time: string;
	dateTime: string;
	timeDescription: string;
	appointmentTypeId?: string;
	appointmentTypeIds?: string[];
	appointmentDescription?: string;
	assessmentId?: string;
	epicDepartmentId?: string;
	epicAppointmentFhirId?: string;
}
