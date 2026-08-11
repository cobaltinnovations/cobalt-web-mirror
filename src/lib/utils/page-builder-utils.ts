const PAGE_ROW_ANCHOR_PREFIX = 'page-row-';

export const getPageRowAnchorDomId = (pageRowAnchorId: string) => `${PAGE_ROW_ANCHOR_PREFIX}${pageRowAnchorId}`;

export const getPageRowAnchorDomIdFromHash = (hash: string, pageRowAnchorIds: string[]) => {
	if (!hash.startsWith('#')) {
		return undefined;
	}

	let decodedHash: string;

	try {
		decodedHash = decodeURIComponent(hash.slice(1));
	} catch {
		return undefined;
	}

	return pageRowAnchorIds.some((pageRowAnchorId) => getPageRowAnchorDomId(pageRowAnchorId) === decodedHash)
		? decodedHash
		: undefined;
};
