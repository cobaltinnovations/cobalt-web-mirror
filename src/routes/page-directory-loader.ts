import { defer, LoaderFunctionArgs, redirect } from 'react-router-dom';
import { pagesService } from '@/lib/services/pages-service';
import {
	getPageDirectoryConfiguration,
	getPageDirectoryRequestParameters,
	PAGE_DIRECTORY_PAGE_SIZE,
	withPageDirectoryPage,
} from '@/lib/utils/page-directory-utils';

const fetchForNavigation = <T>(apiRequest: { fetch(): Promise<T>; abort(): void }, signal: AbortSignal) => {
	const response = apiRequest.fetch();
	const abort = () => apiRequest.abort();
	if (signal.aborted) {
		abort();
	} else {
		signal.addEventListener('abort', abort, { once: true });
	}
	return response.finally(() => signal.removeEventListener('abort', abort));
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const configuration = getPageDirectoryConfiguration(url.pathname);
	if (!configuration) {
		throw new Response('Directory not found', { status: 404 });
	}

	const parameters = getPageDirectoryRequestParameters(configuration.pageLocationId, url.searchParams);
	const settledResponse = fetchForNavigation(pagesService.getPublishedPages(parameters), request.signal);
	if (Number(parameters.pageNumber) > 0) {
		try {
			const response = await settledResponse;
			if (response.pages.length === 0 && response.totalCount > 0) {
				const lastPage = Math.ceil(response.totalCount / PAGE_DIRECTORY_PAGE_SIZE) - 1;
				const pageNumber = Math.min(Number(parameters.pageNumber) - 1, lastPage);
				url.search = withPageDirectoryPage(url.searchParams, pageNumber).toString();
				return redirect(url.pathname + url.search);
			}
			return defer({ configuration, pagesResponse: Promise.resolve(response) });
		} catch (error) {
			// Keep failed later-page requests in the directory's existing retry/error boundary.
			return defer({ configuration, pagesResponse: Promise.reject(error) });
		}
	}
	return defer({ configuration, pagesResponse: settledResponse });
};
