import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

import { reportingSerive, ReportType } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import AsyncWrapper from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import Select from '@/components/select';
import DatePicker from '@/components/date-picker';

const Reports = () => {
	const handleError = useHandleError();
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

			try {
				await reportingSerive
					.runReport({
						reportTypeId: formValues.reportTypeId,
						reportFormatId: 'CSV',
						startDateTime: `${formValues.startDate}T00:00:00`,
						endDateTime: '2023-01-31T23:59:59',
					})
					.fetch();
			} catch (error) {
				handleError(error);
			}
		},
		[formValues.reportTypeId, formValues.startDate, handleError]
	);

	useEffect(() => {
		console.log(formValues);
	}, [formValues]);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<HeroContainer>
				<h2 className="mb-0 text-center">Reports</h2>
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
								<Button type="submit" size="lg">
									Download Report
								</Button>
							</div>
						</Form>
					</Col>
				</Row>
			</Container>
		</AsyncWrapper>
	);
};

export default Reports;
