import { ReactComponent as AvatarIcon } from '@/assets/icons/icon-avatar.svg';
import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-cobalt-horizontal.svg';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';
import { PatientOrderAutocompleteResult, PatientOrderModel } from '@/lib/models';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { Link, useMatch, useNavigate } from 'react-router-dom';
import { MhicHeaderAutoComplete } from './mhic-header-autocomplete';

interface MhicHeaderProps {
	recentOrders?: PatientOrderAutocompleteResult[];
	patientOrder?: PatientOrderModel;
}

export const MHIC_HEADER_HEIGHT = 56;

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
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
	brandingOuter: {
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		padding: '8px 0 8px 40px',
		borderRight: `1px solid ${theme.colors.n100}`,
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
}));

export const MhicHeader = ({ recentOrders = [], patientOrder }: MhicHeaderProps) => {
	const classes = useStyles();
	const { signOutAndClearContext } = useAccount();
	const navigate = useNavigate();
	const { account } = useAccount();

	const overviewMatch = useMatch({
		path: '/ic/mhic/overview/*',
	});
	const myPatientsMatch = useMatch({
		path: '/ic/mhic/my-patients/*',
	});
	const patientOrdersMatch = useMatch({
		path: '/ic/mhic/patient-orders/*',
	});
	const reportsMatch = useMatch({
		path: '/ic/mhic/reports',
	});
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
			...(account?.accountCapabilityFlags.canViewIcReports
				? [
						{
							testId: '',
							navigationItemId: 'REPORTS',
							to: '/ic/mhic/reports',
							title: 'Reports',
							active: !!reportsMatch,
						},
				  ]
				: []),
		],
		[
			overviewMatch,
			myPatientsMatch,
			patientOrdersMatch,
			account?.accountCapabilityFlags.canViewIcReports,
			reportsMatch,
		]
	);

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
							{navigationLinks.map((link, index) => (
								<li key={index} className={classNames({ active: link.active })}>
									{link.to && <Link to={link.to}>{link.title}</Link>}
								</li>
							))}
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
								<Dropdown.Toggle as={DropdownToggle} className="p-0" id="mhic-header__dropdown-menu">
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
						</>
					)}
				</div>
			</div>
		</header>
	);
};
