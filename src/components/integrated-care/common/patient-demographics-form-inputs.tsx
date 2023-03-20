import InputHelper from '@/components/input-helper';
import { ReferenceDataResponse } from '@/lib/models';
import { FormikProps } from 'formik';
import React from 'react';

export interface PatientDemographicsFormData {
	patientBirthSexId: string;
	patientGenderIdentityId: string;
	patientRaceId: string;
	patientEthnicityId: string;
	patientLanguageCode: string;
}

interface PatientDemographicsFormInputsProps {
	formikProps: FormikProps<PatientDemographicsFormData>;
	referenceData?: ReferenceDataResponse;
}

export const PatientDemographicsFormInputs = ({
	formikProps: { values, handleBlur, handleChange, touched, errors },
	referenceData,
}: PatientDemographicsFormInputsProps) => {
	return (
		<>
			<InputHelper
				className="mb-2"
				label="Birth Sex"
				name="patientBirthSexId"
				value={values.patientBirthSexId}
				as="select"
				onBlur={handleBlur}
				onChange={handleChange}
				error={touched.patientBirthSexId && errors.patientBirthSexId ? errors.patientBirthSexId : ''}
			>
				<option value="">Select...</option>
				{referenceData?.birthSexes.map((birthSex) => {
					return (
						<option key={birthSex.birthSexId} value={birthSex.birthSexId}>
							{birthSex.description}
						</option>
					);
				})}
			</InputHelper>
			<InputHelper
				className="mb-2"
				label="Gender Identity"
				name="patientGenderIdentityId"
				value={values.patientGenderIdentityId}
				as="select"
				onBlur={handleBlur}
				onChange={handleChange}
				error={
					touched.patientGenderIdentityId && errors.patientGenderIdentityId
						? errors.patientGenderIdentityId
						: ''
				}
			>
				<option value="">Select...</option>
				{referenceData?.genderIdentities.map((genderIdentity) => {
					return (
						<option key={genderIdentity.genderIdentityId} value={genderIdentity.genderIdentityId}>
							{genderIdentity.description}
						</option>
					);
				})}
			</InputHelper>
			<InputHelper
				className="mb-2"
				label="Race"
				name="patientRaceId"
				value={values.patientRaceId}
				as="select"
				onBlur={handleBlur}
				onChange={handleChange}
				error={touched.patientRaceId && errors.patientRaceId ? errors.patientRaceId : ''}
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
				name="patientEthnicityId"
				value={values.patientEthnicityId}
				as="select"
				onBlur={handleBlur}
				onChange={handleChange}
				error={touched.patientEthnicityId && errors.patientEthnicityId ? errors.patientEthnicityId : ''}
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
				value={values.patientLanguageCode}
				as="select"
				onBlur={handleBlur}
				onChange={handleChange}
				error={touched.patientLanguageCode && errors.patientLanguageCode ? errors.patientLanguageCode : ''}
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
		</>
	);
};
