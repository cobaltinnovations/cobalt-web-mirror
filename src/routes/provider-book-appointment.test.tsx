import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { CobaltThemeProvider } from '@/jss/theme';
import { AnalyticsNativeEventTypeId, BookingExperienceId } from '@/lib/models';
import { analyticsService } from '@/lib/services';
import { Component } from './provider-book-appointment';

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: () => ({
		account: {
			accountId: 'account-id',
			firstName: 'Ada',
			lastName: '',
			emailAddress: '',
			phoneNumber: '',
		},
		institution: {
			platformName: 'Cobalt',
		},
	}),
}));

jest.mock('@/hooks/use-flags', () => ({
	__esModule: true,
	default: () => ({ addFlag: jest.fn() }),
}));

jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => jest.fn(),
}));

jest.mock('@/components/async-page', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/fullscreen-bar', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/appointment-unavailable-modal', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
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

beforeEach(() => {
	jest.clearAllMocks();
	Object.defineProperty(navigator, 'maxTouchPoints', {
		configurable: true,
		value: 0,
	});
});

it('records the V2 appointment confirmation page without contact information', () => {
	render(
		<CobaltThemeProvider>
			<MemoryRouter
				initialEntries={[
					'/provider-book-appointment?featureId=THERAPY&providerSearchResultTypeId=CLINIC&clinicId=clinic-id&providerIdToSchedule=provider-id&appointmentTypeId=appointment-type-id&appointmentModalityId=PHONE&screeningSessionId=screening-session-id&date=2026-09-24&time=20%3A00%3A00',
				]}
			>
				<Component />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

	expect(analyticsService.persistEvent).toHaveBeenCalledWith(
		AnalyticsNativeEventTypeId.PAGE_VIEW_PROVIDER_APPOINTMENT_CONFIRMATION,
		{
			bookingExperienceId: BookingExperienceId.V2,
			featureId: 'THERAPY',
			providerSearchResultTypeId: 'CLINIC',
			clinicId: 'clinic-id',
			providerIdToSchedule: 'provider-id',
			appointmentTypeId: 'appointment-type-id',
			appointmentModalityId: 'PHONE',
			screeningSessionId: 'screening-session-id',
			date: '2026-09-24',
			time: '20:00:00',
		}
	);
});

it('focuses the first empty contact-information field after the form loads on a non-touch device', () => {
	const { container } = render(
		<CobaltThemeProvider>
			<MemoryRouter
				initialEntries={[
					'/provider-book-appointment?providerSearchResultTypeId=PROVIDER&appointmentModalityId=VIRTUAL',
				]}
			>
				<Component />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

	const firstNameInput = container.querySelector<HTMLInputElement>('input[name="firstName"]');
	const lastNameInput = container.querySelector<HTMLInputElement>('input[name="lastName"]');

	expect(firstNameInput).not.toHaveFocus();
	expect(lastNameInput).toHaveFocus();
});

it('does not autofocus a contact-information field on a touch device', () => {
	Object.defineProperty(navigator, 'maxTouchPoints', {
		configurable: true,
		value: 1,
	});

	const { container } = render(
		<CobaltThemeProvider>
			<MemoryRouter
				initialEntries={[
					'/provider-book-appointment?providerSearchResultTypeId=PROVIDER&appointmentModalityId=VIRTUAL',
				]}
			>
				<Component />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

	const contactInputs = Array.from(
		container.querySelectorAll<HTMLInputElement>('#provider-book-appointment-form input')
	);

	expect(contactInputs).toHaveLength(4);
	contactInputs.forEach((input) => expect(input).not.toHaveFocus());
});
