import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Col, Container, Row, Spinner, FormCheck } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import { IQuestionnaireResponse, IQuestionnaireResponse_Item, QuestionnaireResponseStatusKind } from '@ahryman40k/ts-fhir-types/lib/R4';
import { useMutation, useQueryClient } from 'react-query';
import { R4 } from '@ahryman40k/ts-fhir-types';
import { postQuestionnaireResponse, putUpdatePatientDemographics } from '@/hooks/pic-hooks';
import { fiftyStates, genders, patientInformationForm } from '@/assets/pic/formTemplates/patientInformationForm';
import { FormattedPatientObject, UpdatedDemographics } from '../utils';
import { Link, useHistory } from 'react-router-dom';

export const PersonalInformation: FC<Props> = (props) => {
	const history = useHistory();
	const { t } = useTranslation();
	const { nextUrl, assessmentId, patient } = props;
	const queryClient = useQueryClient();

	const [phoneError, setPhoneError] = useState(false);
	const [emailError, setEmailError] = useState(false);
	const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(false);
	const [disclaimerAcknowledgementConfirmed, setDisclaimerAcknowledgementConfirmed] = useState(false);

	const initialFormValues: Values = {
		lastName: patient.familyName || '',
		preferredName: patient.displayName || '',
		phoneNumber: patient.phone || '',
		age: patient.age,
		genderIdentity: patient.gender || '',
		city: patient.city || '',
		state: patient.state || '',
		email: patient.email || '',
	};

	const postQuestionnaire = async (questionnaireResponse: R4.IQuestionnaireResponse) => {
		return postQuestionnaireResponse(assessmentId, questionnaireResponse);
	};

	const putContact = async (demographics: UpdatedDemographics) => {
		return putUpdatePatientDemographics(demographics, patient?.picPatientId);
	};

	const { mutate: postInformationQuestionnaireMutation, isError: infoQuestionnaireError, isLoading: infoQuestionnaireLoading } = useMutation(
		postQuestionnaire,
		{
			onSuccess: (data, variables, context) => {
				history.push(nextUrl);
			},
		}
	);

	const { mutate: putContactMutation, isError: putContactError, isLoading: putContactLoading } = useMutation(putContact, {
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries('patient');
			history.push(nextUrl);
		},
	});

	const isError = infoQuestionnaireError || putContactError;
	const isLoading = infoQuestionnaireLoading || putContactLoading;

	const submitForm = (values: Values) => {
		// TODO: send updated demographic information once writing back to epic is in place post pilot
		// const questionnaireResponse = arrayToQuestionnaireResponse(patientInformationForm, values);
		// postInformationQuestionnaireMutation(questionnaireResponse);

		// Update patients contact information
		const contact = {
			phone: values.phoneNumber,
			email: values.email,
		};

		putContactMutation(contact);
	};

	const validatePhone = (phone: string) => {
		const isValid = phone.match(/^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/gm);

		if (isValid) {
			setPhoneError(false);
		}

		if (!isValid) {
			setPhoneError(true);
		}
	};

	const validateEmail = (email: string) => {
		const isValid = email.match(
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);

		if (isValid) {
			setEmailError(false);
		}

		if (!isValid) {
			setEmailError(true);
		}
	};

	const arrayToQuestionnaireResponse = (formFields: FormField[], values: Values) => {
		const answers: IQuestionnaireResponse_Item[] = formFields.reduce((array: IQuestionnaireResponse_Item[], field) => {
			const { fieldName, inputType } = field;
			// @ts-ignore
			const answerItem = inputType === 'number' ? { valueInteger: parseInt(values[fieldName]) } : { valueString: values[fieldName] };
			const answer: IQuestionnaireResponse_Item = {
				linkId: fieldName,
				answer: [answerItem],
			};
			array.push(answer);
			return array;
		}, []);

		const response: IQuestionnaireResponse = {
			resourceType: 'QuestionnaireResponse',
			questionnaire: '/personalInformationForm',
			status: QuestionnaireResponseStatusKind._inProgress,
			item: [
				{
					linkId: '/personalInformationForm',
					item: answers,
				},
			],
		};
		return response;
	};

	return (
		<Container>
			{!disclaimerAcknowledgementConfirmed ? (
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 8, offset: 2 }}>
					<p className="mx-auto my-5">
						If you need immediate help, call 911 or click <Link to="/pic/contact-lcsw">HERE</Link> for a list of resources. The resources above can
						be accessed at any time by clicking the In Crisis button on the top right.
					</p>

					<FormCheck
						type="checkbox"
						bsPrefix="cobalt-modal-form__check"
						name="eventType"
						id="disclaimer-acknowledge"
						label="I acknowledge that this assessment is not a way to communicate urgent information to my care team."
						className="ml-2"
						checked={disclaimerAcknowledged}
						onChange={() => {
							setDisclaimerAcknowledged(!disclaimerAcknowledged);
						}}
					/>

					<Button
						type="button"
						className={'mx-auto mt-5 w-80 d-flex justify-content-center'}
						disabled={!disclaimerAcknowledged}
						onClick={() => {
							setDisclaimerAcknowledgementConfirmed(true);
						}}
					>
						Continue
					</Button>
				</Col>
			) : (
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 8, offset: 2 }}>
					<p className={'mx-auto mt-5 mb-5'}>{t('personalInformation.personalInformationDescription', { pcp: patient.pcp })}</p>
					{/* TODO: all patient demographics expect for phone and email are not persisted until data is saved back to epic */}
					<Formik initialValues={initialFormValues} onSubmit={(values: Values) => submitForm(values)}>
						<>
							{isError && (
								<Row className="mb-3">
									<p className={'text-danger'}>Error: An error occurred when updating patients contact information, Please try again </p>
								</Row>
							)}
							<Form>
								{patientInformationForm.map((field: FormField) => {
									const { fieldName, inputType, placeholderTextKey } = field;
									return (
										<div key={fieldName} className={'mx-auto mt-2 p-2 border font-karla-bold bg-light text-gray'}>
											<label
												htmlFor={fieldName}
												className={`${fieldName !== 'email' && fieldName !== 'phoneNumber' ? 'text-gary' : 'text-dark'}`}
											>
												{t(`personalInformation.${fieldName}`)}
											</label>
											{fieldName === 'state' || fieldName === 'genderIdentity' ? (
												<Field
													id={fieldName}
													name={fieldName}
													placeholder={placeholderTextKey ? t(`personalInformation.${placeholderTextKey}`) : ''}
													className={'w-100 p-1 no-border text-dark'}
													as="select"
													disabled={true}
												>
													{fieldName === 'state' &&
														fiftyStates.map((state) => (
															<option value={state.value} key={state.value}>
																{state.label}
															</option>
														))}
													{fieldName === 'genderIdentity' &&
														genders.map((gender) => (
															<option value={gender.value} key={gender.value}>
																{gender.label}
															</option>
														))}
												</Field>
											) : (
												<>
													<Field
														validate={fieldName === 'email' ? validateEmail : fieldName === 'phoneNumber' ? validatePhone : ''}
														id={fieldName}
														name={fieldName}
														type={inputType}
														placeholder={placeholderTextKey ? t(`personalInformation.${placeholderTextKey}`) : ''}
														className={`w-100 p-1 no-border ${
															fieldName !== 'email' && fieldName !== 'phoneNumber' ? 'text-gray' : 'text-dark'
														}`}
														disabled={fieldName === 'email' || fieldName === 'phoneNumber' ? false : true}
													/>
													{phoneError && fieldName === 'phoneNumber' && <p className="mt-3">Enter a valid phone number</p>}
													{emailError && fieldName === 'email' && <p className="mt-3">Enter a valid email address</p>}
												</>
											)}
										</div>
									);
								})}
								<Button
									type="submit"
									data-cy={'continue-assessment'}
									className={'mx-auto mt-5 w-80 d-flex justify-content-center'}
									disabled={phoneError || emailError ? true : false}
								>
									{t('personalInformation.continueButtonText')}
								</Button>
							</Form>
						</>
					</Formik>
					{isLoading && <Spinner animation="border" className={'d-flex mx-auto mt-20'} />}
				</Col>
			)}
		</Container>
	);
};

interface FormField {
	fieldName: string;
	inputType: string;
	placeholderTextKey?: string;
}

interface Values {
	lastName: string;
	preferredName: string;
	age?: number;
	phoneNumber: string;
	genderIdentity: string;
	city: string;
	state: string;
	email: string;
}

interface Patient {
	picPatientId: string;
	pcp: string;
	displayName: string;
	familyName: string;
	gender: string;
	phone: string;
	email: string;
	age: number;
	city: string;
	state: string;
	specialist?: string;
	referredToPic: string;
	loggedIn: string[];
	goals?: string[];
}

interface Props {
	nextUrl: string;
	patient: FormattedPatientObject;
	assessmentId: string;
}
