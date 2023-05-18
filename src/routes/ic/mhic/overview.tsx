import React, { useEffect, useState } from 'react';
import { defer, useRouteLoaderData } from 'react-router-dom';
import { Col, Container, Row, Tab } from 'react-bootstrap';

import { MhicPanelTodayResponse, PatientOrdersListResponse, integratedCareService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import TabBar from '@/components/tab-bar';
import { MhicPageHeader, MhicPatientOrderTable, MhicShelfOutlet } from '@/components/integrated-care/mhic';

enum TAB_KEYS {
	NEW_PATIENTS = 'NEW_PATIENTS',
	VOICEMAILS = 'VOICEMAILS',
	FOLLOW_UPS = 'FOLLOW_UPS',
	ASSESSMENTS = 'ASSESSMENTS',
	RESOURCES = 'RESOURCES',
	SAFETY_PLANNING = 'SAFETY_PLANNING',
}

interface MhicOverviewLoaderData {
	overviewResponsePromise: Promise<MhicPanelTodayResponse>;
	newPatientResults: Promise<PatientOrdersListResponse['findResult']>;
	voicemailResults: Promise<PatientOrdersListResponse['findResult']>;
	followupResults: Promise<PatientOrdersListResponse['findResult']>;
	assessmentResults: Promise<PatientOrdersListResponse['findResult']>;
	resourcesResults: Promise<PatientOrdersListResponse['findResult']>;
	safetyPlanningResults: Promise<PatientOrdersListResponse['findResult']>;
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
		safetyPlanningResults: overviewResponsePromise.then((res) => {
			return {
				patientOrders: res.safetyPlanningPatientOrders,
				totalCount: res.safetyPlanningPatientOrders.length,
				totalCountDescription: res.safetyPlanningPatientOrders.length.toString(),
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
	[TAB_KEYS.SAFETY_PLANNING]: 0,
};

export const Component = () => {
	const { account } = useAccount();
	const {
		overviewResponsePromise,
		newPatientResults,
		voicemailResults,
		followupResults,
		assessmentResults,
		resourcesResults,
		safetyPlanningResults,
	} = useMhicOverviewLoaderData();

	const [tabKey, setTabKey] = useState(TAB_KEYS.NEW_PATIENTS);

	const [countsByStatus, setCountsByStatus] = useState<Record<TAB_KEYS, number>>({ ...INITIAL_COUNTS });

	useEffect(() => {
		// TODO: Perhaps better moving resolution behind <Await />
		overviewResponsePromise
			.then((res) => {
				setCountsByStatus({
					[TAB_KEYS.ASSESSMENTS]: res.scheduledAssessmentPatientOrders.length,
					[TAB_KEYS.FOLLOW_UPS]: res.followupPatientOrders.length,
					[TAB_KEYS.NEW_PATIENTS]: res.newPatientPatientOrders.length,
					[TAB_KEYS.RESOURCES]: res.needResourcesPatientOrders.length,
					[TAB_KEYS.VOICEMAILS]: res.voicemailTaskPatientOrders.length,
					[TAB_KEYS.SAFETY_PLANNING]: res.safetyPlanningPatientOrders.length,
				});
			})
			.catch((e) => {
				setCountsByStatus({ ...INITIAL_COUNTS });
			});
	}, [overviewResponsePromise]);

	return (
		<>
			<Container fluid className="py-8 overflow-visible">
				<Row className="mb-6">
					<Col>
						<MhicPageHeader
							title={`Welcome back, ${account?.firstName ?? 'MHIC'}`}
							description="Your priorities for today"
						/>
					</Col>
				</Row>
				<Row>
					<Col>
						<Tab.Container id="overview-tabs" defaultActiveKey={TAB_KEYS.NEW_PATIENTS} activeKey={tabKey}>
							<hr />
							<TabBar
								key="mhic-orders-overview-tabbar"
								className="mb-8"
								value={tabKey}
								tabs={[
									{
										value: TAB_KEYS.NEW_PATIENTS,
										title: `Outreach Review (${countsByStatus.NEW_PATIENTS})`,
									},
									{
										value: TAB_KEYS.VOICEMAILS,
										title: `Voicemail (${countsByStatus.VOICEMAILS})`,
									},
									{
										value: TAB_KEYS.FOLLOW_UPS,
										title: `Follow Up (${countsByStatus.FOLLOW_UPS})`,
									},
									{
										value: TAB_KEYS.ASSESSMENTS,
										title: `Assessment (${countsByStatus.ASSESSMENTS})`,
									},
									{
										value: TAB_KEYS.RESOURCES,
										title: `Resources (${countsByStatus.RESOURCES})`,
									},
									{
										value: TAB_KEYS.SAFETY_PLANNING,
										title: `Safety Planning (${countsByStatus.SAFETY_PLANNING})`,
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
											triage: true,
											episode: true,
										}}
									/>
								</Tab.Pane>
								<Tab.Pane eventKey={TAB_KEYS.SAFETY_PLANNING}>
									<MhicPatientOrderTable
										patientOrderFindResultPromise={safetyPlanningResults}
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
											referralReason: true,
											assessmentCompleted: true,
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
