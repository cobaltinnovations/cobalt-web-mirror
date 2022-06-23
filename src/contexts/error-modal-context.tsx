import { ErrorConfig } from '@/lib/http-client';
import React, { FC, createContext, useState, PropsWithChildren } from 'react';

type ErrorModalContextConfig = {
	show: boolean;
	setShow: React.Dispatch<React.SetStateAction<boolean>>;
	error: ErrorConfig | undefined;
	setError: React.Dispatch<React.SetStateAction<ErrorConfig | undefined>>;
};

const ErrorModalContext = createContext({} as ErrorModalContextConfig);

const ErrorModalProvider: FC<PropsWithChildren> = (props) => {
	const [show, setShow] = useState(false);
	const [error, setError] = useState<ErrorConfig>();

	const value = {
		show,
		setShow,
		error,
		setError,
	};

	return <ErrorModalContext.Provider value={value}>{props.children}</ErrorModalContext.Provider>;
};

const ErrorModalConsumer = ErrorModalContext.Consumer;

export { ErrorModalContext, ErrorModalProvider, ErrorModalConsumer };
