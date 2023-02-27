import moment from 'moment';
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
import DatePicker from '@/components/date-picker';

export interface FormData {
	firstName: string;
	lastName: string;
	birthdate: string;
	phoneNumber: string;
	emailAddress: string;
	insuranceId: string;
}

const DemographicsPart1 = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const { account } = useAccount();
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();

	const initialFormValues: FormData = useMemo(() => {
		return {
			firstName: account?.firstName ?? '',
			lastName: account?.lastName ?? '',
			birthdate: account?.birthdate ?? '',
			phoneNumber: account?.phoneNumber ?? '',
			emailAddress: account?.emailAddress ?? '',
			insuranceId: account?.insuranceId ?? '',
		};
	}, [
		account?.birthdate,
		account?.emailAddress,
		account?.firstName,
		account?.insuranceId,
		account?.lastName,
		account?.phoneNumber,
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
				navigate('/ic/patient/demographics-part-2');
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
										name="firstName"
										value={values.firstName}
										onBlur={handleBlur}
										onChange={handleChange}
										error={touched.firstName && errors.firstName ? errors.firstName : ''}
									/>
									<InputHelper
										className="mb-2"
										label="Last Name"
										type="text"
										name="lastName"
										value={values.lastName}
										onBlur={handleBlur}
										onChange={handleChange}
										error={touched.lastName && errors.lastName ? errors.lastName : ''}
										required
									/>
									<Form.Group controlId="birthdate" className="mb-2">
										<DatePicker
											showYearDropdown
											showMonthDropdown
											dropdownMode="select"
											labelText="Date of Birth"
											selected={values.birthdate ? moment(values.birthdate).toDate() : undefined}
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
										name="phoneNumber"
										value={values.phoneNumber}
										onBlur={handleBlur}
										onChange={handleChange}
										error={touched.phoneNumber && errors.phoneNumber ? errors.phoneNumber : ''}
										required
									/>
									<InputHelper
										className="mb-2"
										label="Email Address"
										type="email"
										name="emailAddress"
										value={values.emailAddress}
										onBlur={handleBlur}
										onChange={handleChange}
										error={touched.emailAddress && errors.emailAddress ? errors.emailAddress : ''}
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

export default DemographicsPart1;
