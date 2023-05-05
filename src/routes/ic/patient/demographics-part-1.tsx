import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';

import { PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import { ERROR_CODES } from '@/lib/http-client';
import useHandleError from '@/hooks/use-handle-error';
import AsyncPage from '@/components/async-page';
import { PatientDetailsFormInputs, PatientDetailsFormData } from '@/components/integrated-care/common';

const PatientDemographicsPart1 = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();

	const initialFormValues: PatientDetailsFormData = useMemo(() => {
		return {
			patientFirstName: patientOrder?.patientFirstName ?? '',
			patientLastName: patientOrder?.patientLastName ?? '',
			patientBirthdate: patientOrder?.patientBirthdate ?? '',
			patientPhoneNumber: patientOrder?.patientPhoneNumberDescription ?? '',
			patientEmailAddress: patientOrder?.patientEmailAddress ?? patientOrder?.patientAccount?.emailAddress ?? '',
		};
	}, [
		patientOrder?.patientAccount?.emailAddress,
		patientOrder?.patientBirthdate,
		patientOrder?.patientEmailAddress,
		patientOrder?.patientFirstName,
		patientOrder?.patientLastName,
		patientOrder?.patientPhoneNumberDescription,
	]);

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getLatestPatientOrder().fetch();
		setPatientOrder(response.patientOrder);
	}, []);

	const handleFormSubmit = useCallback(
		async (values: PatientDetailsFormData) => {
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
						<Formik<PatientDetailsFormData>
							initialValues={initialFormValues}
							enableReinitialize
							onSubmit={handleFormSubmit}
						>
							{(formikProps) => (
								<Form onSubmit={formikProps.handleSubmit}>
									<PatientDetailsFormInputs formikProps={formikProps} />

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
