import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { AccountModel, GenderIdentity, PatientOrderInsurancePayors, Race } from '@/lib/models';
import { useIntegratedCareLoaderData } from '../landing';
import { useMhicLayoutLoaderData } from './mhic-layout';
import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import { TypeaheadHelper } from '@/components/typeahead-helper';

enum REPORT_TYPE_ID {
	PIPELINE = 'PIPELINE',
	OUTREACH = 'OUTREACH',
	MHIC = 'MHIC',
}

const reportTypes = [
	{
		reportTypeId: REPORT_TYPE_ID.PIPELINE,
		title: 'Pipeline',
	},
	{
		reportTypeId: REPORT_TYPE_ID.OUTREACH,
		title: 'Overall Outreach',
	},
	{
		reportTypeId: REPORT_TYPE_ID.MHIC,
		title: 'MHIC Outreach',
	},
];

export const loader = async () => {
	return null;
};

export const Component = () => {
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const { panelAccounts } = useMhicLayoutLoaderData();
	const [formValues, setFormValues] = useState({
		from: undefined as Date | undefined,
		to: undefined as Date | undefined,
		reportType: '',

		// PIPELINE specific
		practice: [] as string[],
		payor: [] as PatientOrderInsurancePayors[],
		patientRace: [] as Race[],
		patientGender: [] as GenderIdentity[],
		patientAgeMin: undefined as number | undefined,
		patientAgeMax: undefined as number | undefined,

		// MHIC specific
		mhic: [] as AccountModel[],
	});

	// Must clear all the reportType specific filters on reportTypeChange
	const handleReportTypeInputChange = useCallback(({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
		setFormValues((previousValue) => ({
			...previousValue,
			reportType: currentTarget.value,
			practice: [],
			payor: [],
			patientRace: [],
			patientGender: [],
			patientAgeMin: undefined,
			patientAgeMax: undefined,
			mhic: [],
		}));
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			console.log(formValues);
		},
		[formValues]
	);

	return (
		<Container className="py-16">
			<Row>
				<Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }} xl={{ span: 4, offset: 4 }}>
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
									selected={formValues.from}
									onChange={(date) => {
										setFormValues((previousValue) => ({
											...previousValue,
											from: date ?? undefined,
										}));
									}}
									required
								/>
							</Col>
							<Col>
								<DatePicker
									labelText="To"
									selected={formValues.to}
									onChange={(date) => {
										setFormValues((previousValue) => ({
											...previousValue,
											to: date ?? undefined,
										}));
									}}
									required
								/>
							</Col>
						</Row>
						<Row
							className={classNames({
								'mb-8': formValues.reportType === REPORT_TYPE_ID.PIPELINE,
								'mb-10': formValues.reportType === REPORT_TYPE_ID.OUTREACH,
								'mb-4': formValues.reportType === REPORT_TYPE_ID.MHIC,
							})}
						>
							<Col>
								<InputHelper
									as="select"
									label="Report Type"
									value={formValues.reportType}
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

						{formValues.reportType === REPORT_TYPE_ID.PIPELINE && (
							<Row className="mb-10">
								<Col>
									<h5 className="mb-2">Filters</h5>
									<TypeaheadHelper
										className="mb-4"
										id="typeahead--practice"
										label="Practice"
										multiple
										options={referenceDataResponse.referringPracticeNames}
										selected={formValues.practice}
										onChange={(selected) => {
											setFormValues((previousValues) => ({
												...previousValues,
												practice: selected as string[],
											}));
										}}
									/>
									<TypeaheadHelper
										className="mb-4"
										id="typeahead--payor"
										label="Payor"
										multiple
										labelKey="name"
										options={referenceDataResponse.patientOrderInsurancePayors}
										selected={formValues.payor}
										onChange={(selected) => {
											setFormValues((previousValues) => ({
												...previousValues,
												payor: selected as PatientOrderInsurancePayors[],
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
										selected={formValues.patientRace}
										onChange={(selected) => {
											setFormValues((previousValues) => ({
												...previousValues,
												patientRace: selected as Race[],
											}));
										}}
									/>
									<TypeaheadHelper
										className="mb-4"
										id="typeahead--patient-gender"
										label="Patient Gender"
										multiple
										labelKey="description"
										options={referenceDataResponse.genderIdentities}
										selected={formValues.patientGender}
										onChange={(selected) => {
											setFormValues((previousValues) => ({
												...previousValues,
												patientGender: selected as GenderIdentity[],
											}));
										}}
									/>
									<h5 className="mb-2">Patient Age</h5>
									<Row>
										<Col>
											<InputHelper
												type="number"
												label="From"
												value={formValues.patientAgeMin}
												onChange={({ currentTarget }) => {
													setFormValues((previousValues) => ({
														...previousValues,
														patientAgeMin: parseInt(currentTarget.value, 10),
													}));
												}}
											/>
										</Col>
										<Col>
											<InputHelper
												type="number"
												label="To"
												value={formValues.patientAgeMax}
												onChange={({ currentTarget }) => {
													setFormValues((previousValues) => ({
														...previousValues,
														patientAgeMax: parseInt(currentTarget.value, 10),
													}));
												}}
											/>
										</Col>
									</Row>
								</Col>
							</Row>
						)}

						{formValues.reportType === REPORT_TYPE_ID.MHIC && (
							<Row className="mb-10">
								<Col>
									<TypeaheadHelper
										className="mb-4"
										id="typeahead--mhic"
										label="Select MHIC"
										multiple
										labelKey="displayName"
										options={panelAccounts}
										selected={formValues.mhic}
										onChange={(selected) => {
											setFormValues((previousValues) => ({
												...previousValues,
												mhic: selected as AccountModel[],
											}));
										}}
										required={formValues.reportType === REPORT_TYPE_ID.MHIC}
									/>
								</Col>
							</Row>
						)}

						{formValues.reportType && (
							<>
								<hr className="mb-8" />
								<div className="text-right">
									<Button type="submit">Generate Report</Button>
								</div>
							</>
						)}
					</Form>
				</Col>
			</Row>
		</Container>
	);
};
