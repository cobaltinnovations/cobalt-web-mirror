import moment from 'moment';
import React, { FC, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import * as yup from 'yup';
import { Formik } from 'formik';
import { createUseStyles } from 'react-jss';

import AsyncPage from '@/components/async-page';
import InputHelper from '@/components/input-helper';
import DatePicker from '@/components/date-picker';

import { groupSessionsService } from '@/lib/services';
import { GroupSessionRequestModel } from '@/lib/models';

import { getRequiredYupFields } from '@/lib/utils';
import useHandleError from '@/hooks/use-handle-error';
import { useCobaltTheme } from '@/jss/theme';
import HeroContainer from '@/components/hero-container';

enum NUMBER_OF_PEOPLE {
	LESS_THAN_FIVE = 'less than 5',
	FIVE_TO_TEN = '5-10',
	TEN_TO_FIFTEEN = '10-15',
	FIFTEEN_TO_TWENTYFIVE = '15-25',
	MORE_THAN_TWENTY_FIVE = 'more than 25',
}

const requestSessionSchema = yup
	.object()
	.required()
	.shape({
		name: yup.string().required().default(''),
		emailAddress: yup.string().email().required().default(''),
		phoneNumber: yup.string().default(''),
		dateInMind: yup.boolean().default(false),
		date: yup.string().when('dateInMind', {
			is: true,
			then: yup.string().required().default(''),
			otherwise: yup.string().default(''),
		}),
		time: yup.string().when('dateInMind', {
			is: true,
			then: yup.string().required().default(''),
			otherwise: yup.string().default(''),
		}),
		numberOfPeople: yup.string().required().default(''),
		additionalDetails: yup.string().default(''),
		customQuestionOne: yup.string().default(''),
		customQuestionTwo: yup.string().default(''),
	});

type RequestSessionFormData = yup.InferType<typeof requestSessionSchema>;
const requiredFields = getRequiredYupFields<RequestSessionFormData>(requestSessionSchema);

const useStyles = createUseStyles({
	imageOuter: {
		'& img': {
			width: '100%',
		},
	},
});

const InTheStudioGroupSessionByRequest: FC = () => {
	const handleError = useHandleError();
	const navigate = useNavigate();
	const classes = useStyles();
	const { fonts } = useCobaltTheme();
	const { groupSessionRequestId } = useParams<{ groupSessionRequestId?: string }>();
	const [session, setSession] = useState<GroupSessionRequestModel>();

	const fetchData = useCallback(async () => {
		if (!groupSessionRequestId) {
			throw new Error();
		}

		const { groupSessionRequest } = await groupSessionsService
			.getGroupSessionRequestById(groupSessionRequestId)
			.fetch();

		setSession(groupSessionRequest);
	}, [groupSessionRequestId]);

	async function handleFormSubmit(values: RequestSessionFormData) {
		if (!session || !groupSessionRequestId) {
			return;
		}

		try {
			await groupSessionsService
				.signUpForGroupSessionRequest({
					groupSessionRequestId: groupSessionRequestId,
					respondentName: values.name,
					respondentEmailAddress: values.emailAddress,
					respondentPhoneNumber: values.phoneNumber,
					suggestedDate: values.date,
					suggestedTime: values.time,
					expectedParticipants: values.numberOfPeople,
					notes: values.additionalDetails,
					customAnswer1: values.customQuestionOne,
					customAnswer2: values.customQuestionTwo,
				})
				.fetch();

			navigate('/thank-you', {
				state: {
					groupSessionName: session?.title,
				},
			});
		} catch (error) {
			handleError(error);
		}
	}

	return (
		<AsyncPage fetchData={fetchData}>
			<HeroContainer>
				<h2 className="mb-0 text-center">{session?.title}</h2>
			</HeroContainer>
			<Container className="pt-6 pb-6">
				<Row>
					<Col lg={{ span: 8, offset: 2 }}>
						<h1 className="mb-6 fs-h3">{session?.title}</h1>
					</Col>
				</Row>

				<Row>
					<Col lg={{ span: 8, offset: 2 }}>
						<div className={classes.imageOuter}>
							<img src={session?.imageUrl} alt="" />
						</div>
						<Card className="mb-5 border-0 p-6">
							<div dangerouslySetInnerHTML={{ __html: session?.description || '' }}></div>
							<p className="mb-0 text-danger">required*</p>
						</Card>
						<Formik<RequestSessionFormData>
							enableReinitialize
							validationSchema={requestSessionSchema}
							initialValues={requestSessionSchema.cast(undefined)}
							onSubmit={handleFormSubmit}
						>
							{(formikBag) => {
								const {
									values,
									setFieldValue,
									setFieldTouched,
									handleChange,
									handleBlur,
									handleSubmit,
									touched,
									errors,
								} = formikBag;

								return (
									<Form onSubmit={handleSubmit}>
										<Card className="mb-5 border-0 p-6">
											<InputHelper
												className="mb-5"
												label="Name"
												type="text"
												name="name"
												value={values.name}
												as="input"
												onBlur={handleBlur}
												onChange={handleChange}
												required={requiredFields.name}
												error={touched.name && errors.name ? errors.name : ''}
											/>

											<InputHelper
												className="mb-5"
												label="Email Address"
												type="email"
												name="emailAddress"
												value={values.emailAddress}
												as="input"
												onBlur={handleBlur}
												onChange={handleChange}
												required={requiredFields.emailAddress}
												error={
													touched.emailAddress && errors.emailAddress
														? errors.emailAddress
														: ''
												}
											/>

											<InputHelper
												className="mb-5"
												label="Phone Number"
												type="tel"
												name="phoneNumber"
												value={values.phoneNumber}
												as="input"
												onBlur={handleBlur}
												onChange={handleChange}
												required={requiredFields.phoneNumber}
												error={
													touched.phoneNumber && errors.phoneNumber ? errors.phoneNumber : ''
												}
											/>

											<Form.Group className="mb-5">
												<Form.Label className="mb-2" style={{ ...fonts.default }}>
													Do you have a specific date in mind for the session?
												</Form.Label>
												<Form.Check
													className="mb-0"
													type="radio"
													id="dateInMind-no"
													name="dateInMind"
													label="No"
													checked={!values.dateInMind}
													onChange={() => {
														setFieldTouched('dateInMind', true);
														setFieldValue('dateInMind', false);
													}}
												/>
												<Form.Check
													className="mb-0"
													type="radio"
													id="dateInMind-yes"
													name="dateInMind"
													label="Yes"
													checked={values.dateInMind}
													onChange={() => {
														setFieldTouched('dateInMind', true);
														setFieldValue('dateInMind', true);
													}}
												/>
											</Form.Group>

											{values.dateInMind && (
												<>
													<Form.Group controlId="date" className="mb-5">
														<Form.Label className="mb-1" style={{ ...fonts.default }}>
															Date
														</Form.Label>
														<DatePicker
															showYearDropdown
															showMonthDropdown
															dropdownMode="select"
															selected={
																values.date ? moment(values.date).toDate() : undefined
															}
															onChange={(date) => {
																setFieldTouched('date', true);
																setFieldValue(
																	'date',
																	date ? moment(date).format('YYYY-MM-DD') : ''
																);
															}}
														/>
													</Form.Group>

													<InputHelper
														className="mb-5"
														label="What time of day works best for your team?"
														type="time"
														name="time"
														value={values.time}
														as="input"
														onBlur={handleBlur}
														onChange={handleChange}
														required={requiredFields.time}
														error={touched.time && errors.time ? errors.time : ''}
													/>
												</>
											)}

											<Form.Group className="mb-5">
												<Form.Label className="mb-2" style={{ ...fonts.default }}>
													How many people do you think will participate
												</Form.Label>
												<Form.Check
													className="mb-0"
													type="radio"
													id="numberOfPeople-lessThanFive"
													name="numberOfPeople"
													label={NUMBER_OF_PEOPLE.LESS_THAN_FIVE}
													value={NUMBER_OF_PEOPLE.LESS_THAN_FIVE}
													checked={values.numberOfPeople === NUMBER_OF_PEOPLE.LESS_THAN_FIVE}
													onChange={handleChange}
												/>
												<Form.Check
													className="mb-0"
													type="radio"
													id="numberOfPeople-fiveToTen"
													name="numberOfPeople"
													label={NUMBER_OF_PEOPLE.FIVE_TO_TEN}
													value={NUMBER_OF_PEOPLE.FIVE_TO_TEN}
													checked={values.numberOfPeople === NUMBER_OF_PEOPLE.FIVE_TO_TEN}
													onChange={handleChange}
												/>
												<Form.Check
													className="mb-0"
													type="radio"
													id="numberOfPeople-tenToFifteen"
													name="numberOfPeople"
													label={NUMBER_OF_PEOPLE.TEN_TO_FIFTEEN}
													value={NUMBER_OF_PEOPLE.TEN_TO_FIFTEEN}
													checked={values.numberOfPeople === NUMBER_OF_PEOPLE.TEN_TO_FIFTEEN}
													onChange={handleChange}
												/>
												<Form.Check
													className="mb-0"
													type="radio"
													id="numberOfPeople-fifteenToTwentyFive"
													name="numberOfPeople"
													label={NUMBER_OF_PEOPLE.FIFTEEN_TO_TWENTYFIVE}
													value={NUMBER_OF_PEOPLE.FIFTEEN_TO_TWENTYFIVE}
													checked={
														values.numberOfPeople === NUMBER_OF_PEOPLE.FIFTEEN_TO_TWENTYFIVE
													}
													onChange={handleChange}
												/>
												<Form.Check
													className="mb-0"
													type="radio"
													id="numberOfPeople-moreThanTwentyFive"
													name="numberOfPeople"
													label={NUMBER_OF_PEOPLE.MORE_THAN_TWENTY_FIVE}
													value={NUMBER_OF_PEOPLE.MORE_THAN_TWENTY_FIVE}
													checked={
														values.numberOfPeople === NUMBER_OF_PEOPLE.MORE_THAN_TWENTY_FIVE
													}
													onChange={handleChange}
												/>
											</Form.Group>

											<InputHelper
												className={
													session?.customQuestion1 || session?.customQuestion2 ? 'mb-5' : ''
												}
												label="Is there anything you’d like the facilitator to know about your group in particular?"
												name="additionalDetails"
												value={values.additionalDetails}
												as="textarea"
												onBlur={handleBlur}
												onChange={handleChange}
												required={requiredFields.additionalDetails}
												error={
													touched.additionalDetails && errors.additionalDetails
														? errors.additionalDetails
														: ''
												}
											/>

											{session?.customQuestion1 && (
												<InputHelper
													className={session?.customQuestion2 ? 'mb-5' : ''}
													label={session?.customQuestion1}
													name="customQuestionOne"
													value={values.customQuestionOne}
													as="textarea"
													onBlur={handleBlur}
													onChange={handleChange}
													required={requiredFields.customQuestionOne}
													error={
														touched.customQuestionOne && errors.customQuestionOne
															? errors.customQuestionOne
															: ''
													}
												/>
											)}

											{session?.customQuestion2 && (
												<InputHelper
													label={session?.customQuestion2}
													name="customQuestionTwo"
													value={values.customQuestionTwo}
													as="textarea"
													onBlur={handleBlur}
													onChange={handleChange}
													required={requiredFields.customQuestionTwo}
													error={
														touched.customQuestionTwo && errors.customQuestionTwo
															? errors.customQuestionTwo
															: ''
													}
												/>
											)}
										</Card>
										<div className="text-center">
											<Button variant="primary" type="submit">
												Reserve a Place
											</Button>
										</div>
									</Form>
								);
							}}
						</Formik>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default InTheStudioGroupSessionByRequest;
