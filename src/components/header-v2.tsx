import React, { useState, useRef, useEffect, useCallback, useMemo, PropsWithChildren } from 'react';
import { Link, matchPath, PathMatch, To, useLocation, useMatches, useRevalidator } from 'react-router-dom';
import { Button, Collapse, Dropdown } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';

import {
	AccountSourceId,
	AlertTypeId,
	AnalyticsNativeEventClickthroughTopicCenterSource,
	AnalyticsNativeEventTypeId,
	FeatureId,
	SITE_LOCATION_ID,
} from '@/lib/models';
import { analyticsService, institutionService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useAnalytics from '@/hooks/use-analytics';
import useAccount from '@/hooks/use-account';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import PathwaysIcon from '@/components/pathways-icons';
import HeaderAlert from '@/components/header-alert';

import { exploreLinks } from '@/menu-links';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-cobalt-horizontal.svg';
import InCrisisHeaderButton from './in-crisis-header-button';
import HeaderNavDropdown from './header-nav-dropdown';
import { NavFeaturedItem, HeaderNavFeaturedItem } from './header-nav-featured-item';
import { useAppRootLoaderData } from '@/routes/root';

import { AnalyticsNativeEventAccountSignedOutSource } from '@/lib/models';
import { RouteHandle } from '@/routes';
import { buildQueryParamUrl, canAccessProviderScheduling, getGeneralNavigationFeatures } from '@/lib/utils';
import SvgIcon from './svg-icon';
import {
	getFeatureNavigationLink,
	getGeneralNavigationGroups,
	getResourceNavigationMetadata,
	featuredTopicsNavigationMetadata,
	communityDirectoryNavigationMetadata,
	getCommunityNavigationLink,
} from '@/lib/utils/general-navigation-utils';
import { useNavigationEmployers } from '@/hooks/use-navigation-employers';
import { HeaderNavEmployers } from './header-nav-employers';
import { HeaderNavDescription } from './header-nav-description';

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
		height: 'auto',
		aspectRatio: '16 / 9',
		objectFit: 'cover',
		width: 144,
		flexShrink: 0,
		[mediaQueries.lg]: {
			height: 'auto',
			width: 120,
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
	accountMenuButton: {
		width: 44,
		height: 44,
		minHeight: 44,
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		'&:focus:not(:focus-visible)': {
			boxShadow: 'none',
		},
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
		paddingTop: 20,
		position: 'fixed',
		overflowY: 'auto',
		backgroundColor: theme.colors.n0,
		'& ul': {
			padding: 0,
			margin: '0 auto',
			listStyle: 'none',
		},
		'& a, & button:not(.in-crisis-button)': {
			borderRadius: 4,
			display: 'block',
			padding: '12px 16px',
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
			'& a': {
				margin: 8,
				padding: '12px 16px',
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
			return <SvgIcon kit="fak" icon="people-group-support" size={16} {...svgProps} />;
		default:
			return <SvgIcon kit="far" icon="gear" size={16} {...svgProps} />;
	}
};

const MobileAccordianItem = ({
	toggleElement,
	titleTo,
	title,
	className,
	children,
}: PropsWithChildren<{ toggleElement: JSX.Element; titleTo?: To; title?: string; className?: string }>) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<>
			<div className={titleTo ? 'd-flex align-items-center' : undefined}>
				{titleTo && (
					<Link to={titleTo} className="flex-grow-1">
						{toggleElement}
					</Link>
				)}
				<Button
					variant="light"
					className="d-flex justify-content-between align-items-center"
					style={titleTo ? { width: 'auto' } : undefined}
					aria-label={titleTo ? `Show ${title} links` : undefined}
					aria-expanded={isExpanded}
					onClick={() => {
						setIsExpanded(!isExpanded);
					}}
				>
					{!titleTo && toggleElement}
					<SvgIcon kit="far" icon="chevron-down" size={16} className="text-n300" />
				</Button>
			</div>
			<Collapse in={isExpanded}>
				<div>
					<div className={classNames('collapse-inner', className)}>{children}</div>
				</div>
			</Collapse>
		</>
	);
};

const HeaderV2 = () => {
	const { featuredTopicCenter, legacyFeaturedTopicCenter } = useAppRootLoaderData();
	const { pathname } = useLocation();
	const handleError = useHandleError();
	const classes = useHeaderV2Styles();
	const revalidator = useRevalidator();
	const routeMatches = useMatches();
	const hideHeader = useMemo(
		() => routeMatches.some((match) => (match.handle as RouteHandle | undefined)?.hideHeader),
		[routeMatches]
	);

	const { account, institution, isAdmin, signOutAndClearContext } = useAccount();
	const { trackEvent } = useAnalytics();
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [alertsDisabled, setAlertsDisabled] = useState(false);
	const employers = useNavigationEmployers(institution.institutionId, institution.featuresEnabled);
	const showEmployers = employers.status !== 'loaded' || employers.locations.length > 0;
	const generalNavigationFeatures = useMemo(() => getGeneralNavigationFeatures(institution), [institution]);

	/* ----------------------------------------------------------- */
	/* Body padding for fixed header */
	/* ----------------------------------------------------------- */
	const header = useRef<HTMLDivElement | null>(null);
	const movileNavRef = useRef<HTMLDivElement | null>(null);

	const setBodyPadding = useCallback(() => {
		if (hideHeader || !header.current) {
			document.body.style.paddingTop = '0px';
			return;
		}

		const headerHeight = header.current.getBoundingClientRect().height;
		document.body.style.paddingTop = `${headerHeight}px`;
	}, [hideHeader]);

	const setMobileNavTop = useCallback(() => {
		if (!movileNavRef.current) {
			return;
		}

		if (hideHeader || !header.current) {
			movileNavRef.current.style.top = '0px';
			return;
		}

		const headerHeight = header.current.clientHeight;
		movileNavRef.current.style.top = `${headerHeight}px`;
	}, [hideHeader]);

	const handleWindowResize = useCallback(() => {
		setBodyPadding();
		setMobileNavTop();
	}, [setBodyPadding, setMobileNavTop]);

	useEffect(() => {
		setBodyPadding();
		setMobileNavTop();

		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [handleWindowResize, setBodyPadding, setMobileNavTop]);

	useEffect(() => {
		setBodyPadding();

		return () => {
			document.body.style.paddingTop = '0px';
		};
	}, [account, setBodyPadding]);

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
	const navigationConfig: {
		testId?: string;
		navigationItemId?: string;
		title: string;
		subtitle?: string;
		footerLink?: { title: string; to: To };
		to?: To;
		onClick?(): void;
		active: PathMatch<string> | boolean | null;
		items?: {
			testId?: string;
			navigationItemId?: string;
			title: string;
			to: To;
			icon: JSX.Element;
			description: string;
			descriptionHtml?: string;
			onClick?(): void;
		}[];
	}[] = useMemo(() => {
		const featureIdsWithLocationFilter = [FeatureId.THERAPY, FeatureId.COACHING];
		const groups = getGeneralNavigationGroups({
			features: generalNavigationFeatures,
			additionalNavigationItems: institution.additionalNavigationItems,
		});
		const showCommunityLinks = groups.communities.length > 0;

		return [
			...(institution?.featuresEnabled
				? [
						{
							navigationItemId: 'CONNECT_WITH_SUPPORT',
							title: 'Appointments',
							subtitle: 'Appointment Services',
							active: groups.appointments
								.map(({ urlName }) => urlName)
								.some((urlName) => matchPath(urlName + '/*', pathname)),
							items: groups.appointments.map(({ featureId, name, navDescription, urlName }) => ({
								navigationItemId: featureId,
								icon: <PathwaysIcon featureId={featureId} svgProps={{ width: 24, height: 24 }} />,
								title: name,
								description: navDescription,
								to:
									featureIdsWithLocationFilter.includes(featureId) && account?.institutionLocationId
										? buildQueryParamUrl(urlName, {
												institutionLocationId: account.institutionLocationId,
										  })
										: urlName,
								onClick: getFeatureNavigationLink({ featureId, urlName }).onClick,
							})),
						},
				  ]
				: []),
			...(groups.groupSessions
				? [
						{
							navigationItemId: 'GROUP_SESSIONS',
							title: 'Group Sessions',
							...getFeatureNavigationLink(groups.groupSessions),
							active: matchPath(groups.groupSessions.urlName + '/*', pathname),
						},
				  ]
				: []),
			{
				navigationItemId: 'BROWSE_RESOURCES',
				title: 'Self-Help Resources',
				subtitle: 'Self-Help Resources',
				active: [
					'/featured-topics',
					...groups.resources.map(({ urlName }) => urlName),
					...exploreLinks.map(({ to }) => to()),
				].some((to) => matchPath(to + '/*', pathname)),
				items: [
					...groups.resources.map((feature) => ({
						navigationItemId: feature.featureId,
						icon: <PathwaysIcon featureId={feature.featureId} svgProps={{ width: 24, height: 24 }} />,
						...getResourceNavigationMetadata(feature),
					})),
					{
						navigationItemId: 'FEATURED_TOPICS_DIRECTORY',
						...featuredTopicsNavigationMetadata,
						icon: (
							<PathwaysIcon
								featureId={FeatureId.SELF_HELP_RESOURCES}
								svgProps={{ width: 24, height: 24 }}
							/>
						),
					},
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
							footerLink: communityDirectoryNavigationMetadata,
							active:
								!!matchPath('/communities/*', pathname) ||
								groups.communities.some(({ url }) => matchPath(url + '/*', pathname)),
							items: groups.communities.map((item, index) => ({
								testId: `menuLink-additionalItem${index}`,
								icon: (
									<AdditionalNavigationItemIconOrImage
										iconName={item.iconName}
										imageUrl={item.imageUrl}
										imageAlt={item.name}
										svgProps={{ width: 24, height: 24 }}
									/>
								),
								description: '',
								...getCommunityNavigationLink(item, institution.preferLegacyTopicCenters),
							})),
						},
				  ]
				: [
						{
							navigationItemId: 'COMMUNITY',
							title: 'Community',
							to: '/communities',
							active: matchPath('/communities/*', pathname),
						},
				  ]),
		];
	}, [
		institution?.additionalNavigationItems,
		institution?.featuresEnabled,
		institution.preferLegacyTopicCenters,
		generalNavigationFeatures,
		pathname,
		account?.institutionLocationId,
	]);

	/* ----------------------------------------------------------- */
	/* Account navigation Config */
	/* ----------------------------------------------------------- */
	const showAccountSettings =
		institution?.requireConsentForm || account?.accountSourceId === AccountSourceId.EMAIL_PASSWORD;
	const showMyEvents = !!institution.features.find((i) => i.featureId === FeatureId.MY_EVENTS);

	const accountNavigationConfig = useMemo(
		() => [
			...(showAccountSettings
				? [
						{
							testId: 'menuLinkAccountSettings',
							icon: <SvgIcon kit="fas" icon="gear" size={20} className="text-p300" />,
							title: 'Account Settings',
							to: '/account-settings',
						},
				  ]
				: []),
			...(showMyEvents
				? [
						{
							testId: 'menuLinkEvents',
							icon: <SvgIcon kit="far" icon="calendar" size={20} className="text-p300" />,
							title: 'My Events',
							to: '/my-calendar',
						},
				  ]
				: []),
		],
		[showAccountSettings, showMyEvents]
	);

	/* ----------------------------------------------------------- */
	/* Admin navigation Config */
	/* ----------------------------------------------------------- */
	const canAccessScheduling = canAccessProviderScheduling(account);
	const adminNavigationConfig = useMemo(() => {
		return [
			...(canAccessScheduling
				? [
						{
							testId: 'menuLinkScheduling',
							icon: (
								<SvgIcon kit="far" icon="arrow-up-right-from-square" size={16} className="text-gray" />
							),
							title: 'Patient Scheduling',
							to: '/scheduling',
						},
				  ]
				: []),
			...(isAdmin || account?.accountCapabilityFlags.canManageCareEncounters
				? [
						{
							testId: '',
							icon: (
								<SvgIcon kit="far" icon="arrow-up-right-from-square" size={16} className="text-gray" />
							),
							title: isAdmin ? 'Admin' : 'Encounters',
							to: isAdmin ? '/admin' : '/admin/encounters',
						},
				  ]
				: []),
		];
	}, [account?.accountCapabilityFlags.canManageCareEncounters, canAccessScheduling, isAdmin]);

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

	const featuredTopicCenterItem: NavFeaturedItem | undefined = useMemo(() => {
		if (institution.preferLegacyTopicCenters) {
			return legacyFeaturedTopicCenter
				? {
						isLegacy: true,
						subtitle: 'Monthly Spotlight',
						name: legacyFeaturedTopicCenter.featuredTitle!,
						imageAlt: legacyFeaturedTopicCenter.name!,
						imageUrl: legacyFeaturedTopicCenter.imageUrl!,
						descriptionHtml: legacyFeaturedTopicCenter.navDescription!,
						linkTo: `/featured-topics/${legacyFeaturedTopicCenter.urlName}`,
						topicCenterId: legacyFeaturedTopicCenter.topicCenterId,
						pageId: '',
				  }
				: undefined;
		}

		return featuredTopicCenter
			? {
					isLegacy: false,
					subtitle: 'Monthly Spotlight',
					name: featuredTopicCenter.headline,
					imageAlt: featuredTopicCenter.imageAltText ?? '',
					imageUrl: featuredTopicCenter.imageUrl,
					descriptionHtml: featuredTopicCenter.shortDescription ?? '',
					linkTo: featuredTopicCenter.relativeUrl,
					topicCenterId: '',
					pageId: featuredTopicCenter.pageId,
			  }
			: undefined;
	}, [featuredTopicCenter, institution.preferLegacyTopicCenters, legacyFeaturedTopicCenter]);

	if (hideHeader) {
		return null;
	}

	return (
		<>
			<CSSTransition in={menuOpen} timeout={200} classNames="menu-animation" mountOnEnter unmountOnExit>
				<div ref={movileNavRef} className={classNames('d-lg-none', classes.mobileNav)}>
					<ul>
						{navigationConfig.map((navigationItem) => {
							const showFeaturedItem =
								navigationItem.navigationItemId === 'BROWSE_RESOURCES' && featuredTopicCenterItem;

							if (navigationItem.items && navigationItem.items.length <= 0) {
								return null;
							}

							return (
								<li key={navigationItem.navigationItemId}>
									{navigationItem.to && !navigationItem.items && (
										<Link
											to={navigationItem.to}
											onClick={() => {
												setMenuOpen(false);
												navigationItem.onClick?.();
											}}
										>
											{navigationItem.title}
										</Link>
									)}
									{navigationItem.items && (
										<MobileAccordianItem
											titleTo={navigationItem.to}
											title={navigationItem.title}
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
												<Link
													key={itemIndex}
													to={item.to ?? '/#'}
													onClick={() => {
														setMenuOpen(false);
														item.onClick?.();
													}}
												>
													<div
														className={classNames('d-flex', {
															'align-items-center':
																!item.description || !!item.descriptionHtml,
														})}
													>
														{item.icon}
														<div className="ps-4 w-100">
															<p className="mb-0 fw-semibold">{item.title}</p>
															<HeaderNavDescription
																description={item.description}
																descriptionHtml={item.descriptionHtml}
															/>
														</div>
													</div>
												</Link>
											))}
											{navigationItem.navigationItemId === 'CONNECT_WITH_SUPPORT' &&
												showEmployers && (
													<HeaderNavEmployers
														employers={employers}
														mobileNav
														onNavigate={() => setMenuOpen(false)}
													/>
												)}
											{navigationItem.footerLink && (
												<Link
													to={navigationItem.footerLink.to}
													className="text-p500 mt-4"
													onClick={() => setMenuOpen(false)}
												>
													{navigationItem.footerLink.title}
													<SvgIcon kit="far" icon="arrow-right" size={16} className="ms-2" />
												</Link>
											)}
											{showFeaturedItem && (
												<HeaderNavFeaturedItem
													mobileNav
													className="bg-n50 mt-6 px-4 py-6"
													featuredItem={featuredTopicCenterItem}
													onImageClick={() => {
														setMenuOpen(false);
														featuredTopicCenterItem.isLegacy
															? analyticsService.persistEvent(
																	AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER,
																	{
																		topicCenterId:
																			featuredTopicCenterItem.topicCenterId,
																		source: AnalyticsNativeEventClickthroughTopicCenterSource.NAV_FEATURE,
																	}
															  )
															: analyticsService.persistEvent(
																	AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE,
																	{
																		pageId: featuredTopicCenterItem.pageId,
																		source: AnalyticsNativeEventClickthroughTopicCenterSource.NAV_FEATURE,
																		siteLocationId: SITE_LOCATION_ID.FEATURED_TOPIC,
																	}
															  );
													}}
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
										<SvgIcon kit="fas" icon="circle-user" size={24} className="text-p700" />
										<span className="ms-4">My Account</span>
									</div>
								}
							>
								<div className="mx-3 border rounded">
									{accountNavigationConfig.map((item, itemIndex) => (
										<Link key={itemIndex} to={item.to} className="m-0">
											<div className="d-flex align-items-center">
												<SvgIcon kit="far" icon="gear" size={16} className="text-p300" />
												<p className="mb-0 ps-4 fw-semibold">{item.title}</p>
											</div>
										</Link>
									))}
									{accountNavigationConfig.length > 0 && adminNavigationConfig.length > 0 && (
										<hr className="m-0" />
									)}
									{adminNavigationConfig.length > 0 && (
										<>
											{adminNavigationConfig.map((item, itemIndex) => (
												<Link key={itemIndex} to={item.to} className="m-0" target="_blank">
													<div className="d-flex justify-content-between align-items-center">
														<p className="mb-0 pe-4 fw-semibold">{item.title}</p>
														{item.icon}
													</div>
												</Link>
											))}
											<hr className="m-0" />
										</>
									)}
									<Button
										variant="light"
										className="fw-semibold text-gray"
										onClick={() => {
											signOutAndClearContext(
												AnalyticsNativeEventAccountSignedOutSource.PATIENT_HEADER,
												{}
											);
										}}
									>
										<div className="d-flex align-items-center">
											<SvgIcon
												kit="far"
												icon="arrow-left-from-bracket"
												size={16}
												className="me-4 text-danger"
											/>
											<p className="mb-0 pe-4 fw-semibold text-danger">Log Out</p>
										</div>
									</Button>
								</div>
							</MobileAccordianItem>
						</li>
					</ul>
					<hr />
					<div className="px-4">
						<InCrisisHeaderButton className="in-crisis-button d-flex justify-content-center" />
					</div>
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
							{institution.headerLogoUrl ? (
								<img src={institution.headerLogoUrl} alt={institution.name} />
							) : (
								<LogoSmallText className="text-primary" />
							)}
						</Link>
						<nav className={classes.desktopNav}>
							<ul>
								{navigationConfig.map((navigationItem) => {
									const showFeaturedItem =
										navigationItem.navigationItemId === 'BROWSE_RESOURCES' &&
										featuredTopicCenterItem;

									if (navigationItem.items && navigationItem.items.length <= 0) {
										return null;
									}

									return (
										<li
											key={navigationItem.navigationItemId}
											className={classNames({
												active: navigationItem.active,
											})}
										>
											{navigationItem.to && !navigationItem.items && (
												<Link
													to={navigationItem.to}
													onClick={() => {
														navigationItem.onClick?.();
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
													titleTo={navigationItem.to}
													onTitleClick={() =>
														trackEvent({
															action: 'Top Nav',
															link_text: navigationItem.title,
														})
													}
													onToggle={(nextShow) => {
														if (nextShow) {
															trackEvent({
																action: 'Top Nav',
																link_text: navigationItem.title,
															});
														}
													}}
													title={navigationItem.title}
													subtitle={navigationItem.subtitle}
													footerLink={navigationItem.footerLink}
													onFooterClick={() =>
														trackEvent({
															action: 'Top Nav Dropdown',
															link_text: navigationItem.title,
															link_detail: navigationItem.footerLink?.title,
														})
													}
													secondaryColumn={
														navigationItem.navigationItemId === 'CONNECT_WITH_SUPPORT' &&
														showEmployers ? (
															<HeaderNavEmployers
																employers={employers}
																onNavigate={(title) =>
																	trackEvent({
																		action: 'Top Nav Dropdown',
																		link_text: navigationItem.title,
																		link_detail: title,
																	})
																}
															/>
														) : undefined
													}
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
																item.onClick?.();
															}}
														>
															<div
																className={classNames('d-flex', {
																	'align-items-center':
																		!item.description || !!item.descriptionHtml,
																})}
															>
																{item.icon}
																<div className="ps-4">
																	<p className="mb-0 fw-semibold">{item.title}</p>
																	<HeaderNavDescription
																		description={item.description}
																		descriptionHtml={item.descriptionHtml}
																	/>
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
								aria-label="Open account menu"
								className={classNames(classes.accountMenuButton, 'p-0 border-0')}
							>
								<SvgIcon kit="fas" icon="circle-user" size={32} className="d-flex" />
							</Dropdown.Toggle>
							<Dropdown.Menu
								as={DropdownMenu}
								align="end"
								flip={false}
								popperConfig={{ strategy: 'fixed' }}
								renderOnMount
								className={classes.accountDropdown}
							>
								{account?.displayName && <p className="fw-bold text-gray">{account?.displayName}</p>}
								{accountNavigationConfig.map((item, itemIndex) => (
									<Dropdown.Item key={itemIndex} as={Link} to={item.to}>
										<div className="d-flex align-items-center">
											{item.icon}
											<p className="mb-0 ps-4 fw-semibold">{item.title}</p>
										</div>
									</Dropdown.Item>
								))}
								{accountNavigationConfig.length > 0 && adminNavigationConfig.length > 0 && (
									<Dropdown.Divider />
								)}
								{adminNavigationConfig.length > 0 && (
									<>
										{adminNavigationConfig.map((item, itemIndex) => (
											<Dropdown.Item key={itemIndex} as={Link} to={item.to} target="_blank">
												<div className="d-flex justify-content-between align-items-center">
													<p className="mb-0 pe-4 fw-semibold">{item.title}</p>
													{item.icon}
												</div>
											</Dropdown.Item>
										))}
										<Dropdown.Divider />
									</>
								)}
								<Dropdown.Item
									onClick={() => {
										signOutAndClearContext(
											AnalyticsNativeEventAccountSignedOutSource.PATIENT_HEADER,
											{}
										);
									}}
								>
									<div className="d-flex align-items-center">
										<SvgIcon
											kit="far"
											icon="arrow-left-from-bracket"
											size={20}
											className="me-4 text-danger"
										/>
										<p className="mb-0 pe-4 fw-semibold text-danger">Log Out</p>
									</div>
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
