import InputHelper from '@/components/input-helper';
import { ReferenceDataResponse } from '@/lib/models';
import { FormikProps } from 'formik';
import React from 'react';

export interface PatientAddressFormData {
	patientAddress: {
		streetAddress1: string;
		streetAddress2: string;
		locality: string;
		region: string;
		postalCode: string;
		postalName: string;
		countryCode: string;
	};
}

interface PatientAddressFormInputsProps {
	formikProps: FormikProps<PatientAddressFormData>;
	referenceData?: ReferenceDataResponse;
}

export const PatientAddressFormInputs = ({
	formikProps: { values, handleBlur, setFieldValue, handleChange, touched, errors },
	referenceData,
}: PatientAddressFormInputsProps) => {
	return (
		<>
			<InputHelper
				className="mb-2"
				label="Street Address 1"
				type="text"
				name="patientAddress.streetAddress1"
				value={values.patientAddress.streetAddress1}
				onBlur={handleBlur}
				onChange={handleChange}
				error={
					touched.patientAddress?.streetAddress1 && errors.patientAddress?.streetAddress1
						? errors.patientAddress?.streetAddress1
						: ''
				}
			/>
			<InputHelper
				className="mb-2"
				label="Street Address 2"
				type="text"
				name="patientAddress.streetAddress2"
				value={values.patientAddress.streetAddress2}
				onBlur={handleBlur}
				onChange={handleChange}
				error={
					touched.patientAddress?.streetAddress2 && errors.patientAddress?.streetAddress2
						? errors.patientAddress?.streetAddress2
						: ''
				}
			/>
			<InputHelper
				className="mb-2"
				label="City"
				type="text"
				name="patientAddress.locality"
				value={values.patientAddress.locality}
				onBlur={handleBlur}
				onChange={handleChange}
				error={
					touched.patientAddress?.locality && errors.patientAddress?.locality
						? errors.patientAddress?.locality
						: ''
				}
			/>
			<InputHelper
				className="mb-2"
				label="State"
				name="patientAddress.region"
				value={values.patientAddress.region}
				as="select"
				onBlur={handleBlur}
				onChange={handleChange}
				error={
					touched.patientAddress?.region && errors.patientAddress?.region ? errors.patientAddress?.region : ''
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
				name="patientAddress.postalCode"
				value={values.patientAddress.postalCode}
				onBlur={handleBlur}
				onChange={handleChange}
				error={
					touched.patientAddress?.postalCode && errors.patientAddress?.postalCode
						? errors.patientAddress?.postalCode
						: ''
				}
			/>
		</>
	);
};
