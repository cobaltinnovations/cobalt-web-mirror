import Cookies from 'js-cookie';
import React, { FC, useEffect, useState } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';

import config from '@/lib/config';
import { Chart as ChartModel } from '@/lib/models';
import { reportingSerive, REPORTING_WINDOW_ID } from '@/lib/services';
import { buildQueryParamUrl } from '@/lib/utils';

import useHandleError from '@/hooks/use-handle-error';

import { Chart } from '@/components/chart';
import Select from '@/components/select';
import Loader from '@/components/loader';
import HeroContainer from '@/components/hero-container';

enum PERIODS {
	WEEKLY = 'WEEKLY',
	MONTHLY = 'MONTHLY',
}

const weeklyDurations = [
	{
		value: REPORTING_WINDOW_ID.WEEKLY_4_WEEKS,
		label: '4w',
	},
	{
		value: REPORTING_WINDOW_ID.WEEKLY_8_WEEKS,
		label: '8w',
	},
	{
		value: REPORTING_WINDOW_ID.WEEKLY_12_WEEKS,
		label: '12w',
	},
];

const monthlyDurations = [
	{
		value: REPORTING_WINDOW_ID.MONTHLY_3_MONTHS,
		label: '3m',
	},
	{
		value: REPORTING_WINDOW_ID.MONTHLY_12_MONTHS,
		label: '12m',
	},
	{
		value: REPORTING_WINDOW_ID.MONTHLY_ALL_TIME,
		label: 'All Time',
	},
];

const StatsDashboard: FC = () => {
	const handleError = useHandleError();

	const [isLoading, setIsLoading] = useState(false);
	const [periodicSelectValue, setPeriodicSelectValue] = useState<PERIODS>(PERIODS.MONTHLY);
	const [reportingWindowId, setReportingWindowId] = useState(REPORTING_WINDOW_ID.MONTHLY_ALL_TIME);
	const [charts, setCharts] = useState<ChartModel[]>([]);

	useEffect(() => {
		async function fetchData() {
			try {
				setIsLoading(true);

				const response = await reportingSerive.getCharts({ reportingWindowId }).fetch();

				setCharts(response.charts);
			} catch (error: any) {
				handleError(error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, [handleError, reportingWindowId]);

	function handleDownloadCsvButtonClick() {
		window.open(
			buildQueryParamUrl(`${config.COBALT_WEB_API_BASE_URL}/reporting/csv`, {
				reportingWindowId,
				'X-Cobalt-Access-Token': Cookies.get('accessToken'),
			}),
			'_blank'
		);
	}

	return (
		<>
			<HeroContainer>
				<h2 className="mb-0 text-center">Stats Dashboard</h2>
			</HeroContainer>
			<Container className="py-5">
				<Row className="mb-4">
					<Col>
						<div className="d-flex align-items-center justify-content-between">
							<div className="d-flex align-items-center">
								<Select
									className="flex-shrink-0"
									value={periodicSelectValue}
									onChange={(event) => {
										if (event.currentTarget.value === PERIODS.WEEKLY) {
											setPeriodicSelectValue(PERIODS.WEEKLY);
											setReportingWindowId(weeklyDurations[0].value);
										} else {
											setPeriodicSelectValue(PERIODS.MONTHLY);
											setReportingWindowId(monthlyDurations[0].value);
										}
									}}
								>
									<option value={PERIODS.WEEKLY}>Weekly</option>
									<option value={PERIODS.MONTHLY}>Monthly</option>
								</Select>
								<InputGroup className="ms-4">
									{(periodicSelectValue === PERIODS.WEEKLY ? weeklyDurations : monthlyDurations).map(
										(duration) => {
											return (
												<Form.Check
													key={duration.value}
													bsPrefix="input-group__radio"
													type="radio"
													name="time-period"
													id={`time-period--${duration.value}`}
													value={duration.value}
													label={duration.label}
													inline
													checked={reportingWindowId === duration.value}
													onChange={() => {
														setReportingWindowId(duration.value);
													}}
												/>
											);
										}
									)}
								</InputGroup>
								{isLoading && (
									<div className="position-relative ms-9">
										<Loader size={50} />
									</div>
								)}
							</div>
							<Button size="sm" onClick={handleDownloadCsvButtonClick}>
								download .csv
							</Button>
						</div>
					</Col>
				</Row>
				<hr className="mb-4" />
				<Row className="mb-4">
					<Col>
						<h2 className="mb-0">utilization</h2>
					</Col>
				</Row>
				{charts.map((chart) => {
					return (
						<Row className="mb-6" key={chart.chartTypeId}>
							<Col>
								<Chart configuration={chart} />
							</Col>
						</Row>
					);
				})}
			</Container>
		</>
	);
};

export default StatsDashboard;
