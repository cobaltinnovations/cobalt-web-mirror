import React, { FC, useState, useContext, useRef, useEffect, useCallback } from 'react';

import { HeaderContext } from '@/contexts/header-context';

import Menu from '@/components/menu';
import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';

import { ReactComponent as MenuIcon } from '@/assets/icons/menu.svg';
import { ReactComponent as CrisisIcon } from '@/assets/icons/icon-crisis.svg';
import { createUseThemedStyles } from '@/jss/theme';

const headerButton = {
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
};

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
		backgroundColor: theme.colors.primary,
	},
	headerTitle: {
		...theme.fonts.m,
		overflow: 'hidden',
		textAlign: 'center',
		color: theme.colors.white,
		whiteSpace: 'nowrap',
		...theme.fonts.primaryBold,
		textOverflow: 'ellipsis',
		maxWidth: 'calc(100% - 160px)',
	},
	menuButton: {
		...headerButton,
		left: 0,
	},
	inCrisisButton: {
		...headerButton,
		right: 0,
		width: 80,
		paddingTop: 1,
		color: theme.colors.white,
		whiteSpace: 'nowrap',
		flexDirection: 'column',
		'& small': {
			fontSize: '1.2rem',
			lineHeight: '1.2rem',
		},
	},
	menuIcon: {
		'& path': {
			fill: theme.colors.white,
		},
	},
	crisisIcon: {
		marginBottom: 3,
		'& path': {
			fill: theme.colors.white,
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
					<div tabIndex={0} className={classes.inCrisisButton} onClick={handleInCrisisButtonClick}>
						<CrisisIcon className={classes.crisisIcon} />
						<small className="font-secondary-bold">In Crisis?</small>
					</div>
				)}
			</header>
		</>
	);
};

export default Header;
