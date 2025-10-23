import moment from 'moment';
import React, { useCallback, useMemo, useState } from 'react';
import { LoaderFunctionArgs, redirect, useLoaderData, useSearchParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { DateFormats } from '@/lib/utils';
import { AnalyticsReportGroup } from '@/lib/models';
import { adminAnalyticsService, AdminAnalyticsWidget, DATE_OPTION_KEYS } from '@/lib/services/admin-analytics-service';
import useAccount from '@/hooks/use-account';
import TabBar from '@/components/tab-bar';
import { AdminAnalyticsWidgetGroup } from '@/components/admin';
import AsyncWrapper from '@/components/async-page';
import InputHelper from '@/components/input-helper';
import DatePicker from '@/components/date-picker';

import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	TimeScale,
	Tooltip,
} from 'chart.js';
import 'chartjs-adapter-moment';
ChartJS.register(
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	LineElement,
	TimeScale
);
const dateOptions = adminAnalyticsService.getDateOptions();

type AdminAnalyticsLayoutLoaderData = {
	analyticsReportGroups: AnalyticsReportGroup[];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const analyticsReportGroupId = url.searchParams.get('analyticsReportGroupId');
	const response = await adminAnalyticsService.getReportGroups().fetch();

	if (!analyticsReportGroupId) {
		return redirect(
			`${url.pathname}?analyticsReportGroupId=${response.analyticsReportGroups[0].analyticsReportGroupId}`
		);
	}

	return response;
}

export const Component = () => {
	const { institution } = useAccount();
	const { analyticsReportGroups } = useLoaderData() as AdminAnalyticsLayoutLoaderData;

	const [searchParams, setSearchParams] = useSearchParams({
		startDate: dateOptions[DATE_OPTION_KEYS.LAST_7_DAYS].startDate,
		endDate: dateOptions[DATE_OPTION_KEYS.LAST_7_DAYS].endDate,
	});
	const analyticsReportGroupId = useMemo(() => searchParams.get('analyticsReportGroupId') ?? '', [searchParams]);
	const startDate = useMemo(
		() => searchParams.get('startDate') ?? dateOptions[DATE_OPTION_KEYS.LAST_7_DAYS].startDate,
		[searchParams]
	);
	const endDate = useMemo(
		() => searchParams.get('endDate') ?? dateOptions[DATE_OPTION_KEYS.LAST_7_DAYS].endDate,
		[searchParams]
	);

	const selectedDateOption = useMemo(
		() =>
			Object.values(dateOptions).find(
				(dateOption) => dateOption.startDate === startDate && dateOption.endDate === endDate
			),
		[endDate, startDate]
	);

	const [widgets, setWidgets] = useState<AdminAnalyticsWidget[]>([]);

	const fetchWidgets = useCallback(async () => {
		const response = await adminAnalyticsService
			.getAnalyticsReportGroupWidgetsById(analyticsReportGroupId, {
				startDate,
				endDate,
			})
			.fetch();
		setWidgets(response.widgets);
	}, [analyticsReportGroupId, endDate, startDate]);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | X-ray</title>
			</Helmet>

			<Container className="py-8">
				<Row>
					<Col className="d-flex flex-wrap align-items-center justify-content-between">
						<h1>X-Ray</h1>
						<div className="d-flex">
							<InputHelper
								style={{ width: 200 }}
								className="me-2"
								as="select"
								label="Date Range"
								value={selectedDateOption ? selectedDateOption?.label : 'CUSTOM'}
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
									disabled={!!selectedDateOption}
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
									disabled={!!selectedDateOption}
								/>
							</div>
						</div>
					</Col>
				</Row>
				<Row>
					<Col>
						<TabBar
							key="admin-x-ray-tab-bar"
							className="mb-8"
							value={analyticsReportGroupId}
							tabs={analyticsReportGroups.map((arg) => ({
								value: arg.analyticsReportGroupId,
								title: arg.name,
								to: {
									pathname: '/admin/x-ray',
									search: `?analyticsReportGroupId=${arg.analyticsReportGroupId}`,
								},
							}))}
						/>
					</Col>
				</Row>
				<AsyncWrapper fetchData={fetchWidgets}>
					<AdminAnalyticsWidgetGroup widgets={widgets} />
				</AsyncWrapper>
			</Container>
		</>
	);
};
