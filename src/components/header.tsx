import React, { FC, useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import Menu from '@/components/menu';
import useAccount from '@/hooks/use-account';

import { ReactComponent as MenuIcon } from '@/assets/icons/menu.svg';
import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-small-text.svg';
import mediaQueries from '@/jss/media-queries';
import InCrisisHeaderButton from './in-crisis-header-button';

const useHeaderStyles = createUseThemedStyles((theme) => ({
	header: {
		top: 0,
		left: 0,
		right: 0,
		zIndex: 4,
		height: 54,
		display: 'flex',
		position: 'fixed',
		padding: '0 40px 0 20px',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.border}`,
		[mediaQueries.lg]: {
			padding: '0 20px 0 8px',
		},
	},
	menuButton: {
		width: 44,
		height: 44,
		display: 'flex',
		cursor: 'pointer',
		alignItems: 'center',
		justifyContent: 'center',
		'&:hover': {
			backgroundColor: 'rgba(255,255,255,0.12)',
		},
	},
	menuIcon: {
		'& path': {
			fill: theme.colors.p500,
		},
	},
	phoneIcon: {
		marginRight: 4,
	},
	'@global': {
		'.header-menu-open': {
			overflow: 'hidden',
		},
	},
}));

interface HeaderProps {
	showHeaderButtons?: boolean;
}

const Header: FC<HeaderProps> = ({ showHeaderButtons = true }) => {
	const { account } = useAccount();
	const classes = useHeaderStyles();
	const [menuOpen, setMenuOpen] = useState<boolean>(false);

	/* ----------------------------------------------------------- */
	/* Body padding for fixed header */
	/* ----------------------------------------------------------- */
	const header = useRef<HTMLElement | null>(null);

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

	useEffect(() => {
		setBodyPadding();

		return () => {
			document.body.style.paddingTop = '0px';
		};
	}, [account]);

	useEffect(() => {
		document.body.classList.toggle('header-menu-open', !!menuOpen);

		return () => {
			document.body.classList.remove('header-menu-open');
		};
	}, [menuOpen]);

	/* ----------------------------------------------------------- */
	/* Button handlers */
	/* ----------------------------------------------------------- */
	function handleMenuButtonClick() {
		setMenuOpen(true);
	}

	function handleMenuHide() {
		setMenuOpen(false);
	}

	return (
		<>
			<Menu open={menuOpen} onHide={handleMenuHide} />

			<header ref={header} className={classes.header}>
				<div className="d-flex align-items-center">
					{showHeaderButtons && (
						<div
							data-testid="headerNavMenuButton"
							tabIndex={0}
							className={classes.menuButton}
							onClick={handleMenuButtonClick}
						>
							<MenuIcon className={classes.menuIcon} />
						</div>
					)}
					<Link className="d-block" to="/">
						<LogoSmallText className="text-primary d-block" />
					</Link>
				</div>
				{showHeaderButtons && <InCrisisHeaderButton />}
			</header>
		</>
	);
};

export default Header;
