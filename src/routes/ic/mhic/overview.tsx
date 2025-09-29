import React, { useEffect, useMemo, useState } from 'react';
import { defer, useRouteLoaderData } from 'react-router-dom';
import { Col, Container, Row, Tab } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import {
	MhicPanelTodayResponse,
	PatientOrdersListResponse,
	analyticsService,
	integratedCareService,
} from '@/lib/services';
import useAccount from '@/hooks/use-account';
import TabBar from '@/components/tab-bar';
import { MhicPageHeader, MhicPatientOrderTable, MhicShelfOutlet } from '@/components/integrated-care/mhic';
import { usePolledLoaderData } from '@/hooks/use-polled-loader-data';
import { useMhicPatientOrdereShelfLoaderData } from './patient-order-shelf';
import { AnalyticsNativeEventMhicPriorityGroupId, AnalyticsNativeEventTypeId } from '@/lib/models';

enum TAB_KEYS {
	OUTREACH_REVIEW = 'OUTREACH_REVIEW',
	VOICEMAILS = 'VOICEMAILS',
	FOLLOW_UPS = 'FOLLOW_UPS',
	ASSESSMENTS = 'ASSESSMENTS',
	RESOURCES = 'RESOURCES',
	SAFETY_PLANNING = 'SAFETY_PLANNING',
}

interface MhicOverviewLoaderData {
	getResponseChecksum: () => Promise<string | undefined>;
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

function loadOverviewData(isPolling = false) {
	const request = integratedCareService.getOverview();
	const overviewResponsePromise = request.fetch({ isPolling });

	return {
		getResponseChecksum: () => overviewResponsePromise.then(() => request.cobaltResponseChecksum),
		overviewResponsePromise,
		newPatientResults: overviewResponsePromise.then((res) => {
			return {
				patientOrders: res.outreachReviewPatientOrders,
				totalCount: res.outreachReviewPatientOrders.length,
				totalCountDescription: res.outreachReviewPatientOrders.length.toString(),
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
				patientOrders: res.outreachFollowupNeededPatientOrders,
				totalCount: res.outreachFollowupNeededPatientOrders.length,
				totalCountDescription: res.outreachFollowupNeededPatientOrders.length.toString(),
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
	};
}

export async function loader() {
	return defer(loadOverviewData());
}

const INITIAL_COUNTS = {
	[TAB_KEYS.ASSESSMENTS]: 0,
	[TAB_KEYS.FOLLOW_UPS]: 0,
	[TAB_KEYS.OUTREACH_REVIEW]: 0,
	[TAB_KEYS.RESOURCES]: 0,
	[TAB_KEYS.VOICEMAILS]: 0,
	[TAB_KEYS.SAFETY_PLANNING]: 0,
};

export const Component = () => {
	const { account, institution } = useAccount();
	const shelfData = useMhicPatientOrdereShelfLoaderData();
	const { data, isLoading } = usePolledLoaderData({
		useLoaderHook: useMhicOverviewLoaderData,
		immediateUpdate: !!shelfData,
		pollingFn: () => loadOverviewData(true),
	});
	const {
		overviewResponsePromise,
		newPatientResults,
		voicemailResults,
		followupResults,
		assessmentResults,
		resourcesResults,
		safetyPlanningResults,
	} = data;

	const [tabKey, setTabKey] = useState(TAB_KEYS.OUTREACH_REVIEW);
	const [countsByStatus, setCountsByStatus] = useState<Record<TAB_KEYS, number>>({ ...INITIAL_COUNTS });
	const [countsHaveLoaded, setCountsHaveLoaded] = useState(false);

	useEffect(() => {
		const fetchCounts = async () => {
			try {
				const res = await overviewResponsePromise;
				setCountsByStatus({
					[TAB_KEYS.ASSESSMENTS]: res.scheduledAssessmentPatientOrders.length,
					[TAB_KEYS.FOLLOW_UPS]: res.outreachFollowupNeededPatientOrders.length,
					[TAB_KEYS.OUTREACH_REVIEW]: res.outreachReviewPatientOrders.length,
					[TAB_KEYS.RESOURCES]: res.needResourcesPatientOrders.length,
					[TAB_KEYS.VOICEMAILS]: res.voicemailTaskPatientOrders.length,
					[TAB_KEYS.SAFETY_PLANNING]: res.safetyPlanningPatientOrders.length,
				});
			} catch (e) {
				setCountsByStatus({ ...INITIAL_COUNTS });
			} finally {
				setCountsHaveLoaded(true);
			}
		};

		fetchCounts();
	}, [overviewResponsePromise]);

	const tabKeyAnalyticsEvents: Record<TAB_KEYS, () => void> = useMemo(
		() => ({
			[TAB_KEYS.ASSESSMENTS]: () => {
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_PRIORITIES, {
					priorityGroupId: AnalyticsNativeEventMhicPriorityGroupId.SCHEDULED_ASSESSMENT,
					totalCount: countsByStatus.ASSESSMENTS,
				});
			},
			[TAB_KEYS.FOLLOW_UPS]: () => {
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_PRIORITIES, {
					priorityGroupId: AnalyticsNativeEventMhicPriorityGroupId.OUTREACH_FOLLOWUP_NEEDED,
					totalCount: countsByStatus.FOLLOW_UPS,
				});
			},
			[TAB_KEYS.OUTREACH_REVIEW]: () => {
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_PRIORITIES, {
					priorityGroupId: AnalyticsNativeEventMhicPriorityGroupId.OUTREACH_REVIEW,
					totalCount: countsByStatus.OUTREACH_REVIEW,
				});
			},
			[TAB_KEYS.RESOURCES]: () => {
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_PRIORITIES, {
					priorityGroupId: AnalyticsNativeEventMhicPriorityGroupId.NEED_RESOURCES,
					totalCount: countsByStatus.RESOURCES,
				});
			},
			[TAB_KEYS.SAFETY_PLANNING]: () => {
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_PRIORITIES, {
					priorityGroupId: AnalyticsNativeEventMhicPriorityGroupId.SAFETY_PLANNING,
					totalCount: countsByStatus.SAFETY_PLANNING,
				});
			},
			[TAB_KEYS.VOICEMAILS]: () => {
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_PRIORITIES, {
					priorityGroupId: AnalyticsNativeEventMhicPriorityGroupId.VOICEMAIL_TASK,
					totalCount: countsByStatus.VOICEMAILS,
				});
			},
		}),
		[
			countsByStatus.ASSESSMENTS,
			countsByStatus.FOLLOW_UPS,
			countsByStatus.OUTREACH_REVIEW,
			countsByStatus.RESOURCES,
			countsByStatus.SAFETY_PLANNING,
			countsByStatus.VOICEMAILS,
		]
	);

	useEffect(() => {
		if (!countsHaveLoaded) {
			return;
		}

		tabKeyAnalyticsEvents[tabKey]();
	}, [countsHaveLoaded, tabKey, tabKeyAnalyticsEvents]);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Integrated Care - Overview</title>
			</Helmet>

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
						<Tab.Container
							id="overview-tabs"
							defaultActiveKey={TAB_KEYS.OUTREACH_REVIEW}
							activeKey={tabKey}
						>
							<hr />
							<TabBar
								key="mhic-orders-overview-tabbar"
								className="mb-8"
								value={tabKey}
								tabs={[
									{
										value: TAB_KEYS.OUTREACH_REVIEW,
										title: `New Order Review (${countsByStatus.OUTREACH_REVIEW})`,
									},
									{
										value: TAB_KEYS.VOICEMAILS,
										title: `Voicemail (${countsByStatus.VOICEMAILS})`,
									},
									{
										value: TAB_KEYS.FOLLOW_UPS,
										title: `Follow-Up (${countsByStatus.FOLLOW_UPS})`,
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
								<Tab.Pane eventKey={TAB_KEYS.OUTREACH_REVIEW}>
									<MhicPatientOrderTable
										isLoading={isLoading}
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
										isLoading={isLoading}
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
											lastContact: true,
											nextContact: true,
											nextContactType: true,
											episode: true,
										}}
									/>
								</Tab.Pane>
								<Tab.Pane eventKey={TAB_KEYS.FOLLOW_UPS}>
									<MhicPatientOrderTable
										isLoading={isLoading}
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
											lastContact: true,
											nextContact: true,
											nextContactType: true,
											episode: true,
										}}
									/>
								</Tab.Pane>
								<Tab.Pane eventKey={TAB_KEYS.ASSESSMENTS}>
									<MhicPatientOrderTable
										isLoading={isLoading}
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
										isLoading={isLoading}
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
										isLoading={isLoading}
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
