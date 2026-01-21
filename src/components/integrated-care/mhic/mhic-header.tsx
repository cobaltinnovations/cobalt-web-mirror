import LogoSmallText from '@/assets/logos/logo-cobalt-horizontal.svg?react';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';
import { PatientOrderAutocompleteResult, PatientOrderModel } from '@/lib/models';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { Link, matchPath, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { MhicHeaderAutoComplete } from './mhic-header-autocomplete';
import HeaderNavDropdown from '@/components/header-nav-dropdown';
import { AnalyticsNativeEventAccountSignedOutSource } from '@/lib/models';
import SvgIcon from '@/components/svg-icon';

interface MhicHeaderProps {
	recentOrders?: PatientOrderAutocompleteResult[];
	patientOrder?: PatientOrderModel;
}

export const MHIC_HEADER_HEIGHT = 60;

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		top: 0,
		left: 0,
		right: 0,
		zIndex: 4,
		height: MHIC_HEADER_HEIGHT,
		display: 'flex',
		position: 'fixed',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	brandingOuter: {
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		padding: '8px 0 8px 40px',
		borderRight: `1px solid ${theme.colors.border}`,
	},
	navigationOuter: {
		flex: 1,
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		'& nav ul': {
			margin: 0,
			padding: 0,
			height: '100%',
			display: 'flex',
			listStyle: 'none',
		},
		'& nav ul li': {
			height: '100%',
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
}));

export const MhicHeader = ({ recentOrders = [], patientOrder }: MhicHeaderProps) => {
	const classes = useStyles();
	const { signOutAndClearContext, account } = useAccount();
	const navigate = useNavigate();
	const location = useLocation();

	const overviewMatch = useMatch({
		path: '/ic/mhic/overview/*',
	});
	const myPatientsMatch = useMatch({
		path: '/ic/mhic/my-patients/*',
	});
	const patientOrdersMatch = useMatch({
		path: '/ic/mhic/patient-orders/*',
	});
	const adminMatch = useMatch({
		path: '/ic/mhic/admin/*',
	});

	const hideDefaultHeaderRoutes = [
		'/ic/mhic/resource-locations/add',
		'/ic/mhic/resource-locations/:careResourceLocationId/edit',
		'/ic/mhic/admin/resources/:careResourceId/add-location',
		'/ic/mhic/resource-search/:patientOrderId',
	].some((path) => matchPath(path, location.pathname));

	const assessmentMatch = useMatch({
		path: '/ic/mhic/order-assessment/:patientOrderId/*',
	});

	const isInAssessmentView = !!assessmentMatch;

	const hasAssessmentResult = !!patientOrder?.screeningSessionResult;

	const navigationLinks = useMemo(
		() => [
			{
				testId: '',
				navigationItemId: 'MY_PANEL',
				to: '/ic/mhic',
				title: 'My Panel',
				active: !!overviewMatch || !!myPatientsMatch,
			},
			{
				testId: '',
				navigationItemId: 'PATIENT_ORDERS',
				to: '/ic/mhic/patient-orders',
				title: 'Patient Orders',
				active: patientOrdersMatch,
			},
			{
				testId: '',
				navigationItemId: 'ADMIN',
				title: 'Admin',
				active: adminMatch,
				items: [
					...(account?.accountCapabilityFlags.canManageCareResources
						? [
								{
									testId: '',
									navigationItemId: 'RESOURCES',
									to: '/ic/mhic/admin/resources',
									title: 'Resources',
									active: false,
								},
							]
						: []),
					...(account?.accountCapabilityFlags.canAdministerIcDepartments
						? [
								{
									testId: '',
									navigationItemId: 'DEPARTMENT_AVAILABILITY',
									to: '/ic/mhic/admin/department-availability',
									title: 'Department Availability',
									active: false,
								},
							]
						: []),
					...(account?.accountCapabilityFlags.canViewIcReports
						? [
								{
									testId: '',
									navigationItemId: 'REPORTS',
									to: '/ic/mhic/admin/reports',
									title: 'Reports',
									active: false,
								},
							]
						: []),
				],
			},
		],
		[
			account?.accountCapabilityFlags.canAdministerIcDepartments,
			account?.accountCapabilityFlags.canManageCareResources,
			account?.accountCapabilityFlags.canViewIcReports,
			adminMatch,
			myPatientsMatch,
			overviewMatch,
			patientOrdersMatch,
		]
	);

	if (hideDefaultHeaderRoutes) {
		return null;
	}

	return (
		<header className={classes.header}>
			<div
				className={classes.brandingOuter}
				style={{
					minWidth: isInAssessmentView ? 'auto' : 280,
				}}
			>
				<LogoSmallText className="me-3 text-primary" width={105.78} height={14} />
				{!isInAssessmentView && <span className="d-block text-gray">Integrated Care</span>}
			</div>
			<div className={classNames({ 'px-10': !isInAssessmentView }, classes.navigationOuter)}>
				{isInAssessmentView ? (
					<h5 className="ms-3 mb-0 text-primary">Assessment for {patientOrder?.patientDisplayName}</h5>
				) : (
					<nav className="h-100">
						<ul>
							{navigationLinks.map((link, index) => {
								if (link.items) {
									return (
										<li key={index} className={classNames({ active: link.active })}>
											<HeaderNavDropdown title={link.title} featuredItem={null}>
												{link.items.map((item, itemIndex) => (
													<Dropdown.Item key={itemIndex} to={item.to} as={Link}>
														{item.title}
													</Dropdown.Item>
												))}
											</HeaderNavDropdown>
										</li>
									);
								}

								return (
									<li key={index} className={classNames({ active: link.active })}>
										{link.to && <Link to={link.to}>{link.title}</Link>}
									</li>
								);
							})}
						</ul>
					</nav>
				)}
				<div className="d-flex align-items-center">
					{isInAssessmentView ? (
						<Button
							variant="link"
							className="p-0 me-10 text-decoration-none"
							size="sm"
							onClick={() => {
								navigate({
									pathname: '/ic/mhic/my-patients/' + patientOrder?.patientOrderId,
								});
							}}
						>
							{hasAssessmentResult ? 'Done' : 'Exit'}
						</Button>
					) : (
						<>
							<MhicHeaderAutoComplete recentOrders={recentOrders} />

							<Dropdown className="ms-6 d-flex align-items-center">
								<Dropdown.Toggle
									as={DropdownToggle}
									className="p-0 border-0"
									id="mhic-header__dropdown-menu"
								>
									<SvgIcon kit="fas" icon="circle-user" size={32} className="d-flex text-p700" />
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
											signOutAndClearContext(
												AnalyticsNativeEventAccountSignedOutSource.MHIC_HEADER,
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
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						</>
					)}
				</div>
			</div>
		</header>
	);
};
