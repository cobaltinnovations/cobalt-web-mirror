import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';

import { ReferenceDataResponse } from '@/lib/models';
import { accountService } from '@/lib/services';
import { ERROR_CODES } from '@/lib/http-client';
import useHandleError from '@/hooks/use-handle-error';
import useAccount from '@/hooks/use-account';
import AsyncPage from '@/components/async-page';
import InputHelper from '@/components/input-helper';

export interface FormData {
	address: {
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
	const { account } = useAccount();
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();

	const initialFormValues: FormData = useMemo(() => {
		return {
			address: {
				streetAddress1: account?.address?.streetAddress1 ?? '',
				streetAddress2: account?.address?.streetAddress2 ?? '',
				locality: account?.address?.locality ?? '',
				region: account?.address?.region ?? '',
				postalCode: account?.address?.postalCode ?? '',
				postalName: `${account?.firstName} ${account?.lastName}`,
				countryCode: 'US',
			},
		};
	}, [
		account?.address?.locality,
		account?.address?.postalCode,
		account?.address?.region,
		account?.address?.streetAddress1,
		account?.address?.streetAddress2,
		account?.firstName,
		account?.lastName,
	]);

	const fetchData = useCallback(async () => {
		const response = await accountService.getReferenceData().fetch();
		setReferenceData(response);
	}, []);

	const handleFormSubmit = useCallback(
		async (values: FormData) => {
			if (!account) {
				return;
			}

			try {
				await accountService.patchPatientAccount(account.accountId, values).fetch();
				navigate('/ic/patient/demographics-part-3');
			} catch (error) {
				if ((error as any).code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(error);
				}
			}
		},
		[account, handleError, navigate]
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
										name="address.streetAddress1"
										value={values.address.streetAddress1}
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.address?.streetAddress1 && errors.address?.streetAddress1
												? errors.address?.streetAddress1
												: ''
										}
									/>
									<InputHelper
										className="mb-2"
										label="Street Address 2"
										type="text"
										name="address.streetAddress2"
										value={values.address.streetAddress2}
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.address?.streetAddress2 && errors.address?.streetAddress2
												? errors.address?.streetAddress2
												: ''
										}
									/>
									<InputHelper
										className="mb-2"
										label="City"
										type="text"
										name="address.locality"
										value={values.address.locality}
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.address?.locality && errors.address?.locality
												? errors.address?.locality
												: ''
										}
									/>
									<InputHelper
										className="mb-2"
										label="State"
										name="address.region"
										value={values.address.region}
										as="select"
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.address?.region && errors.address?.region
												? errors.address?.region
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
										name="address.postalCode"
										value={values.address.postalCode}
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.address?.postalCode && errors.address?.postalCode
												? errors.address?.postalCode
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
