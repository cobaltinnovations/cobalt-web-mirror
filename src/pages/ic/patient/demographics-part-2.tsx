import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';

import { PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import { ERROR_CODES } from '@/lib/http-client';
import useHandleError from '@/hooks/use-handle-error';
import AsyncPage from '@/components/async-page';
import InputHelper from '@/components/input-helper';

export interface FormData {
	patientAddress: {
		streetAddress1: string;
		streetAddress2: string;
		locality: string;
		region: string;
		postalCode: string;
		postalName: string;
		countryCode: string;
	};
}

const PatientDemographicsPart2 = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();

	const initialFormValues: FormData = useMemo(() => {
		return {
			patientAddress: {
				streetAddress1: patientOrder?.patientAddress?.streetAddress1 ?? '',
				streetAddress2: patientOrder?.patientAddress?.streetAddress2 ?? '',
				locality: patientOrder?.patientAddress?.locality ?? '',
				region: patientOrder?.patientAddress?.region ?? '',
				postalCode: patientOrder?.patientAddress?.postalCode ?? '',
				postalName: `${patientOrder?.patientFirstName} ${patientOrder?.patientLastName}`,
				countryCode: 'US',
			},
		};
	}, [
		patientOrder?.patientAddress?.locality,
		patientOrder?.patientAddress?.postalCode,
		patientOrder?.patientAddress?.region,
		patientOrder?.patientAddress?.streetAddress1,
		patientOrder?.patientAddress?.streetAddress2,
		patientOrder?.patientFirstName,
		patientOrder?.patientLastName,
	]);

	const fetchData = useCallback(async () => {
		const [patientOrderResponse, referenceDataResponse] = await Promise.all([
			integratedCareService.getOpenOrderForCurrentPatient().fetch(),
			integratedCareService.getReferenceData().fetch(),
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
				navigate('/ic/patient/demographics-part-3');
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
						<h3 className="mb-2">Where do you live?</h3>
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
										label="Street Address 1"
										type="text"
										name="patientAddress.streetAddress1"
										value={values.patientAddress.streetAddress1}
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientAddress?.streetAddress1 &&
											errors.patientAddress?.streetAddress1
												? errors.patientAddress?.streetAddress1
												: ''
										}
									/>
									<InputHelper
										className="mb-2"
										label="Street Address 2"
										type="text"
										name="patientAddress.streetAddress2"
										value={values.patientAddress.streetAddress2}
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientAddress?.streetAddress2 &&
											errors.patientAddress?.streetAddress2
												? errors.patientAddress?.streetAddress2
												: ''
										}
									/>
									<InputHelper
										className="mb-2"
										label="City"
										type="text"
										name="patientAddress.locality"
										value={values.patientAddress.locality}
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientAddress?.locality && errors.patientAddress?.locality
												? errors.patientAddress?.locality
												: ''
										}
									/>
									<InputHelper
										className="mb-2"
										label="State"
										name="patientAddress.region"
										value={values.patientAddress.region}
										as="select"
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientAddress?.region && errors.patientAddress?.region
												? errors.patientAddress?.region
												: ''
										}
									>
										<option value="">Select...</option>
										{referenceData?.regionsByCountryCode['US'].map((region) => {
											return (
												<option key={region.abbreviation} value={region.abbreviation}>
													{region.name}
												</option>
											);
										})}
									</InputHelper>
									<InputHelper
										className="mb-6"
										label="ZIP Code"
										type="text"
										name="patientAddress.postalCode"
										value={values.patientAddress.postalCode}
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientAddress?.postalCode && errors.patientAddress?.postalCode
												? errors.patientAddress?.postalCode
												: ''
										}
									/>
									<div className="d-flex align-items-center justify-content-between">
										<Button
											variant="outline-primary"
											onClick={() => {
												navigate('/ic/patient/demographics-part-1');
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

export default PatientDemographicsPart2;
