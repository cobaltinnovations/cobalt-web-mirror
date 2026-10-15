import React from 'react';
import { act, render } from '@testing-library/react';
import { createMemoryRouter, LoaderFunctionArgs, RouterProvider, useLocation } from 'react-router-dom';
import { Headers, Request, Response } from 'node-fetch';
import { usePageDirectorySearch } from './use-page-directory-search';

// The jsdom environment does not provide Fetch request classes used by the data router.
Object.assign(globalThis, { Headers, Request, Response });

let search: ReturnType<typeof usePageDirectorySearch>;
const SearchState = () => {
	const { pathname } = useLocation();
	search = usePageDirectorySearch(pathname);
	return null;
};

const setup = async (
	loader: (args: LoaderFunctionArgs) => unknown = () => null,
	initialEntries = ['/featured-topics']
) => {
	const router = createMemoryRouter(
		[
			{ path: '/featured-topics', loader, element: <SearchState /> },
			{ path: '/communities', loader, element: <SearchState /> },
		],
		{ initialEntries }
	);
	await act(async () => {
		render(<RouterProvider router={router} />);
	});
	return router;
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const tickSearch = async () => {
	await act(async () => {
		jest.advanceTimersByTime(300);
	});
};

it('preserves newer typing and its debounce when an earlier own search commits', async () => {
	let resolveEarlier!: (value: null) => void;
	const earlierResponse = new Promise<null>((resolve) => {
		resolveEarlier = resolve;
	});
	const loader = jest.fn(({ request }: LoaderFunctionArgs) => {
		return new URL(request.url).searchParams.get('searchQuery') === 'a' ? earlierResponse : null;
	});
	const router = await setup(loader, ['/featured-topics?pageNumber=3']);
	act(() => search.changeSearch('a'));
	await tickSearch();
	expect(router.state.navigation.state).toBe('loading');
	act(() => search.changeSearch('ab'));
	await act(async () => resolveEarlier(null));
	expect(new URLSearchParams(router.state.location.search).get('searchQuery')).toBe('a');
	expect(search.searchInput).toBe('ab');
	await tickSearch();
	expect(Object.fromEntries(new URLSearchParams(router.state.location.search))).toEqual({
		pageNumber: '0',
		searchQuery: 'ab',
	});
	expect(search.searchInput).toBe('ab');
	router.dispose();
});

it('takes URL ownership and cancels pending typing on browser back and forward', async () => {
	const router = await setup(
		() => null,
		['/featured-topics?searchQuery=first', '/featured-topics?searchQuery=second']
	);
	act(() => search.changeSearch('pending'));
	await act(async () => {
		await router.navigate(-1);
	});
	expect(search.searchInput).toBe('first');
	await tickSearch();
	expect(new URLSearchParams(router.state.location.search).get('searchQuery')).toBe('first');
	await act(async () => {
		await router.navigate(1);
	});
	expect(search.searchInput).toBe('second');
	router.dispose();
});

it('cancels pending typing at a directory change without changing the new directory URL', async () => {
	const router = await setup();
	act(() => search.changeSearch('pending-topic'));
	await act(async () => {
		await router.navigate('/communities?searchQuery=parents&pageNumber=2');
	});
	expect(search.searchInput).toBe('parents');
	await tickSearch();
	expect(router.state.location.pathname).toBe('/communities');
	expect(Object.fromEntries(new URLSearchParams(router.state.location.search))).toEqual({
		searchQuery: 'parents',
		pageNumber: '2',
	});
	router.dispose();
});

it('cancels a pending query immediately when clearing search and resets pagination', async () => {
	const router = await setup(() => null, ['/featured-topics?searchQuery=old&pageNumber=3']);
	act(() => search.changeSearch('pending'));
	await act(async () => search.clearSearch());
	await tickSearch();
	expect(search.searchInput).toBe('');
	expect(Object.fromEntries(new URLSearchParams(router.state.location.search))).toEqual({ pageNumber: '0' });
	router.dispose();
});

it('cancels an outgoing directory debounce before a slower directory navigation completes', async () => {
	let resolveNext!: (value: null) => void;
	const nextResponse = new Promise<null>((resolve) => {
		resolveNext = resolve;
	});
	const router = await setup(({ request }) =>
		new URL(request.url).pathname === '/communities' ? nextResponse : null
	);
	act(() => search.changeSearch('pending-topic'));
	let navigation!: Promise<void>;
	await act(async () => {
		navigation = router.navigate('/communities?searchQuery=parents');
	});
	await tickSearch();
	expect(router.state.navigation.location?.pathname).toBe('/communities');
	await act(async () => {
		resolveNext(null);
		await navigation;
	});
	expect(search.searchInput).toBe('parents');
	router.dispose();
});
