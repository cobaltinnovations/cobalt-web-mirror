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
	genderIdentityId: string;
	raceId: string;
	ethnicityId: string;
	languageCode: string;
}

const PatientDemographicsPart3 = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const { account } = useAccount();
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();

	const initialFormValues: FormData = useMemo(() => {
		return {
			genderIdentityId: account?.genderIdentityId ?? '',
			raceId: account?.raceId ?? '',
			ethnicityId: account?.ethnicityId ?? '',
			languageCode: account?.languageCode ?? '',
		};
	}, [account?.ethnicityId, account?.genderIdentityId, account?.languageCode, account?.raceId]);

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
				navigate('/ic/patient/demographics-thanks');
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
										label="Gender Identity"
										name="genderIdentityId"
										value={values.genderIdentityId}
										as="select"
										onBlur={handleBlur}
										onChange={handleChange}
										error={
											touched.genderIdentityId && errors.genderIdentityId
												? errors.genderIdentityId
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
										name="raceId"
										value={values.raceId}
										as="select"
										onBlur={handleBlur}
										onChange={handleChange}
										error={touched.raceId && errors.raceId ? errors.raceId : ''}
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
										name="ethnicityId"
										value={values.ethnicityId}
										as="select"
										onBlur={handleBlur}
										onChange={handleChange}
										error={touched.ethnicityId && errors.ethnicityId ? errors.ethnicityId : ''}
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
										value={values.languageCode}
										as="select"
										onBlur={handleBlur}
										onChange={handleChange}
										error={touched.languageCode && errors.languageCode ? errors.languageCode : ''}
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
