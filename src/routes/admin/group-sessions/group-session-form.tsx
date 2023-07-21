import { ReactComponent as CheckIcon } from '@/assets/icons/icon-check.svg';
import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as LeftChevron } from '@/assets/icons/icon-chevron-left.svg';
import Wysiwyg from '@/components/admin-cms/wysiwyg';
import DatePicker from '@/components/date-picker';
import ImageUploadCard from '@/components/image-upload-card';
import InputHelper from '@/components/input-helper';
import SessionCropModal from '@/components/session-crop-modal';
import TimeSlotInput from '@/components/time-slot-input';
import ToggledInput from '@/components/toggled-input';
import useHandleError from '@/hooks/use-handle-error';
import { GroupSessionSchedulingSystemId, groupSessionsService, imageUploader } from '@/lib/services';
import NoMatch from '@/pages/no-match';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
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
import { set } from 'js-cookie';

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

	request.signal.addEventListener('abort', () => {
		groupSessionRequest?.abort();
	});

	const groupSessionResponse = await groupSessionRequest?.fetch();

	return {
		groupSession: groupSessionResponse?.groupSession ?? null,
		tagGroups: [
			{
				id: uuidv4(),
				name: 'Symptoms',
				tags: [
					{
						id: uuidv4(),
						name: 'Mood',
					},
					{
						id: uuidv4(),
						name: 'Anxiety',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
				],
			},
			{
				id: uuidv4(),
				name: 'Personal Life',
				tags: [
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
				],
			},
			{
				id: uuidv4(),
				name: 'Work Life',
				tags: [
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
				],
			},
			{
				id: uuidv4(),
				name: 'Identity',
				tags: [
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
				],
			},
			{
				id: uuidv4(),
				name: 'World Events',
				tags: [
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
					{
						id: uuidv4(),
						name: 'Tag',
					},
				],
			},
		],
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

export const Component = () => {
	const { isGroupSessionPreview, setIsGroupSessionPreview } = useOutletContext() as AdminLayoutContext;
	const loaderData = useAdminGroupSessionFormLoaderData();
	const navigate = useNavigate();
	const params = useParams<{ action: string; groupSessionId: string }>();

	const [formValues, setFormValues] = useState({
		title: '', // existing
		urlName: '', // existing
		videoconferenceUrl: '', // existing -- COBALT ONLY
		seats: undefined as number | undefined, // existing
		facilitatorName: '', // existing
		facilitatorEmailAddress: '', // existing
		targetEmailAddress: '', // existing
		recurrence: '' as 'single' | 'series', // new -- EXTERNAL ONLY
		startDate: new Date() as Date | null, // existing
		startTime: '', // existing -- COBALT ONLY
		endTime: '', // existing -- COBALT ONLY
		endDate: new Date() as Date | null, // new -- EXTERNAL ONLY
		recurrenceDescription: '', // new -- EXTERNAL ONLY
		imageUrl: '', // existing
		description: '', // existing
		externalRegistrationType: '' as 'url' | 'email' | 'phone', // new -- EXTERNAL ONLY
		externalRegistrationReference: '', // new -- EXTERNAL ONLY
		groupSessionCollectionId: '', // new -- COBALT ONLY
		isHidden: false, // new -- COBAL ONLY
		tagIds: [] as string[], // new
		screeningQuestionsGroupId: '', // new -- COBALT ONLY
		confirmationEmailContent: '', // existing, -- COBALT ONLY
		sendReminderEmail: false, // new -- COBALT ONLY
		reminderEmailContent: '', // new -- COBALT ONLY
		sendFollowupEmail: false, // existing, -- COBALT ONLY
		followupEmailContent: '', // existing, -- COBALT ONLY
		followupEmailSurveyUrl: '', // existing, -- COBALT ONLY
		followupEmailDelayDays: '', // new, -- COBALT ONLY
		followupEmailTime: '', // new -- COBALT ONLY
	});

	const [showContactEmailInput, setShowContactEmailInput] = useState(
		formValues.facilitatorEmailAddress !== formValues.targetEmailAddress
	);
	const [showCollectionsDropdown, setShowCollectionsDropdown] = useState(!!formValues.groupSessionCollectionId);
	const [selectedScreeningForModal, setSelectedScreeningForModal] =
		useState<Exclude<AdminGroupSessionFormLoaderData, null>['screenings'][number]>();

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

	useEffect(() => {
		// cleanup layout/header on unmount
		return () => {
			setIsGroupSessionPreview(false);
		};
	}, [setIsGroupSessionPreview]);

	if (loaderData === null) {
		return <NoMatch />;
	}

	const isAdd = params.action !== 'edit';
	const groupSessionSchedulingSystemId =
		params.action === 'add-external'
			? GroupSessionSchedulingSystemId.EXTERNAL
			: params.action === 'add-internal'
			? GroupSessionSchedulingSystemId.COBALT
			: loaderData?.groupSession?.groupSessionSchedulingSystemId ?? GroupSessionSchedulingSystemId.COBALT;

	const isExternal = groupSessionSchedulingSystemId === GroupSessionSchedulingSystemId.EXTERNAL;

	const startAndEndTimeInputs = (
		<>
			<DatePicker
				className="mb-4"
				labelText="Date"
				required
				selected={formValues.startDate || new Date()}
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
					required
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
					required
					value={formValues.followupEmailTime}
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
					onClick={() => {
						if (isGroupSessionPreview) {
							togglePreview('off');
							return;
						}

						navigate('/admin/group-sessions');
					}}
				>
					{isGroupSessionPreview ? (
						<>
							<LeftChevron /> Back to Edit
						</>
					) : (
						'Save & Exit'
					)}
				</Button>

				<Button
					variant="primary"
					onClick={() => {
						if (!isGroupSessionPreview) {
							togglePreview('on');
							return;
						}

						alert('Publish! =>' + JSON.stringify(formValues, null, 2));

						console.log({ formValues });
					}}
				>
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
		return (
			<>
				<GroupSession groupSession={formValues} />
				{footer}
			</>
		);
	}

	return (
		<>
			<Container className="py-10">
				<Row>
					<Col>
						<h2 className="mb-1">
							{isAdd ? 'Add' : 'Edit'} {isExternal ? 'External' : 'Cobalt'} Group Session
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
						value={formValues.title}
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
						value={formValues.urlName}
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
								required
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
								checked={formValues.recurrence === 'single'}
								onChange={() => {
									setFormValues((curr) => ({
										...curr,
										recurrence: 'single',
									}));
								}}
							>
								{startAndEndTimeInputs}
							</ToggledInput>

							<ToggledInput
								type="radio"
								id="duration-series"
								label="Ongoing series"
								checked={formValues.recurrence === 'series'}
								onChange={() => {
									setFormValues((curr) => ({
										...curr,
										recurrence: 'series',
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
									value={formValues.recurrenceDescription}
									onChange={({ currentTarget }) => {
										setFormValues((curr) => ({
											...curr,
											recurrenceDescription: currentTarget.value,
										}));
									}}
									required
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
						className="bg-white"
						initialValue={formValues.description}
						onChange={(nextDescription) => {
							setFormValues((curr) => ({
								...curr,
								description: nextDescription,
							}));
						}}
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
								checked={formValues.externalRegistrationType === 'phone'}
								onChange={() => {
									setFormValues((curr) => ({
										...curr,
										externalRegistrationType: 'phone',
									}));
								}}
							>
								<InputHelper
									label="Phone Number"
									value={formValues.externalRegistrationReference}
									onChange={({ currentTarget }) => {
										setFormValues((curr) => ({
											...curr,
											externalRegistrationReference: currentTarget.value,
										}));
									}}
									required
								/>
							</ToggledInput>

							<ToggledInput
								type="radio"
								id="more-info-email"
								className="mb-3"
								label="Email to learn more"
								checked={formValues.externalRegistrationType === 'email'}
								onChange={() => {
									setFormValues((curr) => ({
										...curr,
										externalRegistrationType: 'email',
									}));
								}}
							>
								<InputHelper
									label="Email Address"
									type="email"
									value={formValues.externalRegistrationReference}
									onChange={({ currentTarget }) => {
										setFormValues((curr) => ({
											...curr,
											externalRegistrationReference: currentTarget.value,
										}));
									}}
									required
								/>
							</ToggledInput>

							<ToggledInput
								type="radio"
								id="more-info-url"
								className="mb-3"
								label="Click here to learn more (URL)"
								checked={formValues.externalRegistrationType === 'url'}
								onChange={() => {
									setFormValues((curr) => ({
										...curr,
										externalRegistrationType: 'url',
									}));
								}}
							>
								<InputHelper
									label="External URL"
									value={formValues.externalRegistrationReference}
									onChange={({ currentTarget }) => {
										setFormValues((curr) => ({
											...curr,
											externalRegistrationReference: currentTarget.value,
										}));
									}}
									required
									helperText="The external URL may be a link that participants use to register for the session or a link to a webpage with more information."
								/>
							</ToggledInput>

							<ToggledInput
								type="radio"
								id="more-info-call"
								className="mb-3"
								label="Call to learn more"
								checked={formValues.externalRegistrationType === 'phone'}
								onChange={() => {
									setFormValues((curr) => ({
										...curr,
										externalRegistrationType: 'phone',
									}));
								}}
							>
								<InputHelper
									label="Phone Number"
									value={formValues.externalRegistrationReference}
									onChange={({ currentTarget }) => {
										setFormValues((curr) => ({
											...curr,
											externalRegistrationReference: currentTarget.value,
										}));
									}}
									required
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
						checked={!formValues.isHidden && showCollectionsDropdown}
						onChange={({ currentTarget }) => {
							setFormValues((curr) => ({
								...curr,
								isHidden: false,
							}));
							setShowCollectionsDropdown(true);
							// setShowCollectionsDropdown(currentTarget.checked);
						}}
					>
						<InputHelper
							as="select"
							label="Collection"
							required
							value={formValues.targetEmailAddress}
							onChange={({ currentTarget }) => {
								setFormValues((curr) => ({
									...curr,
									targetEmailAddress: currentTarget.value,
								}));
							}}
						>
							<option value="">Select a collection</option>
							<option value="1">Collection 1</option>
							<option value="2">Collection 2</option>
						</InputHelper>
					</ToggledInput>

					<ToggledInput
						type="radio"
						id="visibility-off"
						name="visibility"
						label="Hidden"
						hideChildren
						checked={formValues.isHidden}
						onChange={({ currentTarget }) => {
							setFormValues((curr) => ({
								...curr,
								isHidden: true,
							}));
							setShowCollectionsDropdown(false);
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
							<div key={tagGroup.id} className="mb-4">
								<h5 className="mb-2">{tagGroup.name}</h5>

								<div className="d-flex flex-wrap">
									{(tagGroup.tags ?? []).map((tag) => {
										const isSelected = formValues.tagIds.includes(tag.id);

										return (
											<Button
												key={tag.id}
												size="sm"
												variant={isSelected ? 'primary' : 'outline-primary'}
												className="mb-2 me-2 fs-default text-nowrap"
												onClick={() => {
													setFormValues((curr) => ({
														...curr,
														tagIds: isSelected
															? curr.tagIds.filter((tagId) => tagId !== tag.id)
															: [...curr.tagIds, tag.id],
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
						checked={!formValues.screeningQuestionsGroupId}
						onChange={() => {
							setFormValues((curr) => ({
								...curr,
								screeningQuestionsGroupId: '',
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
								checked={formValues.screeningQuestionsGroupId === screening.id}
								onChange={({ currentTarget }) => {
									setFormValues((curr) => ({
										...curr,
										screeningQuestionsGroupId: currentTarget.checked ? screening.id : '',
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
							as="textarea"
							onChange={({ currentTarget }) => {
								setFormValues((curr) => ({
									...curr,
									reminderEmailContent: currentTarget.value,
								}));
							}}
							required
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
								required
								value={formValues.followupEmailDelayDays}
								onChange={({ currentTarget }) => {
									setFormValues((curr) => ({
										...curr,
										followupEmailDelayDays: currentTarget.value,
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
								required
								value={formValues.followupEmailTime}
								onChange={({ currentTarget }) => {
									setFormValues((curr) => ({
										...curr,
										followupEmailTime: currentTarget.value,
									}));
								}}
							/>
						</div>

						<p className="mb-3">
							The follow-up email will be sent{' '}
							<span className="fw-bold text-decoration-underline">
								{formValues.followupEmailDelayDays} day
							</span>{' '}
							after the session ends at{' '}
							<span className="fw-bold text-docration-underline">
								{formValues.followupEmailTime || '--'}
							</span>
						</p>

						<InputHelper
							label="Follow-up Email Text"
							value={formValues.followupEmailContent}
							as="textarea"
							onChange={({ currentTarget }) => {
								setFormValues((curr) => ({
									...curr,
									followupEmailContent: currentTarget.value,
								}));
							}}
							required
							className="mb-3"
						/>

						<InputHelper
							label="Survey URL"
							value={formValues.followupEmailSurveyUrl}
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
		</>
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
