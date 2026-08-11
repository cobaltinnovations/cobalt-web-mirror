import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
	BACKGROUND_COLOR_ID,
	CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID,
	ImageModel,
	OneColumnRowModel,
	ROW_PADDING_ID,
	ROW_TYPE_ID,
} from '@/lib/models';
import { RowSettingsOneColumn } from './row-settings-one-column';

const mockUpdateOneColumnRow = jest.fn();
const mockUpdateOneColumnImageRightRow = jest.fn();
const mockUpdateOneColumnTextRow = jest.fn();
const mockUpdatePageRow = jest.fn();
const mockSetIsSaving = jest.fn();
const mockHandleError = jest.fn();
let mockImageRepositoryEnabled = false;

const mockRepositoryImage = {
	imageId: 'repository-image-id',
	fileUploadId: 'repository-file-upload-id',
	url: 'https://example.com/repository-image.jpg',
	filename: 'repository-image.jpg',
} as ImageModel;

jest.mock('@/lib/services', () => ({
	pagesService: {
		updateOneColumnRow: (...args: unknown[]) => mockUpdateOneColumnRow(...args),
		updateOneColumnImageRightRow: (...args: unknown[]) => mockUpdateOneColumnImageRightRow(...args),
		updateOneColumnTextRow: (...args: unknown[]) => mockUpdateOneColumnTextRow(...args),
	},
}));

jest.mock('@/hooks/use-page-builder-context', () => ({
	__esModule: true,
	default: () => ({ updatePageRow: mockUpdatePageRow, setIsSaving: mockSetIsSaving }),
}));

jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => mockHandleError,
}));

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: () => ({ institution: { imageRepositoryEnabled: mockImageRepositoryEnabled } }),
}));

jest.mock('@/components/admin/pages', () => ({
	RowSettingsMetaForm: () => null,
}));

jest.mock('@/components/admin/pages/collapse-button', () => ({
	CollapseButton: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

jest.mock('@/components/admin/admin-form-image-input', () => ({
	AdminFormImageInput: ({ onUploadComplete }: { onUploadComplete(fileUploadId: string): void }) => (
		<button type="button" onClick={() => onUploadComplete('legacy-file-upload-id')}>
			Legacy image input
		</button>
	),
}));

jest.mock('@/components/admin/admin-form-image-input-v2', () => ({
	AdminFormImageInputV2: ({ value, onChange }: { value?: ImageModel; onChange(image?: ImageModel): void }) => (
		<button type="button" onClick={() => onChange(value ? undefined : mockRepositoryImage)}>
			{value ? 'Clear repository image' : 'Select repository image'}
		</button>
	),
}));

jest.mock('@/components/wysiwyg-basic', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/input-helper', () => ({
	__esModule: true,
	default: ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
		<input aria-label={label} {...props} />
	),
}));

const createRow = (rowTypeId: OneColumnRowModel['rowTypeId']): OneColumnRowModel => ({
	pageRowId: `row-${rowTypeId}`,
	pageRowAnchorId: `anchor-${rowTypeId}`,
	pageSectionId: 'section-id',
	rowTypeId,
	name: 'Column row',
	backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
	paddingTopId: ROW_PADDING_ID.MEDIUM,
	paddingBottomId: ROW_PADDING_ID.MEDIUM,
	displayOrder: 0,
	columnOne: {
		pageRowColumnId: `column-${rowTypeId}`,
		pageRowId: `row-${rowTypeId}`,
		headline: 'Original headline',
		description: '',
		imageFileUploadId: '',
		imageAltText: '',
		imageUrl: '',
		usePlaceholderImage: false,
		columnDisplayOrder: 0,
		contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT,
	},
});

const serviceForRowType = (rowTypeId: OneColumnRowModel['rowTypeId']) => {
	switch (rowTypeId) {
		case ROW_TYPE_ID.ONE_COLUMN_IMAGE:
			return mockUpdateOneColumnRow;
		case ROW_TYPE_ID.ONE_COLUMN_IMAGE_RIGHT:
			return mockUpdateOneColumnImageRightRow;
		case ROW_TYPE_ID.ONE_COLUMN_TEXT:
			return mockUpdateOneColumnTextRow;
		default: {
			const unsupportedRowType: never = rowTypeId;
			throw new Error(`Unsupported one-column row type: ${unsupportedRowType}`);
		}
	}
};

beforeEach(() => {
	jest.useFakeTimers();
	jest.clearAllMocks();
	mockImageRepositoryEnabled = false;
});

it('uses repository image IDs for selection, later autosaves, and clearing', async () => {
	mockImageRepositoryEnabled = true;
	const pageRow = createRow(ROW_TYPE_ID.ONE_COLUMN_IMAGE);
	mockUpdateOneColumnRow.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ pageRow }) });

	render(<RowSettingsOneColumn pageRow={pageRow} />);
	fireEvent.click(screen.getByRole('button', { name: 'Select repository image' }));

	await waitFor(() => expect(mockUpdateOneColumnRow).toHaveBeenCalledTimes(1));
	expect(mockUpdateOneColumnRow).toHaveBeenLastCalledWith(
		pageRow.pageRowId,
		expect.objectContaining({
			columnOne: expect.objectContaining({
				imageId: mockRepositoryImage.imageId,
			}),
		})
	);
	expect(mockUpdateOneColumnRow.mock.calls[0][1].columnOne).not.toHaveProperty('imageFileUploadId');

	fireEvent.change(screen.getByLabelText('Headline'), {
		target: { name: 'headline', value: 'Updated after selecting' },
	});
	act(() => {
		jest.advanceTimersByTime(500);
	});

	await waitFor(() => expect(mockUpdateOneColumnRow).toHaveBeenCalledTimes(2));
	expect(mockUpdateOneColumnRow).toHaveBeenLastCalledWith(
		pageRow.pageRowId,
		expect.objectContaining({
			columnOne: expect.objectContaining({
				headline: 'Updated after selecting',
				imageId: mockRepositoryImage.imageId,
			}),
		})
	);

	fireEvent.click(screen.getByRole('button', { name: 'Clear repository image' }));
	await waitFor(() => expect(mockUpdateOneColumnRow).toHaveBeenCalledTimes(3));
	expect(mockUpdateOneColumnRow).toHaveBeenLastCalledWith(
		pageRow.pageRowId,
		expect.objectContaining({
			columnOne: expect.objectContaining({ imageId: undefined }),
		})
	);
	expect(mockUpdateOneColumnRow.mock.calls[2][1].columnOne).not.toHaveProperty('imageFileUploadId');
});

it('keeps the legacy uploader and file-upload payload when the repository is disabled', async () => {
	const pageRow = createRow(ROW_TYPE_ID.ONE_COLUMN_IMAGE);
	mockUpdateOneColumnRow.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ pageRow }) });

	render(<RowSettingsOneColumn pageRow={pageRow} />);
	fireEvent.click(screen.getByRole('button', { name: 'Legacy image input' }));

	await waitFor(() => expect(mockUpdateOneColumnRow).toHaveBeenCalledTimes(1));
	expect(mockUpdateOneColumnRow).toHaveBeenCalledWith(
		pageRow.pageRowId,
		expect.objectContaining({
			columnOne: expect.objectContaining({
				imageFileUploadId: 'legacy-file-upload-id',
			}),
		})
	);
	expect(mockUpdateOneColumnRow.mock.calls[0][1].columnOne).not.toHaveProperty('imageId');
});

afterEach(() => {
	jest.useRealTimers();
});

it.each([ROW_TYPE_ID.ONE_COLUMN_IMAGE, ROW_TYPE_ID.ONE_COLUMN_IMAGE_RIGHT, ROW_TYPE_ID.ONE_COLUMN_TEXT] as const)(
	'routes %s updates only to its matching endpoint',
	(rowTypeId) => {
		const pageRow = createRow(rowTypeId);
		const matchingService = serviceForRowType(rowTypeId);
		matchingService.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ pageRow }) });

		render(<RowSettingsOneColumn pageRow={pageRow} />);
		fireEvent.change(screen.getByLabelText('Headline'), {
			target: { name: 'headline', value: 'Updated headline' },
		});

		act(() => {
			jest.advanceTimersByTime(500);
		});

		expect(matchingService).toHaveBeenCalledTimes(1);
		expect(matchingService).toHaveBeenCalledWith(
			pageRow.pageRowId,
			expect.objectContaining({
				columnOne: expect.objectContaining({ headline: 'Updated headline' }),
			})
		);
		expect(
			[mockUpdateOneColumnRow, mockUpdateOneColumnImageRightRow, mockUpdateOneColumnTextRow]
				.filter((service) => service !== matchingService)
				.reduce((callCount, service) => callCount + service.mock.calls.length, 0)
		).toBe(0);
	}
);

it('flushes a pending edit to the original row when the editor unmounts', () => {
	const pageRow = createRow(ROW_TYPE_ID.ONE_COLUMN_IMAGE);
	mockUpdateOneColumnRow.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ pageRow }) });
	const { unmount } = render(<RowSettingsOneColumn pageRow={pageRow} />);

	fireEvent.change(screen.getByLabelText('Headline'), {
		target: { name: 'headline', value: 'Saved while leaving' },
	});

	act(() => {
		unmount();
	});

	expect(mockUpdateOneColumnRow).toHaveBeenCalledTimes(1);
	expect(mockUpdateOneColumnRow).toHaveBeenCalledWith(
		pageRow.pageRowId,
		expect.objectContaining({
			columnOne: expect.objectContaining({ headline: 'Saved while leaving' }),
		})
	);

	act(() => {
		jest.advanceTimersByTime(500);
	});

	expect(mockUpdateOneColumnRow).toHaveBeenCalledTimes(1);
});
