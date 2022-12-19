export function encodeQueryData(data: any): string {
	const queries = [];

	for (const key in data) {
		queries.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);
	}

	return queries.join('&');
}

export function buildQueryParamUrl(url: string, queryParams?: Record<string, any>): string {
	let queryString;

	if (queryParams) {
		const urlSearchParams = new URLSearchParams();

		Object.entries(queryParams).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				value.forEach((innerValue) => {
					urlSearchParams.append(key, innerValue);
				});
			} else {
				urlSearchParams.append(key, value);
			}
		});

		queryString = urlSearchParams.toString();
	}

	if (queryString) {
		url = url.concat(`?${queryString.toString()}`);
	}

	return url;
}
