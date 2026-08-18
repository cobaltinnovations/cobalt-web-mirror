import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { CobaltThemeProvider } from '@/jss/theme';
import { Component } from './encounters';

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

const renderEncounters = (initialEntry = '/admin/encounters') => {
	const router = createMemoryRouter(
		[
			{
				path: '/admin/encounters',
				element: <Component />,
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
