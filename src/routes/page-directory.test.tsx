import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, LoaderFunctionArgs, RouterProvider } from 'react-router-dom';
import { Headers, Request, Response } from 'node-fetch';
import { AnalyticsNativeEventTypeId, PAGE_LOCATION_ID, PAGE_STATUS_ID, SITE_LOCATION_ID } from '@/lib/models';
import { analyticsService } from '@/lib/services/analytics-service';
import { GetPublishedPagesResponse } from '@/lib/services/pages-service';
import { getPageDirectoryConfiguration } from '@/lib/utils/page-directory-utils';
import { CobaltThemeProvider } from '@/jss/theme';
import useAccount from '@/hooks/use-account';
import { Component } from './page-directory';

Object.assign(globalThis, { Headers, Request, Response });

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('@/hooks/use-handle-error', () => ({ __esModule: true, default: () => jest.fn() }));
jest.mock('@/components/svg-icon', () => ({ __esModule: true, default: () => null }));
jest.mock('react-helmet', () => ({ Helmet: () => null }));
jest.mock('@/lib/services/analytics-service', () => ({ analyticsService: { persistEvent: jest.fn() } }));

const persistEvent = analyticsService.persistEvent as jest.Mock;
const response: GetPublishedPagesResponse = {
	pages: [
		{
			pageId: 'page-id',
			name: 'Wellness resources',
			urlName: 'wellness',
			pageStatusId: PAGE_STATUS_ID.LIVE,
			pageStatusDescription: 'Live',
			hasBeenPublished: true,
			pageLocationId: PAGE_LOCATION_ID.FEATURED_TOPIC,
			pageLocationDescription: 'Featured Topic',
			headline: 'Wellness',
			relativeUrl: '/pages/wellness',
		},
	],
	totalCount: 51,
	totalCountDescription: '51',
};

const setup = async (
	initialEntries = ['/featured-topics'],
	getResponse: (url: URL) => Promise<GetPublishedPagesResponse> = () => Promise.resolve(response),
	strict = false
) => {
	const loader = jest.fn(({ request }: LoaderFunctionArgs) => {
		const url = new URL(request.url);
		return { configuration: getPageDirectoryConfiguration(url.pathname), pagesResponse: getResponse(url) };
	});
	const router = createMemoryRouter(
		[
			{ path: '/featured-topics', loader, Component },
			{ path: '/communities', loader, Component },
			{ path: '/pages/:urlName', element: <div>Page detail</div> },
		],
		{ initialEntries }
	);
	const content = (
		<CobaltThemeProvider>
			<RouterProvider router={router} />
		</CobaltThemeProvider>
	);
	const view = render(strict ? <StrictMode>{content}</StrictMode> : content);
	await act(async () => {
		await Promise.resolve();
	});
	return { router, loader, ...view };
};

beforeEach(() => {
	jest.clearAllMocks();
	(useAccount as jest.Mock).mockReturnValue({
		institution: { platformName: 'Cobalt', pageDirectoriesEnabled: true },
	});
});

it.each([
	['/featured-topics', false],
	['/communities', false],
	['/featured-topics', undefined],
	['/communities', undefined],
])(
	'shows not found for %s without directory analytics when the loaded flag is %s',
	async (path, pageDirectoriesEnabled) => {
		(useAccount as jest.Mock).mockReturnValue({
			institution: { platformName: 'Cobalt', pageDirectoriesEnabled },
		});
		const { router } = await setup([path]);
		expect(screen.getByText('Sorry, the resource you requested was not found.')).toBeInTheDocument();
		expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'Wellness resources' })).not.toBeInTheDocument();
		expect(persistEvent).not.toHaveBeenCalled();
		router.dispose();
	}
);

it.each([
	['/featured-topics', PAGE_LOCATION_ID.FEATURED_TOPIC, AnalyticsNativeEventTypeId.PAGE_VIEW_FEATURED_TOPICS],
	['/communities', PAGE_LOCATION_ID.COMMUNITY, AnalyticsNativeEventTypeId.PAGE_VIEW_COMMUNITIES],
])('records one successful view of %s with normalized directory context', async (path, pageLocationId, eventType) => {
	const { router } = await setup([`${path}?searchQuery=%20wellness%20&pageNumber=2`]);
	expect(persistEvent).toHaveBeenCalledTimes(1);
	expect(persistEvent).toHaveBeenCalledWith(eventType, {
		pageLocationId,
		searchQuery: 'wellness',
		pageNumber: 2,
		pageSize: 25,
		totalCount: 51,
	});
	router.dispose();
});

it('records pagination, search, directory changes, and history revisits once each', async () => {
	const { router } = await setup();
	expect(persistEvent).toHaveBeenCalledTimes(1);
	fireEvent.click(screen.getByRole('button', { name: '2' }));
	await waitFor(() => expect(persistEvent).toHaveBeenCalledTimes(2));
	expect(persistEvent).toHaveBeenLastCalledWith(
		AnalyticsNativeEventTypeId.PAGE_VIEW_FEATURED_TOPICS,
		expect.objectContaining({ pageNumber: 1 })
	);
	await act(async () => router.navigate('/featured-topics?searchQuery=parents&pageNumber=0'));
	expect(persistEvent).toHaveBeenCalledTimes(3);
	expect(persistEvent).toHaveBeenLastCalledWith(
		AnalyticsNativeEventTypeId.PAGE_VIEW_FEATURED_TOPICS,
		expect.objectContaining({ searchQuery: 'parents', pageNumber: 0 })
	);
	await act(async () => router.navigate('/communities'));
	expect(persistEvent).toHaveBeenCalledTimes(4);
	expect(persistEvent).toHaveBeenLastCalledWith(AnalyticsNativeEventTypeId.PAGE_VIEW_COMMUNITIES, {
		pageLocationId: PAGE_LOCATION_ID.COMMUNITY,
		pageNumber: 0,
		pageSize: 25,
		totalCount: 51,
	});
	await act(async () => router.navigate(-1));
	expect(persistEvent).toHaveBeenCalledTimes(5);
	expect(persistEvent).toHaveBeenLastCalledWith(
		AnalyticsNativeEventTypeId.PAGE_VIEW_FEATURED_TOPICS,
		expect.objectContaining({ searchQuery: 'parents' })
	);
	await act(async () => router.navigate(1));
	expect(persistEvent).toHaveBeenCalledTimes(6);
	expect(persistEvent).toHaveBeenLastCalledWith(
		AnalyticsNativeEventTypeId.PAGE_VIEW_COMMUNITIES,
		expect.objectContaining({ pageLocationId: PAGE_LOCATION_ID.COMMUNITY })
	);
	router.dispose();
});

it('does not duplicate views during StrictMode replay, input rerenders, and loader revalidation', async () => {
	const { router, loader } = await setup(['/featured-topics'], undefined, true);
	expect(persistEvent).toHaveBeenCalledTimes(1);
	fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'typing' } });
	expect(persistEvent).toHaveBeenCalledTimes(1);
	await act(async () => router.revalidate());
	await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
	expect(persistEvent).toHaveBeenCalledTimes(1);
	router.dispose();
});

it('records a search only when the debounced query commits', async () => {
	jest.useFakeTimers();
	try {
		const { router } = await setup();
		fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'well' } });
		fireEvent.change(screen.getByRole('searchbox'), { target: { value: '  wellness  ' } });
		await act(async () => jest.advanceTimersByTime(299));
		expect(persistEvent).toHaveBeenCalledTimes(1);
		await act(async () => jest.advanceTimersByTime(1));
		expect(persistEvent).toHaveBeenCalledTimes(2);
		expect(persistEvent).toHaveBeenLastCalledWith(AnalyticsNativeEventTypeId.PAGE_VIEW_FEATURED_TOPICS, {
			pageLocationId: PAGE_LOCATION_ID.FEATURED_TOPIC,
			searchQuery: 'wellness',
			pageNumber: 0,
			pageSize: 25,
			totalCount: 51,
		});
		router.dispose();
	} finally {
		jest.useRealTimers();
	}
});

it('ignores obsolete results after navigation and waits for successful results', async () => {
	let resolveOld!: (value: GetPublishedPagesResponse) => void;
	let resolveNew!: (value: GetPublishedPagesResponse) => void;
	const oldResponse = new Promise<GetPublishedPagesResponse>((resolve) => (resolveOld = resolve));
	const newResponse = new Promise<GetPublishedPagesResponse>((resolve) => (resolveNew = resolve));
	const { router } = await setup(['/featured-topics'], ({ pathname }) =>
		pathname === '/featured-topics' ? oldResponse : newResponse
	);
	expect(persistEvent).not.toHaveBeenCalled();
	await act(async () => router.navigate('/communities'));
	await act(async () => resolveOld(response));
	expect(persistEvent).not.toHaveBeenCalled();
	await act(async () => resolveNew(response));
	expect(persistEvent).toHaveBeenCalledTimes(1);
	expect(persistEvent).toHaveBeenLastCalledWith(
		AnalyticsNativeEventTypeId.PAGE_VIEW_COMMUNITIES,
		expect.objectContaining({ totalCount: 51 })
	);
	router.dispose();
});

it.each(['pending', 'failed'])('counts a history revisit after intervening %s search results', async (state) => {
	let resolveSearch!: (value: GetPublishedPagesResponse) => void;
	let rejectSearch!: (error: Error) => void;
	const searchResponse = new Promise<GetPublishedPagesResponse>((resolve, reject) => {
		resolveSearch = resolve;
		rejectSearch = reject;
	});
	const { router } = await setup(['/featured-topics'], (url) =>
		url.searchParams.has('searchQuery') ? searchResponse : Promise.resolve(response)
	);
	expect(persistEvent).toHaveBeenCalledTimes(1);
	await act(async () => router.navigate('/featured-topics?searchQuery=new'));
	if (state === 'failed') await act(async () => rejectSearch(new Error('Unavailable')));
	expect(persistEvent).toHaveBeenCalledTimes(1);
	await act(async () => router.navigate(-1));
	expect(persistEvent).toHaveBeenCalledTimes(2);
	expect(persistEvent).toHaveBeenLastCalledWith(AnalyticsNativeEventTypeId.PAGE_VIEW_FEATURED_TOPICS, {
		pageLocationId: PAGE_LOCATION_ID.FEATURED_TOPIC,
		pageNumber: 0,
		pageSize: 25,
		totalCount: 51,
	});
	if (state === 'pending') await act(async () => resolveSearch(response));
	expect(persistEvent).toHaveBeenCalledTimes(2);
	router.dispose();
});

it('does not expose old cards with the new query context while replacement results are pending', async () => {
	let resolveSearch!: (value: GetPublishedPagesResponse) => void;
	const searchResponse = new Promise<GetPublishedPagesResponse>((resolve) => (resolveSearch = resolve));
	const { router } = await setup(['/featured-topics'], (url) =>
		url.searchParams.has('searchQuery') ? searchResponse : Promise.resolve(response)
	);
	expect(screen.getByRole('link', { name: 'Wellness resources' })).toBeInTheDocument();
	await act(async () => router.navigate('/featured-topics?searchQuery=new'));
	expect(screen.queryByRole('link', { name: 'Wellness resources' })).not.toBeInTheDocument();
	await act(async () => resolveSearch(response));
	fireEvent.click(screen.getByRole('link', { name: 'Wellness resources' }));
	await screen.findByText('Page detail');
	expect(persistEvent).toHaveBeenLastCalledWith(
		AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE,
		expect.objectContaining({ searchQuery: 'new' })
	);
	router.dispose();
});

it('records successful retry results without recording failed results', async () => {
	let reject!: (error: Error) => void;
	let requests = 0;
	const failure = new Promise<GetPublishedPagesResponse>((_resolve, rejectRequest) => (reject = rejectRequest));
	const { router } = await setup(['/communities'], () => (++requests === 1 ? failure : Promise.resolve(response)));
	await act(async () => reject(new Error('Unavailable')));
	expect(persistEvent).not.toHaveBeenCalled();
	expect(screen.getByText('Unable to load pages')).toBeInTheDocument();
	fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
	await waitFor(() => expect(persistEvent).toHaveBeenCalledTimes(1));
	expect(persistEvent).toHaveBeenLastCalledWith(
		AnalyticsNativeEventTypeId.PAGE_VIEW_COMMUNITIES,
		expect.objectContaining({ totalCount: 51 })
	);
	router.dispose();
});

it.each([
	['/featured-topics', PAGE_LOCATION_ID.FEATURED_TOPIC, SITE_LOCATION_ID.FEATURED_TOPIC],
	['/communities', PAGE_LOCATION_ID.COMMUNITY, SITE_LOCATION_ID.COMMUNITY],
])('records the selected page and directory context from %s cards', async (path, pageLocationId, siteLocationId) => {
	const { router } = await setup([`${path}?searchQuery=%20wellness%20&pageNumber=1`]);
	persistEvent.mockClear();
	fireEvent.click(screen.getByRole('link', { name: 'Wellness resources' }));
	await screen.findByText('Page detail');
	expect(persistEvent).toHaveBeenCalledTimes(1);
	expect(persistEvent).toHaveBeenCalledWith(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE, {
		source: 'DIRECTORY',
		pageId: 'page-id',
		pageLocationId,
		siteLocationId,
		searchQuery: 'wellness',
		pageNumber: 1,
		pageSize: 25,
	});
	expect(router.state.location.pathname).toBe('/pages/wellness');
	router.dispose();
});
