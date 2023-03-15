import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';

import { PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import { accountService, integratedCareService } from '@/lib/services';
import { ERROR_CODES } from '@/lib/http-client';
import useHandleError from '@/hooks/use-handle-error';
import AsyncPage from '@/components/async-page';
import InputHelper from '@/components/input-helper';

export interface FormData {
	patientBirthSexId: string;
	patientGenderIdentityId: string;
	patientRaceId: string;
	patientEthnicityId: string;
	patientLanguageCode: string;
}

const PatientDemographicsPart3 = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();

	const initialFormValues: FormData = useMemo(() => {
		return {
			patientBirthSexId: patientOrder?.patientBirthSexId ?? '',
			patientGenderIdentityId: '',
			patientRaceId: '',
			patientEthnicityId: '',
			patientLanguageCode: '',
		};
	}, [patientOrder?.patientBirthSexId]);

	const fetchData = useCallback(async () => {
		const [patientOrderResponse, referenceDataResponse] = await Promise.all([
			integratedCareService.getOpenOrderForCurrentPatient().fetch(),
			accountService.getReferenceData().fetch(),
		]);

		setPatientOrder(patientOrderResponse.patientOrder);
		setReferenceData(referenceDataResponse);
	}, []);

	const handleFormSubmit = useCallback(
		async (values: FormData) => {
			if (!patientOrder) {
				return;
			}

			try {
				await integratedCareService.patchPatientOrder(patientOrder.patientOrderId, values).fetch();
				navigate('/ic/patient/demographics-thanks');
			} catch (error) {
				if ((error as any).code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(error);
				}
			}
		},
		[handleError, navigate, patientOrder]
	);

	return (
		<AsyncPage fetchData={fetchData}>
			<Container className="py-20">
				<Row className="mb-8">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h3 className="mb-2">A little more about you...</h3>
						<p className="mb-0">
							Your primary care team gave us a head start filling out this information. Please make sure
							the information entered is correct, and complete any required fields that are blank.
						</p>
					</Col>
				</Row>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Formik<FormData>
							initialValues={initialFormValues}
							enableReinitialize
							onSubmit={handleFormSubmit}
						>
							{({ values, touched, errors, handleChange, handleBlur, handleSubmit }) => (
								<Form onSubmit={handleSubmit}>
									<InputHelper
										className="mb-2"
										label="Birth Sex"
										name="patientBirthSexId"
										value={values.patientBirthSexId}
										as="select"
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientBirthSexId && errors.patientBirthSexId
												? errors.patientBirthSexId
												: ''
										}
									>
										<option value="">Select...</option>
										{referenceData?.birthSexes.map((birthSex) => {
											return (
												<option key={birthSex.birthSexId} value={birthSex.birthSexId}>
													{birthSex.description}
												</option>
											);
										})}
									</InputHelper>
									<InputHelper
										className="mb-2"
										label="Gender Identity"
										name="patientGenderIdentityId"
										value={values.patientGenderIdentityId}
										as="select"
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientGenderIdentityId && errors.patientGenderIdentityId
												? errors.patientGenderIdentityId
												: ''
										}
									>
										<option value="">Select...</option>
										{referenceData?.genderIdentities.map((genderIdentity) => {
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
									<InputHelper
										className="mb-2"
										label="Race"
										name="patientRaceId"
										value={values.patientRaceId}
										as="select"
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientRaceId && errors.patientRaceId ? errors.patientRaceId : ''
										}
									>
										<option value="">Select...</option>
										{referenceData?.races.map((race) => {
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
										name="patientEthnicityId"
										value={values.patientEthnicityId}
										as="select"
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientEthnicityId && errors.patientEthnicityId
												? errors.patientEthnicityId
												: ''
										}
									>
										<option value="">Select...</option>
										{referenceData?.ethnicities.map((ethnicity) => {
											return (
												<option key={ethnicity.ethnicityId} value={ethnicity.ethnicityId}>
													{ethnicity.description}
												</option>
											);
										})}
									</InputHelper>
									<InputHelper
										className="mb-6"
										label="Preferred Language"
										name="languageCode"
										value={values.patientLanguageCode}
										as="select"
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientLanguageCode && errors.patientLanguageCode
												? errors.patientLanguageCode
												: ''
										}
									>
										<option value="">Select...</option>
										{referenceData?.languages.map((language) => {
											return (
												<option key={language.languageCode} value={language.languageCode}>
													{language.description}
												</option>
											);
										})}
									</InputHelper>
									<div className="d-flex align-items-center justify-content-between">
										<Button
											variant="outline-primary"
											onClick={() => {
												navigate('/ic/patient/demographics-part-2');
											}}
										>
											Back
										</Button>
										<Button variant="primary" type="submit">
											Next
										</Button>
									</div>
								</Form>
							)}
						</Formik>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default PatientDemographicsPart3;
