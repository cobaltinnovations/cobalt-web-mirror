import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
import { CobaltThemeProvider } from '@/jss/theme';
import { FeatureId, InstitutionLocation, ROLE_ID } from '@/lib/models';
import { institutionService } from '@/lib/services/institution-service';
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
jest.mock('@/lib/services/institution-service', () => ({ institutionService: { getInstitutionLocations: jest.fn() } }));
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
const getLocations = institutionService.getInstitutionLocations as jest.Mock;

beforeEach(() => getLocations.mockReset());

const mockAccount = ({
	roleId,
	providerId,
	isAdmin,
	isProvider,
	featuresEnabled = false,
	bookingV2Enabled = false,
}: {
	roleId: string;
	providerId?: string;
	isAdmin: boolean;
	isProvider: boolean;
	featuresEnabled?: boolean;
	bookingV2Enabled?: boolean;
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
			institutionId: 'COBALT',
			bookingV2Enabled,
			features: featuresEnabled
				? [
						{
							featureId: FeatureId.THERAPY,
							name: 'Therapy',
							navigationHeaderId: 'CONNECT_WITH_SUPPORT',
							navVisible: true,
							urlName: '/therapy',
						},
				  ]
				: [],
			featuresEnabled,
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

	return { ...render(<RouterProvider router={router} />), router };
};

it.each([
	[false, false],
	[false, true],
	[true, false],
])('omits employer browsing when features=%s and booking V2=%s', (featuresEnabled, bookingV2Enabled) => {
	mockAccount({ roleId: ROLE_ID.MEMBER, isAdmin: false, isProvider: false, featuresEnabled, bookingV2Enabled });

	renderHeader();
	fireEvent.click(screen.getByTestId('headerNavMenuButton'));

	expect(screen.queryByRole('region', { name: 'Browse by Employer', hidden: true })).not.toBeInTheDocument();
	expect(screen.queryByText('Loading employers…')).not.toBeInTheDocument();
	expect(getLocations).not.toHaveBeenCalled();
});

it('shows employer loading, errors, and filtered links in desktop and mobile navigation for booking V2', async () => {
	mockAccount({
		roleId: ROLE_ID.MEMBER,
		isAdmin: false,
		isProvider: false,
		featuresEnabled: true,
		bookingV2Enabled: true,
	});
	let reject!: (reason: Error) => void;
	getLocations.mockReturnValueOnce({
		fetch: () => new Promise((_resolve, rejectRequest) => (reject = rejectRequest)),
		abort: jest.fn(),
	});
	getLocations.mockReturnValueOnce({
		fetch: async () => ({
			locations: [{ institutionId: 'COBALT', institutionLocationId: 'employer-1', name: 'Employer One' }],
		}),
		abort: jest.fn(),
	});

	renderHeader();
	fireEvent.click(screen.getByTestId('headerNavMenuButton'));
	expect(screen.getAllByRole('region', { name: 'Browse by Employer', hidden: true })).toHaveLength(2);
	expect(screen.getAllByText('Loading employers…')).toHaveLength(2);
	expect(getLocations).toHaveBeenCalledTimes(1);

	await act(async () => reject(new Error('Unavailable')));
	expect(screen.getAllByText('Unable to load employers.')).toHaveLength(2);
	await act(async () => fireEvent.click(screen.getAllByRole('button', { name: 'Retry', hidden: true })[0]));
	expect(getLocations).toHaveBeenCalledTimes(2);
	const links = screen.getAllByText('Employer One');
	expect(links).toHaveLength(2);
	links.forEach((link) =>
		expect(link.closest('a')).toHaveAttribute('href', '/providers?institutionLocationId=employer-1')
	);
});

it.each(['loading', 'error', 'loaded'])(
	'hides existing employer %s content from desktop and mobile navigation when booking V2 is disabled',
	async (status) => {
		mockAccount({
			roleId: ROLE_ID.MEMBER,
			isAdmin: false,
			isProvider: false,
			featuresEnabled: true,
			bookingV2Enabled: true,
		});
		let resolve!: (value: { locations: InstitutionLocation[] }) => void;
		let reject!: (reason: Error) => void;
		const abort = jest.fn();
		getLocations.mockReturnValueOnce({
			fetch: () =>
				new Promise((resolveRequest, rejectRequest) => {
					resolve = resolveRequest;
					reject = rejectRequest;
				}),
			abort,
		});
		const { router } = renderHeader();
		fireEvent.click(screen.getByTestId('headerNavMenuButton'));
		if (status === 'error') await act(async () => reject(new Error('Unavailable')));
		if (status === 'loaded')
			await act(async () =>
				resolve({
					locations: [{ institutionId: 'COBALT', institutionLocationId: 'employer-1', name: 'Employer One' }],
				})
			);
		expect(screen.getAllByRole('region', { name: 'Browse by Employer', hidden: true })).toHaveLength(2);

		mockAccount({
			roleId: ROLE_ID.MEMBER,
			isAdmin: false,
			isProvider: false,
			featuresEnabled: true,
			bookingV2Enabled: false,
		});
		await act(async () => router.navigate('/therapy'));

		expect(screen.queryByRole('region', { name: 'Browse by Employer', hidden: true })).not.toBeInTheDocument();
		expect(getLocations).toHaveBeenCalledTimes(1);
		expect(abort).toHaveBeenCalledTimes(1);
	}
);

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

it('clears fixed-header body spacing when navigating to a route that hides the header', async () => {
	mockAccount({
		roleId: ROLE_ID.MEMBER,
		isAdmin: false,
		isProvider: false,
	});

	const router = createMemoryRouter(
		[
			{
				element: (
					<CobaltThemeProvider>
						<HeaderV2 />
						<Outlet />
					</CobaltThemeProvider>
				),
				children: [
					{ index: true, element: null },
					{
						path: 'fullscreen',
						element: null,
						handle: { hideHeader: true },
					},
				],
			},
		],
		{ initialEntries: ['/'] }
	);

	render(<RouterProvider router={router} />);
	document.body.style.paddingTop = '60px';

	await act(async () => {
		await router.navigate('/fullscreen');
	});

	expect(document.body.style.paddingTop).toBe('0px');
	expect(screen.queryByRole('button', { name: 'Open account menu' })).not.toBeInTheDocument();
});
