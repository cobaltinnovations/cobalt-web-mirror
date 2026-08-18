import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
import { CobaltThemeProvider } from '@/jss/theme';
import { AdminHeader } from './admin-header';

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;

it('shows Encounters as active for the encounters route', () => {
	mockUseAccount.mockReturnValue({
		account: {
			accountCapabilityFlags: {
				canAdministerContent: false,
				canAdministerGroupSessions: false,
				canCreatePages: false,
				canViewProviderReports: false,
				canViewAnalytics: false,
				canViewStudyInsights: false,
			},
		},
		institution: {},
		signOutAndClearContext: jest.fn(),
	} as ReturnType<typeof useAccount>);

	render(
		<CobaltThemeProvider>
			<MemoryRouter initialEntries={['/admin/encounters']}>
				<AdminHeader />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

	const encountersLink = screen.getByRole('link', { name: 'Encounters' });
	expect(encountersLink).toHaveAttribute('href', '/admin/encounters');
	expect(encountersLink.parentElement).toHaveClass('active');
});
