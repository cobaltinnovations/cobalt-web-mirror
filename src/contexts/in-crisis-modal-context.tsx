import React, { FC, createContext, useState, PropsWithChildren } from 'react';

type InCrisisModalContextConfig = {
	show: boolean;
	setShow: React.Dispatch<React.SetStateAction<boolean>>;
	isCall: boolean;
	setIsCall: React.Dispatch<React.SetStateAction<boolean>>;
};

const InCrisisModalContext = createContext({} as InCrisisModalContextConfig);

const InCrisisModalProvider: FC<PropsWithChildren> = (props) => {
	const [show, setShow] = useState(false);
	const [isCall, setIsCall] = useState(false);

	const value = {
		show,
		setShow,
		isCall,
		setIsCall,
	};

	return <InCrisisModalContext.Provider value={value}>{props.children}</InCrisisModalContext.Provider>;
};

const InCrisisModalConsumer = InCrisisModalContext.Consumer;

export { InCrisisModalContext, InCrisisModalProvider, InCrisisModalConsumer };
