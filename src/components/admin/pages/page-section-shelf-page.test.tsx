import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PageSectionShelfPage } from './page-section-shelf-page';

jest.mock('@/jss/theme', () => ({
	createUseThemedStyles: () => () => ({
		page: 'page',
		header: 'header',
		body: 'body',
	}),
}));

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: ({ icon }: { icon: string }) => <span role="img" aria-label={icon} />,
}));

it('renders duplicate immediately before delete and invokes the duplicate action', () => {
	const handleDuplicate = jest.fn();
	render(
		<PageSectionShelfPage
			title="Custom Row"
			showDuplicateButton
			onDuplicateButtonClick={handleDuplicate}
			showDeleteButton
			showCloseButton
		>
			Content
		</PageSectionShelfPage>
	);

	const headerIcons = screen.getAllByRole('img');
	expect(headerIcons[0]).toHaveAccessibleName('clone');
	expect(headerIcons[1]).toHaveAccessibleName('trash-can');
	expect(headerIcons[2]).toHaveAccessibleName('xmark');

	fireEvent.click(screen.getByRole('button', { name: 'Duplicate row' }));

	expect(handleDuplicate).toHaveBeenCalledTimes(1);
});

it('disables the duplicate action while duplication is in progress', () => {
	render(
		<PageSectionShelfPage title="Custom Row" showDuplicateButton duplicateButtonDisabled>
			Content
		</PageSectionShelfPage>
	);

	expect(screen.getByRole('button', { name: 'Duplicate row' })).toBeDisabled();
});
