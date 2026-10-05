import { defer, LoaderFunctionArgs, redirect } from 'react-router-dom';
import { pagesService } from '@/lib/services/pages-service';
import {
	getPageDirectoryConfiguration,
	getPageDirectoryRequestParameters,
	PAGE_DIRECTORY_PAGE_SIZE,
	withPageDirectoryPage,
} from '@/lib/utils/page-directory-utils';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const configuration = getPageDirectoryConfiguration(url.pathname);
	if (!configuration) {
		throw new Response('Directory not found', { status: 404 });
	}

	const parameters = getPageDirectoryRequestParameters(configuration.pageLocationId, url.searchParams);
	const pagesRequest = pagesService.getPublishedPages(parameters);
	const pagesResponse = pagesRequest.fetch();
	const abort = () => pagesRequest.abort();
	if (request.signal.aborted) {
		abort();
	} else {
		request.signal.addEventListener('abort', abort, { once: true });
	}

	const settledResponse = pagesResponse.finally(() => request.signal.removeEventListener('abort', abort));
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
