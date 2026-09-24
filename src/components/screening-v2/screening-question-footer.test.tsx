import React from 'react';
import { render, screen } from '@testing-library/react';

import { ScreeningQuestionFooter } from './screening-question-footer';

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/inline-alert', () => ({
	__esModule: true,
	default: ({ variant, title, description }: { variant: string; title: string; description: React.ReactNode }) => (
		<aside aria-label={title} data-variant={variant}>
			<h2>{title}</h2>
			{description}
		</aside>
	),
}));

it('renders valid primary footer callout metadata as the blue information alert', () => {
	render(
		<ScreeningQuestionFooter
			footerText="Cobalt uses your employer only to personalize your experience."
			metadata={{
				footerCallout: {
					title: 'How we use this information',
					displayTypeId: 'PRIMARY',
				},
			}}
		/>
	);

	expect(screen.getByText('How we use this information')).toBeInTheDocument();
	expect(screen.getByText('Cobalt uses your employer only to personalize your experience.')).toBeInTheDocument();
	expect(screen.getByRole('complementary', { name: 'How we use this information' })).toHaveAttribute(
		'data-variant',
		'primary'
	);
});

it.each([
	undefined,
	{},
	{ footerCallout: { title: '', displayTypeId: 'PRIMARY' } },
	{ footerCallout: { title: 'Unsupported', displayTypeId: 'WARNING' } },
] as unknown[])('retains the ordinary footer when callout metadata is missing or invalid', (metadata) => {
	render(
		<ScreeningQuestionFooter
			footerText="Ordinary footer copy"
			metadata={metadata as React.ComponentProps<typeof ScreeningQuestionFooter>['metadata']}
		/>
	);

	expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
	expect(screen.getByText('Ordinary footer copy')).toHaveClass('mb-6');
});
