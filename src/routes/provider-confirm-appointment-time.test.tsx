import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import {
	AnalyticsNativeEventProviderAppointmentSelectionPresentationId,
	AnalyticsNativeEventTypeId,
	AppointmentBookingRequirementsDestinationId,
	BookingExperienceId,
} from '@/lib/models';
import { analyticsService, appointmentService } from '@/lib/services';
import { Component } from './provider-confirm-appointment-time';

const mockNavigateToNext = jest.fn();
const mockUseScreeningNavigation = jest.fn((options?: { screeningQuestionSearch?: string }) => ({
	navigateToNext: mockNavigateToNext,
}));

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: () => ({ institution: { platformName: 'Cobalt' } }),
}));

jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => jest.fn(),
}));

jest.mock('@/pages/screening/screening.hooks', () => ({
	useScreeningNavigation: (options?: { screeningQuestionSearch?: string }) => mockUseScreeningNavigation(options),
}));

jest.mock('@/components/async-page', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/fullscreen-bar', () => ({
	__esModule: true,
	default: ({ onExit }: { onExit: () => void }) => <button onClick={onExit}>Exit</button>,
}));

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/appointment-date-time-picker', () => ({
	__esModule: true,
	default: ({
		onFirstAvailableAppointmentSelect,
	}: {
		onFirstAvailableAppointmentSelect?: (value: unknown) => void;
	}) => (
		<button
			type="button"
			onClick={() =>
				onFirstAvailableAppointmentSelect?.({
					dateTime: require('moment').utc('2026-09-24 20:00:00', 'YYYY-MM-DD HH:mm:ss'),
					appointmentModalityId: 'PHONE',
					appointmentTypeIds: ['appointment-type-id'],
					appointmentTypeId: 'appointment-type-id',
					providerId: 'provider-id',
				})
			}
		>
			First available shortcut
		</button>
	),
	getDefaultAppointmentDateTimePickerValue: () => ({ dateTime: undefined }),
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
	mockUseScreeningNavigation.mockReturnValue({ navigateToNext: mockNavigateToNext });
});

const LocationDisplay = () => {
	const location = useLocation();

	return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

it('records the appointment selector page and advances with the first-available clinic slot', async () => {
	(appointmentService.getAppointmentBookingRequirements as jest.Mock).mockReturnValue({
		fetch: jest.fn().mockResolvedValue({
			appointmentBookingRequirements: {
				appointmentBookingRequirementsDestinationId:
					AppointmentBookingRequirementsDestinationId.APPOINTMENT_BOOKING,
			},
		}),
	});

	render(
		<MemoryRouter
			initialEntries={[
				'/provider-confirm-appointment-time?featureId=THERAPY&institutionLocationId=location-id&providerSearchResultTypeId=CLINIC&clinicId=clinic-id&providerIdToSchedule=provider-id&appointmentSelectionTypeId=APPOINTMENT_UNDETERMINED&appointmentTypeId=appointment-type-id&appointmentModalityId=PHONE&date=2026-09-24&time=20%3A00%3A00',
			]}
		>
			<Component />
			<LocationDisplay />
		</MemoryRouter>
	);

	const screeningNavigationOptions = mockUseScreeningNavigation.mock.calls[0]?.[0];
	const screeningSearchParams = new URLSearchParams(screeningNavigationOptions?.screeningQuestionSearch);
	expect(screeningSearchParams.get('featureId')).toBe('THERAPY');
	expect(screeningSearchParams.get('institutionLocationId')).toBe('location-id');
	expect(screeningSearchParams.get('returnTo')).toBe(
		'/providers?featureId=THERAPY&institutionLocationId=location-id'
	);

	await waitFor(() => {
		expect(analyticsService.persistEvent).toHaveBeenCalledWith(
			AnalyticsNativeEventTypeId.EVENT_PROVIDER_APPOINTMENT_SELECTION_VIEWED,
			expect.objectContaining({
				bookingExperienceId: BookingExperienceId.V2,
				presentation: AnalyticsNativeEventProviderAppointmentSelectionPresentationId.PAGE,
				clinicId: 'clinic-id',
				providerIdToSchedule: 'provider-id',
			})
		);
	});

	fireEvent.click(screen.getByRole('button', { name: 'First available shortcut' }));

	await waitFor(() => {
		expect(analyticsService.persistEvent).toHaveBeenCalledWith(
			AnalyticsNativeEventTypeId.EVENT_PROVIDER_APPOINTMENT_SELECTED,
			expect.objectContaining({
				bookingExperienceId: BookingExperienceId.V2,
				presentation: AnalyticsNativeEventProviderAppointmentSelectionPresentationId.PAGE,
				clinicId: 'clinic-id',
				providerIdToSchedule: 'provider-id',
				appointmentTypeId: 'appointment-type-id',
				appointmentModalityId: 'PHONE',
			})
		);
		expect(screen.getByTestId('location')).toHaveTextContent('/provider-book-appointment?');
	});
});

it('exits to the provider list with the selected care type and employer', () => {
	render(
		<MemoryRouter
			initialEntries={[
				'/provider-confirm-appointment-time?featureId=THERAPY&institutionLocationId=location-id&providerSearchResultTypeId=PROVIDER&providerId=provider-id',
			]}
		>
			<Component />
			<LocationDisplay />
		</MemoryRouter>
	);

	fireEvent.click(screen.getByRole('button', { name: 'Exit' }));

	expect(screen.getByTestId('location')).toHaveTextContent(
		'/providers?featureId=THERAPY&institutionLocationId=location-id'
	);
});

it('exits to the provider information page that launched booking', () => {
	render(
		<MemoryRouter
			initialEntries={[
				'/provider-confirm-appointment-time?institutionLocationId=location-id&providerSearchResultTypeId=PROVIDER&providerId=provider-id&returnTo=%2Fprovider-info%2Fprovider-id%3FinstitutionLocationId%3Dlocation-id',
			]}
		>
			<Component />
			<LocationDisplay />
		</MemoryRouter>
	);

	fireEvent.click(screen.getByRole('button', { name: 'Exit' }));

	expect(screen.getByTestId('location')).toHaveTextContent(
		'/provider-info/provider-id?institutionLocationId=location-id'
	);
});
