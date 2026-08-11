import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
	BACKGROUND_COLOR_ID,
	CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID,
	CustomRowModel,
	ImageModel,
	PAGE_STATUS_ID,
	PageDetailModel,
	PageRowColumnModel,
	ROW_PADDING_ID,
	ROW_TYPE_ID,
	ThreeColumnRowModel,
	TwoColumnRowModel,
} from '@/lib/models';

import { RowSettingsCallToAction } from './row-settings-call-to-action';
import { RowSettingsCustomRowColumn } from './row-settings-custom-row-column';
import { RowSettingsThreeColumns } from './row-settings-three-columns';
import { RowSettingsTwoColumns } from './row-settings-two-columns';
import { SectionHeroSettingsForm } from './section-hero-settings-form';

const mockUpdatePageHero = jest.fn();
const mockUpdateTwoColumnRow = jest.fn();
const mockUpdateThreeColumnRow = jest.fn();
const mockUpdateCustomRowColumn = jest.fn();
const mockUpdateCallToActionBlockRow = jest.fn();
const mockUpdatePageRowService = jest.fn();
const mockUpdatePageRowContext = jest.fn();
const mockSetPage = jest.fn();
const mockSetIsSaving = jest.fn();
const mockHandleError = jest.fn();
let mockPageBuilderContext: Record<string, unknown> = {};

const mockRepositoryImage = {
	imageId: 'repository-image-id',
	fileUploadId: 'repository-file-upload-id',
	url: 'https://example.com/repository-image.jpg',
	filename: 'repository-image.jpg',
} as ImageModel;

jest.mock('@/lib/services', () => ({
	pagesService: {
		updatePageHero: (...args: unknown[]) => mockUpdatePageHero(...args),
		updateTwoColumnRow: (...args: unknown[]) => mockUpdateTwoColumnRow(...args),
		updateThreeColumnRow: (...args: unknown[]) => mockUpdateThreeColumnRow(...args),
		updateCustomRowColumn: (...args: unknown[]) => mockUpdateCustomRowColumn(...args),
		updateCallToActionBlockRow: (...args: unknown[]) => mockUpdateCallToActionBlockRow(...args),
		updatePageRow: (...args: unknown[]) => mockUpdatePageRowService(...args),
	},
}));

jest.mock('@/hooks/use-page-builder-context', () => ({
	__esModule: true,
	default: () => mockPageBuilderContext,
}));

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: () => ({ institution: { imageRepositoryEnabled: true } }),
}));

jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => mockHandleError,
}));

jest.mock('@/components/admin/admin-form-image-input', () => ({
	AdminFormImageInput: () => <div>Legacy image input</div>,
}));

jest.mock('@/components/admin/admin-form-image-input-v2', () => ({
	AdminFormImageInputV2: ({ onChange }: { onChange(image?: ImageModel): void }) => (
		<button type="button" onClick={() => onChange(mockRepositoryImage)}>
			Select repository image
		</button>
	),
}));

jest.mock('@/components/admin/pages', () => ({
	RowSettingsMetaForm: () => null,
}));

jest.mock('@/components/admin/pages/collapse-button', () => ({
	CollapseButton: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

jest.mock('@/components/wysiwyg-basic', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/input-helper', () => ({
	__esModule: true,
	default: ({
		label,
		as: _as,
		children: _children,
		helperText: _helperText,
		...props
	}: React.InputHTMLAttributes<HTMLInputElement> & {
		label: string;
		as?: string;
		helperText?: React.ReactNode;
	}) => <input aria-label={label} {...props} />,
}));

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/jss/theme', () => ({
	createUseThemedStyles: () => () => ({
		section: 'section',
		sectionDragHandle: 'section-drag-handle',
	}),
}));

jest.mock('@hello-pangea/dnd', () => ({
	DragDropContext: ({ children }: React.PropsWithChildren) => <>{children}</>,
	Droppable: ({ children }: { children(provided: Record<string, unknown>): React.ReactNode }) =>
		children({ innerRef: jest.fn(), droppableProps: {}, placeholder: null }),
	Draggable: ({
		children,
	}: {
		children(provided: Record<string, unknown>, snapshot: { isDragging: boolean }): React.ReactNode;
	}) => children({ innerRef: jest.fn(), draggableProps: {}, dragHandleProps: {} }, { isDragging: false }),
}));

const column = (id: string): PageRowColumnModel => ({
	pageRowColumnId: id,
	pageRowId: 'row-id',
	headline: '',
	description: '',
	imageFileUploadId: '',
	imageAltText: '',
	imageUrl: '',
	usePlaceholderImage: false,
	columnDisplayOrder: 0,
	contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT,
});

const rowBase = {
	pageRowAnchorId: 'anchor-id',
	pageSectionId: 'section-id',
	name: 'Image row',
	backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
	paddingTopId: ROW_PADDING_ID.MEDIUM,
	paddingBottomId: ROW_PADDING_ID.MEDIUM,
	displayOrder: 0,
};

beforeEach(() => {
	jest.clearAllMocks();
	mockPageBuilderContext = {
		updatePageRow: mockUpdatePageRowContext,
		setPage: mockSetPage,
		setIsSaving: mockSetIsSaving,
	};
});

it('saves a repository image on the page hero', async () => {
	const page = {
		pageId: 'page-id',
		pageStatusId: PAGE_STATUS_ID.DRAFT,
		headline: 'Hero',
		description: 'Description',
		imageFileUploadId: '',
		imageAltText: 'Placement alt text',
		imageUrl: '',
	} as PageDetailModel;
	mockPageBuilderContext = { ...mockPageBuilderContext, page };
	mockUpdatePageHero.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ page }) });

	render(<SectionHeroSettingsForm />);
	fireEvent.click(screen.getByRole('button', { name: 'Select repository image' }));

	await waitFor(() => expect(mockUpdatePageHero).toHaveBeenCalledTimes(1));
	expect(mockUpdatePageHero).toHaveBeenCalledWith(
		page.pageId,
		expect.objectContaining({ imageId: mockRepositoryImage.imageId, imageAltText: 'Placement alt text' })
	);
});

it('updates only the selected two-column placement with a repository image ID', async () => {
	const pageRow = {
		...rowBase,
		pageRowId: 'two-column-row',
		rowTypeId: ROW_TYPE_ID.TWO_COLUMN_IMAGE,
		columnOne: column('column-one'),
		columnTwo: column('column-two'),
	} as TwoColumnRowModel;
	mockUpdateTwoColumnRow.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ pageRow }) });

	render(<RowSettingsTwoColumns pageRow={pageRow} />);
	fireEvent.click(screen.getAllByRole('button', { name: 'Select repository image' })[1]);

	await waitFor(() => expect(mockUpdateTwoColumnRow).toHaveBeenCalledTimes(1));
	const request = mockUpdateTwoColumnRow.mock.calls[0][1];
	expect(request.columnOne.imageId).toBeUndefined();
	expect(request.columnTwo.imageId).toBe(mockRepositoryImage.imageId);
});

it('updates only the selected three-column placement with a repository image ID', async () => {
	const pageRow = {
		...rowBase,
		pageRowId: 'three-column-row',
		rowTypeId: ROW_TYPE_ID.THREE_COLUMN_IMAGE,
		columnOne: column('column-one'),
		columnTwo: column('column-two'),
		columnThree: column('column-three'),
	} as ThreeColumnRowModel;
	mockUpdateThreeColumnRow.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ pageRow }) });

	render(<RowSettingsThreeColumns pageRow={pageRow} />);
	fireEvent.click(screen.getAllByRole('button', { name: 'Select repository image' })[2]);

	await waitFor(() => expect(mockUpdateThreeColumnRow).toHaveBeenCalledTimes(1));
	const request = mockUpdateThreeColumnRow.mock.calls[0][1];
	expect(request.columnOne.imageId).toBeUndefined();
	expect(request.columnTwo.imageId).toBeUndefined();
	expect(request.columnThree.imageId).toBe(mockRepositoryImage.imageId);
});

it('replaces a custom-row placeholder with a repository image', async () => {
	const placeholderColumn = { ...column('custom-column'), usePlaceholderImage: true };
	const pageRow = {
		...rowBase,
		pageRowId: 'custom-row',
		rowTypeId: ROW_TYPE_ID.CUSTOM_ROW,
		columns: [placeholderColumn],
	} as CustomRowModel;
	mockPageBuilderContext = { ...mockPageBuilderContext, currentPageRow: pageRow };
	mockUpdateCustomRowColumn.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ pageRow }) });

	render(<RowSettingsCustomRowColumn pageRowColumnId={placeholderColumn.pageRowColumnId} />);
	fireEvent.click(screen.getByRole('button', { name: 'Select repository image' }));

	await waitFor(() => expect(mockUpdateCustomRowColumn).toHaveBeenCalledTimes(1));
	expect(mockUpdateCustomRowColumn).toHaveBeenCalledWith(
		pageRow.pageRowId,
		placeholderColumn.pageRowColumnId,
		expect.objectContaining({ imageId: mockRepositoryImage.imageId, usePlaceholderImage: false })
	);
});

it('saves a repository image on block CTA rows', async () => {
	const pageRow = {
		...rowBase,
		pageRowId: 'cta-row',
		rowTypeId: ROW_TYPE_ID.CALL_TO_ACTION_BLOCK,
		headline: 'CTA',
		description: '',
		buttonText: 'Go',
		buttonUrl: '/go',
		imageFileUploadId: '',
		imageUrl: '',
	};
	mockPageBuilderContext = { ...mockPageBuilderContext, currentPageRow: pageRow };
	mockUpdateCallToActionBlockRow.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ pageRow }) });
	mockUpdatePageRowService.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ pageRow }) });

	render(<RowSettingsCallToAction variant="block" />);
	fireEvent.click(screen.getByRole('button', { name: 'Select repository image' }));

	await waitFor(() => expect(mockUpdateCallToActionBlockRow).toHaveBeenCalledTimes(1));
	expect(mockUpdateCallToActionBlockRow).toHaveBeenCalledWith(
		pageRow.pageRowId,
		expect.objectContaining({ imageId: mockRepositoryImage.imageId })
	);
});
