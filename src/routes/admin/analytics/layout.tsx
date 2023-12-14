import InputHelper from '@/components/input-helper';
import Loader from '@/components/loader';
import TabBar from '@/components/tab-bar';
import { adminAnalyticsService } from '@/lib/services/admin-analytics-service';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import React, { Suspense, useMemo } from 'react';
import { Col, Container, Row, Tab } from 'react-bootstrap';
import { Outlet, useMatch, useRouteLoaderData, useSearchParams } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

type AdminAnalyticsLayoutLoaderData = Awaited<ReturnType<typeof loader>>;

export function useAdminAnalyticsLayoutLoaderData() {
	return useRouteLoaderData('admin-analytics-layout') as AdminAnalyticsLayoutLoaderData;
}

export async function loader() {
	return {
		dateOptions: adminAnalyticsService.getDateOptions(),
	};
}

export const Component = () => {
	const { dateOptions } = useAdminAnalyticsLayoutLoaderData();
	const match = useMatch('/admin/analytics/:dashboardTab');
	const [searchParams, setSearchParams] = useSearchParams({
		startDate: dateOptions[0].startDate,
		endDate: dateOptions[0].endDate,
	});

	const startDate = searchParams.get('startDate');
	const endDate = searchParams.get('endDate');
	const selectedOption = useMemo(() => {
		return dateOptions.find((dateOption) => {
			return dateOption.startDate === startDate && dateOption.endDate === endDate;
		});
	}, [dateOptions, endDate, startDate]);

	const paramTabKey = match?.params.dashboardTab ?? 'overview';

	return (
		<Container fluid className="p-8">
			<Row>
				<Col xs={12} className="d-flex flex-wrap align-items-center justify-content-between">
					<h1>Analytics</h1>

					<InputHelper
						as="select"
						label={selectedOption?.label ?? 'Select'}
						value={selectedOption?.label ?? ''}
						onChange={({ currentTarget }) => {
							const nextOption = dateOptions.find((dateOption) => {
								return dateOption.label === currentTarget.value;
							});

							if (!nextOption) {
								return;
							}

							setSearchParams({
								startDate: nextOption.startDate,
								endDate: nextOption.endDate,
							});
						}}
					>
						<option value="" disabled>
							Set Date Range
						</option>

						{dateOptions.map((dateOption) => {
							return (
								<option key={dateOption.label} value={dateOption.label}>
									{dateOption.startDateDescription} - {dateOption.endDateDescription}
								</option>
							);
						})}
					</InputHelper>
				</Col>

				<Col>
					<Tab.Container id="overview-tabs" defaultActiveKey="details" activeKey={paramTabKey}>
						<TabBar
							key="admin-analytics-tabbar"
							className="mb-8"
							value={paramTabKey}
							tabs={[
								{
									value: 'overview',
									title: 'Overview',
									to: {
										pathname: '/admin/analytics/overview',
										search: '?' + searchParams.toString(),
									},
								},
								{
									value: 'assessments-and-appointments',
									title: 'Assessments & Appointments',
									to: {
										pathname: '/admin/analytics/assessments-and-appointments',
										search: '?' + searchParams.toString(),
									},
								},
								{
									value: 'group-sessions',
									title: 'Group Sessions',
									to: {
										pathname: '/admin/analytics/group-sessions',
										search: '?' + searchParams.toString(),
									},
								},
								{
									value: 'resources-and-topics',
									title: 'Resources & Topics',
									to: {
										pathname: '/admin/analytics/resources-and-topics',
										search: '?' + searchParams.toString(),
									},
								},
							]}
						/>
						<Tab.Content>
							<Suspense fallback={<Loader />}>
								<Outlet />
							</Suspense>
						</Tab.Content>
					</Tab.Container>
				</Col>
			</Row>
		</Container>
	);
};
