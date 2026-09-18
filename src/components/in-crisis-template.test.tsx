import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { CrisisEventActions } from '@/lib/models/ga-events';
import { CobaltThemeProvider } from '@/jss/theme';
import InCrisisTemplate from './in-crisis-template';

const mockTrackEvent = jest.fn();
let mockInstitutionId = 'COBALT';

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
			institutionIds: ['COBALT'],
		},
	],
}));

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: () => ({ institution: { institutionId: mockInstitutionId } }),
}));

jest.mock('@/hooks/use-url-view-tracking', () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock('@/hooks/use-analytics', () => ({
	__esModule: true,
	default: () => ({ trackEvent: mockTrackEvent }),
}));

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: ({ icon }: { icon: string }) => <svg data-testid={`${icon}-icon`} aria-hidden="true" />,
}));

const renderTemplate = (props: React.ComponentProps<typeof InCrisisTemplate> = {}) =>
	render(
		<CobaltThemeProvider>
			<InCrisisTemplate {...props} />
		</CobaltThemeProvider>
	);

beforeEach(() => {
	jest.clearAllMocks();
	mockInstitutionId = 'COBALT';
});

it('keeps non-emergency resources hidden unless the surface explicitly opts in', () => {
	renderTemplate();

	expect(screen.getByRole('button', { name: /Call 911/i })).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: /EASE Clinic/i })).not.toBeInTheDocument();
	expect(screen.queryByText('Looking for non-emergency support?')).not.toBeInTheDocument();
});

it('renders the EASE referral as a clearly separated link rather than a phone action', () => {
	renderTemplate({ showNonEmergencySupport: true });

	const crisisContact = screen.getByRole('button', { name: /Call 911/i });
	const easeReferral = screen.getByRole('button', { name: /Learn about EASE Clinic/i });

	expect(screen.getByText('Looking for non-emergency support?')).toBeInTheDocument();
	expect(easeReferral).toHaveAttribute('href', '/referrals/ease-clinic');
	expect(within(crisisContact).getByTestId('phone-volume-icon')).toBeInTheDocument();
	expect(within(easeReferral).getByTestId('arrow-right-icon')).toBeInTheDocument();
	expect(within(easeReferral).queryByTestId('phone-volume-icon')).not.toBeInTheDocument();
});

it('does not expose an institution-scoped resource to other institutions', () => {
	mockInstitutionId = 'OTHER';
	renderTemplate({ showNonEmergencySupport: true });

	expect(screen.getByRole('button', { name: /Call 911/i })).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: /EASE Clinic/i })).not.toBeInTheDocument();
});

it('records both the modal context and the non-emergency resource when EASE is selected', () => {
	renderTemplate({ isModal: true, showNonEmergencySupport: true });

	fireEvent.click(screen.getByRole('button', { name: /Learn about EASE Clinic/i }));

	expect(mockTrackEvent).toHaveBeenNthCalledWith(1, {
		action: 'In Crisis Pop Up',
		link_text: 'Expedited, non-emergency mental health support for eligible UPHS employees.',
	});
	expect(mockTrackEvent).toHaveBeenNthCalledWith(
		2,
		expect.objectContaining({
			action: CrisisEventActions.UserClickCrisisNonEmergencyResource,
			category: 'Crisis',
			label: '/referrals/ease-clinic',
		})
	);
});
