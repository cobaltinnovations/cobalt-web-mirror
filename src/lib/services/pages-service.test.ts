import { PAGE_LOCATION_ID, PAGE_STATUS_ID } from '@/lib/models/pages-models';
import { httpSingleton } from '@/lib/singletons/http-singleton';
import { pagesService } from './pages-service';
import Cookies from 'js-cookie';

afterEach(() => {
	jest.restoreAllMocks();
	Cookies.remove('accessToken');
});

it('requests ordered location metadata without treating categories as site placements', async () => {
	const response = {
		pageLocations: [
			{
				pageLocationId: PAGE_LOCATION_ID.FEATURED_TOPIC,
				description: 'Featured Topics',
				directoryRelativeUrl: '/featured-topics',
			},
			{
				pageLocationId: PAGE_LOCATION_ID.COMMUNITY,
				description: 'Penn Communities',
				directoryRelativeUrl: '/communities',
			},
			{ pageLocationId: PAGE_LOCATION_ID.UNCATEGORIZED, description: 'Uncategorized' },
		],
	};
	const spy = jest
		.spyOn(httpSingleton, 'orchestrateRequest')
		.mockReturnValue({ fetch: async () => response } as never);
	expect(await pagesService.getPageLocations().fetch()).toEqual(response);
	expect(spy).toHaveBeenCalledWith({ method: 'GET', url: '/page-locations' });
});

it('requests a published directory with encoded search and zero-based pagination', () => {
	const spy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	pagesService.getPublishedPages({
		pageLocationId: PAGE_LOCATION_ID.COMMUNITY,
		searchQuery: 'Health & Wellness',
		pageNumber: '2',
		pageSize: '25',
	});
	const config = spy.mock.calls[0][0];
	const url = new URL(config.url!, 'https://cobalt.example');
	expect(config.method).toBe('GET');
	expect(url.pathname).toBe('/pages/published');
	expect(Object.fromEntries(url.searchParams)).toEqual({
		pageLocationId: 'COMMUNITY',
		searchQuery: 'Health & Wellness',
		pageNumber: '2',
		pageSize: '25',
	});
});

it('passes an explicitly chosen category when creating an unpublished page', () => {
	const spy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = {
		name: 'Anxiety',
		urlName: 'anxiety',
		pageStatusId: PAGE_STATUS_ID.DRAFT,
		pageLocationId: PAGE_LOCATION_ID.FEATURED_TOPIC,
	};
	pagesService.createPage(data);
	expect(spy).toHaveBeenCalledWith({ method: 'POST', url: '/pages', data });
});

it('allows creation to retain the API default category', () => {
	const spy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = { name: 'Anxiety', urlName: 'anxiety', pageStatusId: PAGE_STATUS_ID.DRAFT };
	pagesService.createPage(data);
	expect(spy.mock.calls[0][0].data).toEqual(data);
	expect(spy.mock.calls[0][0].data).not.toHaveProperty('pageLocationId');
});

it('round trips the selected category and API descriptions through settings', async () => {
	const page = {
		pageLocationId: PAGE_LOCATION_ID.COMMUNITY,
		pageLocationDescription: 'Penn Communities',
		pageStatusId: PAGE_STATUS_ID.DRAFT,
		pageStatusDescription: 'Unpublished',
	};
	const spy = jest
		.spyOn(httpSingleton, 'orchestrateRequest')
		.mockReturnValue({ fetch: async () => ({ page }) } as never);
	const data = { name: 'Community', urlName: 'community', pageLocationId: PAGE_LOCATION_ID.COMMUNITY };
	expect(await pagesService.updatePageSettings('page-1', data).fetch()).toEqual({ page });
	expect(spy).toHaveBeenCalledWith({ method: 'PUT', url: '/pages/page-1/settings', data });
});

it('leaves the category absent for existing settings callers that only update a URL', () => {
	const spy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	pagesService.updatePageSettings('page-1', { name: 'Community', urlName: 'new-url' });
	expect(spy.mock.calls[0][0].data).toEqual({ name: 'Community', urlName: 'new-url' });
});

it('builds an authenticated subscriber download URL restricted to email addresses', () => {
	Cookies.set('accessToken', 'test-token');
	const url = new URL(pagesService.getSubscriberEmailDownloadUrl('page-1'), 'https://cobalt.example');
	expect(url.pathname).toBe('/page-row-mailing-lists/csv');
	expect(url.searchParams.get('pageId')).toBe('page-1');
	expect(url.searchParams.get('mailingListEntryTypeId')).toBe('EMAIL_ADDRESS');
	expect(url.searchParams.get('X-Cobalt-Access-Token')).toBe('test-token');
});

it('continues to duplicate pages through the existing API without overriding the inherited category', () => {
	const spy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = { name: 'Copy', urlName: 'copy', copyForEditing: false };
	pagesService.duplicatePage('page-1', data);
	expect(spy).toHaveBeenCalledWith({ method: 'PUT', url: '/pages/page-1/duplicate', data });
	expect(spy.mock.calls[0][0].data).not.toHaveProperty('pageLocationId');
});
