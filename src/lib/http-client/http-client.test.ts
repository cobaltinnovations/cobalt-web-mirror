import { AxiosError } from 'axios';

import { HttpClient } from './http-client';

jest.mock('../services', () => ({
	analyticsService: {
		persistEvent: jest.fn(),
	},
}));

it('restores JSON API errors returned by blob download requests', async () => {
	const client = new HttpClient({
		getFingerprintId: () => Promise.resolve(undefined),
	});
	const apiError = {
		code: 'AUTHENTICATION_REQUIRED',
		message: 'Please sign in.',
		stackTrace: '',
	};
	const axiosError = {
		isAxiosError: true,
		name: 'Error',
		message: 'Request failed with status code 401',
		config: { method: 'GET', url: '/reporting/run-report' },
		request: { status: 401 },
		response: {
			status: 401,
			data: new Blob([JSON.stringify(apiError)], { type: 'application/json' }),
		},
		toJSON: jest.fn(),
	} as unknown as AxiosError;

	client._axiosInstance = jest.fn().mockRejectedValue(axiosError) as never;

	await expect(
		client._fetch({ method: 'GET', responseType: 'blob', url: '/reporting/run-report' })
	).rejects.toMatchObject({
		message: 'Please sign in.',
		apiError,
	});
});
