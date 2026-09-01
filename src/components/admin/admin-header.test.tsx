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

const mockAccount = (canManageCareEncounters: boolean, roleId = 'ADMINISTRATOR', administerFlags = false) => {
	mockUseAccount.mockReturnValue({
		account: {
			roleId,
			accountCapabilityFlags: {
				canAdministerContent: administerFlags,
				canAdministerGroupSessions: administerFlags,
				canCreatePages: administerFlags,
				canViewProviderReports: administerFlags,
				canViewAnalytics: administerFlags,
				canViewStudyInsights: administerFlags,
				canManageCareEncounters,
			},
		},
		institution: {},
		signOutAndClearContext: jest.fn(),
	} as ReturnType<typeof useAccount>);
};

const renderHeader = () =>
	render(
		<CobaltThemeProvider>
			<MemoryRouter initialEntries={['/admin/encounters']}>
				<AdminHeader />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

it('shows Encounters as active for the encounters route', () => {
	mockAccount(true);

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

it('hides Encounters for accounts that cannot manage care encounters', () => {
	mockAccount(false);

	render(
		<CobaltThemeProvider>
			<MemoryRouter initialEntries={['/admin/encounters']}>
				<AdminHeader />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

	expect(screen.queryByRole('link', { name: 'Encounters' })).not.toBeInTheDocument();
});

it('hides administrator-only links from a Care Navigator who is not an administrator', () => {
	// Every one of these routes is administrator-gated, so advertising them to a
	// provider-role navigator would link straight at a NoMatch.
	mockAccount(true, 'PROVIDER', true);
	renderHeader();

	expect(screen.getByRole('link', { name: 'Encounters' })).toBeInTheDocument();
	for (const title of ['Resources', 'Group Sessions', 'Pages', 'Reports', 'Study Insights']) {
		expect(screen.queryByRole('link', { name: title })).not.toBeInTheDocument();
	}
});

it('shows administrator-only links to an administrator', () => {
	mockAccount(false, 'ADMINISTRATOR', true);
	renderHeader();

	expect(screen.getByRole('link', { name: 'Group Sessions' })).toBeInTheDocument();
	expect(screen.queryByRole('link', { name: 'Encounters' })).not.toBeInTheDocument();
});
