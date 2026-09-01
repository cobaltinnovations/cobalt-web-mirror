import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
import { CobaltThemeProvider } from '@/jss/theme';
import { FeatureId, InstitutionFeature } from '@/lib/models';
import FeatureScreeningCta from './feature-screening-cta';

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: jest.fn(),
}));

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;

const renderCta = (features: InstitutionFeature[] = []) => {
	mockUseAccount.mockReturnValue({
		institution: {
			epicFhirEnabled: false,
			features,
		},
	} as ReturnType<typeof useAccount>);

	const router = createMemoryRouter(
		[
			{
				path: '/',
				element: (
					<CobaltThemeProvider>
						<FeatureScreeningCta onStartAssessment={jest.fn()} />
					</CobaltThemeProvider>
				),
			},
			{
				path: '/provider-info/:providerId',
				element: <div>Provider detail</div>,
			},
		],
		{ initialEntries: ['/'] }
	);

	render(<RouterProvider router={router} />);

	return router;
};

it('does not render a Care Navigator action without the institution feature', () => {
	renderCta();

	expect(screen.getByRole('button', { name: 'Take the Assessment' })).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: /Care Navigator/i })).not.toBeInTheDocument();
});

it('routes the feature-driven Care Navigator action to its provider detail page', () => {
	const router = renderCta([
		{
			featureId: FeatureId.RESOURCE_NAVIGATOR,
			navDescription: 'Connect with a Care Navigator.',
			providerId: 'care-navigator-provider-id',
		} as InstitutionFeature,
	]);

	fireEvent.click(screen.getByRole('button', { name: 'Connect with a Care Navigator.' }));

	expect(router.state.location.pathname).toBe('/provider-info/care-navigator-provider-id');
});
