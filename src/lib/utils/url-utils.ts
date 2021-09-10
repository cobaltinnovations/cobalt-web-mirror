export function encodeQueryData(data: any): string {
	const queries = [];

	for (const key in data) {
		queries.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);
	}

	return queries.join('&');
}

export function buildQueryParamUrl(url: string, queryParams: any): string {
	let queryString;

	if (queryParams) {
		queryString = new URLSearchParams(queryParams as Record<string, string>);
	}

	if (queryString) {
		url = url.concat(`?${queryString}`);
	}

	return url;
}
