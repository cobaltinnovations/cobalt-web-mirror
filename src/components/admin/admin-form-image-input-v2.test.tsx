import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import type { ImageModel } from '@/lib/models';

import { AdminFormImageInputV2 } from './admin-form-image-input-v2';

const mockRepositoryImage = {
	imageId: 'repository-image-id',
	fileUploadId: 'repository-file-upload-id',
	url: 'https://example.com/repository-image.jpg',
	filename: 'repository-image.jpg',
	imageAltText: 'Repository image alt text',
} as ImageModel;

jest.mock('@/components/image-repository/image-repository', () => ({
	__esModule: true,
	default: ({ show, onImageSelect }: { show?: boolean; onImageSelect(image: ImageModel): void }) =>
		show ? (
			<button type="button" onClick={() => onImageSelect(mockRepositoryImage)}>
				Choose repository image
			</button>
		) : null,
}));

it('opens the repository and returns the selected image', () => {
	const onChange = jest.fn();
	render(<AdminFormImageInputV2 onChange={onChange} />);

	fireEvent.click(screen.getByRole('button', { name: 'Add Image' }));
	fireEvent.click(screen.getByRole('button', { name: 'Choose repository image' }));

	expect(onChange).toHaveBeenCalledWith(mockRepositoryImage);
});

it('shows and clears a selected repository image', () => {
	const onChange = jest.fn();
	render(<AdminFormImageInputV2 value={mockRepositoryImage} onChange={onChange} />);

	expect(screen.getByRole('img', { name: mockRepositoryImage.imageAltText })).toHaveAttribute(
		'src',
		mockRepositoryImage.url
	);
	fireEvent.click(screen.getByRole('button', { name: 'Clear Image' }));

	expect(onChange).toHaveBeenCalledWith(undefined);
});

it('shows a removable placeholder while keeping repository selection available', () => {
	const onChange = jest.fn();
	render(
		<AdminFormImageInputV2 placeholderImageSrc="/placeholder.jpg" allowRemovePlaceholderImage onChange={onChange} />
	);

	expect(screen.getByRole('img')).toHaveAttribute('src', '/placeholder.jpg');
	expect(screen.getByRole('button', { name: 'Add Image' })).toBeInTheDocument();
	fireEvent.click(screen.getByRole('button', { name: 'Clear Image' }));

	expect(onChange).toHaveBeenCalledWith(undefined);
});
