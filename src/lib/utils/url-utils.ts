import Cookies from 'js-cookie';

import { config } from '@/config';

export function buildQueryParamUrl(url: string, queryParams?: Record<string, any>): string {
	if (!queryParams) {
		return url;
	}

	const hashIndex = url.indexOf('#');
	const hash = hashIndex >= 0 ? url.slice(hashIndex) : '';
	const urlWithoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
	const queryIndex = urlWithoutHash.indexOf('?');
	const pathname = queryIndex >= 0 ? urlWithoutHash.slice(0, queryIndex) : urlWithoutHash;
	const existingQueryString = queryIndex >= 0 ? urlWithoutHash.slice(queryIndex + 1) : '';
	const urlSearchParams = new URLSearchParams(existingQueryString);

	Object.entries(queryParams).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			urlSearchParams.delete(key);
			value.forEach((innerValue) => {
				if (innerValue !== undefined && innerValue !== null) {
					urlSearchParams.append(key, innerValue);
				}
			});
		} else if (value !== undefined && value !== null) {
			urlSearchParams.set(key, value);
		}
	});

	const queryString = urlSearchParams.toString();

	return `${pathname}${queryString ? `?${queryString}` : ''}${hash}`;
}

export function buildBackendDownloadUrl(proxiedPath: string, queryParams: Record<string, any>) {
	// only points to backend instance & append access token in local dev
	// otherwise, nodeapp server.js is used to proxy these requests to backend
	if (__DEV__) {
		// remove trailing slash from base url
		proxiedPath = config.apiBaseUrl.replace(/\/$/, '') + proxiedPath;
		queryParams['X-Cobalt-Access-Token'] = Cookies.get('accessToken');
	}

	return buildQueryParamUrl(proxiedPath, queryParams);
}

export function getSubdomain(url: URL) {
	let subdomain = 'cobalt';

	const hostSplit = url.host.split('.');

	if (__DEV__ && url.host.startsWith('localhost') && config.localhostSubdomain) {
		subdomain = config.localhostSubdomain.toLowerCase();
		// only support `subdomain.host.tld` for now
	} else if (hostSplit.length >= 3) {
		subdomain = hostSplit[0].toLowerCase();
	}

	return subdomain;
}

export function getCookieOrParamAsBoolean(url: URL, cookieOrParamName: string) {
	const urlHasParam = url.searchParams.get(cookieOrParamName) === 'true';

	if (urlHasParam) {
		Cookies.set(cookieOrParamName, 'true');
	}

	return Cookies.get(cookieOrParamName) === 'true';
}
