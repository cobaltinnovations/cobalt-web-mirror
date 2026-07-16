import { getPageRowAnchorDomId, getPageRowAnchorDomIdFromHash } from './page-builder-utils';

const pageRowAnchorId = '93da2607-c637-4235-b98b-1abcc05d2e80';

describe('page builder row anchors', () => {
	it('builds a stable DOM ID from the row anchor ID', () => {
		expect(getPageRowAnchorDomId(pageRowAnchorId)).toBe(`page-row-${pageRowAnchorId}`);
	});

	it('only resolves hashes belonging to a row on the current page', () => {
		expect(getPageRowAnchorDomIdFromHash(`#page-row-${pageRowAnchorId}`, [pageRowAnchorId])).toBe(
			`page-row-${pageRowAnchorId}`
		);
		expect(getPageRowAnchorDomIdFromHash('#page-row-another-row', [pageRowAnchorId])).toBeUndefined();
		expect(getPageRowAnchorDomIdFromHash('#%E0%A4%A', [pageRowAnchorId])).toBeUndefined();
	});
});
