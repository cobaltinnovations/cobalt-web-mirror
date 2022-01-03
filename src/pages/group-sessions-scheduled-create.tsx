import { isNumber } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import React, { FC, useState, useCallback } from 'react';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import * as yup from 'yup';
import { Formik } from 'formik';
import CopyToClipboard from 'react-copy-to-clipboard';
import useHeaderTitle from '@/hooks/use-header-title';
import useQuery from '@/hooks/use-query';

import { ReactComponent as ContentCopyIcon } from '@/assets/icons/icon-content-copy.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/trash.svg';
import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';
import SessionAttendeeList from '@/components/session-attendee-list';
import SessionCancelModal from '@/components/session-cancel-modal';
import SessionCropModal from '@/components/session-crop-modal';
import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import SessionFormSubmitBanner from '@/components/session-form-submit-banner';

import {
	CreateGroupSessionRequestBody,
	GroupSessionSchedulingSystemId,
	groupSessionsService,
	imageUploader,
} from '@/lib/services';
import { GroupSessionModel, GroupSessionReservationModel, ROLE_ID, ScreeningQuestionV2 } from '@/lib/models';

import fonts from '@/jss/fonts';

import { getRequiredYupFields } from '@/lib/utils';
import ImageUpload from '@/components/image-upload';
import SessionRemoveImageModal from '@/components/session-remove-image-modal';
import useAlert from '@/hooks/use-alert';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { cloneDeep } from 'lodash';
import { createUseStyles } from 'react-jss';
import Wysiwyg from '@/components/admin-cms/wysiwyg';

const useStyles = createUseStyles({
	removeButton: {
		top: 0,
		right: 0,
		zIndex: 1,
		position: 'absolute',
		padding: '8px !important',
		transform: 'translate(40%, -40%)',
	},
});

const timeSlots: string[] = [];
const totalSlotsInDay = moment.duration(1, 'day').as('minutes');
const timeSlot = moment('00:00', 'hh:mm');

for (let i = 0; i < totalSlotsInDay; i += 15) {
	timeSlot.add(i === 0 ? 0 : 15, 'minutes');
	timeSlots.push(timeSlot.format('hh:mm A'));
}

const groupSessionSchema = yup
	.object()
	.required()
	.shape({
		isCobaltScheduling: yup.boolean().required().default(true),
		date: yup.string().default(moment().format('YYYY-MM-DD')),
		startTime: yup.string().required().default(''),
		endTime: yup.string().required().default(''),
		schedulingUrl: yup
			.string()
			.default('')
			.when('isCobaltScheduling', { is: false, then: (s) => s.required() }),
		isModerator: yup.boolean().required().default(false),
		facilitatorsName: yup.string().required().default(''),
		facilitatorsEmail: yup.string().email().required().default(''),
		title: yup.string().required().default(''),
		description: yup.string().required().default(''),
		imageUrl: yup.string().default(''),
		meetingUrl: yup
			.string()
			.default('')
			.when('isCobaltScheduling', { is: true, then: (s) => s.required() }),
		capacity: yup
			.number()
			.default(undefined)
			.when('isCobaltScheduling', { is: true, then: (s) => s.required() }),
		slug: yup.string().required().default(''),
		isRestricted: yup.boolean().required().default(false),
		screeningQuestions: yup
			.array()
			.default([
				{
					questionId: uuidv4(),
					fontSizeId: 'DEFAULT',
					question: '',
				},
			])
			.of(
				yup.object().shape({
					questionId: yup.string().default(''),
					fontSizeId: yup.string().default(''),
					question: yup.string().default(''),
				})
			)
			.when('isRestricted', {
				is: true,
				then: (a) =>
					a.test(
						'non-falsy-values',
						'Screening question is a required field.',
						(arr) => !!arr?.length && arr.every((sq) => sq.question)
					),
			}),
		confirmationEmailTemplate: yup.string().default(''),
		followUpEmail: yup.boolean().required().default(false),
		followUpEmailTemplate: yup
			.string()
			.default('')
			.when('followUpEmail', { is: true, then: (s) => s.required('Follow-up email template is required.') }),
		followUpEmailSurveyUrl: yup
			.string()
			.default('')
			.when('followUpEmail', { is: true, then: (s) => s.required('Survey URL is required.') }),
	});

export type GroupSessionFormData = yup.InferType<typeof groupSessionSchema>;
const requiredFields = getRequiredYupFields<GroupSessionFormData>(groupSessionSchema);

const GroupSessionsCreate: FC = () => {
	const history = useHistory();
	const { account } = useAccount();
	const handleError = useHandleError();
	const classes = useStyles();
	const isViewMode = !!useRouteMatch({
		path: '/group-sessions/scheduled/:groupSessionId/view',
		exact: true,
	});

	const { showAlert } = useAlert();
	const { groupSessionId } = useParams<{ groupSessionId?: string }>();
	const query = useQuery();
	const groupSessionIdToCopy = query.get('groupSessionIdToCopy');

	const [showSessionCancelModal, setShowSessionCancelModal] = useState(false);
	const [sessionCropModalIsOpen, setSessionCropModalIsOpen] = useState(false);
	const [showRemoveImageModal, setShowRemoveImageModal] = useState(false);

	const [session, setSession] = useState<GroupSessionModel>();
	const [reservations, setReservations] = useState<GroupSessionReservationModel[]>([]);
	const [initialValues, setInitialValues] = useState<GroupSessionFormData>();

	const [isEdit, setIsEdit] = useState(false);
	const [hasReservations, setHasReservations] = useState(false);
	const [isCopy, setIsCopy] = useState(false);

	const [sessionCropModalImageSource, setSessionCropModalImageSource] = useState('');
	const [imagePreview, setImagePreview] = useState(initialValues ? initialValues.imageUrl : '');
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);

	useHeaderTitle(`${initialValues?.title ? initialValues.title : 'Create Studio Session'}${isCopy ? ' (copy)' : ''}`);

	const accountId = account?.accountId;
	const fetchData = useCallback(async () => {
		if (!accountId || (!groupSessionId && !groupSessionIdToCopy)) {
			// If there is no groupSessionId and no groupSessionIdToCopy,
			// that means this is a new session. Do not fetch any data.
			return;
		}

		let isCopy = false;
		let groupSessionToSet: GroupSessionModel | undefined;

		// We are editing
		if (groupSessionId) {
			const [{ groupSession }, { groupSessionReservations }] = await Promise.all([
				groupSessionsService.getGroupSessionById(groupSessionId).fetch(),
				groupSessionsService.getGroupSessionReservationsById(groupSessionId).fetch(),
			]);

			groupSessionToSet = groupSession;
			setHasReservations(groupSessionReservations.length > 0);
			setIsEdit(true);
			setReservations(groupSessionReservations);
		}

		// We are copying
		if (groupSessionIdToCopy) {
			const { groupSession } = await groupSessionsService.getGroupSessionById(groupSessionIdToCopy).fetch();

			isCopy = true;
			groupSessionToSet = groupSession;
			setIsCopy(true);
		}

		let screeningQuestionsToSet: ScreeningQuestionV2[] = [];
		if (!!groupSessionToSet?.screeningQuestionsV2.length) {
			screeningQuestionsToSet = groupSessionToSet.screeningQuestionsV2;
		} else if (!!groupSessionToSet?.screeningQuestions.length) {
			screeningQuestionsToSet = groupSessionToSet.screeningQuestions.map((question) => {
				return {
					questionId: uuidv4(),
					fontSizeId: 'DEFAULT',
					question,
				};
			});
		}

		if (groupSessionToSet) {
			let capacity = undefined;
			if (isNumber(groupSessionToSet.seatsAvailable) || isNumber(groupSessionToSet.seatsReserved)) {
				capacity = (groupSessionToSet.seatsAvailable || 0) + (groupSessionToSet.seatsReserved || 0);
			}

			setSession(groupSessionToSet);
			setImagePreview(groupSessionToSet.imageUrl);
			setInitialValues({
				isCobaltScheduling:
					groupSessionToSet.groupSessionSchedulingSystemId === GroupSessionSchedulingSystemId.COBALT
						? true
						: false,
				date: isCopy ? '' : moment(groupSessionToSet.startDateTime).format('YYYY-MM-DD'),
				startTime: isCopy ? '' : moment(groupSessionToSet.startDateTime).format('hh:mm A'),
				endTime: isCopy ? '' : moment(groupSessionToSet.endDateTime).format('hh:mm A'),
				schedulingUrl: groupSessionToSet.scheduleUrl,
				isModerator: groupSessionToSet.facilitatorAccountId === accountId,
				facilitatorsName: groupSessionToSet.facilitatorName,
				facilitatorsEmail: groupSessionToSet.facilitatorEmailAddress,
				title: groupSessionToSet.title,
				description: groupSessionToSet.description,
				imageUrl: groupSessionToSet.imageUrl,
				meetingUrl: groupSessionToSet.videoconferenceUrl,
				capacity,
				slug: groupSessionToSet.urlName,
				isRestricted: !!groupSessionToSet.screeningQuestions.length ? true : false,
				screeningQuestions: screeningQuestionsToSet,
				confirmationEmailTemplate: groupSessionToSet.confirmationEmailContent,
				followUpEmail: groupSessionToSet.sendFollowupEmail,
				...(groupSessionToSet.followupEmailContent
					? { followUpEmailTemplate: groupSessionToSet.followupEmailContent }
					: {}),
				...(groupSessionToSet.followupEmailSurveyUrl
					? { followUpEmailSurveyUrl: groupSessionToSet.followupEmailSurveyUrl }
					: {}),
			} as GroupSessionFormData);
		}
	}, [accountId, groupSessionId, groupSessionIdToCopy]);

	function handleCancelSessionButtonClick() {
		setShowSessionCancelModal(true);
	}

	function handleCancelSessionModalHide() {
		setShowSessionCancelModal(false);
	}

	async function handleCancelSessionModalCancel() {
		if (!session) {
			return;
		}

		await groupSessionsService.updateGroupSessionStatusById(session.groupSessionId, 'CANCELED').fetch();

		window.alert('Studio session has been canceled.');
		setShowSessionCancelModal(false);
		history.push('/group-sessions/scheduled');
	}

	async function handleSubmit(values: GroupSessionFormData) {
		try {
			const startDateTime = moment(`${values.date} ${values.startTime}`, 'YYYY-MM-DD HH:mm A').format(
				'YYYY-MM-DD[T]HH:mm'
			);
			const endDateTime = moment(`${values.date} ${values.endTime}`, 'YYYY-MM-DD HH:mm A').format(
				'YYYY-MM-DD[T]HH:mm'
			);

			const submissionValues: CreateGroupSessionRequestBody = {
				facilitatorAccountId: values.isModerator ? account?.accountId ?? null : null,
				facilitatorName: values.facilitatorsName,
				facilitatorEmailAddress: values.facilitatorsEmail,
				title: values.title,
				description: values.description,
				urlName: values.slug,
				startDateTime,
				endDateTime,
				imageUrl: values.imageUrl,
				screeningQuestionsV2: values.isRestricted ? values.screeningQuestions : [],
				confirmationEmailContent: values.confirmationEmailTemplate,
				sendFollowupEmail: values.followUpEmail,
				...(values.followUpEmailTemplate ? { followupEmailContent: values.followUpEmailTemplate } : {}),
				...(values.followUpEmailSurveyUrl ? { followupEmailSurveyUrl: values.followUpEmailSurveyUrl } : {}),
			};

			if (values.isCobaltScheduling) {
				submissionValues.seats = values.capacity;
				submissionValues.videoconferenceUrl = values.meetingUrl;
				submissionValues.scheduleUrl = null;
				submissionValues.groupSessionSchedulingSystemId = GroupSessionSchedulingSystemId.COBALT;
			} else {
				submissionValues.seats = null;
				submissionValues.videoconferenceUrl = null;
				submissionValues.scheduleUrl = values.schedulingUrl;
				submissionValues.groupSessionSchedulingSystemId = GroupSessionSchedulingSystemId.EXTERNAL;
			}

			if (isEdit) {
				if (session) {
					await groupSessionsService.updateGroupsession(session.groupSessionId, submissionValues).fetch();
					showAlert({
						variant: 'success',
						text: 'Session updated.',
					});
				}
			} else {
				await groupSessionsService.createGroupSession(submissionValues).fetch();
				showAlert({
					variant: 'success',
					text: 'Your studio session was added!',
				});
			}

			if (account?.roleId === ROLE_ID.ADMINISTRATOR || account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR) {
				history.push('/group-sessions/scheduled');
			} else {
				history.push('/in-the-studio-thanks');
			}
		} catch (error) {
			handleError(error);
		}
	}

	return (
		<AsyncPage fetchData={fetchData}>
			<SessionCancelModal
				show={showSessionCancelModal}
				onCancel={handleCancelSessionModalCancel}
				onHide={handleCancelSessionModalHide}
			/>

			{(account?.roleId === ROLE_ID.ADMINISTRATOR || account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR) && (
				<Breadcrumb
					breadcrumbs={[
						{
							to: '/group-sessions/scheduled',
							title: 'studio sessions',
						},
						{
							to: '/group-sessions/scheduled/create',
							title: `${initialValues?.title || 'create studio session'}${isCopy ? ' (copy)' : ''}`,
						},
					]}
				/>
			)}

			<Container className="pt-5 pb-32">
				<Row className="mb-5">
					<Col lg={isEdit ? 12 : { span: 8, offset: 2 }}>
						<div className="d-flex align-items-center">
							<div>
								<h1 className="mb-2 font-size-xl">
									{initialValues?.title || 'create studio session'}
									{isCopy ? ' (copy)' : ''}
								</h1>
								<p className="mb-0 text-danger">Required*</p>
							</div>
							{!isViewMode && groupSessionId && (
								<>
									<Button
										className="ml-auto mr-2"
										size="sm"
										variant="danger"
										onClick={handleCancelSessionButtonClick}
									>
										cancel session
									</Button>

									<CopyToClipboard
										onCopy={() => {
											showAlert({
												variant: 'success',
												text: 'the link was copied to your clipboard',
											});
										}}
										text={`https://${window.location.host}/in-the-studio/group-session-scheduled/${groupSessionId}?immediateAccess=true`}
									>
										<Button size="sm" className="p-2">
											<ContentCopyIcon height={24} width={24} />
										</Button>
									</CopyToClipboard>
								</>
							)}
						</div>
					</Col>
				</Row>

				<Row>
					<Col lg={isEdit ? 8 : { span: 8, offset: 2 }}>
						<Formik<GroupSessionFormData>
							enableReinitialize
							validationSchema={groupSessionSchema}
							initialValues={initialValues || groupSessionSchema.cast(undefined)}
							onSubmit={handleSubmit}
						>
							{(formikBag) => {
								const {
									values,
									setFieldValue,
									setFieldTouched,
									handleChange,
									handleBlur,
									touched,
									errors,
									handleSubmit,
								} = formikBag;
								const selectedStartTimeSlotIdx = timeSlots.findIndex(
									(time) => time === values.startTime
								);

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

										<SessionRemoveImageModal
											imageSource={imagePreview || ''}
											show={showRemoveImageModal}
											onHide={() => {
												setShowRemoveImageModal(false);
											}}
											onRemove={() => {
												setShowRemoveImageModal(false);

												setImagePreview('');
												setFieldValue('imageUrl', undefined);
											}}
										/>

										<Form onSubmit={handleSubmit}>
											<Card className="mb-5 border-0 p-6">
												<h5 className="mb-5">Scheduling</h5>

												<Form.Group className="mb-5">
													<Form.Label className="mb-1" style={{ ...fonts.xs }}>
														Would you like to use Cobalt's scheduling system?
													</Form.Label>
													<Form.Check
														disabled={isViewMode}
														type="radio"
														bsPrefix="cobalt-modal-form__check"
														id="isCobaltScheduling-Yes"
														name="isCobaltScheduling"
														label="Yes"
														checked={values.isCobaltScheduling}
														onChange={() => {
															setFieldTouched('isCobaltScheduling', true);
															setFieldValue('isCobaltScheduling', true);
														}}
													/>
													<Form.Check
														disabled={isViewMode}
														type="radio"
														bsPrefix="cobalt-modal-form__check"
														id="isCobaltScheduling-No"
														name="isCobaltScheduling"
														label="No"
														checked={!values.isCobaltScheduling}
														onChange={() => {
															setFieldTouched('isCobaltScheduling', true);
															setFieldValue('isCobaltScheduling', false);
														}}
													/>
												</Form.Group>

												<Form.Group controlId="date">
													<Form.Label className="mb-1" style={{ ...fonts.xs }}>
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
														disabled={hasReservations || isViewMode}
													/>
												</Form.Group>

												<Form.Row>
													<Col>
														<InputHelper
															label="Start Time"
															value={values.startTime || ''}
															as="select"
															onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
																setFieldTouched('startTime', true);
																setFieldValue('startTime', event.target.value);
															}}
															required={requiredFields.startTime}
															error={
																touched.startTime && errors.startTime
																	? errors.startTime
																	: ''
															}
															disabled={hasReservations || isViewMode}
														>
															<option value="" disabled>
																Select...
															</option>
															{timeSlots.map((time) => (
																<option key={time} value={time}>
																	{time}
																</option>
															))}
														</InputHelper>
													</Col>

													<Col>
														<InputHelper
															label="End Time"
															value={values.endTime || ''}
															as="select"
															onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
																setFieldTouched('endTime', true);
																setFieldValue('endTime', event.target.value);
															}}
															required={requiredFields.endTime}
															error={
																touched.endTime && errors.endTime ? errors.endTime : ''
															}
															disabled={hasReservations || isViewMode}
														>
															<option value="" disabled>
																Select...
															</option>
															{timeSlots.map((time, idx) => {
																if (idx <= selectedStartTimeSlotIdx) {
																	return null;
																}

																return (
																	<option key={time} value={time}>
																		{time}
																	</option>
																);
															})}
														</InputHelper>
													</Col>
												</Form.Row>

												{!values.isCobaltScheduling && (
													<InputHelper
														className="my-5"
														label="Scheduling URL"
														type="text"
														name="schedulingUrl"
														value={values.schedulingUrl}
														as="input"
														onBlur={handleBlur}
														onChange={handleChange}
														required={!values.isCobaltScheduling}
														error={
															touched.schedulingUrl && errors.schedulingUrl
																? errors.schedulingUrl
																: ''
														}
														disabled={isViewMode}
													/>
												)}
											</Card>

											<Card className="mb-5 border-0 p-6">
												<h5 className="mb-5">Facilitator</h5>

												<Form.Group className="mb-5">
													<Form.Label className="mb-1" style={{ ...fonts.xs }}>
														Are you the facilitator of this session?
													</Form.Label>
													<Form.Check
														disabled={isViewMode}
														type="radio"
														bsPrefix="cobalt-modal-form__check"
														id="isModerator-Yes"
														name="isModerator"
														label="Yes"
														checked={values.isModerator}
														onChange={() => {
															setFieldTouched('isModerator', true);
															setFieldValue('isModerator', true);
														}}
													/>
													<Form.Check
														disabled={isViewMode}
														type="radio"
														bsPrefix="cobalt-modal-form__check"
														id="isModerator-No"
														name="isModerator"
														label="No"
														checked={!values.isModerator}
														onChange={() => {
															setFieldTouched('isModerator', true);
															setFieldValue('isModerator', false);
														}}
													/>
												</Form.Group>

												<InputHelper
													className="mb-5"
													label="Facilitator's Name"
													type="text"
													name="facilitatorsName"
													value={values.facilitatorsName}
													as="input"
													onBlur={handleBlur}
													onChange={handleChange}
													required={requiredFields.facilitatorsName}
													error={
														touched.facilitatorsName && errors.facilitatorsName
															? errors.facilitatorsName
															: ''
													}
													disabled={isViewMode}
												/>

												<InputHelper
													label="Facilitator's Email"
													type="email"
													name="facilitatorsEmail"
													value={values.facilitatorsEmail}
													as="input"
													onBlur={handleBlur}
													onChange={handleChange}
													required={requiredFields.facilitatorsEmail}
													error={
														touched.facilitatorsEmail && errors.facilitatorsEmail
															? errors.facilitatorsEmail
															: ''
													}
													disabled={isViewMode}
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
													disabled={hasReservations || isViewMode}
												/>

												<Form.Label className="mb-1" style={{ ...fonts.xs }}>
													Description {requiredFields.description && <span>*</span>}
												</Form.Label>
												<p className="text-muted" style={{ ...fonts.xxs }}>
													How would you like to describe your session? (This will be featured
													on the Colbalt Platform, should be 2-3 sentences long, and should
													highlight the benefit for participants).
												</p>
												<Wysiwyg
													className={
														touched.description && errors.description ? 'mb-2' : 'mb-5'
													}
													readOnly={isViewMode}
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
													disabled={isViewMode}
													onChange={(file) => {
														const sourceUrl = URL.createObjectURL(file);

														setSessionCropModalImageSource(sourceUrl);
														setSessionCropModalIsOpen(true);
													}}
													onRemove={() => {
														setShowRemoveImageModal(true);
													}}
												/>

												{values.isCobaltScheduling && (
													<>
														<InputHelper
															className="mb-5"
															label="What is the BlueJeans/Zoom/etc. URL for this session?"
															type="text"
															name="meetingUrl"
															value={values.meetingUrl}
															as="input"
															onBlur={handleBlur}
															onChange={handleChange}
															required
															disabled={isViewMode}
															error={
																touched.meetingUrl && errors.meetingUrl
																	? errors.meetingUrl
																	: ''
															}
														/>

														<InputHelper
															className="mb-5"
															label="What is the capacity limit of your class? (ex: 15 people, 25 people)"
															type="number"
															name="capacity"
															value={'' + values.capacity}
															as="input"
															onBlur={handleBlur}
															onChange={handleChange}
															required={requiredFields.capacity}
															error={
																touched.capacity && errors.capacity
																	? errors.capacity
																	: ''
															}
															disabled={isViewMode}
														/>
													</>
												)}

												<InputHelper
													label="Session Handle"
													type="text"
													name="slug"
													value={values.slug}
													as="input"
													onBlur={handleBlur}
													onChange={handleChange}
													helperText='What would you like to use as the short "handle" for your class? This will be featured at the end of the Cobalt Platform URL. It should be 1-3 words connected by hyphens (ex. tolerating-uncertainty)'
													required={requiredFields.slug}
													error={touched.slug && errors.slug ? errors.slug : ''}
													disabled={hasReservations || isViewMode}
												/>
											</Card>

											<Card className="mb-5 border-0 p-6">
												<h5 className="mb-5">Attendee Information</h5>

												<Form.Group>
													<Form.Label className="mb-1" style={{ ...fonts.xs }}>
														Is this session restricted to certain audiences?
													</Form.Label>
													<Form.Check
														type="radio"
														bsPrefix="cobalt-modal-form__check"
														id="is-restricted-no"
														name="isRestricted"
														label="No"
														checked={!values.isRestricted}
														onBlur={handleBlur}
														onChange={() => {
															setFieldValue('isRestricted', false);
														}}
														disabled={hasReservations || isViewMode}
													/>
													<Form.Check
														type="radio"
														bsPrefix="cobalt-modal-form__check"
														id="is-restricted-yes"
														name="isRestricted"
														label="Yes"
														checked={values.isRestricted}
														onBlur={handleBlur}
														onChange={() => {
															setFieldValue('isRestricted', true);
														}}
														disabled={hasReservations || isViewMode}
													/>
												</Form.Group>

												{values.screeningQuestions &&
													values.screeningQuestions.map((screeningQuestion, index) => {
														const touchedScreenQuestions =
															((touched.screeningQuestions as unknown) as []) || [];
														const sqTouched = !!touchedScreenQuestions.length
															? touchedScreenQuestions[index]
															: false;

														return (
															<div
																key={screeningQuestion.questionId}
																className="position-relative"
															>
																{index !== 0 && (
																	<Button
																		size="sm"
																		className={classes.removeButton}
																		variant="danger"
																		onClick={() => {
																			const screeningQuestionsClone = cloneDeep(
																				values.screeningQuestions || []
																			);
																			screeningQuestionsClone.splice(index, 1);

																			setFieldTouched('screeningQuestions', true);
																			setFieldValue(
																				'screeningQuestions',
																				screeningQuestionsClone
																			);
																		}}
																	>
																		<CloseIcon height={24} width={24} />
																	</Button>
																)}
																<InputHelper
																	className="mb-3"
																	label={`Screening Question #${index + 1}`}
																	name="screeningQuestion"
																	value={screeningQuestion.question}
																	as="textarea"
																	onBlur={handleBlur}
																	onChange={(event) => {
																		const screeningQuestionsClone = cloneDeep(
																			values.screeningQuestions || []
																		);
																		screeningQuestionsClone[index].question =
																			event.currentTarget.value;

																		setFieldTouched('screeningQuestions', true);
																		setFieldValue(
																			'screeningQuestions',
																			screeningQuestionsClone
																		);
																	}}
																	helperText="An attendee must first answer “Yes” to this question before being allowed to reserve a seat."
																	required={requiredFields.screeningQuestions}
																	error={
																		sqTouched &&
																		!screeningQuestion &&
																		errors.screeningQuestions
																			? errors.screeningQuestions
																			: ''
																	}
																	disabled={hasReservations || isViewMode}
																/>
																<div className="mb-5">
																	<Form.Check
																		disabled={isViewMode}
																		type="switch"
																		id={`screening-question-toggle--${screeningQuestion.questionId}`}
																		label="Reduce text size"
																		value="SMALL"
																		checked={
																			screeningQuestion.fontSizeId === 'SMALL'
																		}
																		onChange={(event) => {
																			const screeningQuestionsClone = cloneDeep(
																				values.screeningQuestions || []
																			);

																			if (event.currentTarget.checked) {
																				screeningQuestionsClone[
																					index
																				].fontSizeId = 'SMALL';
																			} else {
																				screeningQuestionsClone[
																					index
																				].fontSizeId = 'DEFAULT';
																			}

																			setFieldValue(
																				'screeningQuestions',
																				screeningQuestionsClone
																			);
																		}}
																	/>
																</div>
															</div>
														);
													})}

												<div className="text-right">
													<Button
														disabled={isViewMode}
														size="sm"
														onClick={() => {
															const screeningQuestionsClone = cloneDeep(
																values.screeningQuestions || []
															);
															// eslint-disable-next-line @typescript-eslint/ban-ts-comment
															// @ts-ignore
															screeningQuestionsClone.push({
																questionId: uuidv4(),
																fontSizeId: 'DEFAULT',
																question: '',
															});

															setFieldTouched('screeningQuestions', true);
															setFieldValue(
																'screeningQuestions',
																screeningQuestionsClone
															);
														}}
													>
														add question
													</Button>
												</div>
											</Card>

											{values.isCobaltScheduling && (
												<Card className="mb-5 border-0 p-6">
													<h5 className="mb-5">Confirmation Email</h5>

													<InputHelper
														disabled={isViewMode}
														label="Email Copy"
														name="confirmationEmailTemplate"
														value={values.confirmationEmailTemplate}
														as="textarea"
														onBlur={handleBlur}
														onChange={handleChange}
														helperText="This email will be sent to attendees after they reserve a seat for the session."
														required={requiredFields.confirmationEmailTemplate}
														error={
															touched.confirmationEmailTemplate &&
															errors.confirmationEmailTemplate
																? errors.confirmationEmailTemplate
																: ''
														}
													/>
												</Card>
											)}

											<Card className="mb-5 border-0 p-6">
												<h5 className="mb-5">Follow-Up Email</h5>

												<Form.Group>
													<Form.Label className="mb-1" style={{ ...fonts.xs }}>
														Do you want to include a follow-up email?{' '}
														<span className="text-danger">*</span>
													</Form.Label>
													<p className="mb-2 ml-0 mr-auto text-muted font-size-xxs">
														This email will be sent to attendees immediately after the
														session.
													</p>
													<Form.Check
														type="radio"
														bsPrefix="cobalt-modal-form__check"
														id="follow-up-email-no"
														name="followUpEmail"
														label="No"
														checked={!values.followUpEmail}
														onBlur={handleBlur}
														onChange={() => {
															setFieldValue('followUpEmail', false);
														}}
														disabled={hasReservations || isViewMode}
													/>
													<Form.Check
														type="radio"
														bsPrefix="cobalt-modal-form__check"
														id="follow-up-email-yes"
														name="followUpEmail"
														label="Yes"
														checked={values.followUpEmail}
														onBlur={handleBlur}
														onChange={() => {
															setFieldValue('followUpEmail', true);
														}}
														disabled={hasReservations || isViewMode}
													/>
												</Form.Group>
												<InputHelper
													disabled={isViewMode}
													className="mb-5"
													label="Email Text"
													name="followUpEmailTemplate"
													value={values.followUpEmailTemplate}
													as="textarea"
													onBlur={handleBlur}
													onChange={handleChange}
													required={requiredFields.followUpEmailTemplate}
													error={
														touched.followUpEmailTemplate && errors.followUpEmailTemplate
															? errors.followUpEmailTemplate
															: ''
													}
												/>
												<InputHelper
													label="Survey URL"
													type="text"
													name="followUpEmailSurveyUrl"
													value={values.followUpEmailSurveyUrl}
													as="input"
													onBlur={handleBlur}
													onChange={handleChange}
													required={requiredFields.followUpEmailSurveyUrl}
													error={
														touched.followUpEmailSurveyUrl && errors.followUpEmailSurveyUrl
															? errors.followUpEmailSurveyUrl
															: ''
													}
													disabled={isViewMode}
												/>
											</Card>

											<SessionFormSubmitBanner
												disabled={isViewMode}
												title={isEdit ? 'update studio session' : 'add studio session'}
											>
												{!isViewMode && isEdit && (
													<p className="mb-0 mt-2">
														An email with updates will be sent to all attendees
													</p>
												)}
											</SessionFormSubmitBanner>
										</Form>
									</>
								);
							}}
						</Formik>
					</Col>
					{isEdit && (
						<Col lg={4}>
							{session && (
								<SessionAttendeeList
									attendees={reservations}
									capacity={(session?.seatsReserved || 0) + (session?.seatsAvailable || 0)}
								/>
							)}
						</Col>
					)}
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default GroupSessionsCreate;
