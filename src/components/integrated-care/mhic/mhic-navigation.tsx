import React, { PropsWithChildren, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';
import classNames from 'classnames';

import { ActivePatientOrderCountModel, PatientOrderStatusId } from '@/lib/models';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as AvatarIcon } from '@/assets/icons/icon-avatar.svg';

const headerHeight = 56;
const sideNavWidth = 280;

const useStyles = createUseThemedStyles((theme) => ({
	sideNav: {
		left: 0,
		bottom: 0,
		padding: 16,
		position: 'fixed',
		overflowY: 'auto',
		top: headerHeight,
		width: sideNavWidth,
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	collapseList: {
		margin: 0,
		padding: 0,
		listStyle: 'none',
		'& li button': {
			border: 0,
			padding: 8,
			width: '100%',
			borderRadius: 4,
			display: 'flex',
			alignItems: 'center',
			textDecoration: 'none',
			color: theme.colors.n900,
			...theme.fonts.bodyNormal,
			backgroundColor: 'transparent',
			justifyContent: 'space-between',
			'&.active': {
				backgroundColor: theme.colors.n50,
			},
		},
	},
	dotOuter: {
		width: 24,
		height: 24,
		marginRight: 8,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: '50%',
	},
	body: {
		right: 0,
		bottom: 0,
		position: 'fixed',
		overflowY: 'auto',
		top: headerHeight,
		left: sideNavWidth,
	},
}));

interface Props {
	patientOrderPanelTypeId: string;
	orderCountsByStatusId?: Record<PatientOrderStatusId, ActivePatientOrderCountModel>;
	onClick(patientOrderPanelTypeId: string): void;
}

export const MhicNavigation = ({
	patientOrderPanelTypeId,
	orderCountsByStatusId,
	onClick,
	children,
}: PropsWithChildren<Props>) => {
	const classes = useStyles();
	const { account } = useAccount();

	const assignedOrders = useMemo(
		() => [
			{
				patientOrderPanelTypeId: '',
				title: 'All',
				count: '[TODO] 76',
				backgroundClassName: 'bg-n300',
			},
			{
				patientOrderPanelTypeId: 'NEED_ASSESSMENT',
				title: 'Need Assessment',
				count: '[TODO] 15',
				backgroundClassName: 'bg-w500',
			},
			{
				patientOrderPanelTypeId: 'SAFETY_PLANNING',
				title: 'Safety Planning',
				count: '[TODO] 2',
				backgroundClassName: 'bg-d500',
			},
			{
				patientOrderPanelTypeId: 'SPECIALTY_CARE',
				title: 'Specialty Care',
				count: '[TODO] 15',
				backgroundClassName: 'bg-primary',
			},
			{
				patientOrderPanelTypeId: 'BHP',
				title: 'BHP',
				count: '[TODO] 15',
				backgroundClassName: 'bg-s500',
			},
			{
				patientOrderPanelTypeId: 'CLOSED',
				title: 'Closed',
				count: orderCountsByStatusId?.[PatientOrderStatusId.CLOSED].countDescription ?? '0',
				backgroundClassName: 'bg-n500',
			},
		],
		[orderCountsByStatusId]
	);

	return (
		<>
			<div className={classes.sideNav}>
				<div className="pt-1 pb-5 d-flex align-items-center border-bottom">
					<AvatarIcon className="me-3" />
					<div>
						<span className="d-block">{account?.displayName}</span>
						<span className="d-block text-gray">MHIC</span>
					</div>
				</div>
				<nav>
					<ul className="list-unstyled">
						<li>
							<Link to="/#">my tasks</Link>
						</li>
						<li>
							<Link to="/#">Assigned Orders</Link>
							<Collapse in={true}>
								<ul className={classes.collapseList}>
									{assignedOrders.map((assignedOrder) => (
										<li>
											<button
												onClick={() => {
													onClick(assignedOrder.patientOrderPanelTypeId);
												}}
												className={classNames({
													active:
														patientOrderPanelTypeId ===
														assignedOrder.patientOrderPanelTypeId,
												})}
											>
												<div className="d-flex align-items-center">
													<div className={classes.dotOuter}>
														<div
															className={classNames(
																classes.dot,
																assignedOrder.backgroundClassName
															)}
														/>
													</div>
													<span className="d-block">{assignedOrder.title}</span>
												</div>
												<span className="d-block text-gray">{assignedOrder.count}</span>
											</button>
										</li>
									))}
								</ul>
							</Collapse>
						</li>
					</ul>
				</nav>
			</div>
			<div className={classes.body}>{children}</div>
		</>
	);
};
