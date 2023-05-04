import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';

import { PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import { ERROR_CODES } from '@/lib/http-client';
import useHandleError from '@/hooks/use-handle-error';
import AsyncPage from '@/components/async-page';
import { PatientAddressFormInputs, PatientAddressFormData } from '@/components/integrated-care/common';

const PatientDemographicsPart2 = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();

	const initialFormValues: PatientAddressFormData = useMemo(() => {
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
			integratedCareService.getLatestPatientOrder().fetch(),
			integratedCareService.getReferenceData().fetch(),
		]);

		setPatientOrder(patientOrderResponse.patientOrder);
		setReferenceData(referenceDataResponse);
	}, []);

	const handleFormSubmit = useCallback(
		async (values: PatientAddressFormData) => {
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
						<Formik<PatientAddressFormData>
							initialValues={initialFormValues}
							enableReinitialize
							onSubmit={handleFormSubmit}
						>
							{(formikProps) => (
								<Form onSubmit={formikProps.handleSubmit}>
									<PatientAddressFormInputs formikProps={formikProps} referenceData={referenceData} />

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
