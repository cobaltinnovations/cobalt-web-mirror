import React, { FC, createContext, useState, PropsWithChildren } from 'react';

type ReauthModalContextConfig = {
	showReauthModal: boolean;
	setShowReauthModal: React.Dispatch<React.SetStateAction<boolean>>;
	signOnUrl: string;
	setSignOnUrl: React.Dispatch<React.SetStateAction<string>>;
};

const ReauthModalContext = createContext({} as ReauthModalContextConfig);

const ReauthModalProvider: FC<PropsWithChildren> = (props) => {
	const [showReauthModal, setShowReauthModal] = useState(false);
	const [signOnUrl, setSignOnUrl] = useState('/sign-in');

	const value = {
		showReauthModal,
		setShowReauthModal,
		signOnUrl,
		setSignOnUrl,
	};

	return <ReauthModalContext.Provider value={value}>{props.children}</ReauthModalContext.Provider>;
};

const ReauthModalConsumer = ReauthModalContext.Consumer;

export { ReauthModalContext, ReauthModalProvider, ReauthModalConsumer };
