// Importing '@/lib/services' first breaks a pre-existing module cycle
// (@/lib/http-client -> http-client -> ../services -> account-service -> http-singleton).
import '@/lib/services';

import React from 'react';
import { RouteObject } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
import { ROLE_ID } from '@/lib/models';
import { routes } from '@/routes';

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));
// Untranspiled ESM in the installed package; only pulled in transitively via the IC routes.
jest.mock('react-bootstrap-typeahead/types/components/MenuItem', () => ({
	__esModule: true,
	default: () => null,
}));

type AccountContext = ReturnType<typeof useAccount>;

const accountContext = (roleId: string, canManageCareEncounters: boolean, providerId?: string) =>
	({
		account: {
			roleId,
			providerId,
			accountCapabilityFlags: {
				canAdministerContent: true,
				canAdministerGroupSessions: true,
				canCreatePages: true,
				canViewProviderReports: true,
				canViewAnalytics: true,
				canViewStudyInsights: true,
				canManageCareEncounters,
			},
		},
		institution: {},
	} as AccountContext);

const NAVIGATOR_PROVIDER = accountContext(ROLE_ID.PROVIDER, true, 'provider-id');
const PLAIN_ADMINISTRATOR = accountContext(ROLE_ID.ADMINISTRATOR, false);
const NAVIGATOR_ADMINISTRATOR = accountContext(ROLE_ID.ADMINISTRATOR, true);
const LINKED_ADMINISTRATOR = accountContext(ROLE_ID.ADMINISTRATOR, false, 'provider-id');
const PLAIN_PROVIDER = accountContext(ROLE_ID.PROVIDER, false, 'provider-id');
const UNLINKED_PROVIDER = accountContext(ROLE_ID.PROVIDER, false);

const findRoute = (
	routeObjects: RouteObject[],
	predicate: (route: RouteObject) => boolean
): RouteObject | undefined => {
	for (const route of routeObjects) {
		if (predicate(route)) {
			return route;
		}

		const match = route.children ? findRoute(route.children, predicate) : undefined;

		if (match) {
			return match;
		}
	}

	return undefined;
};

const routeIdsUnder = (route: RouteObject): string[] => [
	...(route.id ? [route.id] : []),
	...(route.children ?? []).flatMap(routeIdsUnder),
];

// Reads the `isEnabled` predicate off a <ToggledOutlet /> element used as a route guard.
const guardOf = (route: RouteObject): ((accountContext: AccountContext) => boolean) => {
	const element = route.element as React.ReactElement<{
		isEnabled: (accountContext: AccountContext) => boolean;
	}>;

	if (!element?.props?.isEnabled) {
		throw new Error('Route is not guarded by a ToggledOutlet.');
	}

	return element.props.isEnabled;
};

const adminRoute = () => {
	const route = findRoute(routes, (candidate) => candidate.id === 'admin');

	if (!route) {
		throw new Error('admin route not found.');
	}

	return route;
};

const groupContaining = (routeId: string) => {
	const group = (adminRoute().children ?? []).find((child) => routeIdsUnder(child).includes(routeId));

	if (!group) {
		throw new Error(`No admin route group contains ${routeId}.`);
	}

	return group;
};

it('guards the encounters routes on the care encounters capability, not the administrator role', () => {
	const isEnabled = guardOf(groupContaining('admin-encounters'));

	expect(isEnabled(NAVIGATOR_PROVIDER)).toBe(true);
	expect(isEnabled(NAVIGATOR_ADMINISTRATOR)).toBe(true);
	expect(isEnabled(PLAIN_ADMINISTRATOR)).toBe(false);
	expect(isEnabled(PLAIN_PROVIDER)).toBe(false);
});

it('guards provider scheduling on a linked provider profile, not the account role', () => {
	const schedulingGate = findRoute(routes, (candidate) =>
		(candidate.children ?? []).some((child) => child.path === 'scheduling')
	);

	if (!schedulingGate) {
		throw new Error('provider scheduling gate not found.');
	}

	const isEnabled = guardOf(schedulingGate);

	expect(isEnabled(NAVIGATOR_PROVIDER)).toBe(true);
	expect(isEnabled(LINKED_ADMINISTRATOR)).toBe(true);
	expect(isEnabled(PLAIN_ADMINISTRATOR)).toBe(false);
	expect(isEnabled(NAVIGATOR_ADMINISTRATOR)).toBe(false);
	expect(isEnabled(UNLINKED_PROVIDER)).toBe(false);
});

it('keeps the encounter shelf under the same guard as the encounters list', () => {
	expect(routeIdsUnder(groupContaining('admin-encounters'))).toEqual(
		expect.arrayContaining(['admin-encounters', 'admin-encounter-shelf'])
	);
});

it.each([
	'admin-resources',
	'admin-pages',
	'admin-group-sessions',
	'admin-reports',
	'admin-analytics-layout',
	'admin-study-insights',
])('keeps %s restricted to administrators', (routeId) => {
	const isEnabled = guardOf(groupContaining(routeId));

	expect(isEnabled(PLAIN_ADMINISTRATOR)).toBe(true);
	expect(isEnabled(NAVIGATOR_PROVIDER)).toBe(false);
});

it('admits both administrators and care navigators into the admin subtree', () => {
	const subtree = findRoute(routes, (candidate) => (candidate.children ?? []).some((child) => child.id === 'admin'));

	if (!subtree) {
		throw new Error('admin subtree not found.');
	}

	const isEnabled = guardOf(subtree);

	expect(isEnabled(PLAIN_ADMINISTRATOR)).toBe(true);
	expect(isEnabled(NAVIGATOR_PROVIDER)).toBe(true);
	expect(isEnabled(PLAIN_PROVIDER)).toBe(false);
});
