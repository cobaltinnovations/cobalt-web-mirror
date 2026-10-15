import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
import { CobaltThemeProvider } from '@/jss/theme';
import { AnalyticsNativeEventTypeId, FeatureId, PAGE_LOCATION_ID, ROLE_ID } from '@/lib/models';
import { institutionService } from '@/lib/services/institution-service';
import { analyticsService } from '@/lib/services/analytics-service';
import HeaderV2 from './header-v2';
import { useAppRootLoaderData } from '@/routes/root';
import { byPrefixAndName } from '@awesome.me/kit-c75e843088/icons';

// Jest's resolver predates the icon kit's package subpath exports.
jest.mock(
	'@awesome.me/kit-c75e843088/icons',
	() => jest.requireActual('@awesome.me/kit-c75e843088/icons/modules/index.js'),
	{ virtual: true }
);

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
	useAppRootLoaderData: jest.fn(),
}));
jest.mock('@/menu-links', () => ({ exploreLinks: [] }));
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

beforeEach(() => {
	getLocations.mockReset();
	(useAppRootLoaderData as jest.Mock).mockReturnValue({});
});
afterEach(() => jest.restoreAllMocks());

const mockAccount = ({
	roleId,
	providerId,
	institutionLocationId,
	isAdmin,
	isProvider,
	featuresEnabled = false,
	bookingV2Enabled = false,
	communitiesEnabled = false,
	pageDirectoriesEnabled,
	preferLegacyTopicCenters = false,
}: {
	roleId: string;
	providerId?: string;
	institutionLocationId?: string;
	isAdmin: boolean;
	isProvider: boolean;
	featuresEnabled?: boolean;
	bookingV2Enabled?: boolean;
	communitiesEnabled?: boolean;
	pageDirectoriesEnabled?: boolean;
	preferLegacyTopicCenters?: boolean;
}) => {
	mockUseAccount.mockReturnValue({
		account: {
			roleId,
			providerId,
			institutionLocationId,
			accountCapabilityFlags: {
				canManageCareEncounters: true,
			},
		},
		institution: {
			additionalNavigationItems: communitiesEnabled
				? [{ name: 'Parents', url: '/pages/parents', pageId: 'parents-page', topicCenterId: 'parents-topic' }]
				: [],
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
						{
							featureId: FeatureId.SELF_HELP_RESOURCES,
							name: 'Self-Help Resources',
							navigationHeaderId: 'BROWSE_RESOURCES',
							navVisible: true,
							urlName: '/resources',
						},
				  ]
				: [],
			featuresEnabled,
			pageDirectoriesEnabled,
			headerLogoUrl: '',
			name: 'Test Institution',
			preferLegacyTopicCenters,
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
	['desktop', false],
	['mobile', false],
	['desktop', true],
	['mobile', true],
])('records Community directory navigation on %s (curated links=%s)', async (surface, communitiesEnabled) => {
	mockAccount({
		roleId: ROLE_ID.MEMBER,
		isAdmin: false,
		isProvider: false,
		communitiesEnabled,
		pageDirectoriesEnabled: true,
	});
	const persistEvent = jest.spyOn(analyticsService, 'persistEvent').mockReturnValue(true);
	const { router } = renderHeader();
	fireEvent.click(screen.getByTestId('headerNavMenuButton'));
	const links = screen.getAllByRole('link', {
		name: communitiesEnabled ? 'All communities' : 'Community',
		hidden: true,
	});
	expect(links).toHaveLength(2);
	fireEvent.click(links[surface === 'mobile' ? 0 : 1]);
	await waitFor(() => expect(router.state.location.pathname).toBe('/communities'));
	expect(persistEvent).toHaveBeenCalledTimes(1);
	expect(persistEvent).toHaveBeenCalledWith(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_DIRECTORY, {
		source: 'NAV',
		pageLocationId: PAGE_LOCATION_ID.COMMUNITY,
	});
	expect(router.state.location.pathname).toBe('/communities');
	router.dispose();
});

it.each(['desktop', 'mobile'])('records Featured Topics directory navigation on %s', async (surface) => {
	mockAccount({ roleId: ROLE_ID.MEMBER, isAdmin: false, isProvider: false, pageDirectoriesEnabled: true });
	const persistEvent = jest.spyOn(analyticsService, 'persistEvent').mockReturnValue(true);
	const { router } = renderHeader();
	fireEvent.click(screen.getByTestId('headerNavMenuButton'));
	const links = screen.getAllByRole('link', { name: /Featured Topics/, hidden: true });
	expect(links).toHaveLength(2);
	fireEvent.click(links[surface === 'mobile' ? 0 : 1]);
	await waitFor(() => expect(router.state.location.pathname).toBe('/featured-topics'));
	expect(persistEvent).toHaveBeenCalledTimes(1);
	expect(persistEvent).toHaveBeenCalledWith(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_DIRECTORY, {
		source: 'NAV',
		pageLocationId: PAGE_LOCATION_ID.FEATURED_TOPIC,
	});
	expect(router.state.location.pathname).toBe('/featured-topics');
	router.dispose();
});

it('renders the Featured Topics history icon while retaining the Resource Library book icon on both surfaces', () => {
	mockAccount({
		roleId: ROLE_ID.MEMBER,
		isAdmin: false,
		isProvider: false,
		featuresEnabled: true,
		pageDirectoriesEnabled: true,
	});
	const { router } = renderHeader();
	fireEvent.click(screen.getByTestId('headerNavMenuButton'));

	const featuredTopicsLinks = screen.getAllByRole('link', { name: /Featured Topics/, hidden: true });
	const resourceLinks = screen.getAllByRole('link', { name: 'Resource Library', hidden: true });
	expect(featuredTopicsLinks).toHaveLength(2);
	expect(resourceLinks).toHaveLength(2);
	featuredTopicsLinks.forEach((link) =>
		expect(link.querySelector('svg path')).toHaveAttribute(
			'd',
			byPrefixAndName.fas['rectangle-vertical-history'].icon[4] as string
		)
	);
	resourceLinks.forEach((link) =>
		expect(link.querySelector('svg path')).toHaveAttribute('d', byPrefixAndName.fak['menu-book'].icon[4] as string)
	);
	router.dispose();
});

it.each([
	[false, false],
	[false, true],
	[undefined, false],
	[undefined, true],
])(
	'hides directory navigation when the flag is %s and curated links=%s',
	(pageDirectoriesEnabled, communitiesEnabled) => {
		mockAccount({
			roleId: ROLE_ID.MEMBER,
			isAdmin: false,
			isProvider: false,
			communitiesEnabled,
			pageDirectoriesEnabled,
		});
		const { router } = renderHeader();
		fireEvent.click(screen.getByTestId('headerNavMenuButton'));
		expect(screen.queryByRole('link', { name: /Featured Topics/, hidden: true })).not.toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'All communities', hidden: true })).not.toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'Community', hidden: true })).not.toBeInTheDocument();
		if (communitiesEnabled) {
			expect(screen.getAllByRole('link', { name: 'Parents', hidden: true })).toHaveLength(2);
		} else {
			expect(screen.queryByRole('button', { name: 'Community', hidden: true })).not.toBeInTheDocument();
		}
		router.dispose();
	}
);

it('removes existing directory navigation after refreshed institution configuration disables it', async () => {
	mockAccount({ roleId: ROLE_ID.MEMBER, isAdmin: false, isProvider: false, pageDirectoriesEnabled: true });
	const { router } = renderHeader();
	fireEvent.click(screen.getByTestId('headerNavMenuButton'));
	expect(screen.getAllByRole('link', { name: /Featured Topics/, hidden: true })).toHaveLength(2);
	mockAccount({ roleId: ROLE_ID.MEMBER, isAdmin: false, isProvider: false, pageDirectoriesEnabled: false });
	await act(async () => router.navigate('/other'));
	fireEvent.click(screen.getByTestId('headerNavMenuButton'));
	expect(screen.queryByRole('link', { name: /Featured Topics/, hidden: true })).not.toBeInTheDocument();
	expect(screen.queryByRole('link', { name: 'Community', hidden: true })).not.toBeInTheDocument();
	router.dispose();
});

it.each([false, true])(
	'preserves curated communities and featured spotlights with directories off (legacy=%s)',
	(preferLegacyTopicCenters) => {
		mockAccount({
			roleId: ROLE_ID.MEMBER,
			isAdmin: false,
			isProvider: false,
			communitiesEnabled: true,
			pageDirectoriesEnabled: false,
			preferLegacyTopicCenters,
		});
		(useAppRootLoaderData as jest.Mock).mockReturnValue({
			featuredTopicCenter: { headline: 'Spotlight', relativeUrl: '/pages/spotlight' },
			legacyFeaturedTopicCenter: { featuredTitle: 'Spotlight', featuredDescription: '', urlName: 'spotlight' },
		});
		const persistEvent = jest.spyOn(analyticsService, 'persistEvent').mockReturnValue(true);
		const { router } = renderHeader();
		fireEvent.click(screen.getByTestId('headerNavMenuButton'));
		const parentsLinks = screen.getAllByRole('link', { name: 'Parents', hidden: true });
		expect(parentsLinks).toHaveLength(2);
		const spotlightLinks = screen.getAllByRole('link', { name: /Spotlight/, hidden: true });
		expect(spotlightLinks).toHaveLength(2);
		spotlightLinks.forEach((link) =>
			expect(link).toHaveAttribute(
				'href',
				preferLegacyTopicCenters ? '/featured-topics/spotlight' : '/pages/spotlight'
			)
		);
		fireEvent.click(parentsLinks[0]);
		expect(persistEvent).toHaveBeenCalledWith(
			preferLegacyTopicCenters
				? AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER
				: AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE,
			expect.objectContaining(
				preferLegacyTopicCenters ? { topicCenterId: 'parents-topic' } : { pageId: 'parents-page' }
			)
		);
		router.dispose();
	}
);

it.each([
	[false, false],
	[false, true],
	[true, false],
	[true, true],
])('omits employer browsing when features=%s and booking V2=%s', (featuresEnabled, bookingV2Enabled) => {
	mockAccount({ roleId: ROLE_ID.MEMBER, isAdmin: false, isProvider: false, featuresEnabled, bookingV2Enabled });
	getLocations.mockReturnValue({
		fetch: async () => ({
			locations: [{ institutionId: 'COBALT', institutionLocationId: 'employer-1', name: 'Employer One' }],
		}),
		abort: jest.fn(),
	});

	const { router } = renderHeader();
	fireEvent.click(screen.getByTestId('headerNavMenuButton'));

	expect(screen.queryByRole('region', { name: 'Browse by Employer', hidden: true })).not.toBeInTheDocument();
	expect(screen.queryByText('Browse by Employer')).not.toBeInTheDocument();
	expect(screen.queryByRole('link', { name: 'Employer One', hidden: true })).not.toBeInTheDocument();
	expect(screen.queryByText('Loading employers…')).not.toBeInTheDocument();
	expect(screen.queryByText('Unable to load employers.')).not.toBeInTheDocument();
	expect(getLocations).not.toHaveBeenCalled();
	if (featuresEnabled) {
		expect(screen.getAllByRole('link', { name: 'Therapy', hidden: true })).toHaveLength(2);
	} else {
		expect(screen.queryByRole('link', { name: 'Therapy', hidden: true })).not.toBeInTheDocument();
	}
	router.dispose();
});

it.each<[string, boolean, string | undefined]>([
	['desktop', false, undefined],
	['mobile', false, undefined],
	['desktop', true, undefined],
	['mobile', true, undefined],
	['desktop', false, 'account-location'],
	['mobile', false, 'account-location'],
	['desktop', true, 'account-location'],
	['mobile', true, 'account-location'],
])(
	'preserves appointment service navigation on %s (booking V2=%s, location=%s)',
	async (surface, bookingV2Enabled, institutionLocationId) => {
		mockAccount({
			roleId: ROLE_ID.MEMBER,
			isAdmin: false,
			isProvider: false,
			featuresEnabled: true,
			bookingV2Enabled,
			institutionLocationId,
		});
		jest.spyOn(analyticsService, 'persistEvent').mockReturnValue(true);
		const { router } = renderHeader();
		fireEvent.click(screen.getByTestId('headerNavMenuButton'));
		const links = screen.getAllByRole('link', { name: 'Therapy', hidden: true });
		expect(links).toHaveLength(2);
		const expectedSearch = institutionLocationId ? '?institutionLocationId=account-location' : '';
		links.forEach((link) => expect(link).toHaveAttribute('href', `/therapy${expectedSearch}`));
		fireEvent.click(links[surface === 'mobile' ? 0 : 1]);
		await waitFor(() => expect(router.state.location.pathname).toBe('/therapy'));
		expect(router.state.location.search).toBe(expectedSearch);
		expect(getLocations).not.toHaveBeenCalled();
		router.dispose();
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
