import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
	BACKGROUND_COLOR_ID,
	CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID,
	CustomRowModel,
	PAGE_STATUS_ID,
	PageDetailModel,
	PageSectionDetailModel,
	ROW_PADDING_ID,
	ROW_TYPE_ID,
} from '@/lib/models';
import { RowSelectionForm } from './row-selection-form';

const mockCreateCustomRow = jest.fn();
const mockCreateCustomRowColumn = jest.fn();
const mockUpdateCustomRowColumn = jest.fn();
const mockAddPageRowToCurrentPageSection = jest.fn();
const mockUpdatePageRow = jest.fn();
const mockSetCurrentPageRowId = jest.fn();
const mockSetIsSaving = jest.fn();
const mockHandleError = jest.fn();

const HEADLINE_ROW_DESCRIPTION =
	'<h2 class="ql-align-center">headline</h2><p class="ql-align-center"><br></p><p class="ql-align-center">description text.</p>';

jest.mock('@/lib/services', () => ({
	pagesService: {
		createCustomRow: (...args: unknown[]) => mockCreateCustomRow(...args),
		createCustomRowColumn: (...args: unknown[]) => mockCreateCustomRowColumn(...args),
		updateCustomRowColumn: (...args: unknown[]) => mockUpdateCustomRowColumn(...args),
	},
}));

jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => mockHandleError,
}));

jest.mock('@/hooks/use-page-builder-context', () => ({
	__esModule: true,
	default: () => ({
		page: mockPage,
		currentPageSection: mockPageSection,
		addPageRowToCurrentPageSection: mockAddPageRowToCurrentPageSection,
		updatePageRow: mockUpdatePageRow,
		setCurrentPageRowId: mockSetCurrentPageRowId,
		setIsSaving: mockSetIsSaving,
	}),
}));

jest.mock('@/components/inline-alert', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/admin/pages', () => ({
	CallToActionRowButton: () => null,
	CollapseButton: ({ children }: React.PropsWithChildren) => <>{children}</>,
	CustomRowButton: ({ preview, onClick }: { preview?: string; onClick?(): void }) => (
		<button type="button" data-testid={`custom-row-${preview}`} onClick={onClick}>
			{preview === 'headline' ? 'Headline Row' : preview}
		</button>
	),
	PremadeComponentRowButton: () => null,
	SelectGroupSessionsModal: () => null,
	SelectResourcesModal: () => null,
	SelectTagModal: () => null,
}));

const createCustomRow = (pageRowId: string, name: string, columns: CustomRowModel['columns'] = []): CustomRowModel => ({
	pageRowId,
	pageRowAnchorId: `${pageRowId}-anchor`,
	pageSectionId: 'section-id',
	rowTypeId: ROW_TYPE_ID.CUSTOM_ROW,
	name,
	backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
	paddingTopId: ROW_PADDING_ID.MEDIUM,
	paddingBottomId: ROW_PADDING_ID.MEDIUM,
	displayOrder: 0,
	columns,
});

const existingCustomRow = createCustomRow('existing-row', 'Custom Row 2');
const createdCustomRow = createCustomRow('headline-row', 'Custom Row 3');
const createdColumn = {
	pageRowColumnId: 'headline-column',
	pageRowId: createdCustomRow.pageRowId,
	headline: '',
	description: HEADLINE_ROW_DESCRIPTION,
	imageFileUploadId: '',
	imageAltText: '',
	imageUrl: '',
	usePlaceholderImage: false,
	columnDisplayOrder: 0,
	contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.TEXT_THEN_IMAGE,
};
const customRowWithColumn = createCustomRow(createdCustomRow.pageRowId, createdCustomRow.name, [createdColumn]);

const mockPageSection: PageSectionDetailModel = {
	pageSectionId: 'section-id',
	pageId: 'page-id',
	name: 'Content',
	headline: '',
	description: '',
	backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
	displayOrder: 0,
	pageRows: [existingCustomRow],
};

const mockPage = {
	pageId: 'page-id',
	pageStatusId: PAGE_STATUS_ID.DRAFT,
	pageSections: [mockPageSection],
} as PageDetailModel;

beforeEach(() => {
	jest.clearAllMocks();
	mockCreateCustomRow.mockReturnValue({ fetch: jest.fn().mockResolvedValue({ pageRow: createdCustomRow }) });
	mockCreateCustomRowColumn.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ pageRow: customRowWithColumn }),
	});
	mockUpdateCustomRowColumn.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ pageRow: customRowWithColumn }),
	});
});

it('creates the headline preset as a sequentially named custom row with one text-only column', async () => {
	render(<RowSelectionForm />);

	expect(screen.getAllByTestId(/^custom-row-/).map((button) => button.textContent)).toEqual([
		'Headline Row',
		'split-two',
		'two-columns',
		'three-columns',
		'empty',
	]);

	fireEvent.click(screen.getByRole('button', { name: 'Headline Row' }));

	await waitFor(() => expect(mockUpdatePageRow).toHaveBeenCalledWith(customRowWithColumn));

	expect(mockCreateCustomRow).toHaveBeenCalledWith('section-id', {
		name: 'Custom Row 3',
		backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
		paddingBottomId: ROW_PADDING_ID.NONE,
	});
	expect(mockCreateCustomRowColumn).toHaveBeenCalledWith(createdCustomRow.pageRowId, {
		contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.TEXT_THEN_IMAGE,
		usePlaceholderImage: false,
		description: HEADLINE_ROW_DESCRIPTION,
	});
	expect(mockUpdateCustomRowColumn).toHaveBeenCalledWith(createdCustomRow.pageRowId, createdColumn.pageRowColumnId, {
		headline: '',
		description: HEADLINE_ROW_DESCRIPTION,
		imageFileUploadId: '',
		imageAltText: '',
		usePlaceholderImage: false,
		contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.TEXT_THEN_IMAGE,
	});
	expect(mockAddPageRowToCurrentPageSection).toHaveBeenCalledWith(createdCustomRow);
	expect(mockSetCurrentPageRowId).toHaveBeenCalledWith(createdCustomRow.pageRowId);
	expect(mockSetIsSaving).toHaveBeenNthCalledWith(1, true);
	expect(mockSetIsSaving).toHaveBeenLastCalledWith(false);
	expect(mockHandleError).not.toHaveBeenCalled();
});
