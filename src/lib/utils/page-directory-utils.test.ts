import { PAGE_LOCATION_ID } from '@/lib/models/pages-models';
import {
	getPageDirectoryConfiguration,
	getPageDirectoryRequestParameters,
	withPageDirectoryPage,
	withPageDirectorySearch,
} from './page-directory-utils';

it.each([
	['/featured-topics', PAGE_LOCATION_ID.FEATURED_TOPIC, 'Featured Topics'],
	['/communities/', PAGE_LOCATION_ID.COMMUNITY, 'Penn Communities'],
])('maps the public route %s to its directory category', (path, category, title) => {
	expect(getPageDirectoryConfiguration(path)).toMatchObject({ pageLocationId: category, title });
});

it('uses page zero and a fixed size consistently with the directory paginator', () => {
	expect(getPageDirectoryRequestParameters(PAGE_LOCATION_ID.COMMUNITY, new URLSearchParams('pageSize=100'))).toEqual({
		pageLocationId: 'COMMUNITY',
		pageNumber: '0',
		pageSize: '25',
	});
});

it.each(['-1', 'NaN', '1.5', '9007199254740992'])(
	'normalizes invalid pagination %s before requesting the API',
	(pageNumber) => {
		expect(
			getPageDirectoryRequestParameters(PAGE_LOCATION_ID.FEATURED_TOPIC, new URLSearchParams({ pageNumber }))
				.pageNumber
		).toBe('0');
	}
);

it('resets the page when searching and preserves unrelated query parameters', () => {
	const previous = new URLSearchParams('pageNumber=3&track=true&searchQuery=old');
	const next = withPageDirectorySearch(previous, '  Anxiety & Wellness  ');
	expect(Object.fromEntries(next)).toEqual({ pageNumber: '0', track: 'true', searchQuery: 'Anxiety & Wellness' });
	expect(previous.get('pageNumber')).toBe('3');
});

it('clears search and starts from page zero', () => {
	expect(
		Object.fromEntries(withPageDirectorySearch(new URLSearchParams('searchQuery=anxiety&pageNumber=2'), ' '))
	).toEqual({ pageNumber: '0' });
});

it('keeps search intact when moving to another result page', () => {
	const next = withPageDirectoryPage(new URLSearchParams('searchQuery=anxiety&pageNumber=0'), 2);
	expect(getPageDirectoryRequestParameters(PAGE_LOCATION_ID.FEATURED_TOPIC, next)).toEqual({
		pageLocationId: 'FEATURED_TOPIC',
		pageNumber: '2',
		pageSize: '25',
		searchQuery: 'anxiety',
	});
});
