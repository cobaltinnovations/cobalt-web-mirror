import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse, CancelTokenSource } from 'axios';
// Axios TS Definitions:
// https://github.com/axios/axios/blob/master/index.d.ts

import { ERROR_CODES, errors, ErrorConfig, ApiError } from '@/lib/http-client/errors';

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
	fetch(): Promise<T>;
	abort(): void;
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
			return response.data;
		} catch (error) {
			if (axios.isCancel(error)) {
				throw errors[ERROR_CODES.REQUEST_ABORTED](error as any);
			} else {
				throw this._getFormattedError(error as AxiosError<any>);
			}
		}
	}

	_getFormattedError(error: AxiosError): ErrorConfig {
		const errorFromApi: ApiError = error?.response?.data;

		if (errorFromApi) {
			const formattedApiError: ErrorConfig = {
				code: errorFromApi.code,
				message: errorFromApi.message,
				apiError: errorFromApi,
				axiosError: error,
			};

			return formattedApiError;
		}

		return errors[ERROR_CODES.GENERIC](error);
	}

	orchestrateRequest<T>(requestConfig: AxiosRequestConfig) {
		const orchestratedRequest: OrchestratedRequest<T> = {
			requestId: uuidv4(),
			requestComplete: false,
		} as any;

		orchestratedRequest.fetch = async () => {
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
				},
				cancelToken: source.token,
				...(body ? { data: body } : {}),
			};

			this._requests[orchestratedRequest.requestId] = orchestratedRequest;

			const data = await this._fetch(orchestratedRequest.config);

			orchestratedRequest.requestComplete = true;
			delete this._requests[orchestratedRequest.requestId];

			return data as T;
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
