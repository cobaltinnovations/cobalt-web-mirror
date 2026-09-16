import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import {
	AnalyticsNativeEventProviderAppointmentSelectionPresentationId,
	AnalyticsNativeEventTypeId,
	AppointmentBookingRequirementsDestinationId,
	BookingExperienceId,
	ProviderAppointmentModalityId,
	ProviderAppointmentSelectionTypeId,
	ProviderSearchResultModel,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import { analyticsService, appointmentService } from '@/lib/services';
import { CobaltThemeProvider } from '@/jss/theme';
import ProviderScheduleModal, {
	createProviderScheduleModalConfig,
	getInitialAppointmentDateTimePickerValue,
} from './provider-schedule-modal';

jest.mock('@/components/appointment-date-time-picker', () => ({
	__esModule: true,
	default: () => null,
	getDefaultAppointmentDateTimePickerValue: () => ({ dateTime: undefined }),
}));

jest.mock('./svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

const mockNavigateToNext = jest.fn();
const mockHandleError = jest.fn();

jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => mockHandleError,
}));

jest.mock('@/pages/screening/screening.hooks', () => ({
	useScreeningNavigation: () => ({ navigateToNext: mockNavigateToNext }),
}));

jest.mock('@/lib/services', () => ({
	analyticsService: {
		persistEvent: jest.fn(),
	},
	appointmentService: {
		getAppointmentBookingRequirements: jest.fn(),
	},
}));

beforeEach(() => {
	jest.clearAllMocks();
	(appointmentService.getAppointmentBookingRequirements as jest.Mock).mockReturnValue({
		fetch: jest.fn().mockResolvedValue({
			appointmentBookingRequirements: {
				appointmentBookingRequirementsDestinationId:
					AppointmentBookingRequirementsDestinationId.APPOINTMENT_BOOKING,
			},
		}),
	});
});

const LocationDisplay = () => {
	const location = useLocation();
	return React.createElement('div', { 'data-testid': 'location' }, `${location.pathname}${location.search}`);
};

const createClinicProviderSearchResult = () =>
	({
		providerSearchResultId: 'clinic-result-id',
		clinicId: 'clinic-id',
		providerSearchResultTypeId: ProviderSearchResultTypeId.CLINIC,
		appointmentSelectionTypeId: ProviderAppointmentSelectionTypeId.APPOINTMENT_UNDETERMINED,
		supportedAppointmentModalities: [
			{
				appointmentModalityId: ProviderAppointmentModalityId.PHONE,
				description: 'Phone',
			},
		],
		firstAvailableAppointment: {
			providerId: 'clinic-provider-id',
			date: '2026-09-24',
			time: '20:00:00',
			dateTime: '2026-09-24T20:00:00',
			timeDescription: '8:00 PM',
			appointmentTypeId: 'appointment-type-id',
		},
	} as ProviderSearchResultModel);

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
	expect(config.appointmentTypeId).toBeUndefined();
	expect(initialValue.appointmentTypeId).toBe('phone-appointment-type-id');
	expect(initialValue.providerId).toBe('clinic-provider-id');
});

it('records a pooled clinic selection and advances directly to booking', async () => {
	const provider = createClinicProviderSearchResult();
	const config = createProviderScheduleModalConfig({
		featureId: 'THERAPY',
		institutionLocationId: 'institution-location-id',
		provider,
	});

	render(
		React.createElement(
			CobaltThemeProvider,
			null,
			React.createElement(
				MemoryRouter,
				{ initialEntries: ['/providers?institutionLocationId=institution-location-id'] },
				React.createElement(
					React.Fragment,
					null,
					React.createElement(ProviderScheduleModal, { animation: false, show: true, config }),
					React.createElement(LocationDisplay)
				)
			)
		)
	);

	await waitFor(() => {
		expect(analyticsService.persistEvent).toHaveBeenCalledWith(
			AnalyticsNativeEventTypeId.EVENT_PROVIDER_APPOINTMENT_SELECTION_VIEWED,
			expect.objectContaining({
				bookingExperienceId: BookingExperienceId.V2,
				presentation: AnalyticsNativeEventProviderAppointmentSelectionPresentationId.MODAL,
				providerSearchResultId: 'clinic-result-id',
				clinicId: 'clinic-id',
				providerIdToSchedule: 'clinic-provider-id',
			})
		);
	});

	fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

	await waitFor(() => {
		expect(analyticsService.persistEvent).toHaveBeenCalledWith(
			AnalyticsNativeEventTypeId.EVENT_PROVIDER_APPOINTMENT_SELECTED,
			expect.objectContaining({
				bookingExperienceId: BookingExperienceId.V2,
				presentation: AnalyticsNativeEventProviderAppointmentSelectionPresentationId.MODAL,
				clinicId: 'clinic-id',
				providerIdToSchedule: 'clinic-provider-id',
				appointmentTypeId: 'appointment-type-id',
				appointmentModalityId: ProviderAppointmentModalityId.PHONE,
			})
		);
		expect(appointmentService.getAppointmentBookingRequirements).toHaveBeenCalledWith({
			providerId: 'clinic-provider-id',
			appointmentTypeId: 'appointment-type-id',
			appointmentSelectionTypeId: ProviderAppointmentSelectionTypeId.APPOINTMENT_UNDETERMINED,
			appointmentModalityId: ProviderAppointmentModalityId.PHONE,
			date: '2026-09-24',
			time: '20:00:00',
		});
		expect(screen.getByTestId('location')).toHaveTextContent('/provider-book-appointment?');
		expect(screen.getByTestId('location')).not.toHaveTextContent('/provider-confirm-appointment-time');
	});
});

it('starts a required screening directly from the appointment modal', async () => {
	const screeningSession = { screeningSessionId: 'screening-session-id' };
	(appointmentService.getAppointmentBookingRequirements as jest.Mock).mockReturnValue({
		fetch: jest.fn().mockResolvedValue({
			appointmentBookingRequirements: {
				appointmentBookingRequirementsDestinationId:
					AppointmentBookingRequirementsDestinationId.SCREENING_SESSION,
				screeningSession,
			},
		}),
	});
	const config = createProviderScheduleModalConfig({
		featureId: 'THERAPY',
		institutionLocationId: 'institution-location-id',
		provider: createClinicProviderSearchResult(),
	});

	render(
		React.createElement(
			CobaltThemeProvider,
			null,
			React.createElement(
				MemoryRouter,
				null,
				React.createElement(ProviderScheduleModal, { animation: false, show: true, config })
			)
		)
	);

	fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

	await waitFor(() => {
		expect(mockNavigateToNext).toHaveBeenCalledWith(screeningSession);
	});
});
