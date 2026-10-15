import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import useAccount from '@/hooks/use-account';
import { CobaltThemeProvider } from '@/jss/theme';
import {
	BACKGROUND_COLOR_ID,
	GROUP_SESSION_STATUS_ID,
	GroupSessionModel,
	GroupSessionsRowModel,
	ROW_PADDING_ID,
	ROW_TYPE_ID,
} from '@/lib/models';
import { getRendererForPageRow, PagePreviewViewport } from './row-renderer';

jest.mock(
	'@awesome.me/kit-c75e843088/icons',
	() => jest.requireActual('@awesome.me/kit-c75e843088/icons/modules/index.js'),
	{ virtual: true }
);
jest.mock('@/hooks/use-account');
jest.mock('@/hooks/use-handle-error', () => ({ __esModule: true, default: () => jest.fn() }));
jest.mock('@/hooks/use-random-placeholder-image', () => ({ __esModule: true, default: () => '/placeholder.png' }));
jest.mock('@/pages/resource-library', () => ({ resourceLibraryCarouselConfig: {} }));
jest.mock('@/components/wysiwyg-basic', () => ({ WysiwygDisplay: () => null }));
jest.mock('@/lib/services', () => ({
	analyticsService: { persistEvent: jest.fn() },
	groupSessionsService: { isGroupSession: () => true },
}));

const groupSession = (index: number) =>
	({
		groupSessionId: `session-${index}`,
		urlName: `session-${index}`,
		title: `Group Session ${index}`,
		groupSessionStatusId: GROUP_SESSION_STATUS_ID.ADDED,
		appointmentTimeDescription: 'Tomorrow at noon',
		facilitatorName: 'Facilitator',
		description: 'Session description',
		imageUrl: '/session.png',
	} as GroupSessionModel);

const renderGroupSessions = (
	sessions: GroupSessionModel[],
	previewViewport: PagePreviewViewport = 'desktop',
	{ pageTitle = 'Financial Well-being and Mental Health' }: { pageTitle?: string } = {}
) => {
	const pageRow: GroupSessionsRowModel = {
		pageRowId: 'row-id',
		pageRowAnchorId: 'anchor-id',
		pageSectionId: 'section-id',
		rowTypeId: ROW_TYPE_ID.GROUP_SESSIONS,
		name: 'Group Sessions',
		backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
		paddingTopId: ROW_PADDING_ID.MEDIUM,
		paddingBottomId: ROW_PADDING_ID.MEDIUM,
		displayOrder: 0,
		groupSessions: sessions,
	};
	const router = createMemoryRouter(
		[
			{
				path: '*',
				element: (
					<CobaltThemeProvider>
						{getRendererForPageRow({
							pageId: 'page-id',
							pageTitle,
							pageRow,
							contentsByTagGroupId: {},
							tagsByTagId: {},
							enableAnalytics: false,
							livePageSiteLocations: [],
							previewViewport,
						})}
					</CobaltThemeProvider>
				),
			},
		],
		{ initialEntries: ['/pages/topic'] }
	);
	render(<RouterProvider router={router} />);
	return router;
};

beforeEach(() => {
	jest.clearAllMocks();
	(useAccount as jest.Mock).mockReturnValue({
		institution: { groupSessionRequestsEnabled: true, platformName: 'Cobalt' },
	});
});

it.each<[PagePreviewViewport, boolean | undefined, string | undefined, string]>([
	['desktop', true, 'Cobalt', 'Financial Well-being and Mental Health'],
	['mobile', true, 'DH <Wellness>', 'Stress <Support> & Resilience'],
	['desktop', false, 'DH Wellness', 'Financial Well-being and Mental Health'],
	['desktop', undefined, undefined, 'Financial Well-being and Mental Health'],
])(
	'shows personalized empty-state copy and all-sessions action in %s when session requests are %s',
	async (viewport, enabled, platformName, pageTitle) => {
		(useAccount as jest.Mock).mockReturnValue({
			institution: { groupSessionRequestsEnabled: enabled, platformName },
		});
		const router = renderGroupSessions([], viewport, { pageTitle });

		expect(screen.getByRole('heading', { name: 'No Upcoming Group Sessions' })).toBeInTheDocument();
		expect(
			screen.getByText(
				`There are no upcoming Group Sessions for ${pageTitle}. In the meantime, you may browse other Group Sessions on ${
					platformName ?? 'Cobalt'
				}.`
			)
		).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Request a Session' })).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole('button', { name: 'View All Group Sessions' }));
		await waitFor(() => expect(router.state.location.pathname).toBe('/group-sessions'));
		router.dispose();
	}
);

it.each<[number, PagePreviewViewport]>([
	[1, 'desktop'],
	[3, 'desktop'],
	[1, 'mobile'],
])('retains populated rows with %i session(s) in %s', (count, viewport) => {
	const router = renderGroupSessions(
		Array.from({ length: count }, (_, index) => groupSession(index)),
		viewport
	);

	for (let index = 0; index < count; index++) {
		expect(screen.getByText(`Group Session ${index}`)).toBeInTheDocument();
	}
	expect(screen.queryByRole('heading', { name: 'No Upcoming Group Sessions' })).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'View All Group Sessions' })).not.toBeInTheDocument();
	router.dispose();
});
