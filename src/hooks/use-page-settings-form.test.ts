import { useState } from 'react';
import { act, renderHook } from '@testing-library/react';
import { PAGE_LOCATION_ID, PAGE_STATUS_ID, PageDetailModel } from '@/lib/models/pages-models';
import { pagesService } from '@/lib/services/pages-service';
import { usePageSettingsForm } from './use-page-settings-form';

const initialPage = {
	pageId: 'page-a',
	name: 'Page A',
	urlName: 'old-url',
	pageLocationId: PAGE_LOCATION_ID.UNCATEGORIZED,
	pageStatusId: PAGE_STATUS_ID.DRAFT,
} as PageDetailModel;

type SettingsData = Parameters<typeof pagesService.updatePageSettings>[1];
let requests: { pageId: string; data: SettingsData; resolve(): void; reject(error: Error): void }[];
let onError: jest.Mock;
let onSavingChange: jest.Mock;

beforeEach(() => {
	jest.useFakeTimers();
	requests = [];
	onError = jest.fn();
	onSavingChange = jest.fn();
	jest.spyOn(pagesService, 'updatePageSettings').mockImplementation(
		(pageId, data) =>
			({
				fetch: () =>
					new Promise((resolve, reject) => {
						requests.push({
							pageId,
							data,
							resolve: () => resolve({ page: { ...initialPage, pageId, ...data } }),
							reject,
						});
					}),
			} as never)
	);
});

afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});

const setup = () =>
	renderHook(() => {
		const [page, setPage] = useState(initialPage);
		const form = usePageSettingsForm({ page, onSaved: setPage, onSavingChange, onError });
		return { ...form, page, setPage };
	});

const tickAutosave = async () => {
	await act(async () => {
		jest.advanceTimersByTime(500);
	});
};

it('flushes pending location edits and serializes the URL save behind them', async () => {
	const { result } = setup();
	act(() => result.current.changeValues({ pageLocationId: PAGE_LOCATION_ID.COMMUNITY }));
	let save!: Promise<void>;
	await act(async () => {
		save = result.current.saveUrl('page-a', 'new-url');
	});
	expect(requests).toHaveLength(1);
	expect(requests[0].data).toMatchObject({ urlName: 'old-url', pageLocationId: PAGE_LOCATION_ID.COMMUNITY });
	await act(async () => requests[0].resolve());
	expect(requests).toHaveLength(2);
	expect(requests[1].data).toMatchObject({ urlName: 'new-url', pageLocationId: PAGE_LOCATION_ID.COMMUNITY });
	await act(async () => {
		requests[1].resolve();
		await save;
	});
	expect(result.current.page.urlName).toBe('new-url');
	expect(result.current.formValues.pageLocationId).toBe(PAGE_LOCATION_ID.COMMUNITY);
	expect(onSavingChange).toHaveBeenLastCalledWith(false);
});

it('preserves newer draft values when an earlier autosave updates page context', async () => {
	const { result } = setup();
	act(() => result.current.changeValues({ pageLocationId: PAGE_LOCATION_ID.COMMUNITY }));
	await tickAutosave();
	act(() =>
		result.current.changeValues({ pageName: 'Latest name', pageLocationId: PAGE_LOCATION_ID.FEATURED_TOPIC })
	);
	await tickAutosave();
	expect(requests).toHaveLength(1);
	await act(async () => requests[0].resolve());
	expect(result.current.formValues).toMatchObject({
		pageName: 'Latest name',
		pageLocationId: PAGE_LOCATION_ID.FEATURED_TOPIC,
	});
	expect(requests).toHaveLength(2);
	await act(async () => requests[1].resolve());
	expect(result.current.page).toMatchObject({ name: 'Latest name', pageLocationId: PAGE_LOCATION_ID.FEATURED_TOPIC });
});

it('retains failed autosave drafts and includes them in the next URL save', async () => {
	const { result } = setup();
	act(() => result.current.changeValues({ pageLocationId: PAGE_LOCATION_ID.COMMUNITY }));
	await tickAutosave();
	const error = new Error('Autosave failed');
	await act(async () => requests[0].reject(error));
	expect(onError).toHaveBeenCalledWith(error);
	let save!: Promise<void>;
	await act(async () => {
		save = result.current.saveUrl('page-a', 'new-url');
	});
	expect(requests[1].data).toMatchObject({ urlName: 'new-url', pageLocationId: PAGE_LOCATION_ID.COMMUNITY });
	await act(async () => {
		requests[1].resolve();
		await save;
	});
	expect(result.current.page).toMatchObject({ urlName: 'new-url', pageLocationId: PAGE_LOCATION_ID.COMMUNITY });
});

it('does not replay a rejected URL when a newer location edit waits behind its save', async () => {
	const { result } = setup();
	let save!: Promise<void>;
	await act(async () => {
		save = result.current.saveUrl('page-a', 'rejected-url');
	});
	const failure = save.catch((error) => error);
	act(() => result.current.changeValues({ pageLocationId: PAGE_LOCATION_ID.COMMUNITY }));
	await tickAutosave();
	expect(requests).toHaveLength(1);
	await act(async () => {
		requests[0].reject(new Error('URL unavailable'));
		await failure;
	});
	expect(requests[1].data).toMatchObject({ urlName: 'old-url', pageLocationId: PAGE_LOCATION_ID.COMMUNITY });
	expect(result.current.formValues.friendlyUrl).toBe('old-url');
	await act(async () => requests[1].resolve());
	act(() => result.current.changeValues({ pageLocationId: PAGE_LOCATION_ID.FEATURED_TOPIC }));
	await tickAutosave();
	expect(requests[2].data.urlName).toBe('old-url');
	await act(async () => requests[2].resolve());
});

it('uses a successful URL save for later queued location edits and overlapping URL submissions', async () => {
	const { result } = setup();
	let first!: Promise<void>;
	await act(async () => {
		first = result.current.saveUrl('page-a', 'first-url');
	});
	act(() => result.current.changeValues({ pageLocationId: PAGE_LOCATION_ID.COMMUNITY }));
	await tickAutosave();
	let second!: Promise<void>;
	await act(async () => {
		second = result.current.saveUrl('page-a', 'second-url');
	});
	expect(requests).toHaveLength(1);
	await act(async () => {
		requests[0].resolve();
		await first;
	});
	expect(requests[1].data).toMatchObject({ urlName: 'first-url', pageLocationId: PAGE_LOCATION_ID.COMMUNITY });
	await act(async () => requests[1].resolve());
	expect(requests[2].data).toMatchObject({ urlName: 'second-url', pageLocationId: PAGE_LOCATION_ID.COMMUNITY });
	await act(async () => {
		requests[2].resolve();
		await second;
	});
	expect(result.current.page).toMatchObject({ urlName: 'second-url', pageLocationId: PAGE_LOCATION_ID.COMMUNITY });
});

it('flushes a page boundary without letting an old response replace the new page', async () => {
	const { result } = setup();
	act(() => result.current.changeValues({ pageLocationId: PAGE_LOCATION_ID.COMMUNITY }));
	const nextPage = { ...initialPage, pageId: 'page-b', name: 'Page B', urlName: 'page-b' };
	await act(async () => result.current.setPage(nextPage));
	expect(requests[0].pageId).toBe('page-a');
	await act(async () => requests[0].resolve());
	expect(result.current.page).toEqual(nextPage);
	expect(result.current.formValues).toMatchObject({ pageName: 'Page B', friendlyUrl: 'page-b' });
	await expect(result.current.saveUrl('page-a', 'stale-url')).rejects.toThrow('page being edited has changed');
});

it('flushes the existing autosave debounce when the settings editor unmounts', async () => {
	const { result, unmount } = setup();
	act(() => result.current.changeValues({ pageLocationId: PAGE_LOCATION_ID.COMMUNITY }));
	unmount();
	await act(async () => {
		await Promise.resolve();
	});
	expect(requests[0].data.pageLocationId).toBe(PAGE_LOCATION_ID.COMMUNITY);
	await act(async () => requests[0].resolve());
});

it('retains the originating page URL when queued edits finish after switching pages', async () => {
	const { result } = setup();
	let save!: Promise<void>;
	await act(async () => {
		save = result.current.saveUrl('page-a', 'new-url');
	});
	act(() => result.current.changeValues({ pageLocationId: PAGE_LOCATION_ID.COMMUNITY }));
	await act(async () => result.current.setPage({ ...initialPage, pageId: 'page-b', urlName: 'page-b' }));
	expect(requests).toHaveLength(1);
	await act(async () => {
		requests[0].resolve();
		await save;
	});
	expect(requests[1]).toMatchObject({
		pageId: 'page-a',
		data: { urlName: 'new-url', pageLocationId: PAGE_LOCATION_ID.COMMUNITY },
	});
	await act(async () => requests[1].resolve());
	expect(result.current.page.pageId).toBe('page-b');
	expect(result.current.page.urlName).toBe('page-b');
});
