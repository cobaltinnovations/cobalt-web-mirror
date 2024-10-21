import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Cancel, CancelTokenSource } from 'axios';
// Axios TS Definitions:
// https://github.com/axios/axios/blob/master/index.d.ts

import { CobaltError } from '@/lib/http-client/errors';
import { analyticsService } from '../services';
import { AnalyticsNativeEventTypeId } from '../models';

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

					const clientDeviceFingerprint = window.localStorage.getItem('cobaltAnalytics.FINGERPRINT');
					const clientDeviceSessionId = window.sessionStorage.getItem('cobaltAnalytics.SESSION_ID');
					const referringMessageId = window.sessionStorage.getItem('cobaltAnalytics.REFERRING_MESSAGE_ID');
					const referringCampaign = window.sessionStorage.getItem('cobaltAnalytics.REFERRING_CAMPAIGN');

					let supportedLocales = undefined;
					let locale = undefined;
					let timeZone = undefined;

					try {
						supportedLocales = navigator.languages ? JSON.stringify(navigator.languages) : undefined;
					} catch (ignored) {
						// Don't worry about it
					}

					try {
						locale = new Intl.NumberFormat().resolvedOptions().locale;
					} catch (ignored) {
						// Don't worry about it
					}

					try {
						timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
					} catch (ignored) {
						// Don't worry about it
					}

					headers['X-Cobalt-Webapp-Current-Url'] = window.location.href;
					headers['X-Client-Device-Fingerprint'] = clientDeviceFingerprint ? clientDeviceFingerprint : '';
					headers['X-Client-Device-Type-Id'] = 'WEB_BROWSER';
					headers['X-Client-Device-App-Name'] = 'Cobalt Webapp';
					headers['X-Client-Device-Session-Id'] = clientDeviceSessionId ? clientDeviceSessionId : '';
					headers['X-Client-Device-Supported-Locales'] = supportedLocales ? supportedLocales : '';
					headers['X-Client-Device-Locale'] = locale ? locale : '';
					headers['X-Client-Device-Time-Zone'] = timeZone ? timeZone : '';
					headers['X-Cobalt-Referring-Message-Id'] = referringMessageId ? referringMessageId : '';
					headers['X-Cobalt-Referring-Campaign'] = referringCampaign ? referringCampaign : '';

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
			// See https://axios-http.com/docs/handling_errors for details

			// Store analytics for the error
			try {
				let serializableErrorContext = undefined;

				if ((error as any).response)
					serializableErrorContext = JSON.parse(JSON.stringify((error as any).response, null, 2));

				analyticsService.persistEvent(AnalyticsNativeEventTypeId.API_CALL_ERROR, {
					request: {
						method: config.method?.toUpperCase(),
						url: config.url?.startsWith('/') ? config.url : `/${config.url}`,
						body: config.data ? JSON.parse(config.data) : undefined,
					},
					response: {
						status: serializableErrorContext ? serializableErrorContext.status : undefined,
						body: serializableErrorContext ? serializableErrorContext.data : undefined,
					},
				});
			} catch (ignored) {
				// We tried and failed to send error analytics.
			}

			// Surface error to users (if necessary)
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
