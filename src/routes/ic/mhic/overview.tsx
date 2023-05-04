import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Col, Container, Row, Tab } from 'react-bootstrap';
import classNames from 'classnames';

import { PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncWrapper from '@/components/async-page';
import TabBar from '@/components/tab-bar';
import { MhicInlineAlert, MhicPageHeader, MhicPatientOrderTable } from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as ClipboardIcon } from '@/assets/icons/icon-clipboard.svg';
import { ReactComponent as EventIcon } from '@/assets/icons/icon-event.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone-2.svg';
import { ReactComponent as TherapyIcon } from '@/assets/icons/icon-therapy.svg';
import { MhicLayoutContext } from './mhic-layout';

const useStyles = createUseThemedStyles((theme) => ({
	overviewCard: {
		padding: 16,
		display: 'flex',
		borderRadius: 8,
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
	},
	iconOuter: {
		width: 48,
		flexShrink: 0,
		marginRight: 16,
	},
	icon: {
		width: 48,
		height: 48,
		display: 'flex',
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
}));

enum TAB_KEYS {
	NEW_PATIENTS = 'NEW_PATIENTS',
	VOICEMAILS = 'VOICEMAILS',
	FOLLOW_UPS = 'FOLLOW_UPS',
	ASSESSMENTS = 'ASSESSMENTS',
	RESOURCES = 'RESOURCES',
}

export const Component = () => {
	const classes = useStyles();
	const { account } = useAccount();
	const navigate = useNavigate();
	const { setMainViewRefresher } = useOutletContext<MhicLayoutContext>();

	const [tabKey, setTabKey] = useState(TAB_KEYS.NEW_PATIENTS);

	const [safetyPatientOrders, setSafetyPatientOrders] = useState<PatientOrderModel[]>([]);
	const [newPatientOrders, setNewPatientOrders] = useState<PatientOrderModel[]>([]);
	const [voicemailPatientOrders, setVoicemailPatientOrders] = useState<PatientOrderModel[]>([]);
	const [followUpPatientOrders, setFollowUpPatientOrders] = useState<PatientOrderModel[]>([]);
	const [assessmentPatientOrders, setAssessmentPatientOrders] = useState<PatientOrderModel[]>([]);
	const [resourcesPatientOrders, setResourcesPatientOrders] = useState<PatientOrderModel[]>([]);

	const fetchData = useCallback(async () => {
		const {
			safetyPlanningPatientOrders,
			newPatientPatientOrders,
			voicemailTaskPatientOrders,
			followupPatientOrders,
			scheduledAssessmentPatientOrders,
			needResourcesPatientOrders,
		} = await integratedCareService.getOverview().fetch();

		setSafetyPatientOrders(safetyPlanningPatientOrders);
		setNewPatientOrders(newPatientPatientOrders);
		setVoicemailPatientOrders(voicemailTaskPatientOrders);
		setFollowUpPatientOrders(followupPatientOrders);
		setAssessmentPatientOrders(scheduledAssessmentPatientOrders);
		setResourcesPatientOrders(needResourcesPatientOrders);
	}, []);

	useEffect(() => {
		setMainViewRefresher(() => fetchData);
	}, [fetchData, setMainViewRefresher]);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<Container fluid className="py-8 overflow-visible">
				<Row className="mb-8">
					<Col>
						<MhicPageHeader title={`Welcome back, ${account?.firstName ?? 'MHIC'}`} />
					</Col>
				</Row>
				{safetyPatientOrders.length > 0 && (
					<Row className="mb-9">
						<Col>
							<MhicInlineAlert
								variant="danger"
								title={`${safetyPatientOrders.length} order${
									safetyPatientOrders.length === 1 ? '' : 's'
								} require${safetyPatientOrders.length === 1 ? 's' : ''} safety planning`}
								description={`Please review ${
									safetyPatientOrders.length === 1 ? 'this order' : 'these orders'
								} first`}
								action={{
									title: 'View Safety Planning',
									onClick: () => {
										navigate(
											'/ic/mhic/my-patients?patientOrderSafetyPlanningStatusId=NEEDS_SAFETY_PLANNING'
										);
									},
								}}
							/>
						</Col>
					</Row>
				)}
				<Row className="mb-10">
					<Col>
						<div className={classes.overviewCard}>
							<div className={classes.iconOuter}>
								<div className={classNames(classes.icon, 'bg-a50')}>
									<ClipboardIcon className="text-secondary" width={24} height={24} />
								</div>
							</div>
							<div>
								<p className="mb-0">New Patients</p>
								<h4 className="mb-0">{newPatientOrders.length}</h4>
							</div>
						</div>
					</Col>
					<Col>
						<div className={classes.overviewCard}>
							<div className={classes.iconOuter}>
								<div className={classNames(classes.icon, 'bg-w50')}>
									<TherapyIcon className="text-warning" width={24} height={24} />
								</div>
							</div>
							<div>
								<p className="mb-0">Voicemail Tasks</p>
								<h4 className="mb-0">{voicemailPatientOrders.length}</h4>
							</div>
						</div>
					</Col>
					<Col>
						<div className={classes.overviewCard}>
							<div className={classes.iconOuter}>
								<div className={classNames(classes.icon, 'bg-p50')}>
									<PhoneIcon className="text-primary" width={24} height={24} />
								</div>
							</div>
							<div>
								<p className="mb-0">Follow Ups</p>
								<h4 className="mb-0">{followUpPatientOrders.length}</h4>
							</div>
						</div>
					</Col>
					<Col>
						<div className={classes.overviewCard}>
							<div className={classes.iconOuter}>
								<div className={classNames(classes.icon, 'bg-s50')}>
									<EventIcon className="text-success" width={24} height={24} />
								</div>
							</div>
							<div>
								<p className="mb-0">Scheduled Assessments</p>
								<h4 className="mb-0">{assessmentPatientOrders.length}</h4>
							</div>
						</div>
					</Col>
				</Row>
				<Row className="mb-5">
					<Col>
						<h4 className="mb-2">My Prioirities</h4>
						<Tab.Container id="shelf-tabs" defaultActiveKey={TAB_KEYS.NEW_PATIENTS} activeKey={tabKey}>
							<TabBar
								className="mb-5"
								value={tabKey}
								tabs={[
									{
										value: TAB_KEYS.NEW_PATIENTS,
										title: `New Patients (${newPatientOrders.length})`,
									},
									{
										value: TAB_KEYS.VOICEMAILS,
										title: `Voicemails (${voicemailPatientOrders.length})`,
									},
									{
										value: TAB_KEYS.FOLLOW_UPS,
										title: `Follow Up (${followUpPatientOrders.length})`,
									},
									{
										value: TAB_KEYS.ASSESSMENTS,
										title: `Assessments (${assessmentPatientOrders.length})`,
									},
									{
										value: TAB_KEYS.RESOURCES,
										title: `Resources (${resourcesPatientOrders.length})`,
									},
								]}
								onTabClick={(value) => {
									setTabKey(value as TAB_KEYS);
								}}
							/>
							<Tab.Content>
								<Tab.Pane eventKey={TAB_KEYS.NEW_PATIENTS}>
									<MhicPatientOrderTable
										isLoading={false}
										patientOrders={newPatientOrders}
										selectAll={false}
										totalPatientOrdersCount={newPatientOrders.length}
										totalPatientOrdersDescription={String(newPatientOrders.length)}
										pageNumber={0}
										pageSize={1000}
										showPagination={false}
										onPaginationClick={() => {
											return;
										}}
										columnConfig={{
											flag: true,
											patient: true,
											practice: true,
											referralReason: true,
											outreachNumber: true,
											episode: true,
										}}
									/>
								</Tab.Pane>
								<Tab.Pane eventKey={TAB_KEYS.VOICEMAILS}>
									<MhicPatientOrderTable
										isLoading={false}
										patientOrders={voicemailPatientOrders}
										selectAll={false}
										totalPatientOrdersCount={voicemailPatientOrders.length}
										totalPatientOrdersDescription={String(voicemailPatientOrders.length)}
										pageNumber={0}
										pageSize={1000}
										showPagination={false}
										onPaginationClick={() => {
											return;
										}}
										columnConfig={{
											flag: true,
											patient: true,
											referralDate: true,
											outreachNumber: true,
											lastOutreach: true,
											episode: true,
										}}
									/>
								</Tab.Pane>
								<Tab.Pane eventKey={TAB_KEYS.FOLLOW_UPS}>
									<MhicPatientOrderTable
										isLoading={false}
										patientOrders={followUpPatientOrders}
										selectAll={false}
										totalPatientOrdersCount={followUpPatientOrders.length}
										totalPatientOrdersDescription={String(followUpPatientOrders.length)}
										pageNumber={0}
										pageSize={1000}
										showPagination={false}
										onPaginationClick={() => {
											return;
										}}
										columnConfig={{
											flag: true,
											patient: true,
											referralDate: true,
											outreachNumber: true,
											lastOutreach: true,
											episode: true,
										}}
									/>
								</Tab.Pane>
								<Tab.Pane eventKey={TAB_KEYS.ASSESSMENTS}>
									<MhicPatientOrderTable
										isLoading={false}
										patientOrders={assessmentPatientOrders}
										selectAll={false}
										totalPatientOrdersCount={assessmentPatientOrders.length}
										totalPatientOrdersDescription={String(assessmentPatientOrders.length)}
										pageNumber={0}
										pageSize={1000}
										showPagination={false}
										onPaginationClick={() => {
											return;
										}}
										columnConfig={{
											flag: true,
											patient: true,
											assessmentScheduled: true,
											episode: true,
										}}
									/>
								</Tab.Pane>
								<Tab.Pane eventKey={TAB_KEYS.RESOURCES}>
									<MhicPatientOrderTable
										isLoading={false}
										patientOrders={resourcesPatientOrders}
										selectAll={false}
										totalPatientOrdersCount={resourcesPatientOrders.length}
										totalPatientOrdersDescription={String(resourcesPatientOrders.length)}
										pageNumber={0}
										pageSize={1000}
										showPagination={false}
										onPaginationClick={() => {
											return;
										}}
										columnConfig={{
											flag: true,
											patient: true,
											assessmentCompleted: true,
											completedBy: true,
											triage: true,
											episode: true,
										}}
									/>
								</Tab.Pane>
							</Tab.Content>
						</Tab.Container>
					</Col>
				</Row>
			</Container>
		</AsyncWrapper>
	);
};
