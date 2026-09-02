import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { CobaltThemeProvider } from '@/jss/theme';
import ProviderInfoDetail from './provider-info-detail';

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('./async-page', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('./provider-schedule-modal', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('@/components/ineligible-booking-modal', () => ({
	__esModule: true,
	default: () => null,
}));

it('renders the provider header as a tinted, full-width hero', () => {
	const { container } = render(
		<CobaltThemeProvider>
			<MemoryRouter>
				<ProviderInfoDetail providerId="provider-id" flushHeader />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

	const providerContainers = container.querySelectorAll('.container');
	expect(providerContainers).toHaveLength(2);

	const header = providerContainers[0].parentElement;
	const body = providerContainers[1];
	expect(header).toHaveStyle({
		backgroundColor: '#F5F0EC',
		paddingTop: '40px',
		paddingBottom: '40px',
		marginTop: '-32px',
		marginLeft: '-40px',
		marginRight: '-40px',
	});
	expect(body).toHaveStyle({
		paddingTop: '32px',
		paddingBottom: '64px',
	});
});
