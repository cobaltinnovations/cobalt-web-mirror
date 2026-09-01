import React from 'react';
import { render, screen } from '@testing-library/react';

import { ProviderSearchResultModel } from '@/lib/models';
import ProviderSearchResult from './provider-search-result';

jest.mock('@/jss/theme', () => ({
	createUseThemedStyles: () => () =>
		new Proxy(
			{},
			{
				get: (_target, property) => String(property),
			}
		),
}));

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('./provider-schedule-card', () => ({
	__esModule: true,
	default: () => <div data-testid="provider-schedule-card" />,
}));

it('renders trusted provider description markup and left-aligns a wrapping provider name', () => {
	const provider = {
		name: 'University of Pennsylvania Employee Assistance Program',
		description: '<p>First line<br>Second <strong>important</strong> line</p>',
		supportedAppointmentModalities: [],
	} as ProviderSearchResultModel;

	const { container } = render(
		<ProviderSearchResult
			provider={provider}
			onTitleButtonClick={jest.fn()}
			onScheduleAppointmentButtonClick={jest.fn()}
			onViewAppointmentsButtonClick={jest.fn()}
		/>
	);

	const titleButton = screen.getByRole('button', { name: provider.name });
	expect(titleButton).toHaveClass('text-start');
	expect(screen.getByText('important')).toHaveProperty('tagName', 'STRONG');
	expect(container.querySelector('.description br')).toBeInTheDocument();
	expect(screen.queryByText(/<p>/)).not.toBeInTheDocument();
});
