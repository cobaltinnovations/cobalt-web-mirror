import { AxiosError } from 'axios';

export enum ERROR_CODES {
	GENERIC = 'GENERIC',
	REQUEST_ABORTED = 'REQUEST_ABORTED',
	CONNECTION_LOST = 'CONNECTION_LOST',
	VALIDATION_FAILED = 'VALIDATION_FAILED',
}

export type NetworkFailureCause = 'OFFLINE_OR_NETWORK_DROP' | 'CORS_OR_BROWSER_BLOCK' | 'TIMEOUT' | 'UNKNOWN';

export type NetworkDiagnostics = {
	axiosCode?: string;
	axiosMessage?: string;
	responseStatus?: number;
	requestStatus?: number;
	requestUrl?: string;
	requestMethod?: string;
	navigatorOnline?: boolean;
	documentVisibilityState?: string;
	windowLocationHref?: string;
	capturedAtIso: string;
	suspectedCause: NetworkFailureCause;
};

type AxiosErrorClassification = {
	isConnectionLost: boolean;
	networkDiagnostics: NetworkDiagnostics;
};

export class CobaltError extends Error {
	static fromApiError(error: ApiError) {
		const instance = new CobaltError(error.message);

		instance.code = error.code;
		instance.apiError = error;

		return instance;
	}

	static fromAxiosError(error: AxiosError) {
		const classification = CobaltError.classifyAxiosError(error);
		let instance: CobaltError;
		const errorData = error.response?.data;
		const apiError = isApiError(errorData) ? errorData : undefined;

		if (apiError) {
			instance = CobaltError.fromApiError(apiError);
		} else if (classification.isConnectionLost) {
			instance = new CobaltError('Connection to the server was lost.');
			instance.code = ERROR_CODES.CONNECTION_LOST;
		} else {
			instance = new CobaltError('Sorry, an error occurred.');
		}

		instance.axiosError = error;
		instance.networkDiagnostics = classification.networkDiagnostics;

		return instance;
	}

	static fromStatusCode0(error: AxiosError) {
		return CobaltError.fromAxiosError(error);
	}

	static fromEConnAborted(error: AxiosError) {
		return CobaltError.fromAxiosError(error);
	}

	static fromUnknownError(error: unknown) {
		const instance = new CobaltError('Sorry, an error occurred.');

		instance.unknownError = error;

		return instance;
	}

	static fromCancelledRequest() {
		const instance = new CobaltError('Request was cancelled');
		instance.code = ERROR_CODES.REQUEST_ABORTED;

		return instance;
	}

	static fromDeferredDataAbort() {
		const instance = new CobaltError('Request was cancelled');
		instance.code = ERROR_CODES.REQUEST_ABORTED;

		return instance;
	}

	static fromValidationFailed(message: string) {
		const instance = new CobaltError(message);
		instance.code = ERROR_CODES.VALIDATION_FAILED;
		return instance;
	}

	get reportableToUser() {
		return this.code !== ERROR_CODES.REQUEST_ABORTED;
	}

	get reportableToSentry() {
		if (this.code === ERROR_CODES.REQUEST_ABORTED) {
			return false;
		}

		if (this.code === ERROR_CODES.VALIDATION_FAILED) {
			return false;
		}

		if (this.code === ERROR_CODES.CONNECTION_LOST) {
			return false;
		}

		return this.apiError?.code !== ERROR_CODES.VALIDATION_FAILED;
	}

	code?: string = ERROR_CODES.GENERIC;
	apiError?: ApiError;
	axiosError?: AxiosError;
	unknownError?: unknown;
	networkDiagnostics?: NetworkDiagnostics;

	constructor(public message: string) {
		super(message);
	}

	private static classifyAxiosError(error: AxiosError): AxiosErrorClassification {
		const requestStatus = CobaltError.resolveRequestStatus(error);
		const responseStatus = error.response?.status;
		const axiosCode = error.code;
		const hasNoResponse = !error.response;
		const hasStatus0 = responseStatus === 0 || requestStatus === 0;
		const isTimeout = axiosCode === 'ECONNABORTED';
		const isErrNetwork = axiosCode === 'ERR_NETWORK';
		const isConnectionLost = isTimeout || hasNoResponse || hasStatus0 || isErrNetwork;
		const navigatorOnline = CobaltError.getNavigatorOnlineStatus();
		const suspectedCause = CobaltError.determineNetworkFailureCause({
			isTimeout,
			isConnectionLost,
			navigatorOnline,
		});

		return {
			isConnectionLost,
			networkDiagnostics: {
				axiosCode,
				axiosMessage: error.message,
				responseStatus,
				requestStatus,
				requestUrl: CobaltError.resolveRequestUrl(error),
				requestMethod: error.config?.method?.toUpperCase(),
				navigatorOnline,
				documentVisibilityState: CobaltError.getDocumentVisibilityState(),
				windowLocationHref: CobaltError.getWindowLocationHref(),
				capturedAtIso: new Date().toISOString(),
				suspectedCause,
			},
		};
	}

	private static determineNetworkFailureCause({
		isTimeout,
		isConnectionLost,
		navigatorOnline,
	}: {
		isTimeout: boolean;
		isConnectionLost: boolean;
		navigatorOnline: boolean | undefined;
	}): NetworkFailureCause {
		if (isTimeout) {
			return 'TIMEOUT';
		}

		if (!isConnectionLost) {
			return 'UNKNOWN';
		}

		if (navigatorOnline === false) {
			return 'OFFLINE_OR_NETWORK_DROP';
		}

		if (navigatorOnline === true) {
			return 'CORS_OR_BROWSER_BLOCK';
		}

		return 'UNKNOWN';
	}

	private static resolveRequestStatus(error: AxiosError): number | undefined {
		const status = (error.request as { status?: unknown } | undefined)?.status;

		return typeof status === 'number' ? status : undefined;
	}

	private static resolveRequestUrl(error: AxiosError): string | undefined {
		const requestUrl = error.config?.url;
		if (!requestUrl) {
			return undefined;
		}

		if (requestUrl.startsWith('http://') || requestUrl.startsWith('https://')) {
			return requestUrl;
		}

		const baseURL = error.config?.baseURL;
		if (!baseURL) {
			return requestUrl;
		}

		return `${baseURL.replace(/\/+$/, '')}/${requestUrl.replace(/^\/+/, '')}`;
	}

	private static getNavigatorOnlineStatus(): boolean | undefined {
		if (typeof navigator === 'undefined') {
			return undefined;
		}

		return navigator.onLine;
	}

	private static getDocumentVisibilityState(): string | undefined {
		if (typeof document === 'undefined') {
			return undefined;
		}

		return document.visibilityState;
	}

	private static getWindowLocationHref(): string | undefined {
		if (typeof window === 'undefined') {
			return undefined;
		}

		return window.location.href;
	}
}

export type ApiError = {
	code: string;
	stackTrace: string;
	message: string;
	globalErrors?: string;
	fieldErrors?: FieldError[];
	metadata?: Record<string, string | boolean>;
	accessTokenStatus?: 'PARTIALLY_EXPIRED' | 'FULLY_EXPIRED';
	signOnUrl?: string;
};

type FieldError = {
	field: string;
	error: string;
};

export function isApiError(error: unknown): error is ApiError {
	return (
		typeof error === 'object' && error !== null && Object.hasOwn(error, 'code') && Object.hasOwn(error, 'message')
	);
}

type DeferredDataError = {
	stack: string;
	message: 'Deferred data aborted';
};

export function isDeferredDataError(error: unknown): error is DeferredDataError {
	return (
		typeof error === 'object' &&
		error !== null &&
		Object.hasOwn(error, 'stack') &&
		Object.hasOwn(error, 'message') &&
		(error as any).message === 'Deferred data aborted'
	);
}
