import { buildQueryParamUrl } from './url-utils';

describe('buildQueryParamUrl', () => {
	it('merges parameters into a URL that already has a query string', () => {
		expect(
			buildQueryParamUrl('/providers?featureId=THERAPY', {
				institutionLocationId: 'location-id',
			})
		).toBe('/providers?featureId=THERAPY&institutionLocationId=location-id');
	});

	it('preserves fragments and replaces existing scalar parameters', () => {
		expect(buildQueryParamUrl('/providers?featureId=COACHING#results', { featureId: 'THERAPY' })).toBe(
			'/providers?featureId=THERAPY#results'
		);
	});

	it('supports repeated array parameters', () => {
		expect(buildQueryParamUrl('/providers', { clinicId: ['one', 'two'] })).toBe(
			'/providers?clinicId=one&clinicId=two'
		);
	});
});
