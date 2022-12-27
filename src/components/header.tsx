import React, { FC, useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import Menu from '@/components/menu';
import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';

import { ReactComponent as MenuIcon } from '@/assets/icons/menu.svg';
import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-small-text.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import mediaQueries from '@/jss/media-queries';
import useAnalytics from '@/hooks/use-analytics';
import { CrisisAnalyticsEvent } from '@/contexts/analytics-context';

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
		borderBottom: `1px solid ${theme.colors.n100}`,
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
	inCrisisButton: {
		display: 'flex',
		alignItems: 'center',
	},
	menuIcon: {
		'& path': {
			fill: theme.colors.p500,
		},
	},
	phoneIcon: {
		marginRight: 4,
	},
}));

interface HeaderProps {
	showHeaderButtons?: boolean;
}

const Header: FC<HeaderProps> = ({ showHeaderButtons = true }) => {
	const { account } = useAccount();
	const classes = useHeaderStyles();
	const { openInCrisisModal } = useInCrisisModal();
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const { trackEvent } = useAnalytics();

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
		trackEvent(CrisisAnalyticsEvent.clickCrisisHeader());
		openInCrisisModal();
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
				{showHeaderButtons && (
					<Button className={classes.inCrisisButton} size="sm" onClick={handleInCrisisButtonClick}>
						<PhoneIcon className={classes.phoneIcon} />
						<small className="fw-bold">In Crisis?</small>
					</Button>
				)}
			</header>
		</>
	);
};

export default Header;
