import React, { FC, useRef, useEffect, useCallback } from 'react';

import { createUseThemedStyles } from '@/jss/theme';

const useFooterStyles = createUseThemedStyles((theme) => ({
	footer: {
		left: 0,
		bottom: 0,
		width: '100%',
		position: 'absolute',

		height: 6,
		color: 'white',
		backgroundColor: theme.colors.a300,
	},
}));

const Footer: FC = () => {
	const classes = useFooterStyles();
	const footer = useRef<HTMLElement | null>(null);

	const handleWindowResize = useCallback(() => {
		setBodyPadding();
	}, []);

	useEffect(() => {
		setBodyPadding();
		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [handleWindowResize]);

	function setBodyPadding() {
		if (!footer.current) return;

		const footerHeight = footer.current.clientHeight;
		document.body.style.paddingBottom = `${footerHeight}px`;
	}

	return <footer ref={footer} className={classes.footer} />;
};

export default Footer;
