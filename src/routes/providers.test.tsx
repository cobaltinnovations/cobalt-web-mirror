import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import {
	AnalyticsNativeEventProviderSearchResultActionId,
	AnalyticsNativeEventProviderSearchResultSourceId,
	AnalyticsNativeEventTypeId,
	BookingExperienceId,
	ProviderAppointmentModalityId,
	ProviderAppointmentSelectionTypeId,
	ProviderSearchResultModel,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import { analyticsService } from '@/lib/services';
import { ProviderSearchResultWithScreening } from './providers';

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/provider-search-result', () => ({
	__esModule: true,
	default: ({ onScheduleAppointmentButtonClick }: { onScheduleAppointmentButtonClick(): void }) => (
		<button onClick={onScheduleAppointmentButtonClick}>Check Eligibility &amp; Schedule Online</button>
	),
}));

jest.mock('@/lib/services', () => {
	const services = jest.requireActual('@/lib/services');

	return {
		...services,
		analyticsService: {
			persistEvent: jest.fn(),
		},
	};
});

const LocationProbe = () => {
	const location = useLocation();

	return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

beforeEach(() => {
	jest.clearAllMocks();
});

it('opens referral-backed provider details from the list instead of starting screening', () => {
	const provider = {
		providerId: 'team-clinic-provider-id',
		providerSearchResultTypeId: ProviderSearchResultTypeId.PROVIDER,
		name: 'TEAM Clinic',
		supportedAppointmentModalities: [],
		referralBooking: {
			institutionReferrerId: 'team-clinic-referrer-id',
			urlName: 'team-clinic-pilot',
			intakeScreeningFlowId: 'team-clinic-screening-flow-id',
		},
	} as ProviderSearchResultModel;
	const onTitleButtonClick = jest.fn();

	render(
		<MemoryRouter>
			<ProviderSearchResultWithScreening
				featureId="THERAPY"
				institutionLocationId="institution-location-id"
				provider={provider}
				onTitleButtonClick={onTitleButtonClick}
				onViewAppointmentsButtonClick={jest.fn()}
			/>
		</MemoryRouter>
	);

	fireEvent.click(screen.getByRole('button', { name: 'Check Eligibility & Schedule Online' }));

	expect(onTitleButtonClick).toHaveBeenCalledTimes(1);
	expect(analyticsService.persistEvent).toHaveBeenCalledWith(
		AnalyticsNativeEventTypeId.CLICKTHROUGH_PROVIDER_SEARCH_RESULT,
		expect.objectContaining({
			bookingExperienceId: BookingExperienceId.V2,
			action: AnalyticsNativeEventProviderSearchResultActionId.VIEW_DETAILS,
			source: AnalyticsNativeEventProviderSearchResultSourceId.LIST,
			providerId: 'team-clinic-provider-id',
			screeningFlowId: 'team-clinic-screening-flow-id',
		})
	);
});

it('selects an appointment time before launching a provider intake screening', () => {
	const provider = {
		providerId: 'provider-id',
		providerSearchResultTypeId: ProviderSearchResultTypeId.PROVIDER,
		name: 'EAP Clinician',
		supportedAppointmentModalities: [
			{
				appointmentModalityId: ProviderAppointmentModalityId.PHONE,
				description: 'Phone',
			},
		],
		appointmentSelectionTypeId: ProviderAppointmentSelectionTypeId.APPOINTMENT_PREDETERMINED,
		firstAvailableAppointment: {
			providerId: 'provider-id',
			date: '2026-09-18',
			time: '16:00:00',
			appointmentTypeId: 'appointment-type-id',
		},
		screeningRequirement: {
			screeningRequired: true,
			screeningSatisfied: false,
			screeningFlowId: 'screening-flow-id',
		},
	} as ProviderSearchResultModel;

	render(
		<MemoryRouter initialEntries={['/providers?featureId=THERAPY&institutionLocationId=location-id']}>
			<ProviderSearchResultWithScreening
				featureId="THERAPY"
				institutionLocationId="location-id"
				provider={provider}
				onTitleButtonClick={jest.fn()}
				onViewAppointmentsButtonClick={jest.fn()}
			/>
			<LocationProbe />
		</MemoryRouter>
	);

	fireEvent.click(screen.getByRole('button', { name: 'Check Eligibility & Schedule Online' }));

	expect(screen.getByTestId('location')).toHaveTextContent('/provider-confirm-appointment-time?');
	expect(screen.getByTestId('location')).toHaveTextContent('providerId=provider-id');
	expect(screen.getByTestId('location')).toHaveTextContent('appointmentTypeId=appointment-type-id');
	expect(analyticsService.persistEvent).toHaveBeenCalledWith(
		AnalyticsNativeEventTypeId.CLICKTHROUGH_PROVIDER_SEARCH_RESULT,
		expect.objectContaining({
			bookingExperienceId: BookingExperienceId.V2,
			action: AnalyticsNativeEventProviderSearchResultActionId.SCHEDULE_APPOINTMENT,
			source: AnalyticsNativeEventProviderSearchResultSourceId.LIST,
			providerId: 'provider-id',
		})
	);
});
