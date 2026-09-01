import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { Component, loader } from './provider-info';

jest.mock('@/components/provider-info-detail', () => ({
	__esModule: true,
	default: ({
		className,
		providerId,
		flushHeader,
	}: {
		className?: string;
		providerId?: string;
		flushHeader?: boolean;
	}) => (
		<div
			className={className}
			data-flush-header={flushHeader ? 'true' : 'false'}
			data-provider-id={providerId}
			data-testid="provider-info-detail"
		/>
	),
}));

it('renders the standalone provider info with the shared full-width header', async () => {
	const router = createMemoryRouter(
		[
			{
				path: '/provider-info/:providerId',
				loader,
				Component,
			},
		],
		{ initialEntries: ['/provider-info/provider-id'] }
	);

	render(<RouterProvider router={router} />);

	const providerInfoDetail = await screen.findByTestId('provider-info-detail');
	expect(providerInfoDetail).not.toHaveClass('pt-10');
	expect(providerInfoDetail).toHaveAttribute('data-flush-header', 'false');
	expect(providerInfoDetail).toHaveAttribute('data-provider-id', 'provider-id');
});
