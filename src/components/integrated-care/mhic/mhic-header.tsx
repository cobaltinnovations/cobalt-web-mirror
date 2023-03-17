import React, { useMemo } from 'react';
import { Link, useLocation, matchPath, useNavigate } from 'react-router-dom';
import { Button, Dropdown } from 'react-bootstrap';
import classNames from 'classnames';

import useAccount from '@/hooks/use-account';
import InputHelperSearch from '@/components/input-helper-search';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-cobalt-horizontal.svg';
import { ReactComponent as AvatarIcon } from '@/assets/icons/icon-avatar.svg';
import { AccountModel, PatientOrderModel } from '@/lib/models';

interface MhicHeaderProps {
	assessmentView?: boolean;
	patientOrder?: PatientOrderModel;
	patientAccount?: AccountModel;
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
			position: 'relative',
			'& a': {
				height: '100%',
				display: 'flex',
				padding: '0 12px',
				alignItems: 'center',
				textDecoration: 'none',
				color: theme.colors.n500,
				...theme.fonts.bodyNormal,
				'&:hover': {
					color: theme.colors.p700,
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
				'& a': {
					paddingLeft: 0,
				},
				'&:after': {
					left: 0,
				},
			},
			'&:last-child': {
				'& a': {
					paddingRight: 0,
				},
				'&:after': {
					right: 0,
				},
			},
			'&.active': {
				'& a': {
					color: theme.colors.p700,
				},
				'&:after': {
					backgroundColor: theme.colors.p500,
				},
			},
		},
	},
}));

export const MhicHeader = ({ assessmentView = false, patientOrder, patientAccount }: MhicHeaderProps) => {
	const classes = useStyles();
	const { pathname } = useLocation();
	const { signOutAndClearContext } = useAccount();
	const navigate = useNavigate();

	const hasAssessmentResult = !!patientOrder?.screeningSessionResult;

	const navigationLinks = useMemo(
		() => [
			{
				to: '/ic/mhic/my-view',
				title: 'My View',
				active: matchPath('/ic/mhic/my-view/*', pathname),
			},
			{
				to: '/ic/mhic/orders',
				title: 'Orders',
				active: matchPath('/ic/mhic/orders', pathname),
			},
			{
				to: '/ic/mhic/reports',
				title: 'Reports',
				active: matchPath('/ic/mhic/reports', pathname),
			},
		],
		[pathname]
	);

	return (
		<header className={classes.header}>
			<div
				className={classes.brandingOuter}
				style={{
					minWidth: assessmentView ? 'auto' : 280,
				}}
			>
				<LogoSmallText className="me-3 text-primary" width={105.78} height={14} />
				{!assessmentView && <span className="d-block text-gray">Integrated Care</span>}
			</div>
			<div className={classNames({ 'px-10': !assessmentView }, classes.navigationOuter)}>
				{assessmentView ? (
					<h5 className="ms-3 mb-0 text-primary">Assessment for {patientAccount?.displayName}</h5>
				) : (
					<nav className="h-100">
						<ul>
							{navigationLinks.map((link, index) => (
								<li
									key={index}
									className={classNames('h-100', {
										active: link.active,
									})}
								>
									<Link to={link.to}>{link.title}</Link>
								</li>
							))}
						</ul>
					</nav>
				)}
				<div className="d-flex align-items-center">
					{assessmentView ? (
						<Button
							variant="light"
							className="p-0 me-10"
							size="sm"
							onClick={() => {
								navigate({
									pathname: '/ic/mhic/orders',
									search: `?openPatientOrderId=${patientOrder?.patientOrderId}`,
								});
							}}
						>
							{hasAssessmentResult ? 'Done' : 'Exit'}
						</Button>
					) : (
						<>
							<InputHelperSearch
								placeholder="Search"
								onClear={() => {
									return;
								}}
							/>
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
