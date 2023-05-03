import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Tab } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import CopyToClipboard from 'react-copy-to-clipboard';
import classNames from 'classnames';

import { PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useFlags from '@/hooks/use-flags';

import AsyncWrapper from '@/components/async-page';
import TabBar from '@/components/tab-bar';
import { MhicComments, MhicContactHistory, MhicOrderDetails } from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/icon-content-copy.svg';
import { MhicPatientOrderShelfActions } from './mhic-patient-order-shelf-actions';
import useFetchPanelAccounts from '@/pages/ic/hooks/use-fetch-panel-accounts';

const useStyles = createUseThemedStyles((theme) => ({
	patientOrderShelf: {
		top: 0,
		right: 0,
		bottom: 0,
		zIndex: 6,
		width: '95%',
		maxWidth: 800,
		display: 'flex',
		position: 'fixed',
		overflow: 'hidden',
		flexDirection: 'column',
		boxShadow: theme.elevation.e400,
		backgroundColor: theme.colors.n50,
		'& section': {
			padding: 32,
			borderBottom: `1px solid ${theme.colors.n100}`,
		},
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
	header: {
		padding: '28px 32px 0',
		position: 'relative',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
	shelfCloseButton: {
		top: 20,
		right: 24,
	},
	tabContent: {
		flex: 1,
		overflow: 'hidden',
	},
	tabPane: {
		height: '100%',
		overflowY: 'auto',
	},
	commentsPane: {
		height: '100%',
	},
	'@global': {
		'.patient-order-shelf-enter': {
			opacity: 0.5,
			transform: 'translateX(100%)',
		},
		'.patient-order-shelf-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: 'transform 300ms, opacity 300ms',
		},
		'.patient-order-shelf-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.patient-order-shelf-exit-active': {
			opacity: 0.5,
			transform: 'translateX(100%)',
			transition: 'transform 300ms, opacity 300ms',
		},
		'.patient-order-shelf-overlay-enter': {
			opacity: 0,
		},
		'.patient-order-shelf-overlay-enter-active': {
			opacity: 1,
			transition: 'opacity 300ms',
		},
		'.patient-order-shelf-overlay-exit': {
			opacity: 1,
		},
		'.patient-order-shelf-overlay-exit-active': {
			opacity: 0,
			transition: 'opacity 300ms',
		},
	},
}));

interface MhicPatientOrderShelfProps {
	patientOrderId: string | null;
	mainViewRefresher(): void;
	onHide(): void;
	onShelfLoad(result: PatientOrderModel): void;
}

enum TAB_KEYS {
	ORDER_DETAILS = 'ORDER_DETAILS',
	CONTACT_HISOTRY = 'CONTACT_HISOTRY',
	COMMENTS = 'COMMENTS',
}

export const MhicPatientOrderShelf = ({
	patientOrderId,
	mainViewRefresher,
	onHide,
	onShelfLoad,
}: MhicPatientOrderShelfProps) => {
	const classes = useStyles();
	const { addFlag } = useFlags();

	const { fetchPanelAccounts, panelAccounts = [] } = useFetchPanelAccounts();

	const [tabKey, setTabKey] = useState(TAB_KEYS.ORDER_DETAILS);
	const [currentPatientOrder, setCurrentPatientOrder] = useState<PatientOrderModel>();
	const [pastPatientOrders, setPastPatientOrders] = useState<PatientOrderModel[]>([]);
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();

	const fetchPatientOverview = useCallback(async () => {
		if (!patientOrderId) {
			return;
		}

		const [patientOverviewResponse, referenceDataResponse] = await Promise.all([
			integratedCareService.getPatientOrder(patientOrderId).fetch(),
			integratedCareService.getReferenceData().fetch(),
			fetchPanelAccounts(),
		]);

		setCurrentPatientOrder(patientOverviewResponse.patientOrder);
		setPastPatientOrders(patientOverviewResponse.associatedPatientOrders);
		setReferenceData(referenceDataResponse);
		onShelfLoad(patientOverviewResponse.patientOrder);
	}, [fetchPanelAccounts, onShelfLoad, patientOrderId]);

	const handlePatientOrderChanges = useCallback(
		(changedOrder: PatientOrderModel) => {
			setCurrentPatientOrder(changedOrder);
			mainViewRefresher();
		},
		[mainViewRefresher]
	);

	useEffect(() => {
		if (patientOrderId) {
			document.body.style.overflow = 'hidden';
			return;
		}

		document.body.style.overflow = 'visible';
	}, [patientOrderId]);

	return (
		<>
			<CSSTransition
				in={!!patientOrderId}
				timeout={300}
				classNames="patient-order-shelf"
				mountOnEnter
				unmountOnExit
			>
				<div className={classes.patientOrderShelf}>
					<AsyncWrapper fetchData={fetchPatientOverview}>
						<Tab.Container
							id="shelf-tabs"
							defaultActiveKey={TAB_KEYS.ORDER_DETAILS}
							activeKey={tabKey}
							mountOnEnter
							unmountOnExit
						>
							<div className={classes.header}>
								{currentPatientOrder && (
									<MhicPatientOrderShelfActions
										patientOrder={currentPatientOrder}
										onDataChange={handlePatientOrderChanges}
									/>
								)}
								<Button
									variant="light"
									className={classNames(classes.shelfCloseButton, 'p-2 position-absolute')}
									onClick={onHide}
								>
									<CloseIcon className="d-block" />
								</Button>
								<div className="mb-2 d-flex align-items-center">
									<h4 className="mb-0 me-2">{currentPatientOrder?.patientDisplayName}</h4>
									{currentPatientOrder?.totalOutreachCount === 0 && (
										<Badge pill bg="outline-primary">
											New
										</Badge>
									)}
								</div>
								<div className="d-flex align-items-center">
									<p className="mb-0">
										MRN: <span className="fw-bold">{currentPatientOrder?.patientMrn}</span>
									</p>
									<CopyToClipboard
										onCopy={() => {
											addFlag({
												variant: 'success',
												title: 'Copied!',
												description: 'The MRN was copied to your clipboard',
												actions: [],
											});
										}}
										text={currentPatientOrder?.patientMrn ?? ''}
									>
										<Button variant="link" className="p-2">
											<CopyIcon width={20} height={20} />
										</Button>
									</CopyToClipboard>
									<span className="text-n300 me-2">|</span>
									<p className="mb-0">
										Phone:{' '}
										<span className="fw-bold">
											{currentPatientOrder?.patientPhoneNumberDescription}
										</span>
									</p>
									<span className="text-n300 mx-2">|</span>
									<p className="mb-0">
										MHIC:{' '}
										<span className="fw-bold">
											{currentPatientOrder?.panelAccountDisplayName ?? 'Unassigned'}
										</span>
									</p>
								</div>
								<div>
									<TabBar
										hideBorder
										value={tabKey}
										tabs={[
											{ value: TAB_KEYS.ORDER_DETAILS, title: 'Order Details' },
											{ value: TAB_KEYS.CONTACT_HISOTRY, title: 'Contact History' },
											{ value: TAB_KEYS.COMMENTS, title: 'Comments' },
										]}
										onTabClick={(value) => {
											setTabKey(value as TAB_KEYS);
										}}
									/>
								</div>
							</div>
							<Tab.Content className={classes.tabContent}>
								<Tab.Pane eventKey={TAB_KEYS.ORDER_DETAILS} className={classes.tabPane}>
									{currentPatientOrder && referenceData && (
										<MhicOrderDetails
											patientOrder={currentPatientOrder}
											pastPatientOrders={pastPatientOrders}
											panelAccounts={panelAccounts}
											referenceData={referenceData}
											onPatientOrderChange={handlePatientOrderChanges}
										/>
									)}
								</Tab.Pane>
								<Tab.Pane eventKey={TAB_KEYS.CONTACT_HISOTRY} className={classes.tabPane}>
									{currentPatientOrder && referenceData && (
										<MhicContactHistory
											patientOrder={currentPatientOrder}
											referenceData={referenceData}
											onPatientOrderChange={handlePatientOrderChanges}
										/>
									)}
								</Tab.Pane>
								<Tab.Pane eventKey={TAB_KEYS.COMMENTS} className={classes.commentsPane}>
									{currentPatientOrder && (
										<MhicComments
											patientOrder={currentPatientOrder}
											onPatientOrderChange={handlePatientOrderChanges}
										/>
									)}
								</Tab.Pane>
							</Tab.Content>
						</Tab.Container>
					</AsyncWrapper>
				</div>
			</CSSTransition>
			<CSSTransition
				in={!!patientOrderId}
				timeout={300}
				classNames="patient-order-shelf-overlay"
				onClick={onHide}
				mountOnEnter
				unmountOnExit
			>
				<div className={classes.overlay} />
			</CSSTransition>
		</>
	);
};
