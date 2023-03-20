import React, { FC, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Dropdown } from 'react-bootstrap';
import classNames from 'classnames';

import useAnalytics from '@/hooks/use-analytics';
import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import Menu from '@/components/menu';

import { exploreLinks } from '@/menu-links';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { CrisisAnalyticsEvent } from '@/contexts/analytics-context';

import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down-v2.svg';
import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-cobalt-horizontal.svg';
import { ReactComponent as AvatarIcon } from '@/assets/icons/icon-avatar.svg';
import { ReactComponent as MenuIcon } from '@/assets/icons/menu.svg';

import { ReactComponent as TherapyIcon } from '@/assets/icons/icon-therapy.svg';
import { ReactComponent as MedicationIcon } from '@/assets/icons/icon-medication.svg';
import { ReactComponent as CoachingIcon } from '@/assets/icons/icon-coaching.svg';
import { ReactComponent as SpiritualIcon } from '@/assets/icons/icon-spiritual.svg';
import { ReactComponent as CrisisIcon } from '@/assets/icons/icon-crisis.svg';
import { ReactComponent as GroupIcon } from '@/assets/icons/icon-group.svg';
import { ReactComponent as EventIcon } from '@/assets/icons/icon-event.svg';

import { ReactComponent as AdminIcon } from '@/assets/icons/icon-admin.svg';
import { ReactComponent as SpacesOfColorIcon } from '@/assets/icons/icon-spaces-of-color.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';

const useHeaderV2Styles = createUseThemedStyles((theme) => ({
	header: {
		top: 0,
		left: 0,
		right: 0,
		zIndex: 4,
		height: 56,
		position: 'fixed',
		display: 'flex',
		padding: '0 40px',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
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
					alignItems: 'center',
					textDecoration: 'none',
					...theme.fonts.default,
					color: theme.colors.n500,
					...theme.fonts.bodyNormal,
					padding: '0 12px !important',
					'&:hover': {
						color: theme.colors.p700,
						backgroundColor: 'transparent',
					},
				},
				'& .dropdown': {
					height: '100%',
				},
			},
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

interface HeaderProps {
	showHeaderButtons?: boolean;
}

const HeaderV2: FC<HeaderProps> = ({ showHeaderButtons = true }) => {
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

	useEffect(() => {
		document.body.classList.toggle('header-menu-open', !!menuOpen);
	}, [menuOpen]);

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

	const navigationConfig = useMemo(
		() => [
			{
				testId: 'menuLinkHome',
				navigationItemId: 'HOME',
				title: 'Home',
				to: '/',
			},
			{
				navigationItemId: 'CONNECT_WITH_SUPPORT',
				title: 'Connect with Support',
				items: [
					...(institution?.supportEnabled
						? [
								{
									icon: <TherapyIcon />,
									title: 'Therapy',
									description:
										'Connect to a therapist through your Employee Assistance Program or TEAM Clinic',
									to: '/connect-with-support&supportRoleId=CLINICIAN',
								},
								{
									icon: <MedicationIcon />,
									title: 'Medication Prescribers',
									description: 'Discuss medication prescription options through the TEAM Clinic',
									to: '/connect-with-support',
								},
								{
									icon: <CoachingIcon />,
									title: 'Coaching',
									description: 'Get 1:1 confidential emotional support from trained volunteers',
									to: '/connect-with-support&supportRoleId=PSYCHIATRIST',
								},
								{
									icon: <SpiritualIcon />,
									title: 'Spiritual Support',
									description:
										'Receive confidential, non-judgmental support from multi-faith chaplains',
									to: '/connect-with-support&supportRoleId=CHAPLAIN',
								},
						  ]
						: []),
					{
						testId: 'menuLinkCrisisResources',
						icon: <CrisisIcon />,
						title: 'Crisis Support',
						description: 'Get contact information for immediate help',
						to: '/in-crisis',
					},
					{
						testId: 'menuLinkGroupSessions',
						icon: <GroupIcon />,
						title: 'Group Sessions',
						description: 'Register for topical group sessions led by experts',
						to: '/group-sessions',
					},
				],
			},
			{
				navigationItemId: 'BROWSE_RESOURCES',
				title: 'Browse Resources',
				items: [
					{
						testId: 'menuLinkResourceLibrary',
						icon: <MedicationIcon />,
						title: 'Resource Library',
						description: 'Digital articles, podcasts, apps, videos, worksheets, and more',
						to: '/resource-library',
					},
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
		[institution?.additionalNavigationItems, institution?.supportEnabled]
	);

	return (
		<>
			<Menu open={menuOpen} onHide={handleMenuHide} />

			<header ref={header} className={classes.header}>
				<div className="h-100 d-flex align-items-center justify-content-between">
					<LogoSmallText className="text-primary" />

					<nav className={classes.desktopNav}>
						<ul>
							{navigationConfig.map((navigationItem) => (
								<li key={navigationItem.navigationItemId}>
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
				<div className="d-flex align-items-center justify-content-between">
					<Button className="py-1 d-flex align-items-center" size="sm" onClick={handleInCrisisButtonClick}>
						<PhoneIcon className="me-1" />
						<small className="fw-bold">In Crisis?</small>
					</Button>
					<Dropdown className="ms-4 d-flex align-items-center">
						<Dropdown.Toggle as={DropdownToggle} id="mhic-header__dropdown-menu">
							<AvatarIcon className="d-flex" />
						</Dropdown.Toggle>
						<Dropdown.Menu
							as={DropdownMenu}
							align="end"
							flip={false}
							popperConfig={{ strategy: 'fixed' }}
							renderOnMount
						>
							<p className="fw-bold text-gray">{account?.displayName}</p>
							<Dropdown.Item to="/my-calendar" as={Link}>
								<div className="d-flex align-items-center">
									<EventIcon />
									<p className="mb-0 ps-4 fw-semibold">My Events</p>
								</div>
							</Dropdown.Item>
							<Dropdown.Divider />
							{institutionCapabilities?.viewNavAdminMyContent ||
								institutionCapabilities?.viewNavAdminAvailableContent ||
								institutionCapabilities?.viewNavAdminGroupSession ||
								institutionCapabilities?.viewNavAdminGroupSessionRequest ||
								institutionCapabilities?.viewNavAdminReports}
							<Dropdown.Item
								onClick={() => {
									return;
								}}
							>
								<p className="mb-0 fw-semibold">Cobalt Admin</p>
							</Dropdown.Item>
							<Dropdown.Divider />
							<Dropdown.Item onClick={signOutAndClearContext}>
								<p className="mb-0 text-gray">Log Out</p>
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</div>
			</header>
		</>
	);
};

export default HeaderV2;
