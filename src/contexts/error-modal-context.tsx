import { CobaltError } from '@/lib/http-client';
import * as Sentry from '@sentry/react';
import React, { FC, PropsWithChildren, createContext, useCallback, useState } from 'react';

type ErrorModalContextConfig = {
	isErrorModalShown: boolean;
	dismissErrorModal: () => void;
	displayModalForError: (error: CobaltError) => void;
	clearError: () => void;
	error: CobaltError | undefined;
};

const ErrorModalContext = createContext({} as ErrorModalContextConfig);

const ErrorModalProvider: FC<PropsWithChildren> = (props) => {
	const [isErrorModalShown, setIsErrorModalShown] = useState(false);
	const [error, setError] = useState<CobaltError>();

	const dismissErrorModal = useCallback(() => {
		setIsErrorModalShown(false);
	}, []);

	const clearError = useCallback(() => {
		setError(undefined);
	}, []);

	const displayModalForError = useCallback((capturedError: CobaltError) => {
		setIsErrorModalShown(true);
		setError(capturedError);

		if (capturedError.reportableToSentry) {
			Sentry.captureException(capturedError, {
				extra: {
					apiError: capturedError.apiError,
					axiosError: capturedError.axiosError,
					unknownError: capturedError.unknownError,
				},
			});
		}
	}, []);

	return (
		<ErrorModalContext.Provider
			value={{
				isErrorModalShown,
				dismissErrorModal,
				clearError,
				displayModalForError,
				error,
			}}
		>
			{props.children}
		</ErrorModalContext.Provider>
	);
};

export { ErrorModalContext, ErrorModalProvider };
