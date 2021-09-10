import { AxiosError } from 'axios';

export enum ERROR_CODES {
	GENERIC = 'GENERIC',
	REQUEST_ABORTED = 'REQUEST_ABORTED',
}

export type ErrorConfig = {
	code: ERROR_CODES | string;
	message: string;
	apiError?: ApiError;
	axiosError: AxiosError;
};

export type ApiError = {
	code: string;
	stackTrace: string;
	message: string;
	globalErrors?: string;
	fieldErrors?: FieldError[];
	metaData?: Record<string, string | boolean>;
};

type FieldError = {
	field: string;
	error: string;
};

export type ErrorGeneratorFuction = (error: AxiosError) => ErrorConfig;
export type ErrorsConfig = Record<ERROR_CODES, ErrorGeneratorFuction>;

export const errors: ErrorsConfig = {
	[ERROR_CODES.GENERIC]: (error) => {
		return {
			code: ERROR_CODES.GENERIC,
			message: 'Sorry, an error occurred.',
			axiosError: error,
		};
	},
	[ERROR_CODES.REQUEST_ABORTED]: (error) => {
		return {
			code: ERROR_CODES.REQUEST_ABORTED,
			message: 'Sorry, the request was cancelled.',
			axiosError: error,
		};
	},
};
