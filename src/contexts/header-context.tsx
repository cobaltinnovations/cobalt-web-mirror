import React, { FC, createContext, useState, ReactElement, useCallback } from 'react';
import { createUseStyles } from 'react-jss';

import { ReactComponent as LogoText } from '@/assets/logos/logo-text.svg';
import colors from '@/jss/colors';

const useLogoTextStyles = createUseStyles({
	logoText: {
		display: 'block',
		'& path': {
			fill: colors.white,
		},
	},
});

const LogoTextStyled = () => {
	const classes = useLogoTextStyles();
	return <LogoText className={classes.logoText} />;
};

type HeaderContextConfig = {
	title: ReactElement | string;
	setTitle: React.Dispatch<React.SetStateAction<ReactElement | string>>;
	resetTitle(): void;
};

const HeaderContext = createContext({} as HeaderContextConfig);

const HeaderProvider: FC = (props) => {
	const [title, setTitle] = useState<ReactElement | string>(<LogoTextStyled />);

	const resetTitle = useCallback(() => {
		setTitle(<LogoTextStyled />);
	}, []);

	const value = {
		title,
		setTitle,
		resetTitle,
	};

	return <HeaderContext.Provider value={value}>{props.children}</HeaderContext.Provider>;
};

const HeaderConsumer = HeaderContext.Consumer;

export { HeaderContext, HeaderProvider, HeaderConsumer };
