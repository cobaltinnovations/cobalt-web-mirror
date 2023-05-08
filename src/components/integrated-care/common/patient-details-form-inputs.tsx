import React from 'react';
import InputHelper from '@/components/input-helper';
import { FormikProps } from 'formik';
import { Form } from 'react-bootstrap';
import DatePicker from '@/components/date-picker';
import moment from 'moment';
import { useIntegratedCareLoaderData } from '@/routes/ic/landing';

export interface PatientDetailsFormData {
	patientFirstName: string;
	patientLastName: string;
	patientBirthdate: string;
	patientPhoneNumber: string;
	patientEmailAddress: string;
	patientOrderInsurancePayorId: string;
	patientOrderInsurancePlanId: string;
}
interface PatientDetailsFormInputsProps<T = PatientDetailsFormData> {
	formikProps: FormikProps<T>;
}

export const PatientDetailsFormInputs = ({
	formikProps: { values, handleBlur, setFieldValue, handleChange, touched, errors },
}: PatientDetailsFormInputsProps) => {
	const { referenceDataResponse } = useIntegratedCareLoaderData();

	return (
		<>
			<InputHelper
				className="mb-2"
				label="First Name"
				type="text"
				name="patientFirstName"
				value={values.patientFirstName}
				onBlur={handleBlur}
				onChange={handleChange}
				error={touched.patientFirstName && errors.patientFirstName ? errors.patientFirstName : ''}
				required
			/>
			<InputHelper
				className="mb-2"
				label="Last Name"
				type="text"
				name="patientLastName"
				value={values.patientLastName}
				onBlur={handleBlur}
				onChange={handleChange}
				error={touched.patientLastName && errors.patientLastName ? errors.patientLastName : ''}
				required
			/>
			<Form.Group controlId="patientBirthdate" className="mb-2">
				<DatePicker
					showYearDropdown
					showMonthDropdown
					dropdownMode="select"
					labelText="Date of Birth"
					selected={values.patientBirthdate ? moment(values.patientBirthdate).toDate() : undefined}
					onChange={(date) => {
						setFieldValue('patientBirthdate', date ? moment(date).format('YYYY-MM-DD') : '');
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
				error={touched.patientPhoneNumber && errors.patientPhoneNumber ? errors.patientPhoneNumber : ''}
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
				error={touched.patientEmailAddress && errors.patientEmailAddress ? errors.patientEmailAddress : ''}
				required
			/>
			<InputHelper
				className="mb-2"
				label="Insurance Provider"
				as="select"
				name="patientOrderInsurancePayorId"
				value={values.patientOrderInsurancePayorId}
				onBlur={handleBlur}
				onChange={handleChange}
				error={
					touched.patientOrderInsurancePayorId && errors.patientOrderInsurancePayorId
						? errors.patientOrderInsurancePayorId
						: ''
				}
				required
			>
				<option value="" disabled>
					Select...
				</option>
				{referenceDataResponse.patientOrderInsurancePayors.map((insurancePayor) => {
					return (
						<option
							key={insurancePayor.patientOrderInsurancePayorId}
							value={insurancePayor.patientOrderInsurancePayorId}
						>
							{insurancePayor.name}
						</option>
					);
				})}
			</InputHelper>
			<InputHelper
				className="mb-6"
				label="Insurance Plan"
				as="select"
				name="patientOrderInsurancePlanId"
				value={values.patientOrderInsurancePlanId}
				onBlur={handleBlur}
				onChange={handleChange}
				error={
					touched.patientOrderInsurancePlanId && errors.patientOrderInsurancePlanId
						? errors.patientOrderInsurancePlanId
						: ''
				}
				disabled={!values.patientOrderInsurancePayorId}
				required
			>
				<option value="" disabled label="Select..." />
				{referenceDataResponse.patientOrderInsurancePlans
					.filter((plan) => plan.patientOrderInsurancePayorId === values.patientOrderInsurancePayorId)
					.map((insurancePlan) => {
						return (
							<option
								key={insurancePlan.patientOrderInsurancePlanId}
								value={insurancePlan.patientOrderInsurancePlanId}
							>
								{insurancePlan.name}
							</option>
						);
					})}
			</InputHelper>
		</>
	);
};
