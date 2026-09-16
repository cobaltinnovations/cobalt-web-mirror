import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import {
	AnalyticsNativeEventProviderAppointmentSelectionPresentationId,
	AnalyticsNativeEventTypeId,
	AppointmentBookingRequirementsDestinationId,
	BookingExperienceId,
} from '@/lib/models';
import { analyticsService, appointmentService } from '@/lib/services';
import { Component } from './provider-confirm-appointment-time';

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: () => ({ institution: { platformName: 'Cobalt' } }),
}));

jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => jest.fn(),
}));

jest.mock('@/pages/screening/screening.hooks', () => ({
	useScreeningNavigation: () => ({ navigateToNext: jest.fn() }),
}));

jest.mock('@/components/async-page', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/fullscreen-bar', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/appointment-date-time-picker', () => ({
	__esModule: true,
	default: () => null,
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
});

it('records the appointment selector page and the confirmed clinic slot', async () => {
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
		</MemoryRouter>
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

	fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

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
	});
});
