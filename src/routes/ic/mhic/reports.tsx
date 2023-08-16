import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';
import { Helmet } from 'react-helmet';

import { AccountModel, GenderIdentity, Race } from '@/lib/models';
import { useIntegratedCareLoaderData } from '../landing';
import { useMhicLayoutLoaderData } from './mhic-layout';
import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import { buildBackendDownloadUrl } from '@/lib/utils';
import moment from 'moment';

enum REPORT_TYPE_ID {
	IC_PIPELINE = 'IC_PIPELINE',
	IC_OUTREACH = 'IC_OUTREACH',
	IC_ASSESSMENT = 'IC_ASSESSMENT',
}

const reportTypes = [
	{
		reportTypeId: REPORT_TYPE_ID.IC_PIPELINE,
		title: 'Pipeline',
	},
	{
		reportTypeId: REPORT_TYPE_ID.IC_OUTREACH,
		title: 'Outreach',
	},
	{
		reportTypeId: REPORT_TYPE_ID.IC_ASSESSMENT,
		title: 'Assessment',
	},
];

export const loader = async () => {
	return null;
};

export const Component = () => {
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const { panelAccounts } = useMhicLayoutLoaderData();
	const [formValues, setFormValues] = useState({
		startDateTime: undefined as Date | undefined,
		endDateTime: undefined as Date | undefined,
		reportTypeId: '',

		// PIPELINE specific
		referringPracticeNames: [] as string[],
		patientOrderInsurancePayors: [] as string[],
		race: [] as Race[],
		genderIdentity: [] as GenderIdentity[],
		minimumPatientAge: undefined as number | undefined,
		maximumPatientAge: undefined as number | undefined,

		// MHIC specific
		panelAccounts: [] as AccountModel[],
	});

	// Must clear all the reportType specific filters on reportTypeChange
	const handleReportTypeInputChange = useCallback(({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
		setFormValues((previousValue) => ({
			...previousValue,
			reportTypeId: currentTarget.value,
			referringPracticeNames: [],
			patientOrderInsurancePayors: [],
			race: [],
			genderIdentity: [],
			minimumPatientAge: undefined,
			maximumPatientAge: undefined,
			panelAccounts: [],
		}));
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			window.location.href = buildBackendDownloadUrl('/reporting/run-report', {
				// Generic
				...(formValues.startDateTime && {
					startDateTime: `${moment(formValues.startDateTime).format('YYYY-MM-DD')}T00:00:00`,
				}),
				...(formValues.endDateTime && {
					endDateTime: `${moment(formValues.endDateTime).format('YYYY-MM-DD')}T23:59:59`,
				}),
				reportTypeId: formValues.reportTypeId,

				// PIPELINE specific
				referringPracticeNames: formValues.referringPracticeNames,
				patientOrderInsurancePayorId: formValues.patientOrderInsurancePayors,
				patientRaceId: formValues.race.map((r) => r.raceId),
				patientGenderIdentityId: formValues.genderIdentity.map((g) => g.genderIdentityId),
				minimumPatientAge: formValues.minimumPatientAge,
				maximumPatientAge: formValues.maximumPatientAge,

				// MHIC specific
				panelAccountId: formValues.panelAccounts.map((a) => a.accountId),

				// Required
				reportFormatId: 'CSV',
			});
		},
		[formValues]
	);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Reports</title>
			</Helmet>

			<Container className="py-16">
				<Row>
					<Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }} xl={{ span: 6, offset: 3 }}>
						<h2 className="mb-1">Generate a Report</h2>
						<p className="mb-6 text-gray fs-large">
							To generate a report, please select the type of report and any applicable filters.
						</p>
						<hr className="mb-8" />
						<Form onSubmit={handleFormSubmit}>
							<Row className="mb-2">
								<Col>
									<h5>Date Range</h5>
								</Col>
							</Row>
							<Row className="mb-4">
								<Col>
									<DatePicker
										labelText="From"
										selected={formValues.startDateTime}
										onChange={(date) => {
											setFormValues((previousValue) => ({
												...previousValue,
												startDateTime: date ?? undefined,
											}));
										}}
										required
									/>
								</Col>
								<Col>
									<DatePicker
										labelText="To"
										selected={formValues.endDateTime}
										onChange={(date) => {
											setFormValues((previousValue) => ({
												...previousValue,
												endDateTime: date ?? undefined,
											}));
										}}
										required
									/>
								</Col>
							</Row>
							<Row
								className={classNames({
									'mb-8':
										formValues.reportTypeId === REPORT_TYPE_ID.IC_PIPELINE ||
										formValues.reportTypeId === REPORT_TYPE_ID.IC_OUTREACH ||
										formValues.reportTypeId === REPORT_TYPE_ID.IC_ASSESSMENT,
								})}
							>
								<Col>
									<InputHelper
										as="select"
										label="Report Type"
										value={formValues.reportTypeId}
										onChange={handleReportTypeInputChange}
										required
									>
										<option value="" disabled>
											Select...
										</option>
										{reportTypes.map((reportType) => (
											<option key={reportType.reportTypeId} value={reportType.reportTypeId}>
												{reportType.title}
											</option>
										))}
									</InputHelper>
								</Col>
							</Row>

							{(formValues.reportTypeId === REPORT_TYPE_ID.IC_PIPELINE ||
								formValues.reportTypeId === REPORT_TYPE_ID.IC_OUTREACH ||
								formValues.reportTypeId === REPORT_TYPE_ID.IC_ASSESSMENT) && (
								<Row className="mb-8">
									<Col>
										<h5 className="mb-2">Filters</h5>
										<TypeaheadHelper
											className="mb-4"
											id="typeahead--practice"
											label="Practice"
											multiple
											labelKey=""
											options={referenceDataResponse.referringPracticeNames}
											selected={formValues.referringPracticeNames}
											onChange={(selected) => {
												setFormValues((previousValues) => ({
													...previousValues,
													referringPracticeNames: selected as string[],
												}));
											}}
										/>
										<TypeaheadHelper
											className="mb-4"
											id="typeahead--payor"
											label="Payor"
											multiple
											labelKey=""
											options={referenceDataResponse.primaryPayorNames}
											selected={formValues.patientOrderInsurancePayors}
											onChange={(selected) => {
												setFormValues((previousValues) => ({
													...previousValues,
													patientOrderInsurancePayors: selected as string[],
												}));
											}}
										/>
										<TypeaheadHelper
											className="mb-4"
											id="typeahead--patient-race"
											label="Patient Race"
											multiple
											labelKey="description"
											options={referenceDataResponse.races}
											selected={formValues.race}
											onChange={(selected) => {
												setFormValues((previousValues) => ({
													...previousValues,
													race: selected as Race[],
												}));
											}}
										/>
										<TypeaheadHelper
											className="mb-8"
											id="typeahead--patient-gender"
											label="Patient Gender"
											multiple
											labelKey="description"
											options={referenceDataResponse.genderIdentities}
											selected={formValues.genderIdentity}
											onChange={(selected) => {
												setFormValues((previousValues) => ({
													...previousValues,
													genderIdentity: selected as GenderIdentity[],
												}));
											}}
										/>
										<h5 className="mb-2">Patient Age</h5>
										<Row>
											<Col>
												<InputHelper
													type="number"
													label="From"
													value={formValues.minimumPatientAge}
													onChange={({ currentTarget }) => {
														setFormValues((previousValues) => ({
															...previousValues,
															minimumPatientAge: currentTarget.value
																? parseInt(currentTarget.value, 10)
																: undefined,
														}));
													}}
												/>
											</Col>
											<Col>
												<InputHelper
													type="number"
													label="To"
													value={formValues.maximumPatientAge}
													onChange={({ currentTarget }) => {
														setFormValues((previousValues) => ({
															...previousValues,
															maximumPatientAge: currentTarget.value
																? parseInt(currentTarget.value, 10)
																: undefined,
														}));
													}}
												/>
											</Col>
										</Row>
									</Col>
								</Row>
							)}

							{formValues.reportTypeId === REPORT_TYPE_ID.IC_OUTREACH && (
								<>
									<h5 className="mb-2">MHIC</h5>
									<Row className="mb-8">
										<Col>
											<TypeaheadHelper
												className="mb-4"
												id="typeahead--mhic"
												label="Select MHIC"
												multiple
												labelKey="displayName"
												options={panelAccounts}
												selected={formValues.panelAccounts}
												onChange={(selected) => {
													setFormValues((previousValues) => ({
														...previousValues,
														panelAccounts: selected as AccountModel[],
													}));
												}}
											/>
										</Col>
									</Row>
								</>
							)}

							{formValues.reportTypeId && (
								<>
									<hr className="mb-8" />
									<div className="text-right">
										<Button
											type="submit"
											disabled={
												!formValues.startDateTime ||
												!formValues.endDateTime ||
												!formValues.reportTypeId
											}
										>
											Generate Report
										</Button>
									</div>
								</>
							)}
						</Form>
					</Col>
				</Row>
			</Container>
		</>
	);
};
