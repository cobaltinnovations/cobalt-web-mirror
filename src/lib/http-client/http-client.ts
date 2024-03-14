import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Cancel, CancelTokenSource } from 'axios';
// Axios TS Definitions:
// https://github.com/axios/axios/blob/master/index.d.ts

import { CobaltError } from '@/lib/http-client/errors';

export type HttpConfig = {
	baseUrl?: string;
	defaultHeaders?: Record<string, string | number | boolean>;
	tokenHeaderKey?: string;
	getToken?(): string | undefined;
	fingerprintHeaderKey?: string;
	getFingerprintId(): Promise<string | undefined>;
};

export type OrchestratedRequest<T = undefined> = {
	requestId: string;
	requestComplete: boolean;
	source: CancelTokenSource;
	config: AxiosRequestConfig;
	fetch(fetchConfig?: { isPolling?: boolean }): Promise<T>;
	abort(): void;
	cobaltResponseChecksum?: string;
};

export class HttpClient {
	_baseUrl: string;
	_headers: any;
	_requests: Record<string, OrchestratedRequest<any>>;
	_axiosInstance: AxiosInstance;
	_sessionTrackingId = uuidv4();

	constructor(httpConfig: HttpConfig) {
		this._baseUrl = httpConfig.baseUrl || '';
		this._headers = {
			'X-Session-Tracking-Id': this._sessionTrackingId,
			...httpConfig.defaultHeaders,
		};
		this._requests = {};

		this._axiosInstance = axios.create({
			transformRequest: [
				(data: any, headers: any) => {
					const accessToken: string | undefined = httpConfig.getToken ? httpConfig.getToken() : undefined;

					if (accessToken && httpConfig.tokenHeaderKey) {
						headers[httpConfig.tokenHeaderKey] = accessToken;
					}

					headers['X-Cobalt-Webapp-Current-Url'] = window.location.href;

					return data;
				},
			],
		});

		(async () => {
			try {
				const fpId = await httpConfig.getFingerprintId();
				if (fpId && httpConfig.fingerprintHeaderKey) {
					this._headers[httpConfig.fingerprintHeaderKey] = fpId;
				}
			} catch (e) {
				console.warn('failed to fingerprint', e);
			}
		})();
	}

	abortRequest(requestId: string) {
		const request = this._requests[requestId];

		if (request) {
			request.abort();
		}
	}

	async _fetch(config: AxiosRequestConfig) {
		try {
			const response: AxiosResponse = await this._axiosInstance(config);
			return response;
		} catch (error) {
			if (axios.isCancel(error)) {
				throw CobaltError.fromCancelledRequest();
			} else if (axios.isAxiosError(error)) {
				throw CobaltError.fromAxiosError(error);
			} else {
				throw CobaltError.fromUnknownError(error);
			}
		}
	}

	orchestrateRequest<T>(requestConfig: AxiosRequestConfig) {
		const orchestratedRequest: OrchestratedRequest<T> = {
			requestId: uuidv4(),
			requestComplete: false,
		} as any;

		orchestratedRequest.fetch = async (config) => {
			const source = axios.CancelToken.source();

			let body = requestConfig.data;
			if (requestConfig.data) {
				if (requestConfig.data instanceof Blob || requestConfig.data instanceof FormData) {
					body = requestConfig.data;
				} else {
					body = JSON.stringify(requestConfig.data);
				}
			}

			orchestratedRequest.requestComplete = false;
			orchestratedRequest.source = source;
			orchestratedRequest.config = {
				...requestConfig,
				baseURL: requestConfig.baseURL ?? this._baseUrl,
				headers: {
					...this._headers,
					...requestConfig.headers,
					...(config?.isPolling ? { 'X-Cobalt-Autorefresh': true } : {}),
				},
				cancelToken: source.token,
				...(body ? { data: body } : {}),
			};

			this._requests[orchestratedRequest.requestId] = orchestratedRequest;

			const response = await this._fetch(orchestratedRequest.config);

			orchestratedRequest.requestComplete = true;
			orchestratedRequest.cobaltResponseChecksum = response.headers['x-cobalt-checksum'];

			delete this._requests[orchestratedRequest.requestId];

			return response.data as T;
		};

		orchestratedRequest.abort = () => {
			if (orchestratedRequest.requestComplete) return;

			orchestratedRequest.source.cancel();

			orchestratedRequest.requestComplete = true;
			delete this._requests[orchestratedRequest.requestId];
		};

		return orchestratedRequest;
	}
}
