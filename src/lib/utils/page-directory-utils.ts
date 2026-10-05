import { PAGE_LOCATION_ID } from '@/lib/models/pages-models';

export const PAGE_DIRECTORY_PAGE_SIZE = 25;

export const pageDirectoryConfiguration = {
	'/featured-topics': {
		pageLocationId: PAGE_LOCATION_ID.FEATURED_TOPIC,
		title: 'Featured Topics',
		searchPlaceholder: 'Search all topics',
		emptyTitle: 'No featured topics',
	},
	'/communities': {
		pageLocationId: PAGE_LOCATION_ID.COMMUNITY,
		title: 'Penn Communities',
		searchPlaceholder: 'Search all communities',
		emptyTitle: 'No communities',
	},
};

export const getPageDirectoryConfiguration = (pathname: string) =>
	pageDirectoryConfiguration[pathname.replace(/\/$/, '') as keyof typeof pageDirectoryConfiguration];

export const getPageDirectoryRequestParameters = (pageLocationId: PAGE_LOCATION_ID, searchParams: URLSearchParams) => {
	const rawPageNumber = searchParams.get('pageNumber') ?? '0';
	const pageNumber = /^\d+$/.test(rawPageNumber) && Number.isSafeInteger(Number(rawPageNumber)) ? rawPageNumber : '0';
	const searchQuery = searchParams.get('searchQuery')?.trim();

	return {
		pageLocationId,
		pageNumber,
		pageSize: String(PAGE_DIRECTORY_PAGE_SIZE),
		...(searchQuery ? { searchQuery } : {}),
	};
};

export const withPageDirectorySearch = (previous: URLSearchParams, searchQuery: string) => {
	const searchParams = new URLSearchParams(previous);
	const normalizedQuery = searchQuery.trim();
	if (normalizedQuery) {
		searchParams.set('searchQuery', normalizedQuery);
	} else {
		searchParams.delete('searchQuery');
	}
	searchParams.set('pageNumber', '0');
	return searchParams;
};

export const withPageDirectoryPage = (previous: URLSearchParams, pageNumber: number) => {
	const searchParams = new URLSearchParams(previous);
	searchParams.set('pageNumber', String(pageNumber));
	return searchParams;
};
