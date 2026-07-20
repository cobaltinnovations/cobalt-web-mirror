import React from 'react';
import { act, render, screen } from '@testing-library/react';
import {
	BACKGROUND_COLOR_ID,
	CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID,
	MailingListRowModel,
	OneColumnRowModel,
	PageSectionDetailModel,
	ROW_PADDING_ID,
	ROW_TYPE_ID,
	ThreeColumnRowModel,
} from '@/lib/models';
import { PageBuilderContext } from '@/contexts/page-builder-context';
import { PageSectionShelf } from './page-section-shelf';

let mockPageBuilderContext: React.ContextType<typeof PageBuilderContext>;

jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => jest.fn(),
}));

jest.mock('@/lib/services', () => ({ pagesService: {} }));

jest.mock('@/jss/theme', () => ({
	createUseThemedStyles: () => () => ({
		transitionContainer: 'transition-container',
		transitionPage: 'transition-page',
	}),
}));

jest.mock('@/components/confirm-dialog', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/admin/pages', () => {
	const mockReact = require('react');

	return {
		HERO_SECTION_ID: 'hero',
		PageSectionShelfPage: ({ children }: React.PropsWithChildren) => <>{children}</>,
		RowSettingsOneColumn: ({ pageRow }: { pageRow: OneColumnRowModel }) => (
			<div data-testid="one-column-settings" data-page-row-id={pageRow.pageRowId} />
		),
		RowSettingsThreeColumns: ({ pageRow }: { pageRow: ThreeColumnRowModel }) => (
			<div data-testid="three-column-settings" data-page-row-id={pageRow.pageRowId} />
		),
		RowSettingsMailingList: () => {
			const { PageBuilderContext: ActualPageBuilderContext } = jest.requireActual(
				'@/contexts/page-builder-context'
			);
			const context = mockReact.useContext(ActualPageBuilderContext);

			return <div data-testid="mailing-list-settings" data-page-row-id={context.currentPageRow?.pageRowId} />;
		},
	};
});

const createColumn = (pageRowId: string, columnDisplayOrder: number) => ({
	pageRowColumnId: `${pageRowId}-column-${columnDisplayOrder}`,
	pageRowId,
	headline: '',
	description: '',
	imageFileUploadId: '',
	imageAltText: '',
	imageUrl: '',
	usePlaceholderImage: false,
	columnDisplayOrder,
	contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT,
});

const oneColumnRow: OneColumnRowModel = {
	pageRowId: 'one-column-row',
	pageRowAnchorId: 'one-column-anchor',
	pageSectionId: 'section-id',
	rowTypeId: ROW_TYPE_ID.ONE_COLUMN_IMAGE,
	name: 'One column',
	backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
	paddingTopId: ROW_PADDING_ID.MEDIUM,
	paddingBottomId: ROW_PADDING_ID.MEDIUM,
	displayOrder: 0,
	columnOne: createColumn('one-column-row', 0),
};

const threeColumnRow: ThreeColumnRowModel = {
	pageRowId: 'three-column-row',
	pageRowAnchorId: 'three-column-anchor',
	pageSectionId: 'section-id',
	rowTypeId: ROW_TYPE_ID.THREE_COLUMN_IMAGE,
	name: 'Three columns',
	backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
	paddingTopId: ROW_PADDING_ID.MEDIUM,
	paddingBottomId: ROW_PADDING_ID.MEDIUM,
	displayOrder: 1,
	columnOne: createColumn('three-column-row', 0),
	columnTwo: createColumn('three-column-row', 1),
	columnThree: createColumn('three-column-row', 2),
};

const mailingListRow: MailingListRowModel = {
	pageRowId: 'mailing-list-row',
	pageRowAnchorId: 'mailing-list-anchor',
	pageSectionId: 'section-id',
	rowTypeId: ROW_TYPE_ID.MAILING_LIST,
	name: 'Mailing list',
	backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
	paddingTopId: ROW_PADDING_ID.MEDIUM,
	paddingBottomId: ROW_PADDING_ID.MEDIUM,
	displayOrder: 2,
	mailingListId: 'mailing-list-id',
	title: 'Updates',
	description: '',
};

const pageSection: PageSectionDetailModel = {
	pageSectionId: 'section-id',
	pageId: 'page-id',
	name: 'Content',
	headline: '',
	description: '',
	backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
	displayOrder: 0,
	pageRows: [oneColumnRow, threeColumnRow, mailingListRow],
};

const createContext = (
	currentPageRow: OneColumnRowModel | ThreeColumnRowModel | MailingListRowModel
): React.ContextType<typeof PageBuilderContext> => ({
	page: undefined,
	setPage: jest.fn(),
	currentPageSection: pageSection,
	currentPageRow,
	setCurrentPageSectionId: jest.fn(),
	addPageSection: jest.fn(),
	updatePageSection: jest.fn(),
	deletePageSection: jest.fn(),
	addPageRowToCurrentPageSection: jest.fn(),
	setCurrentPageRowId: jest.fn(),
	updatePageRow: jest.fn(),
	deletePageRow: jest.fn(),
	isSaving: false,
	setIsSaving: jest.fn(),
	lastSaved: '',
});

const renderShelf = () =>
	render(
		<PageBuilderContext.Provider value={mockPageBuilderContext}>
			<PageSectionShelf />
		</PageBuilderContext.Provider>
	);

beforeEach(() => {
	jest.useFakeTimers();
	mockPageBuilderContext = createContext(oneColumnRow);
});

afterEach(() => {
	jest.useRealTimers();
});

it('keeps an outgoing column editor bound to its original row during a cross-type transition', () => {
	const { rerender } = renderShelf();

	expect(screen.getByTestId('one-column-settings')).toHaveAttribute('data-page-row-id', oneColumnRow.pageRowId);

	mockPageBuilderContext = createContext(threeColumnRow);
	rerender(
		<PageBuilderContext.Provider value={mockPageBuilderContext}>
			<PageSectionShelf />
		</PageBuilderContext.Provider>
	);

	expect(screen.getByTestId('one-column-settings')).toHaveAttribute('data-page-row-id', oneColumnRow.pageRowId);
	expect(screen.getByTestId('three-column-settings')).toHaveAttribute('data-page-row-id', threeColumnRow.pageRowId);

	act(() => {
		jest.advanceTimersByTime(300);
	});

	expect(screen.queryByTestId('one-column-settings')).not.toBeInTheDocument();
	expect(screen.getByTestId('three-column-settings')).toHaveAttribute('data-page-row-id', threeColumnRow.pageRowId);
});

it('snapshots context for outgoing editors that still consume the selected row from context', () => {
	mockPageBuilderContext = createContext(mailingListRow);
	const { rerender } = renderShelf();

	expect(screen.getByTestId('mailing-list-settings')).toHaveAttribute('data-page-row-id', mailingListRow.pageRowId);

	mockPageBuilderContext = createContext(threeColumnRow);
	rerender(
		<PageBuilderContext.Provider value={mockPageBuilderContext}>
			<PageSectionShelf />
		</PageBuilderContext.Provider>
	);

	expect(screen.getByTestId('mailing-list-settings')).toHaveAttribute('data-page-row-id', mailingListRow.pageRowId);
	expect(screen.getByTestId('three-column-settings')).toHaveAttribute('data-page-row-id', threeColumnRow.pageRowId);
});
