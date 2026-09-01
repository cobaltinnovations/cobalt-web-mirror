import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { Component, loader } from './provider-info';

jest.mock('@/components/provider-info-detail', () => ({
	__esModule: true,
	default: ({ className, providerId }: { className?: string; providerId?: string }) => (
		<div className={className} data-provider-id={providerId} data-testid="provider-info-detail" />
	),
}));

it('adds the standard top padding to the standalone provider info route', async () => {
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
	expect(providerInfoDetail).toHaveClass('pt-10');
	expect(providerInfoDetail).toHaveAttribute('data-provider-id', 'provider-id');
});
