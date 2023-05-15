import React, { useEffect, useState } from 'react';
import { defer, useNavigate, useRouteLoaderData } from 'react-router-dom';
import { Col, Container, Row, Tab } from 'react-bootstrap';
import classNames from 'classnames';

import { MhicPanelTodayResponse, PatientOrdersListResponse, integratedCareService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import TabBar from '@/components/tab-bar';
import {
	MhicInlineAlert,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicShelfOutlet,
} from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as ClipboardIcon } from '@/assets/icons/icon-clipboard.svg';
import { ReactComponent as EventIcon } from '@/assets/icons/icon-event.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone-2.svg';
import { ReactComponent as TherapyIcon } from '@/assets/icons/icon-therapy.svg';

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

interface MhicOverviewLoaderData {
	overviewResponsePromise: Promise<MhicPanelTodayResponse>;
	newPatientResults: Promise<PatientOrdersListResponse['findResult']>;
	voicemailResults: Promise<PatientOrdersListResponse['findResult']>;
	followupResults: Promise<PatientOrdersListResponse['findResult']>;
	assessmentResults: Promise<PatientOrdersListResponse['findResult']>;
	resourcesResults: Promise<PatientOrdersListResponse['findResult']>;
}

export function useMhicOverviewLoaderData() {
	return useRouteLoaderData('mhic-overview') as MhicOverviewLoaderData;
}

export async function loader() {
	const overviewResponsePromise = integratedCareService.getOverview().fetch();
	return defer({
		overviewResponsePromise,
		newPatientResults: overviewResponsePromise.then((res) => {
			return {
				patientOrders: res.newPatientPatientOrders,
				totalCount: res.newPatientPatientOrders.length,
				totalCountDescription: res.newPatientPatientOrders.length.toString(),
			};
		}),
		voicemailResults: overviewResponsePromise.then((res) => {
			return {
				patientOrders: res.voicemailTaskPatientOrders,
				totalCount: res.voicemailTaskPatientOrders.length,
				totalCountDescription: res.voicemailTaskPatientOrders.length.toString(),
			};
		}),
		followupResults: overviewResponsePromise.then((res) => {
			return {
				patientOrders: res.followupPatientOrders,
				totalCount: res.followupPatientOrders.length,
				totalCountDescription: res.followupPatientOrders.length.toString(),
			};
		}),
		assessmentResults: overviewResponsePromise.then((res) => {
			return {
				patientOrders: res.scheduledAssessmentPatientOrders,
				totalCount: res.scheduledAssessmentPatientOrders.length,
				totalCountDescription: res.scheduledAssessmentPatientOrders.length.toString(),
			};
		}),
		resourcesResults: overviewResponsePromise.then((res) => {
			return {
				patientOrders: res.needResourcesPatientOrders,
				totalCount: res.needResourcesPatientOrders.length,
				totalCountDescription: res.needResourcesPatientOrders.length.toString(),
			};
		}),
	});
}

const INITIAL_COUNTS = {
	[TAB_KEYS.ASSESSMENTS]: 0,
	[TAB_KEYS.FOLLOW_UPS]: 0,
	[TAB_KEYS.NEW_PATIENTS]: 0,
	[TAB_KEYS.RESOURCES]: 0,
	[TAB_KEYS.VOICEMAILS]: 0,
};

export const Component = () => {
	const classes = useStyles();
	const { account } = useAccount();
	const navigate = useNavigate();
	const {
		overviewResponsePromise,
		newPatientResults,
		voicemailResults,
		followupResults,
		assessmentResults,
		resourcesResults,
	} = useMhicOverviewLoaderData();

	const [tabKey, setTabKey] = useState(TAB_KEYS.NEW_PATIENTS);

	const [safetyPlanningOrderCount, setSafetyPlanningOrderCount] = useState(0);
	const [countsByStatus, setCountsByStatus] = useState<Record<TAB_KEYS, number>>({ ...INITIAL_COUNTS });

	useEffect(() => {
		// TODO: Perhaps better moving resolution behind <Await />
		overviewResponsePromise
			.then((res) => {
				setSafetyPlanningOrderCount(res.safetyPlanningPatientOrders.length);

				setCountsByStatus({
					[TAB_KEYS.ASSESSMENTS]: res.scheduledAssessmentPatientOrders.length,
					[TAB_KEYS.FOLLOW_UPS]: res.followupPatientOrders.length,
					[TAB_KEYS.NEW_PATIENTS]: res.newPatientPatientOrders.length,
					[TAB_KEYS.RESOURCES]: res.needResourcesPatientOrders.length,
					[TAB_KEYS.VOICEMAILS]: res.voicemailTaskPatientOrders.length,
				});
			})
			.catch((e) => {
				setSafetyPlanningOrderCount(0);
				setCountsByStatus({ ...INITIAL_COUNTS });
			});
	}, [overviewResponsePromise]);

	return (
		<>
			<Container fluid className="py-8 overflow-visible">
				<Row className="mb-8">
					<Col>
						<MhicPageHeader title={`Welcome, ${account?.firstName ?? 'MHIC'}`} />
					</Col>
				</Row>
				{safetyPlanningOrderCount > 0 && (
					<Row className="mb-9">
						<Col>
							<MhicInlineAlert
								variant="danger"
								title={`${safetyPlanningOrderCount} order${
									safetyPlanningOrderCount === 1 ? '' : 's'
								} require${safetyPlanningOrderCount === 1 ? 's' : ''} safety planning`}
								description={`Please review ${
									safetyPlanningOrderCount === 1 ? 'this order' : 'these orders'
								} first`}
								action={{
									title: 'View Safety Planning',
									onClick: () => {
										navigate('/ic/mhic/my-patients/safety-planning');
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
								<h4 className="mb-0">{countsByStatus.NEW_PATIENTS}</h4>
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
								<h4 className="mb-0">{countsByStatus.VOICEMAILS}</h4>
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
								<h4 className="mb-0">{countsByStatus.FOLLOW_UPS}</h4>
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
								<h4 className="mb-0">{countsByStatus.ASSESSMENTS}</h4>
							</div>
						</div>
					</Col>
				</Row>
				<Row className="mb-5">
					<Col>
						<h4 className="mb-2">My Prioirities</h4>
						<Tab.Container id="shelf-tabs" defaultActiveKey={TAB_KEYS.NEW_PATIENTS} activeKey={tabKey}>
							<TabBar
								key="mhic-orders-overview-tabbar"
								className="mb-5"
								value={tabKey}
								tabs={[
									{
										value: TAB_KEYS.NEW_PATIENTS,
										title: `New Review Patients (${countsByStatus.NEW_PATIENTS})`,
									},
									{
										value: TAB_KEYS.VOICEMAILS,
										title: `Voicemails (${countsByStatus.VOICEMAILS})`,
									},
									{
										value: TAB_KEYS.FOLLOW_UPS,
										title: `Follow Up (${countsByStatus.FOLLOW_UPS})`,
									},
									{
										value: TAB_KEYS.ASSESSMENTS,
										title: `Assessments (${countsByStatus.ASSESSMENTS})`,
									},
									{
										value: TAB_KEYS.RESOURCES,
										title: `Resources (${countsByStatus.RESOURCES})`,
									},
								]}
								onTabClick={(value) => {
									setTabKey(value as TAB_KEYS);
								}}
							/>
							<Tab.Content>
								<Tab.Pane eventKey={TAB_KEYS.NEW_PATIENTS}>
									<MhicPatientOrderTable
										patientOrderFindResultPromise={newPatientResults}
										selectAll={false}
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
										patientOrderFindResultPromise={voicemailResults}
										selectAll={false}
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
										patientOrderFindResultPromise={followupResults}
										selectAll={false}
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
										patientOrderFindResultPromise={assessmentResults}
										selectAll={false}
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
										patientOrderFindResultPromise={resourcesResults}
										selectAll={false}
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

			<MhicShelfOutlet />
		</>
	);
};
