import { PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import { Formik } from 'formik';
import React, { useMemo } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import {
	PatientDetailsFormInputs,
	PatientAddressFormInputs,
	PatientDemographicsFormInputs,
	PatientDetailsFormData,
	PatientAddressFormData,
	PatientDemographicsFormData,
} from '../common';

export type PatientInfoFormData = PatientDetailsFormData & PatientAddressFormData & PatientDemographicsFormData;

interface VerifyPatientInfoFormProps {
	patientOrder: PatientOrderModel;
	onSubmit: (values: PatientInfoFormData) => void;
	referenceData?: ReferenceDataResponse;
}

export const MhicVerifyPatientInfoForm = ({ patientOrder, onSubmit, referenceData }: VerifyPatientInfoFormProps) => {
	const initialFormValues: PatientInfoFormData = useMemo(() => {
		return {
			patientFirstName: patientOrder?.patientFirstName ?? '',
			patientLastName: patientOrder?.patientLastName ?? '',
			patientBirthdate: patientOrder?.patientBirthdate ?? '',
			patientPhoneNumber: patientOrder?.patientPhoneNumberDescription ?? '',
			patientEmailAddress: patientOrder?.patientEmailAddress ?? patientOrder?.patientAccount?.emailAddress ?? '',
			patientInsuranceProvider: '', // TODO
			patientInsurancePlan: '', // TODO
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

	return (
		<Container className="py-20">
			<Row className="mb-8">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<h3 className="mb-2">Verify patient information</h3>
					<p className="mb-0">
						The primary care team gave us a head start filling out this information. Please make sure the
						patient’s preferred cell phone number and email address are correct, or enter these if they have
						not been provided.
					</p>
				</Col>
			</Row>
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<Formik<PatientInfoFormData>
						initialValues={initialFormValues}
						enableReinitialize
						onSubmit={onSubmit}
					>
						{(formikProps) => (
							<Form onSubmit={formikProps.handleSubmit}>
								<PatientDetailsFormInputs
									//@ts-expect-error
									formikProps={formikProps}
								/>

								<hr />

								<h4 className="my-8">Address</h4>

								<PatientAddressFormInputs
									//@ts-expect-error
									formikProps={formikProps}
									referenceData={referenceData}
								/>

								<hr />

								<h4 className="my-8">Demographics</h4>

								<PatientDemographicsFormInputs
									//@ts-expect-error
									formikProps={formikProps}
									referenceData={referenceData}
								/>

								<div className="d-flex align-items-center justify-content-end">
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
	);
};
