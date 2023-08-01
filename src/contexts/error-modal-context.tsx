import { CobaltError } from '@/lib/http-client';
import * as Sentry from '@sentry/react';
import React, { FC, PropsWithChildren, createContext, useCallback, useState } from 'react';

type ErrorModalContextConfig = {
	isErrorModalShown: boolean;
	dismissErrorModal: () => void;
	displayModalForError: (error: CobaltError) => void;
	error: CobaltError | undefined;
};

const ErrorModalContext = createContext({} as ErrorModalContextConfig);

const ErrorModalProvider: FC<PropsWithChildren> = (props) => {
	const [isErrorModalShown, setIsErrorModalShown] = useState(false);
	const [error, setError] = useState<CobaltError>();

	const dismissErrorModal = useCallback(() => {
		setIsErrorModalShown(false);
		setError(undefined);
	}, []);

	const displayModalForError = useCallback((capturedError: CobaltError) => {
		setIsErrorModalShown(true);
		setError(capturedError);

		Sentry.captureException(capturedError);
	}, []);

	return (
		<ErrorModalContext.Provider
			value={{
				isErrorModalShown,
				dismissErrorModal,
				displayModalForError,
				error,
			}}
		>
			{props.children}
		</ErrorModalContext.Provider>
	);
};

export { ErrorModalContext, ErrorModalProvider };
