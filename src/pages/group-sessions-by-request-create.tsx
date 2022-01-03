import { v4 as uuidv4 } from 'uuid';
import React, { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import * as yup from 'yup';
import { Formik } from 'formik';

import useHeaderTitle from '@/hooks/use-header-title';

import Breadcrumb from '@/components/breadcrumb';
import InputHelper from '@/components/input-helper';
import SessionCropModal from '@/components/session-crop-modal';
import SessionFormSubmitBanner from '@/components/session-form-submit-banner';

import fonts from '@/jss/fonts';
import { imageUploader, groupSessionsService } from '@/lib/services';
import ImageUpload from '@/components/image-upload';
import useAlert from '@/hooks/use-alert';
import useAccount from '@/hooks/use-account';
import { ROLE_ID } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';
import { getRequiredYupFields } from '@/lib/utils';
import Wysiwyg from '@/components/admin-cms/wysiwyg';

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
	useHeaderTitle('Create Studio Session');

	const handleError = useHandleError();
	const { showAlert } = useAlert();
	const { account } = useAccount();

	const history = useHistory();
	const [sessionCropModalIsOpen, setSessionCropModalIsOpen] = useState(false);
	const [sessionCropModalImageSource, setSessionCropModalImageSource] = useState('');
	const [imagePreview, setImagePreview] = useState('');
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);

	async function handleFormSubmit(values: GroupSessionByRequestFormData) {
		try {
			await groupSessionsService
				.createGroupSessionRequest({
					facilitatorAccountId: values.responsible ? account?.accountId ?? null : null,
					facilitatorName: values.managersName,
					facilitatorEmailAddress: values.managersEmail,
					title: values.title,
					description: values.description,
					urlName: values.sessionHandle,
					imageUrl: values.imageUrl,
					customQuestion1: values.customQuestionOneDescription,
					customQuestion2: values.customQuestionTwoDescription,
				})
				.fetch();

			if (account?.roleId === ROLE_ID.ADMINISTRATOR || account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR) {
				showAlert({
					variant: 'success',
					text: 'Your studio session was added!',
				});

				history.push('/group-sessions/by-request');
			} else {
				history.push('/in-the-studio-thanks');
			}
		} catch (error) {
			handleError(error);
		}
	}

	return (
		<>
			{(account?.roleId === ROLE_ID.ADMINISTRATOR || account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR) && (
				<Breadcrumb
					breadcrumbs={[
						{
							to: '/group-sessions/by-request',
							title: 'studio sessions by request',
						},
						{
							to: '/group-sessions/by-request/create',
							title: 'create studio session',
						},
					]}
				/>
			)}

			<Container className="pt-5 pb-32">
				<Row className="mb-5">
					<Col lg={{ span: 8, offset: 2 }}>
						<h1 className="mb-2 font-size-xl">create studio session by request</h1>
						<p className="mb-0 text-danger">Required*</p>
					</Col>
				</Row>
				<Row>
					<Col lg={{ span: 8, offset: 2 }}>
						<Formik<GroupSessionByRequestFormData>
							enableReinitialize
							validationSchema={groupSessionByRequestSchema}
							initialValues={groupSessionByRequestSchema.cast(undefined)}
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

												<Form.Label className="mb-2" style={{ ...fonts.xs }}>
													Are you the facilitator of this session?
												</Form.Label>
												<Form.Check
													type="radio"
													bsPrefix="cobalt-modal-form__check"
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
													bsPrefix="cobalt-modal-form__check"
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

												<InputHelper
													className="mb-5"
													label="Description"
													name="description"
													value={values.description}
													as="textarea"
													onBlur={handleBlur}
													onChange={handleChange}
													helperText="How would you like to describe your session? (This will be featured on the Cobalt Platform, should be 2-3 sentences long, and should highlight the benefit for participants)."
													required={requiredFields.description}
													error={
														touched.description && errors.description
															? errors.description
															: ''
													}
												/>

												<Form.Label className="mb-1" style={{ ...fonts.xs }}>
													Description {requiredFields.description && <span>*</span>}
												</Form.Label>
												<p className="text-muted" style={{ ...fonts.xxs }}>
													How would you like to describe your session? (This will be featured
													on the Cobalt Platform, should be 2-3 sentences long, and should
													highlight the benefit for participants).
												</p>
												<Wysiwyg
													className={
														touched.description && errors.description ? 'mb-2' : 'mb-5'
													}
													readOnly={false}
													value={values.description}
													onChange={(value) => {
														setFieldValue('description', value);
													}}
												/>
												{touched.description && errors.description && (
													<p className="text-danger" style={{ ...fonts.xxs }}>
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
												<ul className="mb-0 pl-4 font-size-xs">
													<li>Name*</li>
													<li>Email Address*</li>
													<li>Phone Number</li>
													<li>Preferred session date(s)</li>
													<li>Preferred session time(s)</li>
													<li>Estimated Number of Attendees*</li>
													<li>
														Is there anything you’d like the facilitator to know about your
														group in particular?
													</li>
												</ul>
												<p className="mb-3">(*Required)</p>
												<p className="mb-5">
													If you’d like to add custom questions, please add them below.
												</p>

												<Form.Check
													type="checkbox"
													bsPrefix="cobalt-modal-form__check"
													id="customQuestionOne"
													name="customQuestionOne"
													label="Custom Question 1"
													checked={values.customQuestionOne}
													onChange={() => {
														setFieldTouched('customQuestionOne', true);
														setFieldValue('customQuestionOne', !values.customQuestionOne);
													}}
												/>
												{values.customQuestionOne && (
													<div className="mt-2 mb-3 pl-6">
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
													bsPrefix="cobalt-modal-form__check"
													id="customQuestionTwo"
													name="customQuestionTwo"
													label="Custom Question 2"
													checked={values.customQuestionTwo}
													onChange={() => {
														setFieldTouched('customQuestionTwo', true);
														setFieldValue('customQuestionTwo', !values.customQuestionTwo);
													}}
												/>
												{values.customQuestionTwo && (
													<div className="mt-2 pl-6">
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

											<SessionFormSubmitBanner title="add studio session by request" />
										</Form>
									</>
								);
							}}
						</Formik>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default GroupSessionsByRequestCreate;
