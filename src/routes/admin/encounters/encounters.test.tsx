import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { CobaltThemeProvider } from '@/jss/theme';
import { Component as EncounterShelf } from './encounter-shelf';
import { Component } from './encounters';

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

beforeAll(() => {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => undefined,
			removeListener: () => undefined,
			addEventListener: () => undefined,
			removeEventListener: () => undefined,
			dispatchEvent: () => false,
		}),
	});
});

const renderEncounters = (initialEntry = '/admin/encounters') => {
	const router = createMemoryRouter(
		[
			{
				path: '/admin/encounters',
				element: <Component />,
				children: [
					{
						path: ':encounterId',
						element: <EncounterShelf />,
					},
				],
			},
		],
		{ initialEntries: [initialEntry] }
	);

	render(
		<CobaltThemeProvider>
			<RouterProvider router={router} />
		</CobaltThemeProvider>
	);

	return router;
};

const expectTabToBeActive = (name: string) => {
	expect(screen.getByRole('button', { name }).parentElement).toHaveClass('active');
};

it('renders the encounters page with open encounters and an inert search field', () => {
	renderEncounters();

	expect(screen.getByRole('heading', { name: 'Encounters' })).toBeInTheDocument();
	expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
	expect(screen.getByText('Created')).toBeInTheDocument();
	expect(screen.getByText('Patient')).toBeInTheDocument();
	expect(screen.getByText('Appointment Date')).toBeInTheDocument();
	expect(screen.getByText('Avery Morgan')).toBeInTheDocument();
	expectTabToBeActive('Open');

	fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'No matching patient' } });
	expect(screen.getByText('Avery Morgan')).toBeInTheDocument();
});

it('defaults unsupported statuses to the open tab', () => {
	renderEncounters('/admin/encounters?status=pending');

	expectTabToBeActive('Open');
});

it('updates only the status query parameter without changing the displayed encounters', async () => {
	const router = renderEncounters('/admin/encounters?source=admin&status=open');

	fireEvent.click(screen.getByRole('button', { name: 'Closed' }));

	await waitFor(() => expect(router.state.location.search).toBe('?source=admin&status=closed'));
	expectTabToBeActive('Closed');
	expect(screen.getByText('Avery Morgan')).toBeInTheDocument();

	fireEvent.click(screen.getByRole('button', { name: 'Open' }));

	await waitFor(() => expect(router.state.location.search).toBe('?source=admin&status=open'));
	expectTabToBeActive('Open');
	expect(screen.getByText('Avery Morgan')).toBeInTheDocument();
});

it('opens an encounter shelf from a row and preserves list query parameters', async () => {
	const router = renderEncounters('/admin/encounters?source=admin&status=open');

	fireEvent.click(screen.getByRole('row', { name: /Avery Morgan/ }));

	await waitFor(() => expect(router.state.location.pathname).toBe('/admin/encounters/encounter-1'));
	expect(router.state.location.search).toBe('?source=admin&status=open');
	expect(await screen.findByRole('heading', { name: 'Firstname Lastname' })).toBeInTheDocument();
	expect(screen.getByText('Care Navigator:')).toBeInTheDocument();

	await act(async () => {
		await router.navigate(-1);
	});

	await waitFor(() => expect(router.state.location.pathname).toBe('/admin/encounters'));
	expect(router.state.location.search).toBe('?source=admin&status=open');
});

it('renders static shelf details and switches shelf tabs without changing the URL', async () => {
	const router = renderEncounters('/admin/encounters/any-encounter-id?status=closed');

	expect(await screen.findByRole('heading', { name: 'Firstname Lastname' })).toBeInTheDocument();
	expect(screen.getByText('Navigator Name')).toBeInTheDocument();
	expect(screen.getByText('Nov 12, 2022')).toBeInTheDocument();
	expect(screen.getByText('webform')).toBeInTheDocument();
	expect(screen.getByText('address@email.com')).toBeInTheDocument();
	expect(screen.getByText('Navigator Appointment')).toBeInTheDocument();
	expect(screen.getByText('Aetna Behavioral Health Network')).toBeInTheDocument();
	expect(screen.getByText('Close Encounter')).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Close Encounter' })).not.toBeInTheDocument();
	expectTabToBeActive('Encounter Details');

	const shelfUrl = `${router.state.location.pathname}${router.state.location.search}`;
	fireEvent.click(screen.getByRole('button', { name: 'Contact History (0)' }));

	expect(await screen.findByRole('heading', { name: 'No Contact Attempts Logged' })).toBeInTheDocument();
	expectTabToBeActive('Contact History (0)');
	expect(`${router.state.location.pathname}${router.state.location.search}`).toBe(shelfUrl);

	fireEvent.click(screen.getByRole('button', { name: 'Notes (0)' }));

	expect(await screen.findByRole('heading', { name: 'No Notes' })).toBeInTheDocument();
	expectTabToBeActive('Notes (0)');
	expect(`${router.state.location.pathname}${router.state.location.search}`).toBe(shelfUrl);

	fireEvent.click(screen.getByRole('button', { name: 'Close encounter details' }));

	await waitFor(() => expect(router.state.location.pathname).toBe('/admin/encounters'));
	expect(router.state.location.search).toBe('?status=closed');
});

it('dismisses a directly linked shelf with Escape and preserves its query parameters', async () => {
	const router = renderEncounters('/admin/encounters/encounter-6?source=admin&status=open');

	await screen.findByRole('heading', { name: 'Firstname Lastname' });
	fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

	await waitFor(() => expect(router.state.location.pathname).toBe('/admin/encounters'));
	expect(router.state.location.search).toBe('?source=admin&status=open');
});
