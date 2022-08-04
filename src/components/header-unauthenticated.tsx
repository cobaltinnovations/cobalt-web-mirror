import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as Logo } from '@/assets/logos/logo-cobalt-horizontal.svg';
import { Link } from 'react-router-dom';

const useHeaderStyles = createUseThemedStyles((theme) => ({
	header: {
		top: 0,
		left: 0,
		right: 0,
		zIndex: 4,
		height: 54,
		display: 'flex',
		position: 'fixed',
		padding: '0 40px',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		[mediaQueries.lg]: {
			padding: '0 20px',
		},
	},
}));

const HeaderUnauthenticated = () => {
	const classes = useHeaderStyles();
	const header = useRef<HTMLElement>(null);

	const handleWindowResize = useCallback(() => {
		setBodyPadding();
	}, []);

	function setBodyPadding() {
		if (!header.current) {
			document.body.style.paddingTop = '0px';
			return;
		}

		const headerHeight = header.current.clientHeight;
		document.body.style.paddingTop = `${headerHeight}px`;
	}

	useEffect(() => {
		setBodyPadding();
		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [handleWindowResize]);

	return (
		<header ref={header} className={classes.header}>
			<Link className="d-block" to="/sign-in">
				<Logo className="text-primary d-block" />
			</Link>
		</header>
	);
};

export default HeaderUnauthenticated;
