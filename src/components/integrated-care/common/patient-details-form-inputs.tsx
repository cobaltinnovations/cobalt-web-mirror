import React from 'react';
import InputHelper from '@/components/input-helper';
import { FormikProps } from 'formik';
import { Form } from 'react-bootstrap';
import DatePicker from '@/components/date-picker';
import moment from 'moment';

export interface PatientDetailsFormData {
	patientFirstName: string;
	patientLastName: string;
	patientBirthdate: string;
	patientPhoneNumber: string;
	patientEmailAddress: string;
}
interface PatientDetailsFormInputsProps<T = PatientDetailsFormData> {
	formikProps: FormikProps<T>;
}

export const PatientDetailsFormInputs = ({
	formikProps: { values, handleBlur, setFieldValue, handleChange, touched, errors },
}: PatientDetailsFormInputsProps) => {
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
				className="mb-6"
				label="Email Address"
				type="email"
				name="patientEmailAddress"
				value={values.patientEmailAddress}
				onBlur={handleBlur}
				onChange={handleChange}
				error={touched.patientEmailAddress && errors.patientEmailAddress ? errors.patientEmailAddress : ''}
			/>
		</>
	);
};
