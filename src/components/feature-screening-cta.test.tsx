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

jest.mock('./svg-icon', () => ({
	__esModule: true,
	default: ({ icon, className }: { icon: string; className?: string }) => (
		<svg data-icon={icon} className={className} aria-hidden="true" />
	),
}));

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;

const renderCta = ({
	features = [],
	hasTakenFeatureScreening = false,
	onStartAssessment = jest.fn(),
}: {
	features?: InstitutionFeature[];
	hasTakenFeatureScreening?: boolean;
	onStartAssessment?: jest.Mock;
} = {}) => {
	mockUseAccount.mockReturnValue({
		institution: {
			epicFhirEnabled: false,
			features,
			hasTakenFeatureScreening,
		},
	} as ReturnType<typeof useAccount>);

	const router = createMemoryRouter(
		[
			{
				path: '/',
				element: (
					<CobaltThemeProvider>
						<FeatureScreeningCta onStartAssessment={onStartAssessment} />
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

	return { router, onStartAssessment };
};

it('does not render a Care Navigator action without the institution feature', () => {
	renderCta();

	expect(screen.getByRole('button', { name: 'Take Assessment' })).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: /Care Navigator/i })).not.toBeInTheDocument();
});

it('routes the feature-driven Care Navigator action to its provider detail page', () => {
	const { router } = renderCta({
		features: [
			{
				featureId: FeatureId.RESOURCE_NAVIGATOR,
				navDescription: 'Connect with a Care Navigator.',
				providerId: 'care-navigator-provider-id',
			} as InstitutionFeature,
		],
	});

	const scheduleButton = screen.getByRole('button', { name: 'Schedule with Care Navigator' });
	expect(scheduleButton.querySelector('svg')).toBeInTheDocument();
	fireEvent.click(scheduleButton);

	expect(router.state.location.pathname).toBe('/provider-info/care-navigator-provider-id');
});

it('keeps both actions visible and moves recommendation context below them after screening', () => {
	const onStartAssessment = jest.fn();
	renderCta({
		hasTakenFeatureScreening: true,
		onStartAssessment,
		features: [
			{
				featureId: FeatureId.THERAPY,
				recommended: true,
			} as InstitutionFeature,
			{
				featureId: FeatureId.RESOURCE_NAVIGATOR,
				providerId: 'care-navigator-provider-id',
			} as InstitutionFeature,
		],
	});

	const assessmentButton = screen.getByRole('button', { name: 'Take Assessment' });
	const scheduleButton = screen.getByRole('button', { name: 'Schedule with Care Navigator' });
	const recommendation = screen.getByText('Recommendations are based on your recent assessment scores.');

	expect(assessmentButton.compareDocumentPosition(recommendation) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	expect(scheduleButton.compareDocumentPosition(recommendation) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	fireEvent.click(assessmentButton);
	expect(onStartAssessment).toHaveBeenCalledTimes(1);
});
