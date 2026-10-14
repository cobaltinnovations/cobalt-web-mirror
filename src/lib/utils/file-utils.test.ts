import { downloadBlob, filenameFromContentDisposition } from './file-utils';

describe('filenameFromContentDisposition', () => {
	it('reads a quoted attachment filename', () => {
		expect(
			filenameFromContentDisposition(
				'attachment; filename="Cobalt ACCOUNT_GEOLOCATION 2026-09-01 to 2026-09-10.csv"',
				'fallback.csv'
			)
		).toBe('Cobalt ACCOUNT_GEOLOCATION 2026-09-01 to 2026-09-10.csv');
	});

	it('prefers and decodes an RFC 5987 filename', () => {
		expect(
			filenameFromContentDisposition(
				"attachment; filename=report.csv; filename*=UTF-8''Account%20Geolocation.csv",
				'fallback.csv'
			)
		).toBe('Account Geolocation.csv');
	});

	it('uses the fallback when the header has no filename', () => {
		expect(filenameFromContentDisposition('attachment', 'fallback.csv')).toBe('fallback.csv');
	});
});

it('downloads a blob using an object URL and revokes it afterward', () => {
	const blob = new Blob(['account_id\n'], { type: 'text/csv' });
	const createObjectUrl = jest.fn(() => 'blob:report');
	const revokeObjectUrl = jest.fn();
	const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

	Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrl });
	Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectUrl });

	downloadBlob(blob, 'report.csv');

	expect(createObjectUrl).toHaveBeenCalledWith(blob);
	expect(click).toHaveBeenCalledTimes(1);
	expect(revokeObjectUrl).toHaveBeenCalledWith('blob:report');
	expect(document.querySelector('a[download="report.csv"]')).not.toBeInTheDocument();

	click.mockRestore();
});
