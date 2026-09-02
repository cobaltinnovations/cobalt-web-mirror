import {
	ProviderAppointmentModalityId,
	ProviderAppointmentSelectionTypeId,
	ProviderSearchResultModel,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import { createProviderScheduleModalConfig, getInitialAppointmentDateTimePickerValue } from './provider-schedule-modal';

jest.mock('@/components/appointment-date-time-picker', () => ({
	__esModule: true,
	default: () => null,
	getDefaultAppointmentDateTimePickerValue: () => ({ dateTime: undefined }),
}));

jest.mock('./svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

it('carries the list card availability filters and first appointment into the schedule modal', () => {
	const provider = {
		providerId: 'provider-id',
		providerSearchResultTypeId: ProviderSearchResultTypeId.PROVIDER,
		appointmentSelectionTypeId: ProviderAppointmentSelectionTypeId.APPOINTMENT_PREDETERMINED,
		supportedAppointmentModalities: [
			{
				appointmentModalityId: ProviderAppointmentModalityId.VIRTUAL,
				description: 'Virtual',
			},
		],
		firstAvailableAppointment: {
			providerId: 'provider-id',
			date: '2026-09-05',
			time: '09:00:00',
			dateTime: '2026-09-05T09:00:00',
			timeDescription: '9:00 AM',
			appointmentTypeId: 'clinician-appointment-type-id',
			appointmentTypeIds: ['clinician-appointment-type-id'],
			appointmentDescription: 'Clinician Appointment',
		},
	} as ProviderSearchResultModel;

	const config = createProviderScheduleModalConfig({
		featureId: 'THERAPY',
		institutionLocationId: 'institution-location-id',
		provider,
	});
	const initialValue = getInitialAppointmentDateTimePickerValue(config);

	expect(config).toEqual(
		expect.objectContaining({
			featureId: 'THERAPY',
			institutionLocationId: 'institution-location-id',
			providerId: 'provider-id',
			appointmentTypeId: 'clinician-appointment-type-id',
			initialAppointmentModalityId: ProviderAppointmentModalityId.VIRTUAL,
		})
	);
	expect(initialValue).toEqual(
		expect.objectContaining({
			appointmentModalityId: ProviderAppointmentModalityId.VIRTUAL,
			appointmentTypeId: 'clinician-appointment-type-id',
			appointmentTypeIds: ['clinician-appointment-type-id'],
			appointmentTypeDescription: 'Clinician Appointment',
			providerId: 'provider-id',
		})
	);
	expect(initialValue.dateTime.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-09-05 09:00:00');
});

it('uses the concrete provider from a clinic card first appointment', () => {
	const provider = {
		clinicId: 'clinic-id',
		providerSearchResultTypeId: ProviderSearchResultTypeId.CLINIC,
		supportedAppointmentModalities: [
			{
				appointmentModalityId: ProviderAppointmentModalityId.PHONE,
				description: 'Phone',
			},
		],
		firstAvailableAppointment: {
			providerId: 'clinic-provider-id',
			date: '2026-09-04',
			time: '16:00:00',
			dateTime: '2026-09-04T16:00:00',
			timeDescription: '4:00 PM',
			appointmentTypeId: 'phone-appointment-type-id',
		},
	} as ProviderSearchResultModel;

	const config = createProviderScheduleModalConfig({
		featureId: 'THERAPY',
		institutionLocationId: 'institution-location-id',
		provider,
	});
	const initialValue = getInitialAppointmentDateTimePickerValue(config);

	expect(config.clinicId).toBe('clinic-id');
	expect(config.providerId).toBeUndefined();
	expect(initialValue.providerId).toBe('clinic-provider-id');
});
