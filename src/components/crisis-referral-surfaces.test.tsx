import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import { CobaltThemeProvider } from '@/jss/theme';
import InCrisis from '@/pages/in-crisis';
import InCrisisModal from './in-crisis-modal';
import { IcScreeningCrisisModal } from './integrated-care/patient/patient-crisis-modal';

const mockTrackEvent = jest.fn();

jest.mock('@/crisis-resources', () => ({
	CRISIS_RESOURCES: [
		{
			crisisResourceTypeId: 'CRISIS_CONTACT',
			title: 'Call 911',
			description: '24/7 Emergency',
			href: 'tel:911',
		},
		{
			crisisResourceTypeId: 'NON_EMERGENCY_SUPPORT',
			title: 'Learn about EASE Clinic',
			description: 'Expedited, non-emergency mental health support for eligible UPHS employees.',
			href: '/referrals/ease-clinic',
		},
	],
}));

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: () => ({ institution: { platformName: 'Cobalt' } }),
}));

jest.mock('@/hooks/use-analytics', () => ({
	__esModule: true,
	default: () => ({ trackEvent: mockTrackEvent }),
}));

jest.mock('@/hooks/use-track-modal-view', () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock('@/lib/services', () => ({
	analyticsService: { persistEvent: jest.fn() },
}));

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

const renderWithTheme = (children: React.ReactNode) => render(<CobaltThemeProvider>{children}</CobaltThemeProvider>);

afterEach(() => {
	cleanup();
	jest.clearAllMocks();
});

it('shows EASE on the full crisis page', () => {
	renderWithTheme(<InCrisis />);

	expect(screen.getByRole('button', { name: /Learn about EASE Clinic/i })).toHaveAttribute(
		'href',
		'/referrals/ease-clinic'
	);
});

it('shows EASE in the header crisis modal', () => {
	renderWithTheme(<InCrisisModal show animation={false} onHide={jest.fn()} />);

	expect(screen.getByRole('button', { name: /Learn about EASE Clinic/i })).toHaveAttribute(
		'href',
		'/referrals/ease-clinic'
	);
});

it('shows EASE and preserves next-business-day clinician call language in the general PHQ-9 popup', () => {
	renderWithTheme(<InCrisisModal show isCall animation={false} onHide={jest.fn()} />);

	expect(screen.getByRole('button', { name: /Learn about EASE Clinic/i })).toHaveAttribute(
		'href',
		'/referrals/ease-clinic'
	);
	expect(
		screen.getByText(/A clinician will call you within one business day to talk about how they can help\./i)
	).toBeInTheDocument();
});

it('keeps EASE out of the integrated-care Q9 modal and preserves the clinician follow-up promise', () => {
	renderWithTheme(<IcScreeningCrisisModal show animation={false} onHide={jest.fn()} />);

	expect(
		screen.getByText(/A clinician will follow up with you within the next business day to see how we can help\./i)
	).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: /EASE Clinic/i })).not.toBeInTheDocument();
});
