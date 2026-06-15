import type { SvgIconProps } from '@/components/svg-icon';
import { ProviderAppointmentModalityId } from '@/lib/models';

export type AppointmentModalitySummary = {
	icon: SvgIconProps['icon'];
	title: string;
	description: string;
};

export const providerAppointmentModalityIds: ProviderAppointmentModalityId[] = [
	ProviderAppointmentModalityId.IN_PERSON,
	ProviderAppointmentModalityId.PHONE,
	ProviderAppointmentModalityId.VIRTUAL,
];

export const defaultAppointmentModalitySummary: AppointmentModalitySummary = {
	icon: 'calendar',
	title: 'Appointment Type',
	description: 'Select an appointment type to continue.',
};

const appointmentModalitySummaryById: Record<ProviderAppointmentModalityId, AppointmentModalitySummary> = {
	[ProviderAppointmentModalityId.IN_PERSON]: {
		icon: 'location-dot',
		title: 'In-Person Appointment',
		description: 'Attend this appointment in person.',
	},
	[ProviderAppointmentModalityId.PHONE]: {
		icon: 'phone',
		title: 'Phone Appointment',
		description: 'This appointment will take place by phone.',
	},
	[ProviderAppointmentModalityId.VIRTUAL]: {
		icon: 'laptop-mobile',
		title: 'Virtual Appointment',
		description: 'This appointment will take place virtually.',
	},
};

export const getAppointmentModalitySummaryById = (
	appointmentModalityId?: ProviderAppointmentModalityId
): AppointmentModalitySummary => {
	return appointmentModalityId
		? appointmentModalitySummaryById[appointmentModalityId]
		: defaultAppointmentModalitySummary;
};

export const isProviderAppointmentModalityId = (value: string | null): value is ProviderAppointmentModalityId => {
	return providerAppointmentModalityIds.includes(value as ProviderAppointmentModalityId);
};
