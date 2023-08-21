import InputHelper from '@/components/input-helper';
import Loader from '@/components/loader';
import TabBar from '@/components/tab-bar';
import moment from 'moment';
import React, { Suspense, useMemo } from 'react';
import { Col, Container, Row, Tab } from 'react-bootstrap';
import { LoaderFunctionArgs, Outlet, useMatch, useRouteLoaderData, useSearchParams } from 'react-router-dom';
import { ArcElement, Tooltip, Legend, Chart as ChartJS } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

type AdminAnalyticsLayoutLoaderData = Awaited<ReturnType<typeof loader>>;

export function useAdminAnalyticsLayoutLoaderData() {
	return useRouteLoaderData('admin-analytics-layout') as AdminAnalyticsLayoutLoaderData;
}

function getDateOptions() {
	const today = moment();
	const todayFormatted = today.format('MMM DD, YYYY');

	const startOf7DaysAgo = moment().subtract(7, 'days').startOf('day');
	const startOf7DaysAgoFormatted = startOf7DaysAgo.format('MMM DD, YYYY');
	const startOf30DaysAgo = moment().subtract(30, 'days').startOf('day');
	const startOf30DaysAgoFormatted = startOf30DaysAgo.format('MMM DD, YYYY');
	const startOf90DaysAgo = moment().subtract(90, 'days').startOf('day');
	const startOf90DaysAgoFormatted = startOf90DaysAgo.format('MMM DD, YYYY');
	const startOf12MonthsAgo = moment().subtract(12, 'months').startOf('day');
	const startOf12MonthsAgoFormatted = startOf12MonthsAgo.format('MMM DD, YYYY');
	const startOfThisYear = moment().startOf('year').startOf('day');
	const startOfThisYearFormatted = startOfThisYear.format('MMM DD, YYYY');

	return [
		{
			label: 'Last 7 days',
			startDate: startOf7DaysAgo.format('YYYY-MM-DD'),
			startDateDescription: startOf7DaysAgoFormatted,
			endDate: today.format('YYYY-MM-DD'),
			endDateDescription: todayFormatted,
		},
		{
			label: 'Last 30 days',
			startDate: startOf30DaysAgo.format('YYYY-MM-DD'),
			startDateDescription: startOf30DaysAgoFormatted,
			endDate: today.format('YYYY-MM-DD'),
			endDateDescription: todayFormatted,
		},
		{
			label: 'Last 90 days',
			startDate: startOf90DaysAgo.format('YYYY-MM-DD'),
			startDateDescription: startOf90DaysAgoFormatted,
			endDate: today.format('YYYY-MM-DD'),
			endDateDescription: todayFormatted,
		},
		{
			label: 'Last 12 months',
			startDate: startOf12MonthsAgo.format('YYYY-MM-DD'),
			startDateDescription: startOf12MonthsAgoFormatted,
			endDate: today.format('YYYY-MM-DD'),
			endDateDescription: todayFormatted,
		},
		{
			label: 'This year',
			startDate: startOfThisYear.format('YYYY-MM-DD'),
			startDateDescription: startOfThisYearFormatted,
			endDate: today.format('YYYY-MM-DD'),
			endDateDescription: todayFormatted,
		},
	];
}

export async function loader({ request }: LoaderFunctionArgs) {
	// const url = new URL(request.url);

	return {
		dateOptions: getDateOptions(),
	};
}

export const Component = () => {
	const { dateOptions } = useAdminAnalyticsLayoutLoaderData();
	const match = useMatch('/admin/analytics/:tabId');
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

	const paramTabKey = match?.params.tabId ?? 'overview';

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
