import moment from 'moment';
import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import Loader from '@/components/loader';
import TabBar from '@/components/tab-bar';
import { DATE_OPTION_KEYS, adminAnalyticsService } from '@/lib/services/admin-analytics-service';
import { DateFormats } from '@/lib/utils';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import React, { Suspense, useMemo } from 'react';
import { Col, Container, Row, Tab } from 'react-bootstrap';
import { Outlet, useMatch, useRouteLoaderData, useSearchParams } from 'react-router-dom';
import useAccount from '@/hooks/use-account';

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
	const { institution } = useAccount();
	const { dateOptions } = useAdminAnalyticsLayoutLoaderData();
	const match = useMatch('/admin/analytics/:dashboardTab');
	const [searchParams, setSearchParams] = useSearchParams({
		startDate: dateOptions[DATE_OPTION_KEYS.LAST_7_DAYS].startDate,
		endDate: dateOptions[DATE_OPTION_KEYS.LAST_7_DAYS].endDate,
	});

	const startDate = searchParams.get('startDate');
	const endDate = searchParams.get('endDate');
	const selectedOption = useMemo(() => {
		return Object.values(dateOptions).find((dateOption) => {
			return dateOption.startDate === startDate && dateOption.endDate === endDate;
		});
	}, [dateOptions, endDate, startDate]);

	const paramTabKey = match?.params.dashboardTab ?? 'overview';

	return (
		<Container fluid className="p-8">
			<Row>
				<Col xs={12} className="d-flex flex-wrap align-items-center justify-content-between">
					<h1>Analytics</h1>
					<div className="d-flex">
						<InputHelper
							style={{ width: 200 }}
							className="me-2"
							as="select"
							label="Date Range"
							value={selectedOption ? selectedOption?.label : 'CUSTOM'}
							onChange={({ currentTarget }) => {
								const desiredOption = Object.values(dateOptions).find((dateOption) => {
									return dateOption.label === currentTarget.value;
								});

								if (!desiredOption) {
									setSearchParams({
										startDate: moment().format(DateFormats.API.Date),
										endDate: moment().add(1, 'day').format(DateFormats.API.Date),
									});

									return;
								}

								setSearchParams({
									startDate: desiredOption.startDate,
									endDate: desiredOption.endDate,
								});
							}}
						>
							{Object.values(dateOptions).map((dateOption) => {
								return (
									<option key={dateOption.label} value={dateOption.label}>
										{dateOption.label}
									</option>
								);
							})}

							<option value="CUSTOM">Custom</option>
						</InputHelper>
						<div style={{ width: 160 }} className="me-2">
							<DatePicker
								labelText="Start"
								dropdownMode="select"
								maxDate={moment(endDate).toDate()}
								selected={moment(startDate).toDate() ?? undefined}
								onChange={(date) => {
									if (!date) {
										return;
									}

									setSearchParams({
										startDate: moment(date).format(DateFormats.API.Date),
										endDate: moment(endDate).format(DateFormats.API.Date),
									});
								}}
								disabled={!!selectedOption}
							/>
						</div>
						<div style={{ width: 160 }}>
							<DatePicker
								labelText="End"
								dropdownMode="select"
								minDate={moment(startDate).toDate()}
								selected={moment(endDate).toDate() ?? undefined}
								onChange={(date) => {
									if (!date) {
										return;
									}

									setSearchParams({
										startDate: moment(startDate).format(DateFormats.API.Date),
										endDate: moment(date).format(DateFormats.API.Date),
									});
								}}
								disabled={!!selectedOption}
							/>
						</div>
					</div>
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
								...(institution.tableauEnabled
									? [
											{
												value: 'tableau',
												title: 'Tableau',
												to: {
													pathname: '/admin/analytics/tableau',
													search: '?' + searchParams.toString(),
												},
											},
									  ]
									: []),
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
