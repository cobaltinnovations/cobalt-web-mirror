import React, { useState, useRef, useEffect, useCallback, useMemo, PropsWithChildren } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { Button, Collapse, Dropdown } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';

import useAnalytics from '@/hooks/use-analytics';
import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import PathwaysIcon from '@/components/pathways-icons';

import { exploreLinks } from '@/menu-links';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { CrisisAnalyticsEvent } from '@/contexts/analytics-context';

import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down-v2.svg';
import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-cobalt-horizontal.svg';
import { ReactComponent as AvatarIcon } from '@/assets/icons/icon-avatar.svg';
import { ReactComponent as EventIcon } from '@/assets/icons/icon-event.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { ReactComponent as AdminIcon } from '@/assets/icons/icon-admin.svg';
import { ReactComponent as SpacesOfColorIcon } from '@/assets/icons/icon-spaces-of-color.svg';
import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';

const useHeaderV2Styles = createUseThemedStyles((theme) => ({
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
		'& .dropdown-menu': {
			'& svg': {
				flexShrink: 0,
				color: theme.colors.p300,
			},
			'& p': {
				whiteSpace: 'initial',
			},
		},
		[mediaQueries.lg]: {
			padding: '0 20px',
		},
	},
	desktopNav: {
		height: '100%',
		'& ul': {
			margin: 0,
			padding: 0,
			height: '100%',
			display: 'flex',
			listStyle: 'none',
			'& li': {
				position: 'relative',
				'& a:not(.dropdown-item), & .dropdown button': {
					height: '100%',
					display: 'flex',
					padding: '0 12px',
					alignItems: 'center',
					textDecoration: 'none',
					...theme.fonts.default,
					color: theme.colors.n500,
					...theme.fonts.bodyNormal,
					'&:hover': {
						color: theme.colors.p700,
						backgroundColor: 'transparent',
					},
				},
				'& .dropdown': {
					height: '100%',
					'& .dropdown-menu': {
						width: 344,
					},
				},
				'&:after': {
					left: 12,
					right: 12,
					bottom: 0,
					height: 2,
					content: '""',
					display: 'block',
					position: 'absolute',
					backgroundColor: 'transparent',
				},
				'&:first-child': {
					'& a:not(.dropdown-item), & .dropdown button': {
						paddingLeft: 0,
					},
					'&:after': {
						left: 0,
					},
				},
				'&:last-child': {
					'& a:not(.dropdown-item), & .dropdown button': {
						paddingRight: 0,
					},
					'&:after': {
						right: 0,
					},
				},
				'&.active': {
					'& a:not(.dropdown-item), & .dropdown button': {
						color: theme.colors.p700,
					},
					'&:after': {
						backgroundColor: theme.colors.p500,
					},
				},
			},
		},
		[mediaQueries.lg]: {
			display: 'none',
		},
	},
	accountDropdown: {
		width: 280,
	},
	menuButton: {
		width: 44,
		height: 44,
		padding: 0,
		alignItems: 'center',
		justifyContent: 'center',
		'& span': {
			width: 15,
			height: 2,
			flexShrink: 0,
			borderRadius: 1,
			position: 'relative',
			backgroundColor: theme.colors.p500,
			transition: 'background-color 200ms',
			'&:before, &:after': {
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				content: '""',
				borderRadius: 1,
				position: 'absolute',
				transition: 'transform 200ms',
				backgroundColor: theme.colors.p500,
			},
			'&:before': {
				transform: 'translateY(-4px)',
			},
			'&:after': {
				transform: 'translateY(4px)',
			},
		},
		'&.active span': {
			backgroundColor: 'transparent',
			'&:before': {
				transform: 'translateY(0) rotate(45deg)',
			},
			'&:after': {
				transform: 'translateY(0) rotate(-45deg)',
			},
		},
	},
	mobileNav: {
		top: 56,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 4,
		padding: 16,
		position: 'fixed',
		overflowY: 'auto',
		backgroundColor: theme.colors.n0,
		'& ul': {
			padding: 0,
			margin: '0 auto',
			listStyle: 'none',
		},
		'& a, & button': {
			padding: 12,
			borderRadius: 4,
			display: 'block',
			textDecoration: 'none',
			...theme.fonts.default,
			color: theme.colors.n900,
			'&:hover, &:focus': {
				backgroundColor: theme.colors.n50,
			},
			'&:active': {
				backgroundColor: theme.colors.n75,
			},
			'& svg': {
				flexShrink: 0,
				color: theme.colors.p300,
			},
			'& p': {
				whiteSpace: 'initial',
			},
		},
		'& button': {
			width: '100%',
			textAlign: 'left',
		},
		'& .collapse-inner': {
			padding: 16,
			borderRadius: 8,
			margin: '12px 0',
			border: `1px solid ${theme.colors.n100}`,
		},
		'& hr': {
			margin: '16px 0',
		},
	},
	'@global': {
		'.menu-animation-enter': {
			opacity: 0,
			transform: 'scale(1.1)',
		},
		'.menu-animation-enter-active': {
			opacity: 1,
			transform: 'scale(1)',
			transition: 'opacity 200ms, transform 200ms',
		},
		'.menu-animation-exit': {
			opacity: 1,
			transform: 'scale(1)',
		},
		'.menu-animation-exit-active': {
			opacity: 0,
			transform: 'scale(1.1)',
			transition: 'opacity 200ms, transform 200ms',
		},
	},
}));

const AdditionalNavigationItemIcon = ({
	iconName,
	svgProps,
}: {
	iconName: string;
	svgProps?: React.SVGProps<SVGSVGElement> & {
		title?: string | undefined;
	};
}) => {
	switch (iconName) {
		case 'diversity_1':
			return <SpacesOfColorIcon {...svgProps} />;
		default:
			return <AdminIcon {...svgProps} />;
	}
};

const MobileAccordianItem = ({ toggleElement, children }: PropsWithChildren<{ toggleElement: JSX.Element }>) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<>
			<Button
				variant="light"
				className="d-flex justify-content-between align-items-center"
				onClick={() => {
					setIsExpanded(!isExpanded);
				}}
			>
				{toggleElement}
				<DownChevron className="text-n300" />
			</Button>
			<Collapse in={isExpanded}>
				<div>
					<div className="collapse-inner">{children}</div>
				</div>
			</Collapse>
		</>
	);
};

const HeaderV2 = () => {
	const { pathname } = useLocation();
	const classes = useHeaderV2Styles();
	const { account, institution, institutionCapabilities, signOutAndClearContext } = useAccount();
	const { trackEvent } = useAnalytics();
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
	/* Disable scrolling when menu is open */
	/* ----------------------------------------------------------- */
	useEffect(() => {
		if (menuOpen) {
			document.body.style.overflow = 'hidden';
			return;
		}

		document.body.style.overflow = 'visible';
	}, [menuOpen]);

	/* ----------------------------------------------------------- */
	/* Close menu if pathname changes */
	/* ----------------------------------------------------------- */
	useEffect(() => {
		setMenuOpen((previousValue) => {
			if (previousValue) {
				return false;
			}

			return previousValue;
		});
	}, [pathname]);

	/* ----------------------------------------------------------- */
	/* Button handlers */
	/* ----------------------------------------------------------- */
	function handleInCrisisButtonClick() {
		trackEvent(CrisisAnalyticsEvent.clickCrisisHeader());
		openInCrisisModal();
	}

	/* ----------------------------------------------------------- */
	/* Desktop navigation Config */
	/* ----------------------------------------------------------- */
	const navigationConfig = useMemo(
		() => [
			{
				testId: 'menuLinkHome',
				navigationItemId: 'HOME',
				title: 'Home',
				to: '/',
				active: matchPath('/', pathname),
			},
			...(institution?.featuresEnabled
				? [
						{
							navigationItemId: 'CONNECT_WITH_SUPPORT',
							title: 'Connect with Support',
							active: (institution?.features ?? [])
								.filter((feature) => feature.navigationHeaderId === 'CONNECT_WITH_SUPPORT')
								.map(({ urlName }) => urlName)
								.some((urlName) => matchPath(urlName, pathname)),
							items: (institution?.features ?? [])
								.filter((feature) => feature.navigationHeaderId === 'CONNECT_WITH_SUPPORT')
								.map(({ featureId, name, navDescription, urlName }) => ({
									navigationItemId: featureId,
									icon: <PathwaysIcon featureId={featureId} svgProps={{ width: 24, height: 24 }} />,
									title: name,
									description: navDescription,
									to:
										featureId === 'THERAPY' && account?.institutionLocationId
											? `${urlName}?institutionLocationId=${account.institutionLocationId}`
											: urlName,
								})),
						},
				  ]
				: []),
			{
				navigationItemId: 'BROWSE_RESOURCES',
				title: 'Browse Resources',
				active: [
					...(institution?.features ?? [])
						.filter((feature) => feature.navigationHeaderId === 'BROWSE_RESOURCES')
						.map(({ urlName }) => urlName),
					...(institution?.additionalNavigationItems ?? []).map(({ url }) => url),
					...exploreLinks.map(({ to }) => to()),
				].some((to) => matchPath(to, pathname)),
				items: [
					...(institution?.features ?? [])
						.filter((feature) => feature.navigationHeaderId === 'BROWSE_RESOURCES')
						.map(({ featureId, name, navDescription, urlName }) => ({
							navigationItemId: featureId,
							icon: <PathwaysIcon featureId={featureId} svgProps={{ width: 24, height: 24 }} />,
							title: name,
							description: navDescription,
							to: urlName,
						})),
					...(institution?.additionalNavigationItems ?? []).map(({ iconName, name, url }, index) => ({
						testId: `menuLink-additionalItem${index}`,
						icon: <AdditionalNavigationItemIcon iconName={iconName} svgProps={{ width: 24, height: 24 }} />,
						title: name,
						description: '',
						to: url,
					})),
					...exploreLinks.map(({ testId, icon, label, to }) => ({
						testId,
						icon,
						title: label,
						description: '',
						to: to(),
					})),
				],
			},
		],
		[institution?.additionalNavigationItems, institution?.featuresEnabled, institution?.features, pathname]
	);

	/* ----------------------------------------------------------- */
	/* Account navigation Config */
	/* ----------------------------------------------------------- */
	const accountNavigationConfig = useMemo(
		() => [
			...(institution?.requireConsentForm
				? [
						{
							testId: 'menuLinkPofile',
							icon: AdminIcon,
							title: 'Profile',
							to: '/user-settings',
						},
				  ]
				: []),
			{
				testId: 'menuLinkEvents',
				icon: EventIcon,
				title: 'My Events',
				to: '/my-calendar',
			},
		],
		[institution?.requireConsentForm]
	);

	/* ----------------------------------------------------------- */
	/* Admin navigation Config */
	/* ----------------------------------------------------------- */
	const adminNavigationConfig = useMemo(
		() => [
			...(account?.providerId
				? [
						{
							testId: 'menuLinkScheduling',
							icon: ExternalIcon,
							title: 'Patient Scheduling',
							to: '/scheduling',
						},
				  ]
				: []),
			...(institutionCapabilities?.viewNavAdminMyContent
				? [
						{
							testId: 'menuLinkAdminMyContent',
							icon: ExternalIcon,
							title: 'My Content',
							to: '/cms/on-your-time',
						},
				  ]
				: []),
			...(institutionCapabilities?.viewNavAdminAvailableContent
				? [
						{
							testId: 'menuLinkAdminAvailableContent',
							icon: ExternalIcon,
							title: 'Available Content',
							to: '/cms/available-content',
						},
				  ]
				: []),
			...(institutionCapabilities?.viewNavAdminGroupSession
				? [
						{
							testId: 'menuLinkAdminScheduledGroupSessions',
							icon: ExternalIcon,
							title: 'Scheduled',
							to: '/group-sessions/scheduled',
						},
				  ]
				: []),
			...(institutionCapabilities?.viewNavAdminReports
				? [
						{
							testId: 'menuLinkAdminReports',
							icon: ExternalIcon,
							title: 'Provider Reports',
							to: '/admin/reports',
						},
				  ]
				: []),
		],
		[
			account?.providerId,
			institutionCapabilities?.viewNavAdminAvailableContent,
			institutionCapabilities?.viewNavAdminGroupSession,
			institutionCapabilities?.viewNavAdminMyContent,
			institutionCapabilities?.viewNavAdminReports,
		]
	);

	return (
		<>
			<CSSTransition in={menuOpen} timeout={200} classNames="menu-animation" mountOnEnter unmountOnExit>
				<div className={classNames('d-lg-none', classes.mobileNav)}>
					<ul>
						{navigationConfig.map((navigationItem) => (
							<li key={navigationItem.navigationItemId}>
								{navigationItem.to && <Link to={navigationItem.to}>{navigationItem.title}</Link>}
								{navigationItem.items && (
									<MobileAccordianItem toggleElement={<span>{navigationItem.title}</span>}>
										{(navigationItem.items ?? []).map((item, itemIndex) => (
											<Link key={itemIndex} to={item.to ?? '/#'}>
												<div
													className={classNames('d-flex', {
														'align-items-center': !item.description,
													})}
												>
													{item.icon}
													<div className="ps-4">
														<p className="mb-0 fw-semibold">{item.title}</p>
														{item.description && (
															<p className="mb-0 text-gray">{item.description}</p>
														)}
													</div>
												</div>
											</Link>
										))}
									</MobileAccordianItem>
								)}
							</li>
						))}
						<li>
							<MobileAccordianItem
								toggleElement={
									<div className="d-flex align-items-center">
										<AvatarIcon width={20} height={20} />
										<span className="ms-4">My Account</span>
									</div>
								}
							>
								{accountNavigationConfig.map((item, itemIndex) => (
									<Link key={itemIndex} to={item.to}>
										<div className="d-flex align-items-center">
											<item.icon className="text-p300" />
											<p className="mb-0 ps-4 fw-semibold">{item.title}</p>
										</div>
									</Link>
								))}
								{adminNavigationConfig.length > 0 && (
									<>
										<hr />
										{adminNavigationConfig.map((item, itemIndex) => (
											<Link key={itemIndex} to={item.to}>
												<div className="d-flex justify-content-between align-items-center">
													<p className="mb-0 pe-4 fw-semibold">{item.title}</p>
													<item.icon className="text-gray" />
												</div>
											</Link>
										))}
									</>
								)}
								<hr />
								<Button
									variant="light"
									className="fw-semibold text-gray"
									onClick={signOutAndClearContext}
								>
									Log Out
								</Button>
							</MobileAccordianItem>
						</li>
					</ul>
				</div>
			</CSSTransition>

			<header ref={header} className={classes.header}>
				<div className="h-100 d-flex align-items-center justify-content-between">
					<Link to="/" className="d-block me-10">
						<LogoSmallText className="text-primary" />
					</Link>
					<nav className={classes.desktopNav}>
						<ul>
							{navigationConfig.map((navigationItem) => (
								<li
									key={navigationItem.navigationItemId}
									className={classNames({
										active: navigationItem.active,
									})}
								>
									{navigationItem.to && <Link to={navigationItem.to}>{navigationItem.title}</Link>}
									{navigationItem.items && (
										<Dropdown>
											<Dropdown.Toggle
												as={DropdownToggle}
												id={`employee-header__${navigationItem.navigationItemId}`}
											>
												<span>{navigationItem.title}</span>
												<DownChevron width={16} height={16} />
											</Dropdown.Toggle>
											<Dropdown.Menu
												as={DropdownMenu}
												align="start"
												flip={false}
												popperConfig={{ strategy: 'fixed' }}
												renderOnMount
											>
												{navigationItem.items.map((item, itemIndex) => (
													<Dropdown.Item key={itemIndex} to={item.to} as={Link}>
														<div
															className={classNames('d-flex', {
																'align-items-center': !item.description,
															})}
														>
															{item.icon}
															<div className="ps-4">
																<p className="mb-0 fw-semibold">{item.title}</p>
																{item.description && (
																	<p className="mb-0 text-gray">{item.description}</p>
																)}
															</div>
														</div>
													</Dropdown.Item>
												))}
											</Dropdown.Menu>
										</Dropdown>
									)}
								</li>
							))}
						</ul>
					</nav>
				</div>
				<div className="d-none d-lg-flex align-items-center justify-content-between">
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
							className={classes.accountDropdown}
						>
							<p className="fw-bold text-gray">{account?.displayName}</p>
							{accountNavigationConfig.map((item, itemIndex) => (
								<Dropdown.Item key={itemIndex} as={Link} to={item.to}>
									<div className="d-flex align-items-center">
										<item.icon className="text-p300" />
										<p className="mb-0 ps-4 fw-semibold">{item.title}</p>
									</div>
								</Dropdown.Item>
							))}
							{adminNavigationConfig.length > 0 && (
								<>
									<Dropdown.Divider />
									{adminNavigationConfig.map((item, itemIndex) => (
										<Dropdown.Item key={itemIndex} as={Link} to={item.to}>
											<div className="d-flex justify-content-between align-items-center">
												<p className="mb-0 pe-4 fw-semibold">{item.title}</p>
												<item.icon className="text-gray" />
											</div>
										</Dropdown.Item>
									))}
								</>
							)}
							<Dropdown.Divider />
							<Dropdown.Item onClick={signOutAndClearContext}>
								<p className="mb-0 text-gray">Log Out</p>
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</div>
				<Button
					variant="light"
					data-testid="headerNavMenuButton"
					className={classNames('d-flex d-lg-none', classes.menuButton, {
						active: menuOpen,
					})}
					onClick={() => {
						setMenuOpen(!menuOpen);
					}}
				>
					<span />
				</Button>
			</header>
		</>
	);
};

export default HeaderV2;
