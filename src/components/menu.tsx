import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, To } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import classNames from 'classnames';

import useAccount from '@/hooks/use-account';

import { AccountInstitutionCapabilities, AccountModel, Institution } from '@/lib/models';
import { accountService } from '@/lib/services';

import { ReactComponent as HomeIcon } from '@/assets/icons/icon-home.svg';
import { ReactComponent as EditCalendarIcon } from '@/assets/icons/icon-edit-calendar.svg';
import { ReactComponent as EventIcon } from '@/assets/icons/icon-event.svg';
import { ReactComponent as AdminIcon } from '@/assets/icons/icon-admin.svg';
import { ReactComponent as ConnectWithSupportIcon } from '@/assets/icons/icon-connect-with-support.svg';
import { ReactComponent as OnYourTimeIcon } from '@/assets/icons/icon-on-your-time.svg';
import { ReactComponent as SpacesOfColorIcon } from '@/assets/icons/icon-spaces-of-color.svg';
import { ReactComponent as GroupSessionsIcon } from '@/assets/icons/icon-group-sessions.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';

import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import { ReactComponent as LeftChevron } from '@/assets/icons/icon-chevron-left.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { createUseThemedStyles } from '@/jss/theme';
import { isEqual } from 'lodash';
import { AnalyticsEvent, CrisisAnalyticsEvent, MainNavAnalyticsEvent } from '@/contexts/analytics-context';
import useAnalytics from '@/hooks/use-analytics';
import { exploreLinks } from '@/menu-links';

const useMenuStyles = createUseThemedStyles((theme) => ({
	menu: {
		top: 0,
		left: 0,
		bottom: 0,
		zIndex: 6,
		width: '100%',
		maxWidth: 286,
		position: 'fixed',
		backgroundColor: theme.colors.n0,
		overflow: 'hidden',
	},
	menuWrapper: {
		position: 'absolute',
		top: 0,
		right: 0,
		left: 0,
		bottom: 0,
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
		zIndex: 5,
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
		flexDirection: 'column',
		padding: '16px 20px 0',
	},
	subNavHeader: {
		padding: '16px 20px',
	},
	menuContent: {
		flex: 1,
		overflowY: 'scroll',
	},
	sectionHeader: {
		padding: '8px 20px',
		backgroundColor: theme.colors.n50,
		borderTop: `1px solid ${theme.colors.n100}`,
		borderBottom: `1px solid ${theme.colors.n100}`,
		...theme.fonts.uiSmall,
		...theme.fonts.bodyBold,
		color: theme.colors.n500,
	},
	menuList: {
		margin: 0,
		padding: 0,
		display: 'block',
		listStyle: 'none',
		overflow: 'hidden',
		'& li a': {
			display: 'flex',
			padding: '14px 20px',
			alignItems: 'center',
			textDecoration: 'none',
			'& svg': {
				marginRight: 16,
				color: theme.colors.p300,
			},
			'&:hover': {
				textDecoration: 'underline',
			},
		},
	},
	subMenuList: {
		'& li a': {
			...theme.fonts.default,
			...theme.fonts.bodyBold,
			color: theme.colors.n900,
		},
	},
	supplementalMenuList: {
		'& li a': {
			...theme.fonts.default,
			...theme.fonts.bodyNormal,
			color: theme.colors.n500,
		},
	},
	menuFooter: {
		borderTop: `1px solid ${theme.colors.border}`,
		width: '100%',
		display: 'flex',
		padding: '16px 20px',
		alignItems: 'center',
		justifyContent: 'space-between',
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
		'.menu-slide-left-enter': {
			transform: 'translateX(-100%)',
		},
		'.menu-slide-left-enter-active': {
			transform: 'translateX(0)',
		},
		'.menu-slide-left-exit': {
			transform: 'translateX(0)',
		},
		'.menu-slide-left-exit-active': {
			transform: 'translateX(-100%)',
		},
		'.menu-slide-right-enter': {
			transform: 'translateX(100%)',
		},
		'.menu-slide-right-enter-active': {
			transform: 'translateX(0)',
		},
		'.menu-slide-right-exit': {
			transform: 'translateX(0)',
		},
		'.menu-slide-right-exit-active': {
			transform: 'translateX(100%)',
		},
		[`.menu-slide-right-enter-active, .menu-slide-left-enter-active,
		.menu-slide-right-exit-active, .menu-slide-left-exit-active`]: {
			transition: 'transform 270ms ease',
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

interface MenuNavContext {
	account?: AccountModel;
	institution?: Institution;
	institutionCapabilities?: AccountInstitutionCapabilities;
}

interface MenuNavSection {
	title?: string;
	items: (ctx: MenuNavContext) => MenuNavItem[] | null;
}

interface MenuNavItem {
	label: string;
	icon: ReactNode;
	testId?: string;
	analyticsEvent?: () => AnalyticsEvent;
	to?: (ctx: MenuNavContext) => To | null;
	subNavSections?: (ctx: MenuNavContext) => MenuNavSection[] | null;
}

const AdditionalNavigationItemIcon = ({ iconName }: { iconName: string }) => {
	switch (iconName) {
		case 'diversity_1':
			return <SpacesOfColorIcon />;
		default:
			return <AdminIcon />;
	}
};

const ADMIN_MENU_SECTIONS: MenuNavSection[] = [
	{
		title: 'Content Management',
		items: (context) => [
			{
				testId: 'menuLinkAdminMyContent',
				label: 'My Content',
				icon: <AdminIcon />,
				to: ({ institutionCapabilities }) =>
					institutionCapabilities?.viewNavAdminMyContent ? '/cms/on-your-time' : null,
			},
			{
				testId: 'menuLinkAdminAvailableContent',
				label: 'Available Content',
				icon: <AdminIcon />,
				to: ({ institutionCapabilities }) =>
					institutionCapabilities?.viewNavAdminAvailableContent ? '/cms/available-content' : null,
			},
		],
	},
	{
		title: 'Group Session Management',
		items: () => [
			{
				testId: 'menuLinkAdminScheduledGroupSessions',
				label: 'Scheduled',
				icon: <AdminIcon />,
				to: ({ institutionCapabilities }) =>
					institutionCapabilities?.viewNavAdminGroupSession ? '/group-sessions/scheduled' : null,
			},
			// {
			// 	testId: 'menuLinkAdminByRequestGroupSessions',
			// 	label: 'By Request',
			// 	icon: <AdminIcon />,
			// 	to: ({ institutionCapabilities }) =>
			// 		institutionCapabilities?.viewNavAdminGroupSessionRequest ? '/group-sessions/by-request' : null,
			// },
		],
	},
	{
		title: 'Reporting',
		items: () => [
			{
				testId: 'menuLinkAdminReports',
				label: 'Provider Reports',
				icon: <AdminIcon />,
				to: ({ institutionCapabilities }) =>
					institutionCapabilities?.viewNavAdminReports ? '/admin/reports' : null,
			},
		],
	},
];

const MENU_SECTIONS: MenuNavSection[] = [
	{
		items: () => [
			{
				testId: 'menuLinkHome',
				label: 'Home',
				icon: <HomeIcon />,
				to: () => '/',
			},
			// {
			// 	testId: 'menuLinkProviderProfile',
			// 	label: 'Provider Profile',
			// 	icon: <></>,
			// 	to: ({ account }) => config.COBALT_WEB_PROVIDER_MANAGEMENT_FEATURE === 'true' && account?.providerId ?`/providers/${account?.providerId}/profile` : null
			// },
			{
				testId: 'menuLinkScheduling',
				label: 'Patient Scheduling',
				icon: <EditCalendarIcon />,
				to: ({ account }) => (account?.providerId ? '/scheduling' : null),
			},

			{
				testId: 'menuLinkEvents',
				label: 'My Events',
				icon: <EventIcon />,
				to: () => '/my-calendar',
			},
			{
				testId: 'menuLinkAdmin',
				label: 'Admin',
				icon: <AdminIcon />,
				subNavSections: ({ institutionCapabilities }) =>
					institutionCapabilities?.viewNavAdminMyContent ||
					institutionCapabilities?.viewNavAdminAvailableContent ||
					institutionCapabilities?.viewNavAdminGroupSession ||
					institutionCapabilities?.viewNavAdminGroupSessionRequest ||
					institutionCapabilities?.viewNavAdminReports
						? ADMIN_MENU_SECTIONS
						: null,
			},
		],
	},
	{
		title: 'Connect',
		items: () => [
			{
				testId: 'menuLinkConnectWithSupport',
				label: 'Connect with Support',
				icon: <ConnectWithSupportIcon />,
				to: ({ institution }) => (institution?.supportEnabled ? '/connect-with-support' : null),
			},
			{
				testId: 'menuLinkGroupSessions',
				label: 'Group Sessions',
				icon: <GroupSessionsIcon />,
				to: () => '/in-the-studio',
			},
			{
				testId: 'menuLinkCrisisResources',
				label: 'Crisis Resources',
				icon: <PhoneIcon />,
				analyticsEvent: () => CrisisAnalyticsEvent.clickCrisisMenu(),
				to: () => '/in-crisis',
			},
		],
	},
	{
		title: 'Explore',
		items: (context) => {
			const additionalLinks = (context?.institution?.additionalNavigationItems ?? []).map(
				(additionalNavigationItem, index) => {
					return {
						testId: `menuLink-additionalItem${index}`,
						label: additionalNavigationItem.name,
						icon: <AdditionalNavigationItemIcon iconName={additionalNavigationItem.iconName} />,
						to: () => additionalNavigationItem.url,
					};
				}
			);

			return [
				{
					testId: 'menuLinkResourceLibrary',
					label: 'Resource Library',
					icon: <OnYourTimeIcon />,
					to: () => '/resource-library',
				},
				...additionalLinks,
				...exploreLinks,
			];
		},
	},
];

const Menu: FC<MenuProps> = ({ open, onHide }) => {
	const { account, setAccount } = useAccount();
	const classes = useMenuStyles();
	const [menuSections, setMenuSections] = useState(MENU_SECTIONS);

	function handleOverlayClick() {
		onHide();
	}

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

	const isSubNav = useMemo(() => {
		return !isEqual(menuSections, MENU_SECTIONS);
	}, [menuSections]);

	return (
		<>
			<CSSTransition in={open} timeout={200} classNames="menu-animation" unmountOnExit={true}>
				<div className={classes.menu}>
					<TransitionGroup component={null}>
						<CSSTransition
							key={isSubNav ? 'sub-menu' : 'main-menu'}
							addEndListener={(node, done) => {
								node.addEventListener('transitionend', done, false);
							}}
							classNames={isSubNav ? 'menu-slide-right' : 'menu-slide-left'}
						>
							<CobaltMenu
								sections={menuSections}
								isSubNav={isSubNav}
								onHide={onHide}
								onSubNav={(subNav) => {
									setMenuSections(subNav);
								}}
							/>
						</CSSTransition>
					</TransitionGroup>
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

interface CobaltMenuProps {
	sections: MenuNavSection[];
	isSubNav: boolean;
	onHide: () => void;
	onSubNav: (subSections: MenuNavSection[]) => void;
}

const CobaltMenu = ({ sections, isSubNav, onHide, onSubNav }: CobaltMenuProps) => {
	const classes = useMenuStyles();
	const { account, institution, institutionCapabilities, signOutAndClearContext } = useAccount();
	const { mixpanel, trackEvent } = useAnalytics();

	function handleSignOutLinkClick(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();

		onHide();
		signOutAndClearContext();
	}

	return (
		<div className={classNames(classes.menuWrapper, 'pb-6')}>
			<div
				className={classNames(classes.menuHeader, {
					[classes.subNavHeader]: isSubNav,
				})}
			>
				{isSubNav ? (
					<LeftChevron
						tabIndex={0}
						className={classes.closeIcon}
						onClick={() => {
							onSubNav(MENU_SECTIONS);
						}}
					/>
				) : (
					<CloseIcon tabIndex={0} className={classes.closeIcon} onClick={onHide} />
				)}

				{!isSubNav && (
					<>
						<div className="my-4">
							<h5 data-testid="menuAccountDisplayNameText" className="mb-0">
								{account?.displayName ?? 'Anonymous'}
							</h5>

							{institution?.requireConsentForm && (
								<Link
									to="/user-settings"
									className="d-block mt-1 fs-default fw-normal"
									onClick={onHide}
								>
									Profile
								</Link>
							)}
						</div>
						<hr />
					</>
				)}
			</div>

			<div className={classes.menuContent}>
				{sections.map((section, index) => {
					const ctx = { account, institution, institutionCapabilities };
					const items = section.items(ctx);

					if (items === null) {
						return null;
					}

					return (
						<React.Fragment key={index}>
							{section.title && <div className={classes.sectionHeader}>{section.title}</div>}

							<ul className={classNames(classes.menuList, classes.subMenuList, 'my-2')}>
								{items.map((item, itemIndex) => {
									const to = item.to?.(ctx);
									const subNavSections = item.subNavSections?.(ctx);
									const hasSubNav = Array.isArray(subNavSections);

									if (to === null || subNavSections === null) {
										return null;
									}

									return (
										<li key={itemIndex}>
											<Link
												to={to || ''}
												onClick={(event) => {
													trackEvent(MainNavAnalyticsEvent.clickMainNavItem(item.label));

													mixpanel.track('Main Navigation Click', {
														'Navigation Item Title': item.label,
													});

													const analyticsEvent = item.analyticsEvent?.();
													if (analyticsEvent) {
														trackEvent(analyticsEvent);
													}

													if (hasSubNav) {
														event.preventDefault();
														onSubNav(subNavSections);
													} else {
														onHide();
													}
												}}
											>
												{item.icon}

												{item.label}

												{hasSubNav && <RightChevron className="ms-auto me-0" />}
											</Link>
										</li>
									);
								})}
							</ul>
						</React.Fragment>
					);
				})}

				{!isSubNav && (
					<>
						<hr className="mx-5 mb-4" />

						<ul className={classNames(classes.menuList, classes.supplementalMenuList, 'mb-4')}>
							<li>
								<Link to="/privacy" onClick={onHide}>
									Privacy
								</Link>
							</li>
							{institution?.contactUsEnabled && (
								<li>
									<Link to="/feedback" onClick={onHide}>
										Contact us
									</Link>
								</li>
							)}
						</ul>

						<div className="px-5">
							<Button
								className="d-block w-100"
								variant="outline-primary"
								onClick={handleSignOutLinkClick}
							>
								Sign out
							</Button>
						</div>
					</>
				)}
			</div>

			{/* {!isSubNav && (
				<div className={classes.menuFooter}>
					<div className="text-center">
						<Link to="/feedback" onClick={onHide}>
							Submit Feedback
						</Link>
					</div>

					<HipaaLogo className={classes.hipaaLogo} />
				</div>
			)} */}
		</div>
	);
};

export default Menu;
