import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import Color from 'color';

import useAccount from '@/hooks/use-account';

import config from '@/lib/config';
import { accountService } from '@/lib/services';

import { ReactComponent as UpChevron } from '@/assets/icons/icon-chevron-up.svg';
import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as HipaaLogo } from '@/assets/logos/logo-hipaa.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useMenuStyles = createUseThemedStyles((theme) => ({
	menu: {
		top: 0,
		left: 0,
		bottom: 0,
		zIndex: 5,
		width: '100%',
		maxWidth: 375,
		position: 'fixed',
		backgroundColor: theme.colors.n0,

		display: 'flex',
		overflowY: 'auto',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	overlay: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 3,
		cursor: 'pointer',
		position: 'fixed',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	closeIcon: {
		width: 24,
		height: 24,
		cursor: 'pointer',
		'& polygon': {
			fill: theme.colors.n900,
		},
		'&:focus': {
			outline: 'none',
		},
	},
	menuHeader: {
		width: '100%',
		display: 'flex',
		padding: '16px 20px',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	collapseButton: {
		border: 0,
		width: '100%',
		display: 'flex',
		textAlign: 'left',
		appearance: 'none',
		padding: '16px 20px',
		alignItems: 'center',
		color: theme.colors.n500,
		textTransform: 'uppercase',
		backgroundColor: 'transparent',
		justifyContent: 'space-between',
		borderTop: `1px solid ${theme.colors.border}`,
		...theme.fonts.small,
		...theme.fonts.bodyBold,
		'&:hover': {
			backgroundColor: Color(theme.colors.border).alpha(0.24).string(),
		},
		'&:focus': {
			outline: 'none',
		},
	},
	collapseOuter: {
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	menuList: {
		margin: 0,
		padding: 0,
		display: 'block',
		listStyle: 'none',
		overflow: 'hidden',
		'& li a': {
			display: 'block',
			padding: '16px 20px',
			textDecoration: 'none',
		},
	},
	mainMenuList: {
		'& li a': {
			...theme.fonts.default,
			color: theme.colors.n900,
		},
	},
	subMenuList: {
		'& li a': {
			...theme.fonts.small,
			color: theme.colors.n500,
			textTransform: 'uppercase',
		},
	},
	menuFooter: {
		width: '100%',
		display: 'flex',
		padding: '32px 20px',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	signOutButton: {
		display: 'block',
		padding: '8px 0 !important',
		color: `${theme.colors.n900} !important`,
		backgroundColor: 'transparent !important',
		borderBottom: `1px solid ${theme.colors.n300} !important`,
	},
	hipaaLogo: {
		'& path': {
			fill: theme.colors.p500,
		},
	},
	'@global': {
		'.menu-animation-enter': {
			transform: 'translateX(-100%)',
		},
		'.menu-animation-enter-active': {
			transform: 'translateX(0)',
			transition: 'transform 200ms',
		},
		'.menu-animation-exit': {
			transform: 'translateX(0)',
		},
		'.menu-animation-exit-active': {
			transform: 'translateX(-100%)',
			transition: 'transform 200ms',
		},
		'.overlay-animation-enter': {
			opacity: 0,
		},
		'.overlay-animation-enter-active': {
			opacity: 1,
			transition: 'opacity 200ms',
		},
		'.overlay-animation-exit': {
			opacity: 1,
		},
		'.overlay-animation-exit-active': {
			opacity: 0,
			transition: 'opacity 200ms',
		},
	},
}));

interface MenuProps {
	open: boolean;
	onHide(): void;
}

const Menu: FC<MenuProps> = ({ open, onHide }) => {
	const { account, institution, institutionCapabilities, setAccount, signOutAndClearContext } = useAccount();
	const classes = useMenuStyles();
	const [personalMenuIsOpen, setPersonalMenuIsOpen] = useState(true);
	const [adminMenuIsOpen, setAdminMenuIsOpen] = useState(true);

	function handleOverlayClick() {
		onHide();
	}

	function handleCloseButtonClick() {
		onHide();
	}

	function handleLinkClick() {
		onHide();
	}

	function handleSignOutLinkClick(event: React.MouseEvent<HTMLAnchorElement>) {
		event.preventDefault();

		onHide();
		signOutAndClearContext();
	}

	// const isImmediate = Cookies.get('immediateAccess');
	// const accountIsReady = isImmediate || account?.completedIntroAssessment;

	// fetch account on "open" to have most up-to-date "capabilities"
	const accountId = account?.accountId;
	useEffect(() => {
		if (accountId && open) {
			accountService
				.account(accountId)
				.fetch()
				.then((response) => {
					setAccount(response.account);
				});
		}
	}, [accountId, open, setAccount]);

	const cobaltOptions = () => (
		<>
			<button
				className={classes.collapseButton}
				onClick={() => {
					setPersonalMenuIsOpen(!personalMenuIsOpen);
				}}
			>
				Personal
				{personalMenuIsOpen && <UpChevron />}
				{!personalMenuIsOpen && <DownChevron />}
			</button>

			<Collapse in={personalMenuIsOpen}>
				<ul className={classNames(classes.menuList, classes.mainMenuList)}>
					<li>
						<Link to="/" onClick={handleLinkClick}>
							Home
						</Link>
					</li>
					{institution?.supportEnabled && (
						<li>
							<Link to="/connect-with-support" onClick={handleLinkClick}>
								Connect with Support
							</Link>
						</li>
					)}
					<li>
						<Link to="/my-calendar" onClick={handleLinkClick}>
							My Calendar
						</Link>
					</li>
					{account?.roleId === 'PROVIDER' ? (
						<li>
							<Link to="/scheduling" onClick={handleLinkClick}>
								My Schedule
							</Link>
						</li>
					) : null}
					<li>
						<Link to="/in-the-studio" onClick={handleLinkClick}>
							In the Studio
						</Link>
					</li>
					<li>
						<Link to="/on-your-time" onClick={handleLinkClick}>
							On Your Time
						</Link>
					</li>
					<li>
						<Link to="/in-crisis" onClick={handleLinkClick}>
							Crisis Resources
						</Link>
					</li>
					<li>
						<Link to="/covid-19-resources" onClick={handleLinkClick}>
							Covid-19 Resources
						</Link>
					</li>
					<li>
						<Link to="/well-being-resources" onClick={handleLinkClick}>
							Well-Being Resources
						</Link>
					</li>
					{config.COBALT_WEB_PROVIDER_MANAGEMENT_FEATURE === 'true' && account?.providerId && (
						<li>
							<Link to={`/providers/${account?.providerId}/profile`} onClick={handleLinkClick}>
								Provider Profile
							</Link>
						</li>
					)}
				</ul>
			</Collapse>
			{(institutionCapabilities?.viewNavAdminMyContent ||
				institutionCapabilities?.viewNavAdminAvailableContent ||
				institutionCapabilities?.viewNavAdminGroupSession ||
				institutionCapabilities?.viewNavAdminGroupSessionRequest) && (
				<>
					<button
						className={classes.collapseButton}
						onClick={() => {
							setAdminMenuIsOpen(!adminMenuIsOpen);
						}}
					>
						Admin
						{adminMenuIsOpen && <UpChevron />}
						{!adminMenuIsOpen && <DownChevron />}
					</button>
					<div className={classes.collapseOuter}>
						<Collapse in={adminMenuIsOpen}>
							<ul className={classNames(classes.menuList, classes.mainMenuList)}>
								<li>
									<Link to="/stats-dashboard" onClick={handleLinkClick}>
										Stats Dashboard
									</Link>
								</li>
								{institutionCapabilities?.viewNavAdminMyContent && (
									<li>
										<Link to="/cms/on-your-time" onClick={handleLinkClick}>
											On Your Time - My Content
										</Link>
									</li>
								)}
								{institutionCapabilities?.viewNavAdminAvailableContent && (
									<li>
										<Link to="/cms/available-content" onClick={handleLinkClick}>
											On Your Time - Available Content
										</Link>
									</li>
								)}
								{institutionCapabilities?.viewNavAdminGroupSession && (
									<li>
										<Link to="/group-sessions/scheduled" onClick={handleLinkClick}>
											Studio Sessions - Scheduled
										</Link>
									</li>
								)}
								{institutionCapabilities?.viewNavAdminGroupSessionRequest && (
									<li>
										<Link to="/group-sessions/by-request" onClick={handleLinkClick}>
											Studio Sessions - By Request
										</Link>
									</li>
								)}
							</ul>
						</Collapse>
					</div>
				</>
			)}
			<ul className={classNames(classes.menuList, classes.subMenuList)}>
				<li>
					<Link to="/privacy" onClick={handleLinkClick}>
						Privacy
					</Link>
				</li>

				<li>
					<Link to="/#" onClick={handleSignOutLinkClick}>
						Sign Out
					</Link>
				</li>
			</ul>
		</>
	);

	return (
		<>
			<CSSTransition in={open} timeout={200} classNames="menu-animation" unmountOnExit={true}>
				<div className={classes.menu}>
					<div>
						<div className={classes.menuHeader}>
							<CloseIcon tabIndex={0} className={classes.closeIcon} onClick={handleCloseButtonClick} />
							<div className="text-end">
								<h5 className="mb-0">{account?.displayName}</h5>
							</div>
						</div>
						{cobaltOptions()}
					</div>
					<div className={classes.menuFooter}>
						<div>
							<small>
								<Link to="/feedback" onClick={handleLinkClick}>
									Submit Feedback
								</Link>
							</small>
							<small>&copy; {new Date().getFullYear()} Cobalt Platform</small>
						</div>

						<HipaaLogo className={classes.hipaaLogo} />
					</div>
				</div>
			</CSSTransition>
			<CSSTransition
				in={open}
				timeout={200}
				classNames="overlay-animation"
				onClick={handleOverlayClick}
				unmountOnExit={true}
			>
				<div className={classes.overlay} />
			</CSSTransition>
		</>
	);
};

export default Menu;
