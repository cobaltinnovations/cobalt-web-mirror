import AsyncPage from '@/components/async-page';
import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import { ReferenceDataResponse } from '@/lib/models';
import { accountService, PatientAccountFormData } from '@/lib/services';
import { formatISO, parseISO } from 'date-fns';
import { Formik } from 'formik';
import React, { useCallback, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const IntegratedCarePatientInfoPage = () => {
	const { account } = useAccount();
	const navigate = useNavigate();

	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();

	const fetchData = useCallback(async () => {
		accountService
			.getReferenceData()
			.fetch()
			.then((response) => {
				setReferenceData(response);
			});
	}, []);

	const initialFormValues: PatientAccountFormData = useMemo(() => {
		return {
			firstName: account?.firstName ?? '',
			lastName: account?.lastName ?? '',
			birthdate: account?.birthdate ?? '',
			phoneNumber: account?.phoneNumber ?? '',
			emailAddress: account?.emailAddress ?? '',
			genderIdentityId: account?.genderIdentityId ?? '',
			raceId: account?.raceId ?? '',
			ethnicityId: account?.ethnicityId ?? '',
			languageCode: account?.languageCode ?? '',
			timeZone: account?.timeZone ?? '',
			insuranceId: account?.insuranceId ?? '',
			address: {
				streetAddress1: account?.address?.streetAddress1 ?? '',
				streetAddress2: account?.address?.streetAddress2 ?? '',
				locality: account?.address?.locality ?? '',
				region: account?.address?.region ?? '',
				postalCode: account?.address?.postalCode ?? '',
			},
		};
	}, [
		account?.address?.locality,
		account?.address?.postalCode,
		account?.address?.region,
		account?.address?.streetAddress1,
		account?.address?.streetAddress2,
		account?.birthdate,
		account?.emailAddress,
		account?.ethnicityId,
		account?.firstName,
		account?.genderIdentityId,
		account?.insuranceId,
		account?.languageCode,
		account?.lastName,
		account?.phoneNumber,
		account?.raceId,
		account?.timeZone,
	]);

	return (
		<AsyncPage fetchData={fetchData}>
			<Container className="py-8">
				<Row className="mb-6">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<p className="mb-6">
							Let's begin with who you are and what you're looking for. Your primary care team gave us a
							head start. Please make sure your preferred cell phone number and email are correct, or
							enter these if they are not populated.
						</p>

						<PatientAccountForm
							referenceData={referenceData!}
							initialValues={initialFormValues}
							onSuccess={() => {
								navigate('/ic/screening');
							}}
						/>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default IntegratedCarePatientInfoPage;

interface PatientAccountFormProps {
	referenceData: ReferenceDataResponse;
	initialValues: PatientAccountFormData;
	onSuccess: () => void;
}

const PatientAccountForm = ({ referenceData, initialValues, onSuccess }: PatientAccountFormProps) => {
	const handleError = useHandleError();
	const { account } = useAccount();

	return (
		<Formik<PatientAccountFormData>
			initialValues={initialValues}
			enableReinitialize
			onSubmit={(values) => {
				if (!account) {
					return;
				}

				accountService
					.patchPatientAccount(account.accountId, values)
					.fetch()
					.then(() => {
						onSuccess();
					})
					.catch((e) => {
						if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
							handleError(e);
						}
					});
			}}
		>
			{(formikBag) => {
				const { values, touched, errors, setFieldValue, handleChange, handleBlur, handleSubmit } = formikBag;

				return (
					<Form onSubmit={handleSubmit}>
						<InputHelper
							className="mb-2"
							label="First Name"
							type="text"
							name="firstName"
							value={values.firstName}
							as="input"
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
							as="input"
							onBlur={handleBlur}
							onChange={handleChange}
							error={touched.lastName && errors.lastName ? errors.lastName : ''}
						/>

						<Form.Group controlId="birthdate" className="mb-2">
							<DatePicker
								showYearDropdown
								showMonthDropdown
								dropdownMode="select"
								labelText="Birthdate"
								selected={values.birthdate ? parseISO(values.birthdate) : undefined}
								onChange={(date) => {
									setFieldValue('birthdate', date ? formatISO(date, { representation: 'date' }) : '');
								}}
							/>
						</Form.Group>

						<InputHelper
							className="mb-2"
							label="Phone Number"
							type="text"
							name="phoneNumber"
							value={values.phoneNumber}
							as="input"
							onBlur={handleBlur}
							onChange={handleChange}
							error={touched.phoneNumber && errors.phoneNumber ? errors.phoneNumber : ''}
						/>

						<InputHelper
							className="mb-2"
							label="Gender Identity"
							name="genderIdentityId"
							value={values.genderIdentityId}
							as="select"
							onBlur={handleBlur}
							onChange={handleChange}
							error={touched.genderIdentityId && errors.genderIdentityId ? errors.genderIdentityId : ''}
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
							className="mb-2"
							label="Language"
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

						<InputHelper
							className="mb-2"
							label="Time Zone"
							name="timeZone"
							value={values.timeZone}
							as="select"
							onBlur={handleBlur}
							onChange={handleChange}
							error={touched.timeZone && errors.timeZone ? errors.timeZone : ''}
						>
							<option value="">Select...</option>
							{referenceData?.timeZones.map((timeZone) => {
								return (
									<option key={timeZone.timeZone} value={timeZone.timeZone}>
										{timeZone.description}
									</option>
								);
							})}
						</InputHelper>

						<InputHelper
							className="mb-2"
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

						<InputHelper
							className="mb-2"
							label="Street Address 1"
							type="text"
							name="address.streetAddress1"
							value={values.address.streetAddress1}
							as="input"
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
							as="input"
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
							name="address.city"
							value={values.address.locality}
							as="input"
							onBlur={handleBlur}
							onChange={handleChange}
							error={
								touched.address?.locality && errors.address?.locality ? errors.address?.locality : ''
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
							error={touched.address?.region && errors.address?.region ? errors.address?.region : ''}
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
							className="mb-2"
							label="ZIP Code"
							type="text"
							name="address.postalCode"
							value={values.address.postalCode}
							as="input"
							onBlur={handleBlur}
							onChange={handleChange}
							error={
								touched.address?.postalCode && errors.address?.postalCode
									? errors.address?.postalCode
									: ''
							}
						/>

						<div className="mt-4 d-flex">
							<Button variant="primary" className="flex-grow-1" type="submit">
								Continue
							</Button>
						</div>
					</Form>
				);
			}}
		</Formik>
	);
};
