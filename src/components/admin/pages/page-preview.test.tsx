import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { PAGE_STATUS_ID, PageDetailModel, ROW_TYPE_ID } from '@/lib/models';
import { analyticsService, resourceLibraryService } from '@/lib/services';
import { getPageRowAnchorDomId } from '@/lib/utils';
import { PagePreview } from './page-preview';

jest.mock('@/components/header-v2', () => ({ HEADER_HEIGHT: 60 }));
jest.mock('@/components/page-header', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('@/components/loader', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('@/hooks/use-handle-error', () => {
	const handleError = jest.fn();
	return {
		__esModule: true,
		default: () => handleError,
	};
});
jest.mock('@/components/admin/pages', () => ({
	MailingListModal: () => null,
	getRendererForPageRow: ({ pageRow }: { pageRow: { pageRowId: string } }) => (
		<div data-testid={`rendered-${pageRow.pageRowId}`} />
	),
}));
jest.mock('@/lib/services', () => ({
	analyticsService: {
		persistEvent: jest.fn(),
	},
	resourceLibraryService: {
		getResourceLibrary: jest.fn(),
		getResourceLibraryFilters: jest.fn(),
	},
}));

const regularAnchorId = '93da2607-c637-4235-b98b-1abcc05d2e80';
const fullWidthAnchorId = '7bb33dab-c63f-44ba-aa2c-c84aed759315';

const page = {
	pageId: 'page-id',
	name: 'Resilience',
	urlName: 'resilience',
	pageStatusId: PAGE_STATUS_ID.LIVE,
	headline: 'Resilience',
	description: 'Description',
	imageFileUploadId: 'image-id',
	imageAltText: '',
	imageUrl: '',
	publishedDate: '',
	publishedDateDescription: '',
	created: '',
	createdDescription: '',
	lastUpdated: '',
	lastUpdatedDescription: '',
	relativeUrl: '/pages/resilience',
	editingLivePage: false,
	livePageSiteLocations: [],
	pageSections: [
		{
			pageSectionId: 'section-id',
			pageId: 'page-id',
			name: 'Content',
			headline: '',
			description: '',
			backgroundColorId: 'WHITE',
			displayOrder: 0,
			pageRows: [
				{
					pageRowId: 'regular-row',
					pageRowAnchorId: regularAnchorId,
					pageSectionId: 'section-id',
					rowTypeId: ROW_TYPE_ID.RESOURCES,
					name: 'Resources',
					backgroundColorId: 'WHITE',
					paddingTopId: 'MEDIUM',
					paddingBottomId: 'MEDIUM',
					displayOrder: 0,
					contents: [],
				},
				{
					pageRowId: 'full-width-row',
					pageRowAnchorId: fullWidthAnchorId,
					pageSectionId: 'section-id',
					rowTypeId: ROW_TYPE_ID.CALL_TO_ACTION_FULL_WIDTH,
					name: 'Call to action',
					backgroundColorId: 'WHITE',
					paddingTopId: 'MEDIUM',
					paddingBottomId: 'MEDIUM',
					displayOrder: 1,
					headline: 'Get started',
					description: '',
					buttonText: 'Start',
					buttonUrl: '/start',
				},
			],
		},
	],
} as PageDetailModel;

const mockGetResourceLibrary = resourceLibraryService.getResourceLibrary as jest.Mock;
const mockGetResourceLibraryFilters = resourceLibraryService.getResourceLibraryFilters as jest.Mock;
const mockPersistEvent = analyticsService.persistEvent as jest.Mock;
const mockScrollIntoView = jest.fn();

const renderPagePreview = (initialEntry: string) => {
	const router = createMemoryRouter(
		[
			{
				path: '/pages/:urlName',
				element: <PagePreview page={page} enableAnalytics />,
			},
		],
		{ initialEntries: [initialEntry] }
	);

	render(<RouterProvider router={router} />);
	return router;
};

beforeAll(() => {
	Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
		configurable: true,
		value: mockScrollIntoView,
	});
});

beforeEach(() => {
	jest.clearAllMocks();
	mockGetResourceLibrary.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ contentsByTagGroupId: {} }),
	});
	mockGetResourceLibraryFilters.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ tagGroups: [] }),
	});
});

it('renders durable anchors on regular and full-width rows and scrolls to an initial hash', async () => {
	renderPagePreview(`/pages/resilience#${getPageRowAnchorDomId(fullWidthAnchorId)}`);

	await screen.findByTestId('rendered-full-width-row');

	const regularAnchor = document.getElementById(getPageRowAnchorDomId(regularAnchorId));
	const fullWidthAnchor = document.getElementById(getPageRowAnchorDomId(fullWidthAnchorId));

	expect(regularAnchor).toHaveStyle('scroll-margin-top: 76px');
	expect(fullWidthAnchor).toHaveStyle('scroll-margin-top: 76px');
	expect(mockScrollIntoView).toHaveBeenCalledWith({ block: 'start' });
});

it('handles hash-only navigation without fetching again or duplicating page-view analytics', async () => {
	const router = renderPagePreview('/pages/resilience');

	await screen.findByTestId('rendered-regular-row');
	expect(mockGetResourceLibrary).toHaveBeenCalledTimes(1);
	expect(mockGetResourceLibraryFilters).toHaveBeenCalledTimes(1);
	expect(mockPersistEvent).toHaveBeenCalledTimes(1);

	mockScrollIntoView.mockClear();
	await act(async () => {
		await router.navigate(`/pages/resilience#${getPageRowAnchorDomId(regularAnchorId)}`);
	});

	await waitFor(() => expect(mockScrollIntoView).toHaveBeenCalledWith({ block: 'start' }));
	expect(mockGetResourceLibrary).toHaveBeenCalledTimes(1);
	expect(mockGetResourceLibraryFilters).toHaveBeenCalledTimes(1);
	expect(mockPersistEvent).toHaveBeenCalledTimes(1);
});

it('does not scroll for a hash that does not identify a row on the page', async () => {
	renderPagePreview('/pages/resilience#page-row-not-on-this-page');

	await screen.findByTestId('rendered-regular-row');
	expect(mockScrollIntoView).not.toHaveBeenCalled();
});
