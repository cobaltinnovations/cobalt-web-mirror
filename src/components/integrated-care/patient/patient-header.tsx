import React, { useCallback, useEffect, useRef } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { createUseThemedStyles } from '@/jss/theme';

import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import useAnalytics from '@/hooks/use-analytics';
import { CrisisAnalyticsEvent } from '@/contexts/analytics-context';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-cobalt-horizontal.svg';
import { ReactComponent as AvatarIcon } from '@/assets/icons/icon-avatar.svg';

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		top: 0,
		left: 0,
		right: 0,
		zIndex: 4,
		height: 56,
		display: 'flex',
		padding: '0 40px',
		position: 'fixed',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
}));

export const PatientHeader = () => {
	const classes = useStyles();
	const { signOutAndClearContext } = useAccount();
	const { openInCrisisModal } = useInCrisisModal();
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
			document.body.style.paddingTop = '0px';
		};
	}, [handleWindowResize]);

	function handleInCrisisButtonClick() {
		trackEvent(CrisisAnalyticsEvent.clickCrisisHeader());
		openInCrisisModal();
	}

	return (
		<header ref={header} className={classes.header}>
			<LogoSmallText className="text-primary" />
			<div className="d-flex align-items-center justify-content-between">
				<Button className="py-1 d-flex align-items-center" size="sm" onClick={handleInCrisisButtonClick}>
					<PhoneIcon className="me-1" />
					<small className="fw-bold">In Crisis?</small>
				</Button>
				<Dropdown className="ms-4 d-flex align-items-center">
					<Dropdown.Toggle as={DropdownToggle} id="mhic-header__dropdown-menu" className="p-0">
						<AvatarIcon className="d-flex" />
					</Dropdown.Toggle>
					<Dropdown.Menu
						as={DropdownMenu}
						align="end"
						flip={false}
						popperConfig={{ strategy: 'fixed' }}
						renderOnMount
					>
						<Dropdown.Item
							onClick={() => {
								signOutAndClearContext();
							}}
						>
							<span className="text-danger">Sign Out</span>
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			</div>
		</header>
	);
};
