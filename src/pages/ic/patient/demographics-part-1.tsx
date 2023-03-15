import moment from 'moment';
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
import DatePicker from '@/components/date-picker';

export interface FormData {
	patientFirstName: string;
	patientLastName: string;
	patientBirthdate: string;
	patientPhoneNumber: string;
	patientEmailAddress: string;
	insuranceId: string;
}

const PatientDemographicsPart1 = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();

	const initialFormValues: FormData = useMemo(() => {
		return {
			patientFirstName: patientOrder?.patientFirstName ?? '',
			patientLastName: patientOrder?.patientLastName ?? '',
			patientBirthdate: patientOrder?.patientBirthdate ?? '',
			patientPhoneNumber: patientOrder?.patientPhoneNumber ?? '',
			patientEmailAddress: patientOrder?.patientEmailAddress ?? '',
			insuranceId: '',
		};
	}, [
		patientOrder?.patientBirthdate,
		patientOrder?.patientEmailAddress,
		patientOrder?.patientFirstName,
		patientOrder?.patientLastName,
		patientOrder?.patientPhoneNumber,
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
				navigate('/ic/patient/demographics-part-2');
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
						<h3 className="mb-2">Let's begin with who you are</h3>
						<p className="mb-0">
							Your primary care team gave us a head start filling out this information. Please make sure
							your preferred cell phone number and email address are correct, or enter these if they have
							not been provided.
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
							{({ values, touched, errors, setFieldValue, handleChange, handleBlur, handleSubmit }) => (
								<Form onSubmit={handleSubmit}>
									<InputHelper
										className="mb-2"
										label="First Name"
										type="text"
										name="patientFirstName"
										value={values.patientFirstName}
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientFirstName && errors.patientFirstName
												? errors.patientFirstName
												: ''
										}
									/>
									<InputHelper
										className="mb-2"
										label="Last Name"
										type="text"
										name="patientLastName"
										value={values.patientLastName}
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientLastName && errors.patientLastName
												? errors.patientLastName
												: ''
										}
										required
									/>
									<Form.Group controlId="birthdate" className="mb-2">
										<DatePicker
											showYearDropdown
											showMonthDropdown
											dropdownMode="select"
											labelText="Date of Birth"
											selected={
												values.patientBirthdate
													? moment(values.patientBirthdate).toDate()
													: undefined
											}
											onChange={(date) => {
												setFieldValue(
													'birthdate',
													date ? moment(date).format('YYYY-MM-DD') : ''
												);
											}}
										/>
									</Form.Group>
									<InputHelper
										className="mb-2"
										label="Phone Number"
										type="text"
										name="patientPhoneNumber"
										value={values.patientPhoneNumber}
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientPhoneNumber && errors.patientPhoneNumber
												? errors.patientPhoneNumber
												: ''
										}
										required
									/>
									<InputHelper
										className="mb-2"
										label="Email Address"
										type="email"
										name="patientEmailAddress"
										value={values.patientEmailAddress}
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.patientEmailAddress && errors.patientEmailAddress
												? errors.patientEmailAddress
												: ''
										}
										required
									/>
									<InputHelper
										className="mb-6"
										label="Insurance"
										name="insuranceId"
										value={values.insuranceId}
										as="select"
										onBlur={handleBlur}
										onChange={handleChange}
										error={touched.insuranceId && errors.insuranceId ? errors.insuranceId : ''}
									>
										<option value="">Select...</option>
										{referenceData?.insurances.map((insurance) => {
											return (
												<option key={insurance.insuranceId} value={insurance.insuranceId}>
													{insurance.description}
												</option>
											);
										})}
									</InputHelper>
									<div className="text-right">
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

export default PatientDemographicsPart1;
