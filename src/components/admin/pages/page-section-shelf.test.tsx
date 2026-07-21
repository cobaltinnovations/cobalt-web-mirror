import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
	BACKGROUND_COLOR_ID,
	CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID,
	CustomRowModel,
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
const mockOneColumnUnmounts: string[] = [];

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
		PageSectionShelfPage: ({
			children,
			showBackButton,
			onBackButtonClick,
		}: React.PropsWithChildren<{ showBackButton?: boolean; onBackButtonClick?(): void }>) => (
			<>
				{showBackButton && <button onClick={onBackButtonClick}>Back</button>}
				{children}
			</>
		),
		RowSettingsCustomRow: ({
			onColumnClick,
		}: {
			onColumnClick?(pageRowColumnId: string, columnLabel: string): void;
		}) => (
			<div data-testid="custom-row-settings">
				<button onClick={() => onColumnClick?.('custom-row-column-0', 'A')}>Edit column A</button>
			</div>
		),
		RowSettingsCustomRowColumn: ({ pageRowColumnId }: { pageRowColumnId: string }) => (
			<div data-testid="custom-column-settings" data-page-row-column-id={pageRowColumnId} />
		),
		RowSettingsOneColumn: ({ pageRow }: { pageRow: OneColumnRowModel }) => {
			const mountedPageRowId = mockReact.useRef(pageRow.pageRowId).current;

			mockReact.useEffect(
				() => () => {
					mockOneColumnUnmounts.push(mountedPageRowId);
				},
				[mountedPageRowId]
			);

			return <div data-testid="one-column-settings" data-page-row-id={pageRow.pageRowId} />;
		},
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

const secondOneColumnRow: OneColumnRowModel = {
	...oneColumnRow,
	pageRowId: 'second-one-column-row',
	pageRowAnchorId: 'second-one-column-anchor',
	name: 'Second one column',
	displayOrder: 1,
	columnOne: createColumn('second-one-column-row', 0),
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

const customRow: CustomRowModel = {
	pageRowId: 'custom-row',
	pageRowAnchorId: 'custom-row-anchor',
	pageSectionId: 'section-id',
	rowTypeId: ROW_TYPE_ID.CUSTOM_ROW,
	name: 'Custom row',
	backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
	paddingTopId: ROW_PADDING_ID.MEDIUM,
	paddingBottomId: ROW_PADDING_ID.MEDIUM,
	displayOrder: 3,
	columns: [
		{
			...createColumn('custom-row', 0),
			pageRowColumnId: 'custom-row-column-0',
		},
	],
};

const secondCustomRow: CustomRowModel = {
	...customRow,
	pageRowId: 'second-custom-row',
	pageRowAnchorId: 'second-custom-row-anchor',
	name: 'Second custom row',
	displayOrder: 4,
	columns: [
		{
			...createColumn('second-custom-row', 0),
			pageRowColumnId: 'second-custom-row-column-0',
		},
	],
};

const pageSection: PageSectionDetailModel = {
	pageSectionId: 'section-id',
	pageId: 'page-id',
	name: 'Content',
	headline: '',
	description: '',
	backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
	displayOrder: 0,
	pageRows: [oneColumnRow, secondOneColumnRow, threeColumnRow, mailingListRow, customRow, secondCustomRow],
};

const createContext = (
	currentPageRow: OneColumnRowModel | ThreeColumnRowModel | MailingListRowModel | CustomRowModel
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

const getTransitionPage = (settingsTestId: string) => {
	// Transition classes belong to the keyed wrapper around each settings component.
	// eslint-disable-next-line testing-library/no-node-access
	return screen.getByTestId(settingsTestId).closest('.transition-page');
};

beforeEach(() => {
	jest.useFakeTimers();
	mockOneColumnUnmounts.length = 0;
	mockPageBuilderContext = createContext(oneColumnRow);
});

afterEach(() => {
	jest.useRealTimers();
});

it('immediately replaces same-type peer editors at a keyed identity boundary', () => {
	const { rerender } = renderShelf();

	expect(screen.getByTestId('one-column-settings')).toHaveAttribute('data-page-row-id', oneColumnRow.pageRowId);

	mockPageBuilderContext = createContext(secondOneColumnRow);
	rerender(
		<PageBuilderContext.Provider value={mockPageBuilderContext}>
			<PageSectionShelf />
		</PageBuilderContext.Provider>
	);

	expect(screen.getAllByTestId('one-column-settings')).toHaveLength(1);
	expect(screen.getByTestId('one-column-settings')).toHaveAttribute('data-page-row-id', secondOneColumnRow.pageRowId);
	expect(mockOneColumnUnmounts).toEqual([oneColumnRow.pageRowId]);
	expect(getTransitionPage('one-column-settings')).not.toHaveClass('shelf-page-animation-enter-active');
});

it('unmounts a context-consuming peer editor before rendering the next row', () => {
	mockPageBuilderContext = createContext(mailingListRow);
	const { rerender } = renderShelf();

	expect(screen.getByTestId('mailing-list-settings')).toHaveAttribute('data-page-row-id', mailingListRow.pageRowId);

	mockPageBuilderContext = createContext(threeColumnRow);
	rerender(
		<PageBuilderContext.Provider value={mockPageBuilderContext}>
			<PageSectionShelf />
		</PageBuilderContext.Provider>
	);

	expect(screen.queryByTestId('mailing-list-settings')).not.toBeInTheDocument();
	expect(screen.getByTestId('three-column-settings')).toHaveAttribute('data-page-row-id', threeColumnRow.pageRowId);
});

it('animates forward and backward only within a custom-row drilldown', () => {
	mockPageBuilderContext = createContext(customRow);
	const { rerender } = renderShelf();

	fireEvent.click(screen.getByRole('button', { name: 'Edit column A' }));

	act(() => {
		jest.advanceTimersByTime(299);
	});

	expect(getTransitionPage('custom-row-settings')).toHaveClass('shelf-page-animation-exit-active');
	expect(getTransitionPage('custom-column-settings')).toHaveClass('shelf-page-animation-enter-active');
	expect(screen.getByTestId('custom-row-settings')).toBeInTheDocument();
	expect(screen.getByTestId('custom-column-settings')).toHaveAttribute(
		'data-page-row-column-id',
		'custom-row-column-0'
	);

	act(() => {
		jest.advanceTimersByTime(1);
	});

	expect(screen.queryByTestId('custom-row-settings')).not.toBeInTheDocument();

	fireEvent.click(screen.getByRole('button', { name: 'Back' }));

	expect(getTransitionPage('custom-column-settings')).toHaveClass('shelf-page-animation-backward-exit-active');
	expect(getTransitionPage('custom-row-settings')).toHaveClass('shelf-page-animation-backward-enter-active');

	act(() => {
		jest.advanceTimersByTime(299);
	});

	expect(screen.getByTestId('custom-column-settings')).toBeInTheDocument();
	expect(screen.getByTestId('custom-row-settings')).toBeInTheDocument();

	act(() => {
		jest.advanceTimersByTime(1);
	});

	expect(screen.queryByTestId('custom-column-settings')).not.toBeInTheDocument();
	expect(screen.getByTestId('custom-row-settings')).toBeInTheDocument();

	mockPageBuilderContext = createContext(oneColumnRow);
	rerender(
		<PageBuilderContext.Provider value={mockPageBuilderContext}>
			<PageSectionShelf />
		</PageBuilderContext.Provider>
	);

	expect(screen.queryByTestId('custom-row-settings')).not.toBeInTheDocument();
	expect(screen.getByTestId('one-column-settings')).toHaveAttribute('data-page-row-id', oneColumnRow.pageRowId);
	expect(getTransitionPage('one-column-settings')).not.toHaveClass('shelf-page-animation-enter-active');
});

it('immediately replaces an interrupted custom-row transition with a peer row', () => {
	mockPageBuilderContext = createContext(customRow);
	const { rerender } = renderShelf();

	fireEvent.click(screen.getByRole('button', { name: 'Edit column A' }));

	expect(screen.getByTestId('custom-row-settings')).toBeInTheDocument();
	expect(screen.getByTestId('custom-column-settings')).toBeInTheDocument();

	mockPageBuilderContext = createContext(threeColumnRow);
	rerender(
		<PageBuilderContext.Provider value={mockPageBuilderContext}>
			<PageSectionShelf />
		</PageBuilderContext.Provider>
	);

	expect(screen.queryByTestId('custom-row-settings')).not.toBeInTheDocument();
	expect(screen.queryByTestId('custom-column-settings')).not.toBeInTheDocument();
	expect(screen.getByTestId('three-column-settings')).toHaveAttribute('data-page-row-id', threeColumnRow.pageRowId);
});

it('does not carry a selected column into another custom row', () => {
	mockPageBuilderContext = createContext(customRow);
	const { rerender } = renderShelf();

	fireEvent.click(screen.getByRole('button', { name: 'Edit column A' }));

	act(() => {
		jest.advanceTimersByTime(300);
	});

	expect(screen.getByTestId('custom-column-settings')).toHaveAttribute(
		'data-page-row-column-id',
		'custom-row-column-0'
	);

	mockPageBuilderContext = createContext(secondCustomRow);
	rerender(
		<PageBuilderContext.Provider value={mockPageBuilderContext}>
			<PageSectionShelf />
		</PageBuilderContext.Provider>
	);

	expect(screen.queryByTestId('custom-column-settings')).not.toBeInTheDocument();
	expect(screen.getByTestId('custom-row-settings')).toBeInTheDocument();
});
