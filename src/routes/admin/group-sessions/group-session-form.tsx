import { ReactComponent as CheckIcon } from '@/assets/icons/icon-check.svg';
import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as LeftChevron } from '@/assets/icons/icon-chevron-left.svg';
import Wysiwyg, { WysiwygRef } from '@/components/admin-cms/wysiwyg';
import DatePicker from '@/components/date-picker';
import ImageUploadCard from '@/components/image-upload-card';
import InputHelper from '@/components/input-helper';
import SessionCropModal from '@/components/session-crop-modal';
import TimeSlotInput from '@/components/time-slot-input';
import ToggledInput from '@/components/toggled-input';
import useHandleError from '@/hooks/use-handle-error';
import {
	CreateGroupSessionRequestBody,
	GroupSessionSchedulingSystemId,
	groupSessionsService,
	imageUploader,
	tagService,
} from '@/lib/services';
import NoMatch from '@/pages/no-match';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import {
	Link,
	LoaderFunctionArgs,
	useNavigate,
	useOutletContext,
	useParams,
	useRouteLoaderData,
} from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import GroupSession from '@/components/group-session';
import { AdminLayoutContext } from '../layout';
import { GROUP_SESSION_STATUS_ID, GroupSessionLearnMoreMethodId, GroupSessionModel } from '@/lib/models';
import moment from 'moment';
import { SESSION_STATUS } from '@/components/session-status';

type AdminGroupSessionFormLoaderData = Awaited<ReturnType<typeof loader>>;

export function useAdminGroupSessionFormLoaderData() {
	return useRouteLoaderData('admin-group-session-form') as AdminGroupSessionFormLoaderData;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const action = params.action;
	const groupSessionId = params.groupSessionId;

	// can only add/edit group sessions.
	// add, must not have a group session id.
	// edit, must have a group session id.
	if (
		!action ||
		!['add-internal', 'add-external', 'edit'].includes(action) ||
		(action === 'edit' && !groupSessionId)
	) {
		return null; // page renders a "404" in this case
	}

	const groupSessionRequest = groupSessionId ? groupSessionsService.getGroupSessionById(groupSessionId) : null;
	const groupSessionReservationsRequest = groupSessionId
		? groupSessionsService.getGroupSessionReservationsById(groupSessionId)
		: null;
	const tagGroupsRequest = tagService.getTagGroups();
	const groupSessionCollectionsRequest = groupSessionsService.getGroupSessionCollections();

	request.signal.addEventListener('abort', () => {
		groupSessionRequest?.abort();
		groupSessionReservationsRequest?.abort();
		tagGroupsRequest.abort();
		groupSessionCollectionsRequest.abort();
	});

	const [groupSessionResponse, groupSessionReservationsResponse, tagGroupsResponse, groupSessionCollectionsResponse] =
		await Promise.all([
			groupSessionRequest?.fetch(),
			groupSessionReservationsRequest?.fetch(),
			tagGroupsRequest.fetch(),
			groupSessionCollectionsRequest.fetch(),
		]);

	return {
		groupSession: groupSessionResponse?.groupSession ?? null,
		groupSessionReservations: groupSessionReservationsResponse?.groupSessionReservations ?? [],
		groupSessionCollections: groupSessionCollectionsResponse.groupSessionCollections,
		tagGroups: tagGroupsResponse.tagGroups,
		screenings: [
			{
				id: uuidv4(),
				name: 'Screening 1',
				questions: ['Question 1', 'Question 2'],
			},
			{
				id: uuidv4(),
				name: 'Screening 2',
				questions: ['Question 1', 'Question 2'],
			},
		],
	};
}

const initialGroupSessionFormValues = {
	title: '',
	urlName: '',
	videoconferenceUrl: '',
	seats: undefined as number | undefined,
	facilitatorName: '',
	facilitatorEmailAddress: '',
	targetEmailAddress: '',
	singleSessionFlag: true,
	dateTimeDescription: '' as string | undefined,
	startDate: moment().add(1, 'd').toDate() as Date | null,
	startTime: '',
	endTime: '',
	endDate: moment().add(2, 'd').toDate() as Date | null,
	imageUrl: '',
	description: '',
	groupSessionLearnMoreMethodId: GroupSessionLearnMoreMethodId.URL,
	learnMoreDescription: '',
	groupSessionCollectionId: '',
	visibleFlag: true,
	tagIds: [] as string[],
	screeningFlowId: '',
	confirmationEmailContent: '',
	sendReminderEmail: false,
	reminderEmailContent: '',
	sendFollowupEmail: false,
	followupEmailContent: '',
	followupEmailSurveyUrl: '',
	followupDayOffset: '',
	followupTimeOfDay: '',
};

function getInitialGroupSessionFormValues(
	groupSession?: GroupSessionModel | null
): typeof initialGroupSessionFormValues {
	const { startDateTime, endDateTime, ...rest } = groupSession ?? {};

	const startDate = moment(startDateTime);
	const endDate = moment(endDateTime);

	return Object.assign(
		{ ...initialGroupSessionFormValues },
		{
			...rest,
			startDate: startDateTime ? startDate.toDate() : initialGroupSessionFormValues.startDate,
			startTime: startDateTime ? startDate.format('hh:mm A') : '',
			endTime: endDateTime ? endDate.format('hh:mm A') : '',
			endDate: endDateTime ? endDate.toDate() : initialGroupSessionFormValues.endDate,
		}
	);
}

export const Component = () => {
	const { isGroupSessionPreview, setIsGroupSessionPreview } = useOutletContext() as AdminLayoutContext;
	const loaderData = useAdminGroupSessionFormLoaderData();
	const navigate = useNavigate();
	const params = useParams<{ action: string; groupSessionId: string }>();
	const handleError = useHandleError();

	const descriptionWysiwygRef = useRef<WysiwygRef>(null);
	const [formValues, setFormValues] = useState(getInitialGroupSessionFormValues(loaderData?.groupSession));

	const [showContactEmailInput, setShowContactEmailInput] = useState(
		formValues.facilitatorEmailAddress !== formValues.targetEmailAddress
	);
	const [selectedScreeningForModal, setSelectedScreeningForModal] =
		useState<Exclude<AdminGroupSessionFormLoaderData, null>['screenings'][number]>();

	const isPublished = loaderData?.groupSession?.groupSessionStatusId === SESSION_STATUS.ADDED;
	const isEdit = params.action === 'edit';
	const groupSessionSchedulingSystemId =
		params.action === 'add-external'
			? GroupSessionSchedulingSystemId.EXTERNAL
			: params.action === 'add-internal'
			? GroupSessionSchedulingSystemId.COBALT
			: loaderData?.groupSession?.groupSessionSchedulingSystemId ?? GroupSessionSchedulingSystemId.COBALT;

	const isExternal = groupSessionSchedulingSystemId === GroupSessionSchedulingSystemId.EXTERNAL;
	const hasReservations = (loaderData?.groupSessionReservations ?? []).length > 0;

	const togglePreview = useCallback(
		(nextPreviewState: 'on' | 'off') => {
			if (nextPreviewState === 'on') {
				setIsGroupSessionPreview(true);
				window.scrollTo(0, 0);

				return;
			}

			setIsGroupSessionPreview(false);
		},
		[setIsGroupSessionPreview]
	);

	const handleDescriptionChange = useCallback((nextDescription: string) => {
		setFormValues((curr) => ({
			...curr,
			description: nextDescription,
		}));
	}, []);

	const handleSaveForm = useCallback(
		async (groupSessionStatusId: GROUP_SESSION_STATUS_ID) => {
			const submission = prepareGroupSessionSubmission(formValues, isExternal);

			return (
				isEdit
					? groupSessionsService
							.updateGroupsession(loaderData!.groupSession!.groupSessionId, {
								...submission,
								groupSessionStatusId,
							})
							.fetch()
					: groupSessionsService
							.createGroupSession({
								...submission,
								groupSessionStatusId,
							})
							.fetch()
			)
				.then((response) => {
					navigate('/admin/group-sessions');
				})
				.catch((e) => {
					handleError(e);
				});
		},
		[formValues, handleError, isEdit, isExternal, loaderData, navigate]
	);

	useEffect(() => {
		// cleanup layout/header on unmount
		return () => {
			setIsGroupSessionPreview(false);
		};
	}, [setIsGroupSessionPreview]);

	if (loaderData === null) {
		return <NoMatch />;
	}

	const startAndEndTimeInputs = (
		<>
			<DatePicker
				className="mb-4"
				labelText="Date"
				required={!isExternal || formValues.singleSessionFlag}
				selected={formValues.startDate || new Date()}
				disabled={isEdit && hasReservations}
				onChange={(date) => {
					setFormValues((previousValues) => ({
						...previousValues,
						startDate: date,
					}));
				}}
			/>

			<div className="d-flex">
				<TimeSlotInput
					className="w-100 me-1"
					label="Start Time"
					name="startTime"
					disabled={isEdit && hasReservations}
					required={!isExternal || formValues.singleSessionFlag}
					value={formValues.startTime}
					onChange={({ currentTarget }) => {
						setFormValues((curr) => ({
							...curr,
							startTime: currentTarget.value,
						}));
					}}
				/>

				<TimeSlotInput
					className="w-100 ms-1"
					label="End Time"
					required={!isExternal || formValues.singleSessionFlag}
					name="endTime"
					disabled={isEdit && hasReservations}
					value={formValues.endTime}
					onChange={({ currentTarget }) => {
						setFormValues((curr) => ({
							...curr,
							endTime: currentTarget.value,
						}));
					}}
				/>
			</div>
		</>
	);

	const footer = (
		<Container>
			<div className="py-10 d-flex justify-content-between">
				<Button
					variant="outline-primary"
					type="button"
					onClick={() => {
						if (isGroupSessionPreview) {
							togglePreview('off');
							return;
						}

						if (isEdit && isPublished) {
							window.confirm(
								'You have changes that have not been published, are your sure you want to exit?'
							) && navigate('/admin/group-sessions');
							return;
						}

						handleSaveForm(GROUP_SESSION_STATUS_ID.NEW);
					}}
				>
					{isGroupSessionPreview ? (
						<>
							<LeftChevron /> Back to Edit
						</>
					) : isPublished ? (
						'Exit'
					) : (
						'Save & Exit'
					)}
				</Button>

				<Button variant="primary" type="submit">
					{isGroupSessionPreview ? (
						'Publish'
					) : (
						<>
							Next: Preview <RightChevron />
						</>
					)}
				</Button>
			</div>
		</Container>
	);

	if (isGroupSessionPreview) {
		const submission = prepareGroupSessionSubmission(formValues, isExternal);

		return (
			<Form
				onSubmit={(event) => {
					event.preventDefault();

					handleSaveForm(GROUP_SESSION_STATUS_ID.ADDED);
				}}
			>
				<GroupSession groupSession={submission} />
				{footer}
			</Form>
		);
	}

	return (
		<Form
			onSubmit={(event) => {
				event.preventDefault();

				// validate wysiwyg
				if (!formValues.description) {
					descriptionWysiwygRef.current?.quill?.focus();
					descriptionWysiwygRef.current?.quillRef.current?.scrollIntoView({
						behavior: 'auto',
						block: 'center',
					});
					return;
				}

				if (!isGroupSessionPreview) {
					togglePreview('on');
					return;
				}
			}}
		>
			<Container className="py-10">
				<Row>
					<Col>
						<h2 className="mb-1">
							{isEdit ? 'Edit' : 'Add'} {isExternal ? 'External' : 'Cobalt'} Group Session
						</h2>
						<p className="mb-0 fs-large">
							Complete all <span className="text-danger">*required fields</span> before publishing.
							Published group sessions will appear on the{' '}
							<Link to="/admin/group-sessions">Group Sessions</Link> page of Cobalt.
						</p>
					</Col>
				</Row>
			</Container>

			<hr />

			<Container>
				<GroupSessionFormSection
					title="Basic Info"
					description={
						<>
							<p className="mb-4">
								Write a clear, brief title to help people quickly understand what your group session is
								about.
							</p>

							<p className="mb-4">
								{!isExternal
									? 'Write a clear, brief title to help people quickly understand what your group session is about. '
									: ''}
								Include a friendly URL to make the web address at {window.location.host} easier to read.
								A friendly URL includes 1-3 words separated by hyphens that describe the content of the
								webpage (ex. tolerating-uncertainty).
							</p>
						</>
					}
				>
					<InputHelper
						className="mb-3"
						type="text"
						label="Session Title"
						required
						name="title"
						value={formValues.title}
						disabled={isExternal ? isPublished : isEdit && hasReservations}
						onChange={({ currentTarget }) => {
							setFormValues((curr) => ({
								...curr,
								title: currentTarget.value,
							}));
						}}
					/>

					<InputHelper
						type="text"
						label="Friendly URL"
						name="urlName"
						required
						value={formValues.urlName}
						disabled={isExternal ? isPublished : isEdit && hasReservations}
						onChange={({ currentTarget }) => {
							setFormValues((curr) => ({
								...curr,
								urlName: currentTarget.value,
							}));
						}}
					/>

					{formValues.urlName && (
						<div className="d-flex mt-2">
							<InfoIcon className="me-2 text-p300 flex-shrink-0" width={20} height={20} />
							<p className="mb-0">
								URL will appear as https://{window.location.host}/group-sessions/
								<span className="fw-bold">{formValues.urlName}</span>
							</p>
						</div>
					)}
				</GroupSessionFormSection>

				<hr />

				<GroupSessionFormSection title="Location" description="Only virtual sessions are allowed at this time.">
					<ToggledInput label="Virtual" checked disabled hideChildren={isExternal}>
						<InputHelper
							className="mb-2"
							type="text"
							label="Video Link URL (Bluejeans/Zoom, etc.)"
							name="videoconferenceUrl"
							required
							value={formValues.videoconferenceUrl}
							onChange={({ currentTarget }) => {
								setFormValues((curr) => ({
									...curr,
									videoconferenceUrl: currentTarget.value,
								}));
							}}
						/>
						<p className="mb-0 text-muted">
							Include the URL to the Bluejeans/Zoom/etc. address where the session will be hosted.
						</p>
					</ToggledInput>
				</GroupSessionFormSection>

				<hr />

				<GroupSessionFormSection
					title="Capacity (optional)"
					description="Enter a number to set a limit on how many people are allowed to attend."
				>
					<InputHelper
						type="number"
						label="Number of seats available"
						name="seats"
						value={typeof formValues.seats === 'number' ? formValues.seats.toString() : ''}
						onChange={({ currentTarget }) => {
							setFormValues((curr) => ({
								...curr,
								seats: parseInt(currentTarget.value),
							}));
						}}
					/>
				</GroupSessionFormSection>

				<hr />

				<GroupSessionFormSection
					title={isExternal ? 'Facilitator' : 'Facilitator & Contact'}
					description={
						<>
							<p className="mb-4">
								Enter the information for the person who will be running this session.
							</p>

							{!isExternal && (
								<p>
									Enter the information for the person who will be running this session. By default,
									the facilitator will receive an email whenever a user registers or cancels for the
									group session. You can choose to add a different email address to receive these
									notifications instead.
								</p>
							)}
						</>
					}
				>
					<InputHelper
						className="mb-3"
						type="text"
						label="Facilitator Name"
						required
						name="facilitatorName"
						value={formValues.facilitatorName}
						onChange={({ currentTarget }) => {
							setFormValues((curr) => ({
								...curr,
								facilitatorName: currentTarget.value,
							}));
						}}
					/>

					<InputHelper
						className="mb-3"
						type="email"
						label="Facilitator Email Address"
						required
						name="facilitatorEmailAddress"
						value={formValues.facilitatorEmailAddress}
						onChange={({ currentTarget }) => {
							setFormValues((curr) => ({
								...curr,
								facilitatorEmailAddress: currentTarget.value,
							}));
						}}
					/>

					{!isExternal && (
						<ToggledInput
							type="switch"
							id="contact-is-facilitator"
							label={
								<div>
									<p className="mb-0">Use a different email address for notifications</p>
									<p className="fs-small mb-0 text-muted">
										This address will receive emails when a person registers or cancels
									</p>
								</div>
							}
							checked={showContactEmailInput}
							onChange={({ currentTarget }) => {
								setShowContactEmailInput(currentTarget.checked);
							}}
						>
							<InputHelper
								type="email"
								label="Notification Email"
								required={showContactEmailInput}
								name="targetEmailAddress"
								value={formValues.targetEmailAddress}
								onChange={({ currentTarget }) => {
									setFormValues((curr) => ({
										...curr,
										targetEmailAddress: currentTarget.value,
									}));
								}}
							/>
						</ToggledInput>
					)}
				</GroupSessionFormSection>

				<GroupSessionFormSection
					title={isExternal ? 'Duration' : 'Scheduling'}
					description={
						isExternal
							? 'A group session managed outside of Cobalt may be a single scheduled session or an ongoing series.'
							: 'Add the scheduled date and time for the session.'
					}
				>
					{isExternal ? (
						<>
							<ToggledInput
								type="radio"
								id="duration-single"
								label="Single session"
								className="mb-3"
								checked={formValues.singleSessionFlag === true}
								onChange={() => {
									setFormValues((curr) => ({
										...curr,
										singleSessionFlag: true,
									}));
								}}
							>
								{startAndEndTimeInputs}
							</ToggledInput>

							<ToggledInput
								type="radio"
								id="duration-series"
								label="Ongoing series"
								checked={formValues.singleSessionFlag === false}
								onChange={() => {
									setFormValues((curr) => ({
										...curr,
										singleSessionFlag: false,
									}));
								}}
							>
								<div className="d-flex mb-3">
									<DatePicker
										className="w-100 me-1"
										labelText="Start Date"
										required
										selected={formValues.startDate || new Date()}
										onChange={(date) => {
											setFormValues((previousValues) => ({
												...previousValues,
												startDate: date,
											}));
										}}
									/>

									<DatePicker
										className="w-100 ms-1"
										labelText="End Date"
										required
										selected={formValues.endDate || new Date()}
										onChange={(date) => {
											setFormValues((previousValues) => ({
												...previousValues,
												endDate: date,
											}));
										}}
									/>
								</div>

								<InputHelper
									label="Description"
									placeholder="Ex. Wednesdays 7-7:30 PM"
									name="dateTimeDescription"
									value={formValues.dateTimeDescription}
									onChange={({ currentTarget }) => {
										setFormValues((curr) => ({
											...curr,
											dateTimeDescription: currentTarget.value,
										}));
									}}
									required={!formValues.singleSessionFlag}
								/>
							</ToggledInput>
						</>
					) : (
						startAndEndTimeInputs
					)}
				</GroupSessionFormSection>

				<hr />

				<GroupSessionFormSection
					title="Image"
					description={
						<>
							<p className="mb-4">
								Add an image that represents the subject matter of your group session. Choose one that
								looks good at different sizes — this image will appear across the Cobalt website and
								mobile apps.
							</p>
							<p className="mb-4">
								Your image should be at least 800×450px. It will be cropped to a 16:9 ratio.
							</p>

							<p className="mb-0">Tips for selecting a good image:</p>

							<ul>
								<li>Features a warm, bold color palette</li>
								<li>
									Has a subject that is one of the following: 1) a headshot, 2) a calming piece of
									art, 3) an abstract image of nature
								</li>
								<li>
									Avoid scenes that depict low mood, anxiety, or other distress as well as clichés.
								</li>
							</ul>
						</>
					}
				>
					<GroupSessionImageInput
						imageSrc={formValues.imageUrl}
						onSrcChange={(nextSrc) => {
							setFormValues((curr) => ({
								...curr,
								imageUrl: nextSrc,
							}));
						}}
					/>

					<div className="d-flex  mt-2">
						<InfoIcon className="me-2 text-p300 flex-shrink-0" width={20} height={20} />
						<p className="mb-0">
							If you choose not to upload an image, a generic placeholder image will be added to your
							post. Free images can be found at{' '}
							<a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer">
								unsplash.com
							</a>
						</p>
					</div>
				</GroupSessionFormSection>

				<hr />

				<GroupSessionFormSection
					title="Description"
					description="Describe what your group session is about, who it is for, and any special requirements for participating. Your description should tell potential attendees everything they need to know to make a decision about joining."
				>
					<Wysiwyg
						ref={descriptionWysiwygRef}
						className="bg-white"
						initialValue={loaderData.groupSession?.description ?? ''}
						onChange={handleDescriptionChange}
					/>
				</GroupSessionFormSection>

				{isExternal && (
					<>
						<GroupSessionFormSection
							title="Learn More"
							description="How will participants learn more or sign up for this session?"
						>
							<ToggledInput
								type="radio"
								id="more-info-call"
								className="mb-3"
								label="Call to learn more"
								checked={
									formValues.groupSessionLearnMoreMethodId === GroupSessionLearnMoreMethodId.PHONE
								}
								onChange={() => {
									setFormValues((curr) => ({
										...curr,
										groupSessionLearnMoreMethodId: GroupSessionLearnMoreMethodId.PHONE,
										learnMoreDescription: '',
									}));
								}}
							>
								<InputHelper
									label="Phone Number"
									value={formValues.learnMoreDescription}
									name="learnMoreDescriptionPhone"
									type="tel"
									onChange={({ currentTarget }) => {
										setFormValues((curr) => ({
											...curr,
											learnMoreDescription: currentTarget.value,
										}));
									}}
									required={
										formValues.groupSessionLearnMoreMethodId === GroupSessionLearnMoreMethodId.PHONE
									}
								/>
							</ToggledInput>

							<ToggledInput
								type="radio"
								id="more-info-email"
								className="mb-3"
								label="Email to learn more"
								checked={
									formValues.groupSessionLearnMoreMethodId === GroupSessionLearnMoreMethodId.EMAIL
								}
								onChange={() => {
									setFormValues((curr) => ({
										...curr,
										groupSessionLearnMoreMethodId: GroupSessionLearnMoreMethodId.EMAIL,
										learnMoreDescription: '',
									}));
								}}
							>
								<InputHelper
									label="Email Address"
									type={
										formValues.groupSessionLearnMoreMethodId === GroupSessionLearnMoreMethodId.EMAIL
											? 'email'
											: 'text'
									}
									name="learnMoreDescriptionEmail"
									value={formValues.learnMoreDescription}
									onChange={({ currentTarget }) => {
										setFormValues((curr) => ({
											...curr,
											learnMoreDescription: currentTarget.value,
										}));
									}}
									required={
										formValues.groupSessionLearnMoreMethodId === GroupSessionLearnMoreMethodId.EMAIL
									}
								/>
							</ToggledInput>

							<ToggledInput
								type="radio"
								id="more-info-url"
								className="mb-3"
								label="Click here to learn more (URL)"
								checked={formValues.groupSessionLearnMoreMethodId === GroupSessionLearnMoreMethodId.URL}
								onChange={() => {
									setFormValues((curr) => ({
										...curr,
										groupSessionLearnMoreMethodId: GroupSessionLearnMoreMethodId.URL,
										learnMoreDescription: '',
									}));
								}}
							>
								<InputHelper
									label="External URL"
									name="learnMoreDescriptionUrl"
									value={formValues.learnMoreDescription}
									onChange={({ currentTarget }) => {
										setFormValues((curr) => ({
											...curr,
											learnMoreDescription: currentTarget.value,
										}));
									}}
									required={
										formValues.groupSessionLearnMoreMethodId === GroupSessionLearnMoreMethodId.URL
									}
									helperText="The external URL may be a link that participants use to register for the session or a link to a webpage with more information."
								/>
							</ToggledInput>
						</GroupSessionFormSection>
						<hr />
					</>
				)}

				<hr />

				<GroupSessionFormSection
					title="Visibility"
					description={
						<>
							<p className="mb-2">
								Visible sessions can be displayed in a collection with other similar group sessions. If
								no collection is selected, then the session will only be displayed in the Upcoming
								Sessions section.
							</p>

							<p>
								A hidden session will still be available on Cobalt, but users will need a direct link to
								access it.
							</p>
						</>
					}
				>
					<ToggledInput
						type="radio"
						id="visibility-on"
						label="Visible"
						className="mb-3"
						required
						checked={formValues.visibleFlag}
						onChange={({ currentTarget }) => {
							setFormValues((curr) => ({
								...curr,
								visibleFlag: true,
							}));
						}}
					>
						<InputHelper
							as="select"
							label="Collection"
							name="groupSessionCollectionId"
							value={formValues.groupSessionCollectionId}
							onChange={({ currentTarget }) => {
								setFormValues((curr) => ({
									...curr,
									groupSessionCollectionId: currentTarget.value,
								}));
							}}
						>
							<option value="">Select a collection</option>
							{loaderData.groupSessionCollections.map((groupSessionCollection) => {
								return (
									<option
										key={groupSessionCollection.groupSessionCollectionId}
										value={groupSessionCollection.groupSessionCollectionId}
									>
										{groupSessionCollection.description}
									</option>
								);
							})}
						</InputHelper>
					</ToggledInput>

					<ToggledInput
						type="radio"
						id="visibility-off"
						name="visibility"
						label="Hidden"
						hideChildren
						checked={!formValues.visibleFlag}
						onChange={({ currentTarget }) => {
							setFormValues((curr) => ({
								...curr,
								visibleFlag: false,
							}));
						}}
					/>
				</GroupSessionFormSection>

				<hr />

				<GroupSessionFormSection
					title="Tags"
					description="Tags are used to determine which resources are shown first to a user depending on how they answered the initial assessment questions. If no tags are selected, then the resource will be de-prioritized and appear lower in a user’s list of resources."
				>
					{(loaderData?.tagGroups ?? []).map((tagGroup) => {
						return (
							<div key={tagGroup.tagGroupId} className="mb-4">
								<h5 className="mb-2">{tagGroup.name}</h5>

								<div className="d-flex flex-wrap">
									{(tagGroup.tags ?? []).map((tag) => {
										const isSelected = formValues.tagIds.includes(tag.tagId);

										return (
											<Button
												key={tag.tagId}
												size="sm"
												variant={isSelected ? 'primary' : 'outline-primary'}
												className="mb-2 me-2 fs-default text-nowrap"
												onClick={() => {
													setFormValues((curr) => ({
														...curr,
														tagIds: isSelected
															? curr.tagIds.filter((tagId) => tagId !== tag.tagId)
															: [...curr.tagIds, tag.tagId],
													}));
												}}
											>
												{isSelected ? (
													<CheckIcon className="me-2" />
												) : (
													<PlusIcon className="me-2" />
												)}
												{tag.name}
											</Button>
										);
									})}
								</div>
							</div>
						);
					})}
				</GroupSessionFormSection>

				<hr />

				<GroupSessionFormSection
					title="Screening Questions"
					description={
						<>
							<p className="mb-2">
								You may restrict a group session to certain audiences by selecting a set of pre-defined
								screening questions.
							</p>

							<p>Attendees must answer “Yes” to all screening questions in a set to reserve a seat.</p>
						</>
					}
				>
					<Modal
						centered
						show={!!selectedScreeningForModal}
						onHide={() => {
							setSelectedScreeningForModal(undefined);
						}}
					>
						<Modal.Header closeButton>
							<Modal.Title>{selectedScreeningForModal?.name}</Modal.Title>
						</Modal.Header>

						<Modal.Body>
							<p className="fs-large fw-bold mb-4">
								{selectedScreeningForModal?.questions.length} Questions total
							</p>

							<ol>
								{selectedScreeningForModal?.questions.map((question, idx) => {
									return <li key={idx}>{question}</li>;
								})}
							</ol>
						</Modal.Body>

						<Modal.Footer className="text-right">
							<Button
								size="sm"
								variant="primary"
								onClick={() => {
									setSelectedScreeningForModal(undefined);
								}}
							>
								OK
							</Button>
						</Modal.Footer>
					</Modal>

					<ToggledInput
						className="mb-3"
						id="no-screening"
						label="Do not screen"
						hideChildren
						checked={!formValues.screeningFlowId}
						onChange={() => {
							setFormValues((curr) => ({
								...curr,
								screeningFlowId: '',
							}));
						}}
					/>

					{(loaderData?.screenings ?? []).map((screening) => {
						return (
							<ToggledInput
								key={screening.id}
								id={screening.id}
								label={screening.name}
								className="mb-3"
								hideChildren
								detail={
									<Button
										size="sm"
										variant="link"
										className="p-0 text-decoration-none"
										onClick={() => setSelectedScreeningForModal(screening)}
									>
										View Questions
									</Button>
								}
								checked={formValues.screeningFlowId === screening.id}
								onChange={({ currentTarget }) => {
									setFormValues((curr) => ({
										...curr,
										screeningFlowId: currentTarget.checked ? screening.id : '',
									}));
								}}
							/>
						);
					})}
				</GroupSessionFormSection>

				<hr />

				<GroupSessionFormSection
					title="Confirmation Email"
					description="Write text for an email that will be sent when someone reserves a seat for this session."
				>
					<InputHelper
						label="Confirmation Email Text"
						value={formValues.confirmationEmailContent}
						name="confirmationEmailContent"
						as="textarea"
						onChange={({ currentTarget }) => {
							setFormValues((curr) => ({
								...curr,
								confirmationEmailContent: currentTarget.value,
							}));
						}}
						required
					/>
				</GroupSessionFormSection>

				<hr />

				<GroupSessionFormSection title="Other Emails (Optional)">
					<ToggledInput
						type="switch"
						id="send-reminder-email"
						className="mb-3"
						label={
							<div>
								<p className="mb-0">Send Reminder Email</p>
								<p className="fs-small text-muted mb-0">
									Sent 24 hours before the start of the session
								</p>
							</div>
						}
						checked={formValues.sendReminderEmail}
						onChange={({ currentTarget }) => {
							setFormValues((curr) => ({
								...curr,
								sendReminderEmail: currentTarget.checked,
							}));
						}}
					>
						<InputHelper
							label="Reminder Email Text"
							value={formValues.reminderEmailContent}
							name="reminderEmailContent"
							as="textarea"
							onChange={({ currentTarget }) => {
								setFormValues((curr) => ({
									...curr,
									reminderEmailContent: currentTarget.value,
								}));
							}}
							required={formValues.sendReminderEmail}
						/>
					</ToggledInput>

					<ToggledInput
						type="switch"
						id="send-followup-email"
						className="mb-3"
						label={
							<div>
								<p className="mb-0">Send Follow-up Email</p>
								<p className="fs-small text-muted mb-0">Sent after the session ends</p>
							</div>
						}
						checked={formValues.sendFollowupEmail}
						onChange={({ currentTarget }) => {
							setFormValues((curr) => ({
								...curr,
								sendFollowupEmail: currentTarget.checked,
							}));
						}}
					>
						<div className="d-flex mb-1">
							<InputHelper
								className="w-100 me-1"
								as="select"
								label="# of days after session"
								name="followupDayOffset"
								required={formValues.sendFollowupEmail}
								value={formValues.followupDayOffset}
								onChange={({ currentTarget }) => {
									setFormValues((curr) => ({
										...curr,
										followupDayOffset: currentTarget.value,
									}));
								}}
							>
								<option value="" disabled>
									Select...
								</option>
								{[...Array(14).keys()].map((num) => (
									<option key={num} value={num + 1}>
										{num + 1}
									</option>
								))}
							</InputHelper>

							<TimeSlotInput
								className="w-100 ms-1"
								label="Time"
								name="followupTimeOfDay"
								required={formValues.sendFollowupEmail}
								value={formValues.followupTimeOfDay}
								onChange={({ currentTarget }) => {
									setFormValues((curr) => ({
										...curr,
										followupTimeOfDay: currentTarget.value,
									}));
								}}
							/>
						</div>

						<p className="mb-3">
							The follow-up email will be sent{' '}
							<span className="fw-bold text-decoration-underline">
								{formValues.followupDayOffset} day
							</span>{' '}
							after the session ends at{' '}
							<span className="fw-bold text-docration-underline">
								{formValues.followupTimeOfDay || '--'}
							</span>
						</p>

						<InputHelper
							label="Follow-up Email Text"
							value={formValues.followupEmailContent}
							name="followupEmailContent"
							as="textarea"
							onChange={({ currentTarget }) => {
								setFormValues((curr) => ({
									...curr,
									followupEmailContent: currentTarget.value,
								}));
							}}
							required={formValues.sendFollowupEmail}
							className="mb-3"
						/>

						<InputHelper
							label="Survey URL"
							value={formValues.followupEmailSurveyUrl}
							name="followupEmailSurveyUrl"
							onChange={({ currentTarget }) => {
								setFormValues((curr) => ({
									...curr,
									followupEmailSurveyUrl: currentTarget.value,
								}));
							}}
						/>
					</ToggledInput>
				</GroupSessionFormSection>
			</Container>

			{footer}
		</Form>
	);
};

interface GroupSessionFormSectionProps {
	title: string | ReactNode;
	description?: string | ReactNode;
	children: ReactNode;
}

const GroupSessionFormSection = ({ title, description, children }: GroupSessionFormSectionProps) => {
	return (
		<Row className="py-10">
			<Col xs={12} lg={6}>
				{typeof title === 'string' ? <h4 className="mb-4">{title}</h4> : title}

				{typeof description === 'string' ? <p>{description}</p> : description}
			</Col>

			<Col xs={12} lg={6}>
				{children}
			</Col>
		</Row>
	);
};

interface GroupSessionImageInputProps {
	imageSrc: string;
	onSrcChange: (newSrc: string) => void;
}

const GroupSessionImageInput = ({ imageSrc, onSrcChange }: GroupSessionImageInputProps) => {
	const handleError = useHandleError();
	const [isCropModalOpen, setIsCropModalOpen] = useState(false);
	const [cropModalImageSrc, setCropModalImageSrc] = useState(imageSrc);
	const [imagePreviewSrc, setImagePreviewSrc] = useState(imageSrc);
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);

	return (
		<>
			<SessionCropModal
				imageSource={cropModalImageSrc}
				show={isCropModalOpen}
				onHide={() => {
					setIsCropModalOpen(false);
				}}
				onSave={async (blob) => {
					setIsCropModalOpen(false);

					imageUploader(
						blob,
						groupSessionsService.getPresignedUploadUrl({
							contentType: blob.type,
							filename: `${uuidv4()}.jpg`,
						}).fetch
					)
						.onBeforeUpload((previewImageUrl) => {
							setImagePreviewSrc(previewImageUrl);
						})
						.onPresignedUploadObtained((accessUrl) => {
							setIsUploading(true);

							onSrcChange(accessUrl);
						})
						.onProgress((percentage) => {
							setProgress(percentage);
						})
						.onComplete((accessUrl) => {
							setIsUploading(false);
							setImagePreviewSrc(accessUrl);
						})
						.onError((error: any) => {
							handleError(error);

							setIsUploading(false);

							setImagePreviewSrc('');
						})
						.start();
				}}
			/>

			<ImageUploadCard
				imagePreview={imagePreviewSrc}
				isUploading={isUploading}
				progress={progress}
				onChange={(file) => {
					const sourceUrl = URL.createObjectURL(file);

					setCropModalImageSrc(sourceUrl);
					setIsCropModalOpen(true);
				}}
				onRemove={() => {
					onSrcChange('');
					setImagePreviewSrc('');
				}}
			/>
		</>
	);
};

function prepareGroupSessionSubmission(
	formValues: Partial<typeof initialGroupSessionFormValues>,
	isExternal: boolean
): CreateGroupSessionRequestBody {
	const { startDate, endDate, startTime, endTime, ...groupSessionSubmission } = formValues;

	let startDateTime = moment(`${startDate?.toISOString().split('T')[0]} ${startTime}`, 'YYYY-MM-DD HH:mm A').format(
		'YYYY-MM-DD[T]HH:mm'
	);

	let endDateTime = moment(`${startDate?.toISOString().split('T')[0]} ${endTime}`, 'YYYY-MM-DD HH:mm A').format(
		'YYYY-MM-DD[T]HH:mm'
	);

	if (isExternal) {
		if (groupSessionSubmission.singleSessionFlag) {
			// only for series
			delete groupSessionSubmission.dateTimeDescription;
		} else {
			// default times to start of day
			startDateTime = moment(startDate).startOf('day').format('YYYY-MM-DD[T]HH:mm');

			endDateTime = moment(endDate).startOf('day').format('YYYY-MM-DD[T]HH:mm');
		}
	} else {
		delete groupSessionSubmission.groupSessionLearnMoreMethodId;
		delete groupSessionSubmission.learnMoreDescription;

		delete groupSessionSubmission.singleSessionFlag;
		delete groupSessionSubmission.dateTimeDescription;

		if (!groupSessionSubmission.targetEmailAddress) {
			delete groupSessionSubmission.targetEmailAddress;
		}
	}

	if (!groupSessionSubmission.groupSessionCollectionId) {
		delete groupSessionSubmission.groupSessionCollectionId;
	}

	if (!groupSessionSubmission.imageUrl) {
		delete groupSessionSubmission.imageUrl;
	}

	if (!groupSessionSubmission.screeningFlowId) {
		delete groupSessionSubmission.screeningFlowId;
	}

	if (!groupSessionSubmission.sendReminderEmail) {
		delete groupSessionSubmission.reminderEmailContent;
	}

	if (!groupSessionSubmission.sendFollowupEmail) {
		delete groupSessionSubmission.followupDayOffset;
		delete groupSessionSubmission.followupTimeOfDay;
		delete groupSessionSubmission.followupEmailContent;
		delete groupSessionSubmission.followupEmailSurveyUrl;
	}

	return {
		startDateTime,
		endDateTime,
		groupSessionSchedulingSystemId: isExternal
			? GroupSessionSchedulingSystemId.EXTERNAL
			: GroupSessionSchedulingSystemId.COBALT,
		...groupSessionSubmission,
	};
}
