import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
import { CobaltThemeProvider } from '@/jss/theme';
import { screeningService } from '@/lib/services/screening-service';
import { PatientEligibilityExit } from './eligibility-exit';

jest.mock('@/hooks/use-account', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/hooks/use-handle-error', () => {
	const handleError = jest.fn();
	return { __esModule: true, default: () => handleError };
});
jest.mock('@/lib/services/screening-service', () => ({
	screeningService: { getEligibilityExitContent: jest.fn() },
}));

it('loads tenant content for a completed screening from a direct page URL', async () => {
	(useAccount as jest.Mock).mockReturnValue({ institution: { platformName: 'Penn Cobalt' } });
	const fetch = jest.fn().mockResolvedValue({
		eligibilityExitContent: {
			title: 'EASE Clinic eligibility',
			message: 'The pilot is for PAH employees.',
			actionUrl: 'https://www.penncobalt.com/',
			actionText: 'Explore support options',
			contactName: 'Donna Campo',
			contactPhone: '215-829-7052',
		},
	});
	(screeningService.getEligibilityExitContent as jest.Mock).mockReturnValue({ fetch });
	const router = createMemoryRouter(
		[{ path: '/ic/patient/eligibility-exit/:screeningSessionId', element: <PatientEligibilityExit /> }],
		{ initialEntries: ['/ic/patient/eligibility-exit/completed-session-id'] }
	);

	render(
		<CobaltThemeProvider>
			<RouterProvider router={router} />
		</CobaltThemeProvider>
	);

	expect(await screen.findByRole('heading', { name: 'EASE Clinic eligibility' })).toBeInTheDocument();
	expect(screen.getByText('The pilot is for PAH employees.')).toBeInTheDocument();
	expect(screen.getByRole('link', { name: '215-829-7052' })).toHaveAttribute('href', 'tel:2158297052');
	expect(screen.getByRole('button', { name: 'Explore support options' })).toHaveAttribute(
		'href',
		'https://www.penncobalt.com/'
	);
	expect(screeningService.getEligibilityExitContent).toHaveBeenCalledWith('completed-session-id');
});
