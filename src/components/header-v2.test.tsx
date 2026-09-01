import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
import { CobaltThemeProvider } from '@/jss/theme';
import { ROLE_ID } from '@/lib/models';
import HeaderV2 from './header-v2';

jest.mock('react-bootstrap', () => {
	const actual = jest.requireActual('react-bootstrap');
	const { createElement } = jest.requireActual('react');
	const Dropdown = Object.assign(
		({ children, className }: { children: React.ReactNode; className?: string }) =>
			createElement('div', { className }, children),
		{
			Toggle: ({
				children,
				id,
				className,
				'aria-label': ariaLabel,
			}: {
				children: React.ReactNode;
				id?: string;
				className?: string;
				'aria-label'?: string;
			}) => createElement('button', { id, className, 'aria-label': ariaLabel }, children),
			Menu: ({ children, className }: { children: React.ReactNode; className?: string }) =>
				createElement('div', { className }, children),
			Item: ({
				as: Component = 'a',
				to,
				children,
				...props
			}: {
				as?: React.ElementType;
				to?: string;
				children: React.ReactNode;
			}) => createElement(Component, Component === 'a' ? { ...props, href: to } : { ...props, to }, children),
			Divider: () => createElement('hr'),
		}
	);

	return { ...actual, Dropdown };
});

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('@/hooks/use-analytics', () => ({
	__esModule: true,
	default: () => ({ trackEvent: jest.fn() }),
}));
jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => jest.fn(),
}));
jest.mock('@/routes/root', () => ({
	useAppRootLoaderData: () => ({
		featuredTopicCenter: undefined,
		legacyFeaturedTopicCenter: undefined,
	}),
}));
jest.mock('@/menu-links', () => ({ exploreLinks: [] }));
jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('@/components/pathways-icons', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('@/components/in-crisis-header-button', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('@/components/header-alert', () => ({
	__esModule: true,
	default: () => null,
}));

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;

const mockAccount = ({
	roleId,
	providerId,
	isAdmin,
	isProvider,
}: {
	roleId: string;
	providerId?: string;
	isAdmin: boolean;
	isProvider: boolean;
}) => {
	mockUseAccount.mockReturnValue({
		account: {
			roleId,
			providerId,
			accountCapabilityFlags: {
				canManageCareEncounters: true,
			},
		},
		institution: {
			additionalNavigationItems: [],
			alerts: [],
			bookingV2Enabled: false,
			features: [],
			featuresEnabled: false,
			headerLogoUrl: '',
			name: 'Test Institution',
			preferLegacyTopicCenters: false,
			requireConsentForm: false,
		},
		isAdmin,
		isProvider,
		signOutAndClearContext: jest.fn(),
	} as ReturnType<typeof useAccount>);
};

const renderHeader = () => {
	const router = createMemoryRouter(
		[
			{
				path: '*',
				element: (
					<CobaltThemeProvider>
						<HeaderV2 />
					</CobaltThemeProvider>
				),
			},
		],
		{ initialEntries: ['/'] }
	);

	return render(<RouterProvider router={router} />);
};

it('shows Patient Scheduling for an administrator linked to a provider', () => {
	mockAccount({
		roleId: ROLE_ID.ADMINISTRATOR,
		providerId: 'provider-1',
		isAdmin: true,
		isProvider: false,
	});

	renderHeader();

	const schedulingLink = screen.getByText('Patient Scheduling').closest('a');
	expect(schedulingLink).toHaveAttribute('href', '/scheduling');
	expect(screen.getByRole('button', { name: 'Open account menu' })).toBeInTheDocument();
});

it('hides Patient Scheduling for a provider-role account without a linked provider', () => {
	mockAccount({
		roleId: ROLE_ID.PROVIDER,
		isAdmin: false,
		isProvider: true,
	});

	renderHeader();

	expect(screen.queryByText('Patient Scheduling')).not.toBeInTheDocument();
});
