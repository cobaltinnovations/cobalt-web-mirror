import { v4 as uuidv4 } from 'uuid';
import React, { FC, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import * as yup from 'yup';
import { Field, FieldProps, Formik } from 'formik';
import { Helmet } from 'react-helmet';

import Breadcrumb from '@/components/breadcrumb';
import InputHelper from '@/components/input-helper';
import SessionCropModal from '@/components/session-crop-modal';
import SessionFormSubmitBanner from '@/components/session-form-submit-banner';

import { imageUploader, groupSessionsService, CreateGroupSessionRequestRequestBody } from '@/lib/services';
import ImageUpload from '@/components/image-upload';
import useAccount from '@/hooks/use-account';
import { ROLE_ID } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';
import { getRequiredYupFields } from '@/lib/utils';
import AsyncPage from '@/components/async-page';
import { useCobaltTheme } from '@/jss/theme';
import HeroContainer from '@/components/hero-container';
import useFlags from '@/hooks/use-flags';
import WysiwygBasic from '@/components/wysiwyg-basic';

const groupSessionByRequestSchema = yup
	.object()
	.required()
	.shape({
		responsible: yup.boolean().required().default(false),
		managersName: yup.string().required("Facilitator's Name is required").default(''),
		managersEmail: yup.string().email().required("Facilitator's Email is required").default(''),
		title: yup.string().required('Session Title is required').default(''),
		description: yup.string().required('Description is required').default(''),
		imageUrl: yup.string().default(''),
		sessionHandle: yup.string().required().default(''),
		customQuestionOne: yup.boolean().default(false),
		customQuestionOneDescription: yup.string().default(''),
		customQuestionTwo: yup.boolean().default(false),
		customQuestionTwoDescription: yup.string().default(''),
	});

type GroupSessionByRequestFormData = yup.InferType<typeof groupSessionByRequestSchema>;

const requiredFields = getRequiredYupFields<GroupSessionByRequestFormData>(groupSessionByRequestSchema);

const GroupSessionsByRequestCreate: FC = () => {
	const handleError = useHandleError();
	const { fonts } = useCobaltTheme();
	const { account } = useAccount();
	const { groupSessionId } = useParams<{ groupSessionId?: string }>();
	const { addFlag } = useFlags();

	const navigate = useNavigate();
	const [sessionCropModalIsOpen, setSessionCropModalIsOpen] = useState(false);
	const [sessionCropModalImageSource, setSessionCropModalImageSource] = useState('');
	const [imagePreview, setImagePreview] = useState('');
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);

	const [isEdit, setIsEdit] = useState(false);
	const [initialValues, setInitialValues] = useState<GroupSessionByRequestFormData>();
	const [isSaving, setIsSaving] = useState(false);

	const fetchData = useCallback(async () => {
		if (!groupSessionId) {
			// If there is no groupSessionId, that means this is a new session. Do not fetch any data.
			return;
		}

		const { groupSessionRequest } = await groupSessionsService.getGroupSessionRequestById(groupSessionId).fetch();

		setIsEdit(true);
		setInitialValues({
			responsible: groupSessionRequest.facilitatorEmailAddress === account?.emailAddress,
			managersName: groupSessionRequest.facilitatorName,
			managersEmail: groupSessionRequest.facilitatorEmailAddress,
			title: groupSessionRequest.title,
			description: groupSessionRequest.description,
			imageUrl: groupSessionRequest.imageUrl || '',
			sessionHandle: groupSessionRequest.urlName,
			customQuestionOne: !!groupSessionRequest.customQuestion1,
			customQuestionOneDescription: groupSessionRequest.customQuestion1 || '',
			customQuestionTwo: !!groupSessionRequest.customQuestion2,
			customQuestionTwoDescription: groupSessionRequest.customQuestion2 || '',
		} as GroupSessionByRequestFormData);
	}, [account, groupSessionId]);

	async function handleFormSubmit(values: GroupSessionByRequestFormData) {
		const submissionValues: CreateGroupSessionRequestRequestBody = {
			facilitatorAccountId: values.responsible ? account?.accountId ?? null : null,
			facilitatorName: values.managersName,
			facilitatorEmailAddress: values.managersEmail,
			title: values.title,
			description: values.description,
			urlName: values.sessionHandle,
			imageUrl: values.imageUrl,
			customQuestion1: values.customQuestionOneDescription,
			customQuestion2: values.customQuestionTwoDescription,
		};

		try {
			if (isUploading) {
				throw new Error('Upload is in progress.');
			}

			setIsSaving(true);

			if (isEdit) {
				if (!groupSessionId) {
					throw new Error('groupSessionId not found.');
				}

				const updateResponse = await groupSessionsService
					.updateGroupSessionRequest(groupSessionId, submissionValues)
					.fetch();

				addFlag({
					variant: 'success',
					title: 'Your group session was updated!',
					description: '',
					actions: [
						{
							title: 'View Session',
							onClick: () =>
								navigate(
									`/in-the-studio/group-sessions-by-request/${updateResponse.groupSession.groupSessionId}`
								),
						},
					],
				});
			} else {
				const createResoonse = await groupSessionsService.createGroupSessionRequest(submissionValues).fetch();

				addFlag({
					variant: 'success',
					title: 'Your group session was updated!',
					description: '',
					actions: [
						{
							title: 'View Session',
							onClick: () =>
								navigate(
									`/in-the-studio/group-sessions-by-request/${createResoonse.groupSession.groupSessionId}`
								),
						},
					],
				});
			}

			if (account?.roleId === ROLE_ID.ADMINISTRATOR) {
				navigate('/group-sessions/by-request');
			} else {
				navigate('/in-the-studio-thanks');
			}
		} catch (error) {
			handleError(error);
			setIsSaving(false);
		}
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | Group Sessions - Create Group Session</title>
			</Helmet>

			<AsyncPage fetchData={fetchData}>
				<HeroContainer>
					<h2 className="mb-0 text-center">
						{initialValues?.title ? initialValues?.title : 'Create Group Session'}
					</h2>
				</HeroContainer>

				{/* {account?.roleId === ROLE_ID.ADMINISTRATOR && (
					<Breadcrumb
						breadcrumbs={[
							{
								to: '/group-sessions/by-request',
								title: 'Group Sessions by Request',
							},
							{
								to: '/group-sessions/by-request/create',
								title: initialValues?.title ? initialValues.title : 'Create Group Session',
							},
						]}
					/>
				)} */}
				<Container className="pt-5 pb-32">
					<Row className="mb-5">
						<Col lg={{ span: 8, offset: 2 }}>
							<h1 className="mb-2 fs-h3">
								{initialValues?.title ? initialValues.title : 'Create Group Session by Request'}
							</h1>
							<p className="mb-0 text-danger">Required*</p>
						</Col>
					</Row>
					<Row>
						<Col lg={{ span: 8, offset: 2 }}>
							<Formik<GroupSessionByRequestFormData>
								enableReinitialize
								validationSchema={groupSessionByRequestSchema}
								initialValues={initialValues || groupSessionByRequestSchema.cast(undefined)}
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
										<>
											<SessionCropModal
												imageSource={sessionCropModalImageSource}
												show={sessionCropModalIsOpen}
												onHide={() => {
													setSessionCropModalIsOpen(false);
												}}
												onSave={async (blob) => {
													setSessionCropModalIsOpen(false);

													imageUploader(
														blob,
														groupSessionsService.getPresignedUploadUrl({
															contentType: blob.type,
															filename: `${uuidv4()}.jpg`,
														}).fetch
													)
														.onBeforeUpload((previewImageUrl) => {
															setImagePreview(previewImageUrl);
														})
														.onPresignedUploadObtained((accessUrl) => {
															setIsUploading(true);

															setFieldTouched('imageUrl', true);
															setFieldValue('imageUrl', accessUrl);
														})
														.onProgress((percentage) => {
															setProgress(percentage);
														})
														.onComplete((accessUrl) => {
															setIsUploading(false);
															setImagePreview(accessUrl);
														})
														.onError((error: any) => {
															handleError(error);

															setIsUploading(false);

															setImagePreview('');
															setFieldValue('imageUrl', undefined);
														})
														.start();
												}}
											/>

											<Form onSubmit={handleSubmit}>
												<Card className="mb-5 border-0 p-6">
													<h5 className="mb-5">Facilitator</h5>

													<Form.Label className="mb-2" style={{ ...fonts.default }}>
														Are you the facilitator of this session?
													</Form.Label>
													<Form.Check
														type="radio"
														id="responsible-yes"
														name="responsible"
														label="Yes"
														checked={values.responsible}
														onChange={() => {
															setFieldTouched('responsible', true);
															setFieldValue('responsible', true);
														}}
													/>
													<Form.Check
														className="mb-5"
														type="radio"
														id="responsible-no"
														name="responsible"
														label="No"
														checked={!values.responsible}
														onChange={() => {
															setFieldTouched('responsible', true);
															setFieldValue('responsible', false);
														}}
													/>

													<InputHelper
														className="mb-5"
														label="Facilitator Name"
														type="text"
														name="managersName"
														value={values.managersName}
														as="input"
														onBlur={handleBlur}
														onChange={handleChange}
														required={requiredFields.responsible}
														error={
															touched.managersName && errors.managersName
																? errors.managersName
																: ''
														}
													/>

													<InputHelper
														label="Facilitator Email"
														type="text"
														name="managersEmail"
														value={values.managersEmail}
														as="input"
														onBlur={handleBlur}
														onChange={handleChange}
														required={requiredFields.managersEmail}
														error={
															touched.managersEmail && errors.managersEmail
																? errors.managersEmail
																: ''
														}
													/>
												</Card>
												<Card className="mb-5 border-0 p-6">
													<h5 className="mb-5">Session Details</h5>

													<InputHelper
														className="mb-5"
														label="Session Title"
														type="text"
														name="title"
														value={values.title}
														as="input"
														onBlur={handleBlur}
														onChange={handleChange}
														required={requiredFields.title}
														error={touched.title && errors.title ? errors.title : ''}
													/>

													<Form.Label className="mb-1" style={{ ...fonts.default }}>
														Description {requiredFields.description && <span>*</span>}
													</Form.Label>
													<p className="text-muted" style={{ ...fonts.small }}>
														How would you like to describe your session? (This will be
														featured on the Cobalt Platform, should be 2-3 sentences long,
														and should highlight the benefit for participants).
													</p>
													<Field name="description">
														{({ meta }: FieldProps) => {
															return (
																<WysiwygBasic
																	className={
																		meta.touched && meta.error ? 'mb-2' : 'mb-5'
																	}
																	value={values.description}
																	onChange={(nextValue) => {
																		setFieldValue('description', nextValue);
																	}}
																/>
															);
														}}
													</Field>
													{touched.description && errors.description && (
														<p className="text-danger" style={{ ...fonts.small }}>
															description is a required field
														</p>
													)}

													<ImageUpload
														imagePreview={imagePreview}
														isUploading={isUploading}
														progress={progress}
														onChange={(file) => {
															const sourceUrl = URL.createObjectURL(file);

															setSessionCropModalImageSource(sourceUrl);
															setSessionCropModalIsOpen(true);
														}}
														onRemove={() => {
															setFieldValue('imageUrl', undefined);
															setImagePreview('');
														}}
													/>

													<InputHelper
														label="Session Handle"
														name="sessionHandle"
														value={values.sessionHandle}
														as="input"
														onBlur={handleBlur}
														onChange={handleChange}
														helperText='What would you like to use as the short "handle" for your class? This will be featured at the end of the Cobalt Platform URL. It should be 1-3 words connected by hyphens (ex. tolerating-uncertainty)'
														required={requiredFields.sessionHandle}
														error={
															touched.sessionHandle && errors.sessionHandle
																? errors.sessionHandle
																: ''
														}
													/>
												</Card>
												<Card className="mb-5 border-0 p-6">
													<h5 className="mb-5">Session Form Customization</h5>
													<p className="mb-0">Our standard form asks for:</p>
													<ul className="mb-0 ps-4 fs-default">
														<li>Name*</li>
														<li>Email Address*</li>
														<li>Phone Number</li>
														<li>Preferred session date(s)</li>
														<li>Preferred session time(s)</li>
														<li>Estimated Number of Attendees*</li>
														<li>
															Is there anything you’d like the facilitator to know about
															your group in particular?
														</li>
													</ul>
													<p className="mb-3">(*Required)</p>
													<p className="mb-5">
														If you’d like to add custom questions, please add them below.
													</p>

													<Form.Check
														type="checkbox"
														id="customQuestionOne"
														name="customQuestionOne"
														label="Custom Question 1"
														checked={values.customQuestionOne}
														onChange={() => {
															setFieldTouched('customQuestionOne', true);
															setFieldValue(
																'customQuestionOne',
																!values.customQuestionOne
															);
														}}
													/>
													{values.customQuestionOne && (
														<div className="mt-2 mb-3 ps-6">
															<InputHelper
																label="Enter Question"
																name="customQuestionOneDescription"
																value={values.customQuestionOneDescription}
																as="textarea"
																onBlur={handleBlur}
																onChange={handleChange}
															/>
														</div>
													)}

													<Form.Check
														type="checkbox"
														id="customQuestionTwo"
														name="customQuestionTwo"
														label="Custom Question 2"
														checked={values.customQuestionTwo}
														onChange={() => {
															setFieldTouched('customQuestionTwo', true);
															setFieldValue(
																'customQuestionTwo',
																!values.customQuestionTwo
															);
														}}
													/>
													{values.customQuestionTwo && (
														<div className="mt-2 ps-6">
															<InputHelper
																label="Enter Question"
																name="customQuestionTwoDescription"
																value={values.customQuestionTwoDescription}
																as="textarea"
																onBlur={handleBlur}
																onChange={handleChange}
															/>
														</div>
													)}
												</Card>

												<SessionFormSubmitBanner
													title={
														isEdit
															? 'Update group session by request'
															: 'Add group session by request'
													}
													disabled={isSaving}
												/>
											</Form>
										</>
									);
								}}
							</Formik>
						</Col>
					</Row>
				</Container>
			</AsyncPage>
		</>
	);
};

export default GroupSessionsByRequestCreate;
