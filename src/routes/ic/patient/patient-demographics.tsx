import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';

import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { PatientInfoFormData } from '@/components/integrated-care/mhic';
import {
	PatientAddressFormInputs,
	PatientDemographicsFormInputs,
	PatientDetailsFormInputs,
} from '@/components/integrated-care/common';
import { useIntegratedCareLoaderData } from '../landing';
import { PatientOrderModel } from '@/lib/models';
import AsyncWrapper from '@/components/async-page';

const PatientDemographics = () => {
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const navigate = useNavigate();
	const handleError = useHandleError();
	const [isSaving, setIsSaving] = useState(false);
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();

	const initialFormValues: PatientInfoFormData = useMemo(() => {
		return {
			patientFirstName: patientOrder?.patientFirstName ?? '',
			patientLastName: patientOrder?.patientLastName ?? '',
			patientBirthdate: patientOrder?.patientBirthdate ?? '',
			patientPhoneNumber: patientOrder?.patientPhoneNumberDescription ?? '',
			patientEmailAddress: patientOrder?.patientEmailAddress ?? patientOrder?.patientAccount?.emailAddress ?? '',
			patientAddress: {
				streetAddress1: patientOrder?.patientAddress?.streetAddress1 ?? '',
				streetAddress2: patientOrder?.patientAddress?.streetAddress2 ?? '',
				locality: patientOrder?.patientAddress?.locality ?? '',
				region: patientOrder?.patientAddress?.region ?? '',
				postalCode: patientOrder?.patientAddress?.postalCode ?? '',
				postalName: `${patientOrder?.patientFirstName} ${patientOrder?.patientLastName}`,
				countryCode: 'US',
			},
			patientBirthSexId: patientOrder?.patientBirthSexId ?? '',
			patientGenderIdentityId: patientOrder?.patientGenderIdentityId ?? '',
			patientRaceId: patientOrder?.patientRaceId ?? '',
			patientEthnicityId: patientOrder?.patientEthnicityId ?? '',
			patientLanguageCode: patientOrder?.patientLanguageCode ?? '',
		};
	}, [patientOrder]);

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getLatestPatientOrder().fetch();
		setPatientOrder(response.patientOrder);
	}, []);

	const handleFormikSubmit = useCallback(
		async (values: PatientInfoFormData) => {
			if (!patientOrder) {
				return;
			}

			try {
				setIsSaving(true);

				await integratedCareService.patchPatientOrder(patientOrder.patientOrderId, values).fetch();

				navigate('/ic/patient');
			} catch (error) {
				setIsSaving(false);
				handleError(error);
			}
		},
		[handleError, navigate, patientOrder]
	);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<Container className="py-20">
				<Row className="mb-8">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Formik<PatientInfoFormData>
							initialValues={initialFormValues}
							enableReinitialize
							onSubmit={handleFormikSubmit}
						>
							{(formikProps) => (
								<Form onSubmit={formikProps.handleSubmit}>
									<PatientDetailsFormInputs
										//@ts-expect-error
										formikProps={formikProps}
									/>
									<hr />
									<PatientAddressFormInputs
										//@ts-expect-error
										formikProps={formikProps}
										referenceData={referenceDataResponse}
									/>
									<hr />
									<PatientDemographicsFormInputs
										//@ts-expect-error
										formikProps={formikProps}
										referenceData={referenceDataResponse}
									/>
									<div className="d-flex align-items-center justify-content-end">
										<Button variant="primary" type="submit" disabled={isSaving}>
											Next
										</Button>
									</div>
								</Form>
							)}
						</Formik>
					</Col>
				</Row>
			</Container>
		</AsyncWrapper>
	);
};

export default PatientDemographics;
