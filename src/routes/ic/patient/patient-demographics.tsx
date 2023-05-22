import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

import { PatientOrderCarePreferenceId, PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { useIntegratedCareLoaderData } from '../landing';
import AsyncWrapper from '@/components/async-page';
import InputHelper from '@/components/input-helper';

const carePreferences = [
	{
		patientOrderCarePreferenceId: PatientOrderCarePreferenceId.NO_PREFERENCE,
		title: 'No Preference',
	},
	{
		patientOrderCarePreferenceId: PatientOrderCarePreferenceId.TELEHEALTH,
		title: 'Telehealth',
	},
	{
		patientOrderCarePreferenceId: PatientOrderCarePreferenceId.IN_PERSON,
		title: 'In-persion',
	},
];

const careRadii = [
	{
		inPersonCareRadiusId: 'TEN_MILES',
		inPersonCareRadius: 10,
		title: '10 miles',
	},
	{
		inPersonCareRadiusId: 'TWENTY_MILES',
		inPersonCareRadius: 20,
		title: '20 miles',
	},
	{
		inPersonCareRadiusId: 'THIRTY_MILES',
		inPersonCareRadius: 30,
		title: '30 miles',
	},
	{
		inPersonCareRadiusId: 'FORTY_FIVE_MILES',
		inPersonCareRadius: 45,
		title: '45 miles',
	},
	{
		inPersonCareRadiusId: 'SIXTY_MILES',
		inPersonCareRadius: 60,
		title: '60 miles',
	},
];

const PatientDemographics = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();
	const [formValues, setFormValues] = useState({
		patientPhoneNumber: '',
		patientEmailAddress: '',
		patientOrderCarePreferenceId: '',
		inPersonCareRadius: 0,
		patientLanguageCode: '',
		patientRaceId: '',
		patientEthnicityId: '',
		patientBirthSexId: '',
		patientGenderIdentityId: '',
		verified: false,
	});
	const [isSaving, setIsSaving] = useState(false);

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getLatestPatientOrder().fetch();

		setPatientOrder(response.patientOrder);
		setFormValues({
			patientPhoneNumber: response.patientOrder.patientPhoneNumberDescription ?? '',
			patientEmailAddress:
				response.patientOrder.patientEmailAddress ?? response.patientOrder.patientAccount?.emailAddress ?? '',
			patientOrderCarePreferenceId: response.patientOrder.patientOrderCarePreferenceId ?? '',
			inPersonCareRadius: response.patientOrder.inPersonCareRadius ?? 0,
			patientLanguageCode: response.patientOrder.patientLanguageCode ?? '',
			patientRaceId: response.patientOrder.patientRaceId ?? '',
			patientEthnicityId: response.patientOrder.patientEthnicityId ?? '',
			patientBirthSexId: response.patientOrder.patientBirthSexId ?? '',
			patientGenderIdentityId: response.patientOrder.patientGenderIdentityId ?? '',
			verified: false,
		});
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				setIsSaving(true);

				if (!patientOrder) {
					throw new Error('patientOrder is undefined.');
				}

				await integratedCareService
					.patchPatientOrder(patientOrder.patientOrderId, {
						...formValues,
						patientDemographicsConfirmed: true,
					})
					.fetch();

				navigate('/ic/patient');
			} catch (error) {
				setIsSaving(false);
				handleError(error);
			}
		},
		[formValues, handleError, navigate, patientOrder]
	);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<Container className="py-20">
				<Row className="mb-6">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h3 className="mb-2">Verify your information</h3>
						<p className="mb-8">
							Your primary care team gave us a head start filling out this information. Please make sure
							all information is correct and complete before continuing.
						</p>
						<hr />
					</Col>
				</Row>
				<Form onSubmit={handleFormSubmit}>
					<Row className="mb-6">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h4 className="mb-6">Contact Information</h4>
							<InputHelper
								className="mb-2"
								label="Phone Number"
								type="tel"
								value={formValues.patientPhoneNumber}
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => ({
										...previousValue,
										patientPhoneNumber: currentTarget.value,
									}));
								}}
								disabled={isSaving}
								required
							/>
							<InputHelper
								className="mb-6"
								label="Email Address"
								type="email"
								value={formValues.patientEmailAddress}
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => ({
										...previousValue,
										patientEmailAddress: currentTarget.value,
									}));
								}}
								disabled={isSaving}
								required
							/>
							<hr />
						</Col>
					</Row>
					<Row className="mb-6">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h4 className="mb-6">Care Preference</h4>
							<Form.Group className="mb-6">
								<h5 className="mb-2">
									How would you prefer to connect with a mental health care provider?
								</h5>
								{carePreferences.map((carePreference) => (
									<Form.Check
										key={carePreference.patientOrderCarePreferenceId}
										type="radio"
										name="care-preference"
										id={`care-preference--${carePreference.patientOrderCarePreferenceId}`}
										label={carePreference.title}
										value={carePreference.patientOrderCarePreferenceId}
										checked={
											formValues.patientOrderCarePreferenceId ===
											carePreference.patientOrderCarePreferenceId
										}
										onChange={({ currentTarget }) => {
											setFormValues((previousValue) => ({
												...previousValue,
												patientOrderCarePreferenceId: currentTarget.value,
											}));
										}}
										disabled={isSaving}
									/>
								))}
							</Form.Group>
							<Form.Group className="mb-6">
								<h5 className="mb-2">
									How far would you be willing to travel from your location (
									{patientOrder?.patientAddress?.postalCode}) to see an in-person provider?
								</h5>
								{careRadii.map((careRadius) => (
									<Form.Check
										key={careRadius.inPersonCareRadiusId}
										type="radio"
										name="care-radius"
										id={`care-radius--${careRadius.inPersonCareRadiusId}`}
										label={careRadius.title}
										value={careRadius.inPersonCareRadius}
										checked={formValues.inPersonCareRadius === careRadius.inPersonCareRadius}
										onChange={({ currentTarget }) => {
											setFormValues((previousValue) => ({
												...previousValue,
												inPersonCareRadius: parseInt(currentTarget.value, 10),
											}));
										}}
										disabled={isSaving}
									/>
								))}
							</Form.Group>
							<hr />
						</Col>
					</Row>
					<Row className="mb-6">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h4 className="mb-2">About You</h4>
							<p className="mb-6">
								This information is not required but can be helpful for your care team to know.{' '}
							</p>
							<InputHelper
								className="mb-2"
								label="Preferred Language"
								as="select"
								value={formValues.patientLanguageCode}
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => ({
										...previousValue,
										patientLanguageCode: currentTarget.value,
									}));
								}}
								disabled={isSaving}
							>
								<option value="">Select...</option>
								{referenceDataResponse.languages.map((language) => {
									return (
										<option key={language.languageCode} value={language.languageCode}>
											{language.description}
										</option>
									);
								})}
							</InputHelper>
							<InputHelper
								className="mb-2"
								label="Race"
								as="select"
								value={formValues.patientRaceId}
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => ({
										...previousValue,
										patientRaceId: currentTarget.value,
									}));
								}}
								disabled={isSaving}
							>
								<option value="">Select...</option>
								{referenceDataResponse.races.map((race) => {
									return (
										<option key={race.raceId} value={race.raceId}>
											{race.description}
										</option>
									);
								})}
							</InputHelper>
							<InputHelper
								className="mb-2"
								label="Ethnicity"
								as="select"
								value={formValues.patientEthnicityId}
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => ({
										...previousValue,
										patientEthnicityId: currentTarget.value,
									}));
								}}
								disabled={isSaving}
							>
								<option value="">Select...</option>
								{referenceDataResponse.ethnicities.map((ethnicity) => {
									return (
										<option key={ethnicity.ethnicityId} value={ethnicity.ethnicityId}>
											{ethnicity.description}
										</option>
									);
								})}
							</InputHelper>
							<InputHelper
								className="mb-2"
								label="Birth Sex"
								as="select"
								value={formValues.patientBirthSexId}
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => ({
										...previousValue,
										patientBirthSexId: currentTarget.value,
									}));
								}}
								disabled={isSaving}
							>
								<option value="">Select...</option>
								{referenceDataResponse.birthSexes.map((birthSex) => {
									return (
										<option key={birthSex.birthSexId} value={birthSex.birthSexId}>
											{birthSex.description}
										</option>
									);
								})}
							</InputHelper>
							<InputHelper
								className="mb-6"
								label="Gender Identity"
								as="select"
								value={formValues.patientGenderIdentityId}
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => ({
										...previousValue,
										patientGenderIdentityId: currentTarget.value,
									}));
								}}
								disabled={isSaving}
							>
								<option value="">Select...</option>
								{referenceDataResponse.genderIdentities.map((genderIdentity) => {
									return (
										<option
											key={genderIdentity.genderIdentityId}
											value={genderIdentity.genderIdentityId}
										>
											{genderIdentity.description}
										</option>
									);
								})}
							</InputHelper>
							<hr />
						</Col>
					</Row>
					<Row className="mb-6">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<Form.Check
								type="checkbox"
								name="verify"
								id="verify--information-correct"
								label="I verify that all information entered is correct and complete to the best of my knowledge."
								value="VERIFIED"
								checked={formValues.verified}
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => ({
										...previousValue,
										verified: currentTarget.checked,
									}));
								}}
								disabled={isSaving}
							/>
						</Col>
					</Row>
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<div className="d-flex align-items-center justify-content-end">
								<Button variant="primary" type="submit" disabled={isSaving}>
									Continue
								</Button>
							</div>
						</Col>
					</Row>
				</Form>
			</Container>
		</AsyncWrapper>
	);
};

export default PatientDemographics;
