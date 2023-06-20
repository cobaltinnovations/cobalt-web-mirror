import moment from 'moment';
import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { reportingSerive, ReportType } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import Select from '@/components/select';
import DatePicker from '@/components/date-picker';
import { buildQueryParamUrl } from '@/lib/utils';

const Reports = () => {
	const [reportingTypes, setReportingTypes] = useState<ReportType[]>([]);
	const [formValues, setFormValues] = useState({
		reportTypeId: '',
		startDate: '',
		endDate: '',
	});

	const fetchData = useCallback(async () => {
		const response = await reportingSerive.getReportTypes().fetch();

		setReportingTypes(response.reportTypes);
		setFormValues((previousValues) => ({
			...previousValues,
			reportTypeId: response.reportTypes[0].reportTypeId,
		}));
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			window.location.href = buildQueryParamUrl('/reporting/run-report', {
				reportTypeId: formValues.reportTypeId,
				reportFormatId: 'CSV',
				startDateTime: `${formValues.startDate}T00:00:00`,
				endDateTime: `${formValues.endDate}T23:59:59`,
			});
		},
		[formValues.endDate, formValues.reportTypeId, formValues.startDate]
	);

	return (
		<>
			<Helmet>
				<title>Cobalt | Provider Reports</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<HeroContainer>
					<h2 className="mb-0 text-center">Provider Reports</h2>
				</HeroContainer>
				<Container className="py-14">
					<Row>
						<Col lg={{ span: 8, offset: 2 }}>
							<Form className="p-8 pb-10 bg-white border rounded" onSubmit={handleFormSubmit}>
								<Form.Group className="mb-4">
									<Form.Label className="mb-1">Report Type ID</Form.Label>
									<Select
										className="flex-shrink-0"
										value={formValues.reportTypeId}
										onChange={({ currentTarget }) => {
											setFormValues((previousValues) => ({
												...previousValues,
												reportTypeId: currentTarget.value,
											}));
										}}
									>
										{reportingTypes.map((rt) => (
											<option key={rt.reportTypeId} value={rt.reportTypeId}>
												{rt.description}
											</option>
										))}
									</Select>
								</Form.Group>
								<Form.Group className="mb-4">
									<Form.Label className="mb-1">Start Date</Form.Label>
									<DatePicker
										showYearDropdown
										showMonthDropdown
										dropdownMode="select"
										selected={
											formValues.startDate
												? moment(formValues.startDate, 'YYYY-MM-DD').toDate()
												: undefined
										}
										onChange={(date) => {
											if (!date) {
												return;
											}

											setFormValues((previousValues) => ({
												...previousValues,
												startDate: moment(date).format('YYYY-MM-DD'),
											}));
										}}
									/>
								</Form.Group>
								<Form.Group className="mb-10">
									<Form.Label className="mb-1">End Date</Form.Label>
									<DatePicker
										showYearDropdown
										showMonthDropdown
										dropdownMode="select"
										selected={
											formValues.endDate
												? moment(formValues.endDate, 'YYYY-MM-DD').toDate()
												: undefined
										}
										onChange={(date) => {
											if (!date) {
												return;
											}

											setFormValues((previousValues) => ({
												...previousValues,
												endDate: moment(date).format('YYYY-MM-DD'),
											}));
										}}
									/>
								</Form.Group>
								<div className="text-right">
									<Button
										type="submit"
										size="lg"
										disabled={
											!formValues.reportTypeId || !formValues.startDate || !formValues.endDate
										}
									>
										Download Report
									</Button>
								</div>
							</Form>
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};

export default Reports;
