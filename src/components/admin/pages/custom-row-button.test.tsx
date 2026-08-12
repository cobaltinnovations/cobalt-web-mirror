import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CustomRowButton } from './custom-row-button';

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

it('renders the headline preset preview using the shared custom-row button', () => {
	const handleClick = jest.fn();

	render(<CustomRowButton title="Select Layout" preview="headline" onClick={handleClick} />);

	expect(screen.getByRole('heading', { name: 'Headline Row' })).toBeInTheDocument();
	expect(screen.getByText('Use this space to add description text.')).toBeInTheDocument();

	fireEvent.click(screen.getByRole('button', { name: 'Select Layout' }));

	expect(handleClick).toHaveBeenCalledTimes(1);
});
