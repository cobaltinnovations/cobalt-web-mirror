/** @jest-environment node */
import { createMemoryRouter, LoaderFunctionArgs } from 'react-router-dom';
import { Headers, Request, Response } from 'node-fetch';
import { PAGE_LOCATION_ID } from '@/lib/models/pages-models';
import { pagesService } from '@/lib/services/pages-service';
import { loader } from './page-directory-loader';

jest.mock('@/lib/services/pages-service', () => ({ pagesService: { getPublishedPages: jest.fn() } }));
Object.assign(globalThis, { Headers, Request, Response });

afterEach(() => jest.restoreAllMocks());

const args = (url: string, signal = new AbortController().signal) =>
	({ request: { url, signal }, params: {} } as unknown as LoaderFunctionArgs);

const loadData = async (loaderArgs: LoaderFunctionArgs) => {
	const result = await loader(loaderArgs);
	if (!('data' in result)) throw new Error('Unexpected directory redirect');
	return result.data;
};

it.each([
	['featured-topics', PAGE_LOCATION_ID.FEATURED_TOPIC],
	['communities', PAGE_LOCATION_ID.COMMUNITY],
])('loads %s with the category, search, and pagination from the URL', async (path, category) => {
	const response = {
		pages: [
			{ pageId: '2', name: 'Beta' },
			{ pageId: '1', name: 'Alpha' },
		],
		totalCount: 51,
		totalCountDescription: '51',
	};
	const spy = jest
		.spyOn(pagesService, 'getPublishedPages')
		.mockReturnValue({ fetch: async () => response, abort: jest.fn() } as never);
	const data = await loadData(args(`https://cobalt.example/${path}?pageNumber=2&searchQuery=%20wellness%20`));
	expect(spy).toHaveBeenCalledWith({
		pageLocationId: category,
		pageNumber: '2',
		pageSize: '25',
		searchQuery: 'wellness',
	});
	expect(await data.pagesResponse).toEqual(response);
});

it('aborts an obsolete request when the router cancels the navigation', async () => {
	const controller = new AbortController();
	const response = { pages: [], totalCount: 0, totalCountDescription: '0' };
	let resolve!: (value: typeof response) => void;
	const abort = jest.fn();
	jest.spyOn(pagesService, 'getPublishedPages').mockReturnValue({
		fetch: () =>
			new Promise((r) => {
				resolve = r;
			}),
		abort,
	} as never);
	const data = await loadData(args('https://cobalt.example/featured-topics', controller.signal));
	controller.abort();
	expect(abort).toHaveBeenCalledTimes(1);
	resolve(response);
	await data.pagesResponse;
});

it('removes cancellation listeners after a request settles', async () => {
	const controller = new AbortController();
	const abort = jest.fn();
	jest.spyOn(pagesService, 'getPublishedPages').mockReturnValue({
		fetch: async () => ({ pages: [], totalCount: 0, totalCountDescription: '0' }),
		abort,
	} as never);
	await (
		await loadData(args('https://cobalt.example/communities', controller.signal))
	).pagesResponse;
	controller.abort();
	expect(abort).not.toHaveBeenCalled();
});

const waitForNavigation = async (router: ReturnType<typeof createMemoryRouter>) => {
	if (router.state.initialized && router.state.navigation.state === 'idle') return;
	await new Promise<void>((resolve) => {
		const unsubscribe = router.subscribe((state) => {
			if (state.initialized && state.navigation.state === 'idle') {
				unsubscribe();
				resolve();
			}
		});
	});
};

it.each([
	[10, '0'],
	[26, '1'],
])('recovers an empty later page with %s results through the actual router', async (totalCount, expectedPage) => {
	const spy = jest.spyOn(pagesService, 'getPublishedPages').mockImplementation(
		({ pageNumber }) =>
			({
				fetch: async () => ({
					pages: pageNumber === '5' ? [] : [{ pageId: 'published-page', name: 'Alpha' }],
					totalCount,
					totalCountDescription: String(totalCount),
				}),
				abort: jest.fn(),
			} as never)
	);
	const router = createMemoryRouter([{ path: '/communities', id: 'directory', loader }], {
		initialEntries: ['/communities?pageNumber=5&searchQuery=wellness&track=true'],
	});
	await waitForNavigation(router);
	expect(Object.fromEntries(new URLSearchParams(router.state.location.search))).toEqual({
		pageNumber: expectedPage,
		searchQuery: 'wellness',
		track: 'true',
	});
	expect(spy).toHaveBeenLastCalledWith({
		pageLocationId: 'COMMUNITY',
		pageNumber: expectedPage,
		pageSize: '25',
		searchQuery: 'wellness',
	});
	const data = router.state.loaderData.directory as {
		pagesResponse: Promise<{ pages: { name: string }[]; totalCount: number }>;
	};
	expect(await data.pagesResponse).toMatchObject({ pages: [{ name: 'Alpha' }], totalCount });
	router.dispose();
});

it('preserves genuinely empty results without a redirect loop', async () => {
	jest.spyOn(pagesService, 'getPublishedPages').mockReturnValue({
		fetch: async () => ({ pages: [], totalCount: 0, totalCountDescription: '0' }),
		abort: jest.fn(),
	} as never);
	const data = await loadData(args('https://cobalt.example/communities?pageNumber=5'));
	expect(await data.pagesResponse).toMatchObject({ pages: [], totalCount: 0 });
});

it('keeps later-page failures deferred for the existing directory retry boundary', async () => {
	const error = new Error('Directory request failed');
	jest.spyOn(pagesService, 'getPublishedPages').mockReturnValue({
		fetch: async () => {
			throw error;
		},
		abort: jest.fn(),
	} as never);
	const data = await loadData(args('https://cobalt.example/communities?pageNumber=1'));
	await expect(data.pagesResponse).rejects.toBe(error);
});
