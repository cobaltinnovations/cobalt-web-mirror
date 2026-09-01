import React from 'react';
import { render, screen } from '@testing-library/react';

import ProviderInfoDetailContact from './provider-info-detail-contact';
import { Provider } from '@/lib/models';

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

it('does not render contact information for a virtual-only provider without public contact details', () => {
	const provider = {
		locations: [
			{
				locationId: 'virtual-location',
				name: 'Virtual Care',
			},
		],
	} as Provider;

	const { container } = render(<ProviderInfoDetailContact provider={provider} />);

	expect(screen.queryByRole('heading', { name: 'Contact' })).not.toBeInTheDocument();
	expect(container).toBeEmptyDOMElement();
});

it('continues to render a location when it has an address', () => {
	const provider = {
		locations: [
			{
				locationId: 'office-location',
				address: {
					streetAddress1: '123 Market Street',
					locality: 'Philadelphia',
					region: 'PA',
					postalCode: '19104',
				},
			},
		],
	} as Provider;

	render(<ProviderInfoDetailContact provider={provider} />);

	expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
	expect(screen.getByText('123 Market Street')).toBeInTheDocument();
});
