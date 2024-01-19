import React, { useState, useRef, useEffect, useCallback, useMemo, PropsWithChildren } from 'react';
import { Link, matchPath, useLocation, useRevalidator } from 'react-router-dom';
import { Button, Collapse, Dropdown } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';

import { AlertTypeId, FeatureId } from '@/lib/models';
import { institutionService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useAnalytics from '@/hooks/use-analytics';
import useAccount from '@/hooks/use-account';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import PathwaysIcon from '@/components/pathways-icons';
import HeaderAlert from '@/components/header-alert';

import { exploreLinks } from '@/menu-links';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';
import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-cobalt-horizontal.svg';
import { ReactComponent as AvatarIcon } from '@/assets/icons/icon-avatar.svg';
import { ReactComponent as EventIcon } from '@/assets/icons/icon-event.svg';
import { ReactComponent as AdminIcon } from '@/assets/icons/icon-admin.svg';
import { ReactComponent as SpacesOfColorIcon } from '@/assets/icons/icon-spaces-of-color.svg';
import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import InCrisisHeaderButton from './in-crisis-header-button';
import HeaderNavDropdown from './header-nav-dropdown';
import { NavFeaturedItem, HeaderNavFeaturedItem } from './header-nav-featured-item';
import { useAppRootLoaderData } from '@/routes/root';

export const HEADER_HEIGHT = 60;

const useHeaderV2Styles = createUseThemedStyles((theme) => ({
	headerOuter: {
		top: 0,
		left: 0,
		right: 0,
		zIndex: 4,
		position: 'fixed',
	},
	header: {
		height: HEADER_HEIGHT,
		display: 'flex',
		padding: '0 40px',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.border}`,
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
	communityNavImage: {
		borderRadius: 6,
		height: 80,
		width: 144,
		[mediaQueries.lg]: {
			height: 'auto',
			width: '100%',
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
					border: 0,
					height: '100%',
					display: 'flex',
					padding: '0 12px',
					alignItems: 'center',
					textDecoration: 'none',
					...theme.fonts.default,
					color: theme.colors.n900,
					...theme.fonts.bodyNormal,
					'&:hover': {
						color: theme.colors.p700,
						backgroundColor: 'transparent',
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
		top: 0,
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
			border: 0,
			width: '100%',
			textAlign: 'left',
		},
		'& .collapse-inner': {
			borderRadius: 8,
			margin: '12px 0',
			border: `1px solid ${theme.colors.border}`,
			'& a': {
				margin: 8,
				padding: '8px 12px',
				'&:last-of-type': {
					marginBottom: 0,
				},
			},
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

const AdditionalNavigationItemIconOrImage = ({
	iconName,
	imageUrl,
	imageAlt,
	svgProps,
}: {
	iconName?: string;
	imageUrl?: string;
	imageAlt?: string;
	svgProps?: React.SVGProps<SVGSVGElement> & {
		title?: string | undefined;
	};
}) => {
	const classes = useHeaderV2Styles();
	if (imageUrl) {
		return <img className={classes.communityNavImage} src={imageUrl} alt={imageAlt} />;
	}

	switch (iconName) {
		case 'diversity_1':
			return <SpacesOfColorIcon {...svgProps} />;
		default:
			return <AdminIcon {...svgProps} />;
	}
};

const MobileAccordianItem = ({
	toggleElement,
	className,
	children,
}: PropsWithChildren<{ toggleElement: JSX.Element; className?: string }>) => {
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
					<div className={classNames('collapse-inner', className)}>{children}</div>
				</div>
			</Collapse>
		</>
	);
};

const HeaderV2 = () => {
	const { featuredTopicCenter } = useAppRootLoaderData();
	const { pathname } = useLocation();
	const handleError = useHandleError();
	const classes = useHeaderV2Styles();
	const revalidator = useRevalidator();

	const { account, institution, isAdmin, isProvider, signOutAndClearContext } = useAccount();
	const { trackEvent } = useAnalytics();
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [alertsDisabled, setAlertsDisabled] = useState(false);

	/* ----------------------------------------------------------- */
	/* Body padding for fixed header */
	/* ----------------------------------------------------------- */
	const header = useRef<HTMLDivElement | null>(null);
	const movileNavRef = useRef<HTMLDivElement | null>(null);

	const handleWindowResize = useCallback(() => {
		setBodyPadding();
		setMobileNavTop();
	}, []);

	function setBodyPadding() {
		if (!header.current) {
			document.body.style.paddingTop = '0px';
			return;
		}

		const headerHeight = header.current.clientHeight;
		document.body.style.paddingTop = `${headerHeight}px`;
	}

	function setMobileNavTop() {
		if (!movileNavRef.current) {
			return;
		}

		if (!header.current) {
			movileNavRef.current.style.top = '0px';
			return;
		}

		const headerHeight = header.current.clientHeight;
		movileNavRef.current.style.top = `${headerHeight}px`;
	}

	useEffect(() => {
		setBodyPadding();
		setMobileNavTop();

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

	/* ----------------------------------------------------------- */
	/* Disable scrolling when menu is open */
	/* ----------------------------------------------------------- */
	useEffect(() => {
		setMobileNavTop();

		if (menuOpen) {
			document.body.style.overflow = 'hidden';
			return;
		}

		document.body.style.overflow = 'visible';

		return () => {
			document.body.style.overflow = 'visible';
		};
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
	/* Desktop navigation Config */
	/* ----------------------------------------------------------- */

	const navigationConfig = useMemo(() => {
		const featureIdsWithLocationFilter = [FeatureId.THERAPY, FeatureId.COACHING];
		const showCommunityLinks = institution?.additionalNavigationItems.length > 0;

		return [
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
								.filter((feature) => feature.navVisible)
								.map(({ urlName }) => urlName)
								.some((urlName) => matchPath(urlName + '/*', pathname)),
							items: (institution?.features ?? [])
								.filter((feature) => feature.navigationHeaderId === 'CONNECT_WITH_SUPPORT')
								.filter((feature) => feature.navVisible)
								.map(({ featureId, name, navDescription, urlName }) => ({
									navigationItemId: featureId,
									icon: <PathwaysIcon featureId={featureId} svgProps={{ width: 24, height: 24 }} />,
									title: name,
									description: navDescription,
									to:
										featureIdsWithLocationFilter.includes(featureId) &&
										account?.institutionLocationId
											? `${urlName}?institutionLocationId=${account.institutionLocationId}`
											: urlName,
								})),
						},
				  ]
				: []),
			{
				navigationItemId: 'BROWSE_RESOURCES',
				title: 'Browse Resources',
				subtitle: 'Resources',
				active: [
					...(institution?.features ?? [])
						.filter((feature) => feature.navigationHeaderId === 'BROWSE_RESOURCES')
						.map(({ urlName }) => urlName),
					...exploreLinks.map(({ to }) => to()),
				].some((to) => matchPath(to + '/*', pathname)),
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
					...exploreLinks.map(({ testId, icon, label, to }) => ({
						testId,
						icon,
						title: label,
						description: '',
						to: to(),
					})),
				],
			},
			...(showCommunityLinks
				? [
						{
							navigationItemId: 'COMMUNITY',
							title: 'Community',
							active: (institution?.additionalNavigationItems ?? []).some(({ url }) =>
								matchPath(url + '/*', pathname)
							),
							items: (institution?.additionalNavigationItems ?? []).map(
								({ iconName, imageUrl, name, url }, index) => ({
									testId: `menuLink-additionalItem${index}`,
									icon: (
										<AdditionalNavigationItemIconOrImage
											iconName={iconName}
											imageUrl={imageUrl}
											imageAlt={name}
											svgProps={{ width: 24, height: 24 }}
										/>
									),
									title: name,
									description: '',
									to: url,
								})
							),
						},
				  ]
				: []),
		];
	}, [
		pathname,
		institution?.featuresEnabled,
		institution?.features,
		institution?.additionalNavigationItems,
		account?.institutionLocationId,
	]);

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
	const adminNavigationConfig = useMemo(() => {
		return [
			...(isProvider
				? [
						{
							testId: 'menuLinkScheduling',
							icon: ExternalIcon,
							title: 'Patient Scheduling',
							to: '/scheduling',
						},
				  ]
				: []),
			...(isAdmin
				? [
						{
							testId: '',
							icon: ExternalIcon,
							title: 'Admin',
							to: '/admin',
						},
				  ]
				: []),
		];
	}, [isAdmin, isProvider]);

	const handleAlertDismiss = useCallback(
		async (alertId: string) => {
			try {
				setAlertsDisabled(true);

				await institutionService.dismissAlert(alertId).fetch();

				revalidator.revalidate();
			} catch (error) {
				handleError(error);
			} finally {
				setAlertsDisabled(false);
			}
		},
		[handleError, revalidator]
	);

	const featuredTopicCenterItem: NavFeaturedItem | undefined = featuredTopicCenter && {
		subtitle: 'Featured Topic',
		name: featuredTopicCenter.featuredTitle!,
		imageAlt: featuredTopicCenter.name!,
		imageUrl: featuredTopicCenter.imageUrl!,
		descriptionHtml: featuredTopicCenter.navDescription!,
		linkTo: `/featured-topics/${featuredTopicCenter.urlName}`,
	};

	return (
		<>
			<CSSTransition in={menuOpen} timeout={200} classNames="menu-animation" mountOnEnter unmountOnExit>
				<div ref={movileNavRef} className={classNames('d-lg-none', classes.mobileNav)}>
					<ul>
						{navigationConfig.map((navigationItem) => {
							const showFeaturedItem =
								navigationItem.navigationItemId === 'BROWSE_RESOURCES' && featuredTopicCenterItem;

							return (
								<li key={navigationItem.navigationItemId}>
									{navigationItem.to && <Link to={navigationItem.to}>{navigationItem.title}</Link>}
									{navigationItem.items && (
										<MobileAccordianItem
											className={classNames({
												'pt-2': !navigationItem.subtitle,
												'pb-2': !showFeaturedItem,
											})}
											toggleElement={<span>{navigationItem.title}</span>}
										>
											{navigationItem.subtitle && (
												<p className="text-n500 px-5 mb-3 mt-6">{navigationItem.subtitle}</p>
											)}
											{(navigationItem.items ?? []).map((item, itemIndex) => (
												<Link key={itemIndex} to={item.to ?? '/#'}>
													<div
														className={classNames('d-flex flex-column flex-lg-row', {
															'align-items-center': !item.description,
														})}
													>
														{item.icon}
														<div className="mt-4 mt-lg-0 ps-lg-4 w-100">
															<p className="mb-0 fw-semibold">{item.title}</p>
															{item.description && (
																<p className="mb-0 text-gray">{item.description}</p>
															)}
														</div>
													</div>
												</Link>
											))}
											{showFeaturedItem && (
												<HeaderNavFeaturedItem
													mobileNav
													className="bg-n50 mt-6 px-4 py-6"
													featuredItem={featuredTopicCenterItem}
												/>
											)}
										</MobileAccordianItem>
									)}
								</li>
							);
						})}
						<li>
							<MobileAccordianItem
								className="py-2"
								toggleElement={
									<div className="d-flex align-items-center">
										<AvatarIcon width={20} height={20} className="text-p700" />
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
											<Link key={itemIndex} to={item.to} target="_blank">
												<div className="d-flex justify-content-between align-items-center">
													<p className="mb-0 pe-4 fw-semibold">{item.title}</p>
													<item.icon className="text-gray" />
												</div>
											</Link>
										))}
									</>
								)}
								<hr className="my" />
								<Button
									variant="light"
									className="mx-2 fw-semibold text-gray"
									onClick={signOutAndClearContext}
								>
									Log Out
								</Button>
							</MobileAccordianItem>
						</li>
					</ul>
				</div>
			</CSSTransition>

			<div ref={header} className={classes.headerOuter}>
				{institution?.alerts.map((alert) => {
					const variantMap: Record<AlertTypeId, 'primary' | 'warning' | 'danger'> = {
						[AlertTypeId.INFORMATION]: 'primary',
						[AlertTypeId.WARNING]: 'warning',
						[AlertTypeId.ERROR]: 'danger',
					};

					return (
						<HeaderAlert
							key={alert.alertId}
							variant={variantMap[alert.alertTypeId]}
							title={alert.title}
							message={alert.message}
							dismissable={alert.alertTypeId === AlertTypeId.INFORMATION}
							onDismiss={() => {
								handleAlertDismiss(alert.alertId);
							}}
							disabled={alertsDisabled}
						/>
					);
				})}
				<header className={classes.header}>
					<div className="h-100 d-flex align-items-center justify-content-between">
						<Link to="/" className="d-block me-10">
							<LogoSmallText className="text-primary" />
						</Link>
						<nav className={classes.desktopNav}>
							<ul>
								{navigationConfig.map((navigationItem) => {
									const showFeaturedItem =
										navigationItem.navigationItemId === 'BROWSE_RESOURCES' &&
										featuredTopicCenterItem;

									return (
										<li
											key={navigationItem.navigationItemId}
											className={classNames({
												active: navigationItem.active,
											})}
										>
											{navigationItem.to && (
												<Link
													to={navigationItem.to}
													onClick={() => {
														trackEvent({
															action: 'Top Nav',
															link_text: navigationItem.title,
														});
													}}
												>
													{navigationItem.title}
												</Link>
											)}
											{navigationItem.items && (
												<HeaderNavDropdown
													onToggle={(nextShow) => {
														if (nextShow) {
															trackEvent({
																action: 'Top Nav',
																link_text: navigationItem.title,
															});
														}
													}}
													title={navigationItem.title}
													{...(showFeaturedItem
														? {
																subtitle: navigationItem.subtitle,
																featuredItem: featuredTopicCenterItem,
														  }
														: null)}
													featuredItem={showFeaturedItem ? featuredTopicCenterItem : null}
												>
													{navigationItem.items.map((item, itemIndex) => (
														<Dropdown.Item
															key={itemIndex}
															to={item.to}
															as={Link}
															onClick={() => {
																trackEvent({
																	action: 'Top Nav Dropdown',
																	link_text: navigationItem.title,
																	link_detail: item.title,
																});
															}}
														>
															<div
																className={classNames('d-flex', {
																	'align-items-center': !item.description,
																})}
															>
																{item.icon}
																<div className="ps-4">
																	<p className="mb-0 fw-semibold">{item.title}</p>
																	{item.description && (
																		<p className="mb-0 text-gray">
																			{item.description}
																		</p>
																	)}
																</div>
															</div>
														</Dropdown.Item>
													))}
												</HeaderNavDropdown>
											)}
										</li>
									);
								})}
							</ul>
						</nav>
					</div>
					<div className="d-none d-lg-flex align-items-center justify-content-between">
						<InCrisisHeaderButton />
						<Dropdown className="ms-4 d-flex align-items-center">
							<Dropdown.Toggle
								as={DropdownToggle}
								id="mhic-header__dropdown-menu"
								className="p-0 border-0"
							>
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
											<Dropdown.Item key={itemIndex} as={Link} to={item.to} target="_blank">
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
			</div>
		</>
	);
};

export default HeaderV2;
