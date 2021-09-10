// @ts-nocheck
import React, { FC } from 'react';
import moment from 'moment';
import { Button, Modal } from 'react-bootstrap';
import { Formik, Field, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { useField, useFormikContext } from "formik";
import DatePicker from "react-datepicker";
import {
	demographicsInformationForm,
	races,
	ethnicities,
	preferredLanguages,
	insurances,
	genders,
} from '@/assets/pic/formTemplates/patientInformationForm';

// TODO: Remove disabled from inputs and buttons once BE functionality is in place to update a patients demographic
const FormixCheckbox: FC<Props> = ({ field, form, label, ...rest }) => {
	const { name, value: formikValue } = field;
	const { setFieldValue } = form;

	const handleChange = event => {
		const values = formikValue || [];
		const index = values.indexOf(rest.value);
		if (index === -1) {
			values.push(rest.value);
		} else {
			values.splice(index, 1);
		}
		setFieldValue(name, values);
	};

	return (
		<label>
			<input
				type="checkbox"
				onChange={handleChange}
				checked={formikValue.indexOf(rest.value) !== -1}
				{...rest}
				className='mr-2'
				disabled={true}
			/>
			<span>{label}</span>
		</label>
	);
};

const FormixDatePicker: FC<Props> = (props) => {
	const { setFieldValue } = useFormikContext();
	const [field] = useField(props);
	return (
		<DatePicker
			className={'w-100 p-1 no-border text-dark'}
			{...field}
			{...props}
			selected={(field.value && new Date(field.value)) || null}
			onChange={val => {
				setFieldValue(field.name, val);
			}}
			disabled={true}
		/>
	);
}

export const DemographicsModal: FC<Props> = (props) => {
	const { t } = useTranslation();
	// const { setFieldValue } = useFormikContext();
	const { show, saveClickHandler, closeClickHandler, patient } = props;

	const initialFormValues: Values = {
		dob: patient.dob || '',
		age: patient.age || '',
		insurance: patient.phone || '',
		preferredLanguage: patient.preferredLanguage || '',
		address: patient.address || '',
		genderIdentity: patient.gender || '',
		races: [patient.race || ''],
		ethnicity: patient.ethnicity || '',
		educationLevel: patient.educationLevel || '',
		zip: patient.zip,
	};

	const submitForm = (values) => {
		const { dob } = values;
		const dobTimeStamp = moment(dob).format();
		const demographics = Object.assign({}, values, { dob: dobTimeStamp });
		// TODO: add endpoint to update demographics and write back to epic
	};

	return (
		<>
			<Modal show={show} onHide={closeClickHandler}>
				<Modal.Header closeButton className="border-bottom bg-light">
					<Modal.Title >{t('mhic.patientDetailModal.demographicsTab.demographicsTile.title')}</Modal.Title>
					<p className='modal-title mb-3'>
						{patient.displayName}
						{patient.familyName}
					</p>
				</Modal.Header>
				<Formik initialValues={initialFormValues} onSubmit={(values: Values) => submitForm(values)}>
					<Form>
						<Modal.Body className='modal-body'>
							{demographicsInformationForm.map((field: FormField) => {
								const { fieldName, inputType } = field;
								return (
									<div key={fieldName} className={'mx-auto mt-2 p-2 border font-karla-bold bg-light text-gray'}>
										<label htmlFor={fieldName}>{t(`personalInformation.${fieldName}`)}</label>
										{inputType === 'select' && fieldName !== 'race' ? (
											<Field id={fieldName} name={fieldName} className={'w-100 p-1 no-border text-dark d-flex form'} as="select" disabled={true}>
												{ fieldName === 'genderIdentity' &&
													genders.map((gender) => (
														<option value={gender.value} key={gender.value} >
															{gender.label}
														</option>
													))
												}
												{ fieldName === 'insurance' &&
													insurances.map((insurance) => (
														<option value={insurance.value} key={insurance.value} >
															{insurance.label}
														</option>
													))
												}
												{ fieldName === 'ethnicity' &&
													ethnicities.map((ethnicity) => (
														<option value={ethnicity.value} key={ethnicity.value} >
															{ethnicity.label}
														</option>
													))
												}
												{ fieldName === 'preferredLanguage' &&
													preferredLanguages.map((language) => (
														<option value={language.value} key={language.value} data-cy={language.value} >
															{language.label}
														</option>
													))
												}
											</Field>
											) : fieldName === 'race' ? (
												<div className="w-100 p-1 no-border d-flex flex-column text-dark font-karla-regular">
												{
													races.map((race) => (<Field key={race.value} component={FormixCheckbox} name="races" value={race.value} label={race.label} />))
												}
												</div>
											) : fieldName === 'dob' ? (
												<div className="w-100 p-1 no-border text-dark">
													<FormixDatePicker name={fieldName} />
												</div>
											) : (
												<Field id={fieldName} name={fieldName} type={inputType} className={'w-100 p-1 no-border text-dark'} disabled={true}/>
											)
										}
									</div>
								);
							})}
						</Modal.Body>
						<Modal.Footer className='bg-light justify-content-end modal-footer'>
							<Button variant="outline-primary" onClick={closeClickHandler} className={'mr-1 mt-4'}>
								{t('mhic.modal.cancel')}
							</Button>
							<Button variant="primary" type="submit" className='mt-4' data-cy='save-demographics-button' disabled={true}>
								{t('mhic.modal.save')}
							</Button>
						</Modal.Footer>
					</Form>
				</Formik>
			</Modal>
		</>
	);
};

export default DemographicsModal;
