import { AxiosError } from 'axios';

export enum ERROR_CODES {
	GENERIC = 'GENERIC',
	REQUEST_ABORTED = 'REQUEST_ABORTED',
}

export class CobaltError extends Error {
	static fromApiError(error: ApiError) {
		const instance = new CobaltError(error.message);

		instance.code = error.code;
		instance.apiError = error;

		return instance;
	}

	static fromAxiosError(error: AxiosError) {
		let instance: CobaltError;
		const errorData = error.response?.data;
		const apiError = isApiError(errorData) ? errorData : undefined;

		if (apiError) {
			instance = CobaltError.fromApiError(apiError);
		} else {
			instance = new CobaltError('Sorry, an error occurred.');
		}

		instance.axiosError = error;

		return instance;
	}

	static fromStatusCode0(error: AxiosError) {
		const instance = new CobaltError('Connection to server was lost.');
		instance.code = ERROR_CODES.REQUEST_ABORTED;
		instance.axiosError = error;

		return instance;
	}

	static fromEConnAborted(error: AxiosError) {
		const instance = new CobaltError('Connection to server was lost.');
		instance.code = ERROR_CODES.REQUEST_ABORTED;
		instance.axiosError = error;

		return instance;
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

	get reportableToUser() {
		return this.code !== ERROR_CODES.REQUEST_ABORTED;
	}

	get reportableToSentry() {
		return this.code !== ERROR_CODES.REQUEST_ABORTED && this.apiError?.code !== 'VALIDATION_FAILED';
	}

	code?: string = ERROR_CODES.GENERIC;
	apiError?: ApiError;
	axiosError?: AxiosError;
	unknownError?: unknown;

	constructor(public message: string) {
		super(message);
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
