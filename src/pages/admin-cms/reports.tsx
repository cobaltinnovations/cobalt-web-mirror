import moment from 'moment';
import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { reportingSerive, ReportType } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import DatePicker from '@/components/date-picker';
import { buildBackendDownloadUrl } from '@/lib/utils';
import InputHelper from '@/components/input-helper';

const Reports = () => {
	const [reportingTypes, setReportingTypes] = useState<ReportType[]>([]);
	const [formValues, setFormValues] = useState({
		reportTypeId: '',
		startDate: '',
		endDate: '',
	});

	const fetchData = useCallback(async () => {
		const response = await reportingSerive.getReportTypes().fetch();

		console.log(response);

		setReportingTypes(
			response.reportTypes.filter((rt) => {
				return (
					rt.reportTypeId === 'PROVIDER_UNUSED_AVAILABILITY' ||
					rt.reportTypeId === 'PROVIDER_APPOINTMENTS' ||
					rt.reportTypeId === 'PROVIDER_APPOINTMENT_CANCELATIONS'
				);
			})
		);
		setFormValues((previousValues) => ({
			...previousValues,
			reportTypeId: response.reportTypes[0].reportTypeId,
		}));
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			window.location.href = buildBackendDownloadUrl('/reporting/run-report', {
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
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<Form className="p-8 pb-10 bg-white border rounded" onSubmit={handleFormSubmit}>
								<InputHelper
									className="mb-4"
									as="select"
									label="Report Type ID"
									value={formValues.reportTypeId}
									onChange={({ currentTarget }) => {
										setFormValues((previousValues) => ({
											...previousValues,
											reportTypeId: currentTarget.value,
										}));
									}}
									required
								>
									{reportingTypes.map((rt) => (
										<option key={rt.reportTypeId} value={rt.reportTypeId}>
											{rt.description}
										</option>
									))}
								</InputHelper>
								<DatePicker
									className="mb-4"
									labelText="Start Date"
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
								<DatePicker
									className="mb-4"
									labelText="End Date"
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
