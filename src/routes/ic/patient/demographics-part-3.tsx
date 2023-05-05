import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';

import { PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import { ERROR_CODES } from '@/lib/http-client';
import useHandleError from '@/hooks/use-handle-error';
import AsyncPage from '@/components/async-page';
import { PatientDemographicsFormInputs, PatientDemographicsFormData } from '@/components/integrated-care/common';

const PatientDemographicsPart3 = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();

	const initialFormValues: PatientDemographicsFormData = useMemo(() => {
		return {
			patientBirthSexId: patientOrder?.patientBirthSexId ?? '',
			patientGenderIdentityId: patientOrder?.patientGenderIdentityId ?? '',
			patientRaceId: patientOrder?.patientRaceId ?? '',
			patientEthnicityId: patientOrder?.patientEthnicityId ?? '',
			patientLanguageCode: patientOrder?.patientLanguageCode ?? '',
		};
	}, [
		patientOrder?.patientBirthSexId,
		patientOrder?.patientEthnicityId,
		patientOrder?.patientGenderIdentityId,
		patientOrder?.patientLanguageCode,
		patientOrder?.patientRaceId,
	]);

	const fetchData = useCallback(async () => {
		const [patientOrderResponse] = await Promise.all([integratedCareService.getLatestPatientOrder().fetch()]);

		setPatientOrder(patientOrderResponse.patientOrder);
	}, []);

	const handleFormSubmit = useCallback(
		async (values: PatientDemographicsFormData) => {
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
						<Formik<PatientDemographicsFormData>
							initialValues={initialFormValues}
							enableReinitialize
							onSubmit={handleFormSubmit}
						>
							{(formikProps) => (
								<Form onSubmit={formikProps.handleSubmit}>
									<PatientDemographicsFormInputs formikProps={formikProps} />
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
