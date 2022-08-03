import React, { FC, useState, useContext, useRef, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';

import { HeaderContext } from '@/contexts/header-context';

import Menu from '@/components/menu';
import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';

import { ReactComponent as MenuIcon } from '@/assets/icons/menu.svg';
import { ReactComponent as CrisisIcon } from '@/assets/icons/icon-crisis.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useHeaderStyles = createUseThemedStyles((theme) => ({
	header: {
		top: 0,
		left: 0,
		right: 0,
		zIndex: 4,
		height: 54,
		display: 'flex',
		position: 'fixed',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.n0,
	},
	headerTitle: {
		...theme.fonts.large,
		overflow: 'hidden',
		textAlign: 'center',
		color: theme.colors.p500,
		whiteSpace: 'nowrap',
		...theme.fonts.headingBold,
		textOverflow: 'ellipsis',
		maxWidth: 'calc(100% - 160px)',
	},
	menuButton: {
		left: 0,
		top: '50%',
		width: 64,
		height: 54,
		display: 'flex',
		cursor: 'pointer',
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		transform: 'translateY(-50%)',
		'&:hover': {
			backgroundColor: 'rgba(255,255,255,0.12)',
		},
	},
	inCrisisButton: {
		right: 20,
		top: '50%',
		display: 'flex',
		alignItems: 'center',
		position: 'absolute',
		transform: 'translateY(-50%)',
	},
	menuIcon: {
		'& path': {
			fill: theme.colors.p500,
		},
	},
	crisisIcon: {
		marginRight: 4,
		'& path': {
			fill: theme.colors.p500,
		},
	},
}));

interface HeaderProps {
	showHeaderButtons?: boolean;
}

const Header: FC<HeaderProps> = ({ showHeaderButtons = true }) => {
	const { account } = useAccount();
	const { title } = useContext(HeaderContext);
	const classes = useHeaderStyles();
	const { openInCrisisModal } = useInCrisisModal();
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
	}, [account]);

	/* ----------------------------------------------------------- */
	/* Button handlers */
	/* ----------------------------------------------------------- */
	function handleMenuButtonClick() {
		setMenuOpen(true);
	}

	function handleInCrisisButtonClick() {
		openInCrisisModal();
	}

	function handleMenuHide() {
		setMenuOpen(false);
	}

	return (
		<>
			<Menu open={menuOpen} onHide={handleMenuHide} />

			<header ref={header} className={classes.header}>
				{showHeaderButtons && (
					<div tabIndex={0} className={classes.menuButton} onClick={handleMenuButtonClick}>
						<MenuIcon className={classes.menuIcon} />
					</div>
				)}
				<div className={classes.headerTitle}>{title}</div>
				{showHeaderButtons && (
					<Button className={classes.inCrisisButton} size="sm" onClick={handleInCrisisButtonClick}>
						<CrisisIcon className={classes.crisisIcon} />
						<small className="fw-bold">In Crisis?</small>
					</Button>
				)}
			</header>
		</>
	);
};

export default Header;
