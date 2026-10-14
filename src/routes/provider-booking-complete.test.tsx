import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AnalyticsNativeEventTypeId, BookingExperienceId } from '@/lib/models';
import { analyticsService } from '@/lib/services';
import { CobaltThemeProvider } from '@/jss/theme';
import { Component } from './provider-booking-complete';

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: () => ({ institution: { platformName: 'Cobalt' } }),
}));

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/lib/services', () => ({
	analyticsService: {
		persistEvent: jest.fn(),
	},
}));

beforeEach(() => {
	jest.clearAllMocks();
});

it('records the Provider Booking V2 completion context', async () => {
	render(
		<CobaltThemeProvider>
			<MemoryRouter
				initialEntries={[
					'/provider-booking-complete?featureId=THERAPY&providerSearchResultTypeId=CLINIC&clinicId=clinic-id&providerIdToSchedule=provider-id&appointmentTypeId=appointment-type-id',
				]}
			>
				<Component />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

	await waitFor(() => {
		expect(analyticsService.persistEvent).toHaveBeenCalledWith(
			AnalyticsNativeEventTypeId.PAGE_VIEW_PROVIDER_BOOKING_COMPLETE,
			expect.objectContaining({
				bookingExperienceId: BookingExperienceId.V2,
				providerSearchResultTypeId: 'CLINIC',
				clinicId: 'clinic-id',
				providerIdToSchedule: 'provider-id',
				appointmentTypeId: 'appointment-type-id',
			})
		);
	});
});
