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
	ReportTypeId,
	groupSessionsService,
	imageUploader,
	screeningService,
	tagService,
} from '@/lib/services';
import NoMatch from '@/pages/no-match';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row, Tab } from 'react-bootstrap';
import {
	Link,
	LoaderFunctionArgs,
	Navigate,
	unstable_useBlocker as useBlocker,
	useNavigate,
	useParams,
	useRouteLoaderData,
	useSearchParams,
} from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import { ReactComponent as DownloadIcon } from '@/assets/icons/icon-download.svg';
import GroupSession from '@/components/group-session';
import {
	GROUP_SESSION_STATUS_ID,
	GroupSessionLearnMoreMethodId,
	GroupSessionModel,
	GroupSessionUrlNameValidationResult,
	ScreeningFlow,
	ScreeningFlowTypeId,
} from '@/lib/models';
import moment from 'moment';
import { SESSION_STATUS } from '@/components/session-status';
import useDebouncedState from '@/hooks/use-debounced-state';
import { ScreeningFlowQuestionsModal } from '@/components/screening-flow-questions-modal';
import { createUseThemedStyles } from '@/jss/theme';
import TabBar from '@/components/tab-bar';
import ConfirmDialog from '@/components/confirm-dialog';
import useFlags from '@/hooks/use-flags';
import { buildBackendDownloadUrl } from '@/lib/utils';
import { GroupSessionDetailNavigationSource } from '@/routes/group-session-detail';
import useAccount from '@/hooks/use-account';
import { ButtonLink } from '@/components/button-link';

type AdminGroupSessionFormLoaderData = Awaited<ReturnType<typeof loader>>;

export function useAdminGroupSessionFormLoaderData() {
	return useRouteLoaderData('admin-group-session-form') as AdminGroupSessionFormLoaderData;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const action = params.action;
	const groupSessionId = params.groupSessionId;

	// can add/edit/duplicate/preview/view group sessions.
	// add, must not have a group session id.
	// edit/duplicate/preview/view, must have a group session id.
	if (
		!action ||
		!['add-internal', 'add-external', 'edit', 'duplicate', 'preview', 'view'].includes(action) ||
		(['edit', 'duplicate', 'preview', 'view'].includes(action) && !groupSessionId)
	) {
		return null; // page renders a "404" in this case
	}

	const groupSessionRequest = groupSessionId
		? groupSessionsService.getGroupSessionByIdOrUrlName(groupSessionId)
		: null;
	const groupSessionReservationsRequest = groupSessionId
		? groupSessionsService.getGroupSessionReservationsById(groupSessionId)
		: null;
	const tagGroupsRequest = tagService.getTagGroups();
	const groupSessionCollectionsRequest = groupSessionsService.getGroupSessionCollections();
	const screeningFlowsRequest = screeningService.getScreeningFlowsByFlowTypeId(
		ScreeningFlowTypeId.GROUP_SESSION_INTAKE
	);

	request.signal.addEventListener('abort', () => {
		groupSessionRequest?.abort();
		groupSessionReservationsRequest?.abort();
		tagGroupsRequest.abort();
		groupSessionCollectionsRequest.abort();
		screeningFlowsRequest.abort();
	});

	const [
		groupSessionResponse,
		groupSessionReservationsResponse,
		tagGroupsResponse,
		groupSessionCollectionsResponse,
		screeningFlowsResponse,
	] = await Promise.all([
		groupSessionRequest?.fetch(),
		groupSessionReservationsRequest?.fetch(),
		tagGroupsRequest.fetch(),
		groupSessionCollectionsRequest.fetch(),
		screeningFlowsRequest.fetch(),
	]);

	return {
		groupSession: groupSessionResponse?.groupSession ?? null,
		groupSessionReservations: groupSessionReservationsResponse?.groupSessionReservations ?? [],
		groupSessionCollections: groupSessionCollectionsResponse.groupSessionCollections,
		tagGroups: tagGroupsResponse.tagGroups,
		screeningFlows: screeningFlowsResponse.screeningFlows,
	};
}

const initialGroupSessionFormValues = {
	title: '',
	urlName: '',
	videoconferenceUrl: '',
	seats: undefined as number | undefined,
	facilitatorName: '',
	facilitatorEmailAddress: '',
	differentEmailAddressForNotifications: false,
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

function getInitialGroupSessionFormValues({
	groupSession,
	isDuplicate,
	defaultScreeningFlowId,
}: {
	groupSession?: GroupSessionModel | null;
	isDuplicate?: boolean;
	defaultScreeningFlowId: string;
}): typeof initialGroupSessionFormValues {
	const {
		screeningFlowId = defaultScreeningFlowId,
		startDateTime,
		endDateTime,
		followupTimeOfDay: formattedFollowupTimeOfDay,
		...rest
	} = groupSession ?? {};

	const startDate = moment(startDateTime);
	const endDate = moment(endDateTime);
	const followupTimeOfDay = formattedFollowupTimeOfDay
		? moment(formattedFollowupTimeOfDay, 'HH:mm').format('hh:mm A')
		: '';

	const mergedDateInputValues = {
		startDate: startDateTime ? startDate.toDate() : initialGroupSessionFormValues.startDate,
		startTime: startDateTime ? startDate.format('hh:mm A') : '',
		endTime: endDateTime ? endDate.format('hh:mm A') : '',
		endDate: endDateTime ? endDate.toDate() : initialGroupSessionFormValues.endDate,
		followupTimeOfDay: followupTimeOfDay,
	};

	return Object.assign(
		{ ...initialGroupSessionFormValues },
		{
			...rest,
			screeningFlowId,
			// keep initial values when duplicating an existing session
			...(isDuplicate
				? {
						title: '',
						urlName: '',
				  }
				: mergedDateInputValues),
		}
	);
}

const useStyles = createUseThemedStyles((theme) => ({
	formFooter: {
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1,
		padding: '20px 0',
		position: 'fixed',
		textAlign: 'center',
		backgroundColor: theme.colors.n0,
		borderTop: `1px solid ${theme.colors.border}`,
	},
}));

export const Component = () => {
	const classes = useStyles();
	const { institution } = useAccount();
	const loaderData = useAdminGroupSessionFormLoaderData();
	const navigate = useNavigate();
	const params = useParams<{ action: string; groupSessionId: string }>();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedTab = searchParams.get('tab') ?? 'details';

	const descriptionWysiwygRef = useRef<WysiwygRef>(null);
	const reminderWysiwygRef = useRef<WysiwygRef>(null);
	const followupWysiwygRef = useRef<WysiwygRef>(null);
	const isNotDraft =
		!!loaderData?.groupSession && loaderData?.groupSession?.groupSessionStatusId !== SESSION_STATUS.NEW;
	const isPreview = params.action === 'preview';
	const isEdit = params.action === 'edit';
	const isDuplicate = params.action === 'duplicate';
	const isView = params.action === 'view';

	const isSessionEditable =
		loaderData?.groupSession?.groupSessionStatusId === GROUP_SESSION_STATUS_ID.NEW ||
		loaderData?.groupSession?.groupSessionStatusId === GROUP_SESSION_STATUS_ID.ADDED;

	const [formValues, setFormValues] = useState(
		getInitialGroupSessionFormValues({
			isDuplicate,
			groupSession: loaderData?.groupSession,
			defaultScreeningFlowId: institution.groupSessionDefaultIntakeScreeningFlowId,
		})
	);

	const [isDirty, setIsDirty] = useState(false);
	const navigationBlocker = useBlocker(({ currentLocation, nextLocation }) => {
		// ignore changes in `search`
		const navigatingAway = currentLocation.pathname !== nextLocation.pathname;

		return navigatingAway && isDirty && !isPreview;
	});
	const [showConfirmPublishDialog, setShowConfirmPublishDialog] = useState(false);
	const [showConfirmCancelDialog, setShowConfirmCancelDialog] = useState(false);
	const [urlNameSetByUser, setUrlNameSetByUser] = useState(!isDuplicate && !!loaderData?.groupSession?.urlName);
	const [debouncedSearchQuery] = useDebouncedState(urlNameSetByUser ? formValues.urlName : formValues.title);
	const [urlNameValidations, setUrlNameValidations] = useState<Record<string, GroupSessionUrlNameValidationResult>>(
		{}
	);

	const [selectedScreeningFlowForModal, setSelectedScreeningFlowForModal] = useState<ScreeningFlow>();

	const groupSessionSchedulingSystemId =
		params.action === 'add-external'
			? GroupSessionSchedulingSystemId.EXTERNAL
			: params.action === 'add-internal'
			? GroupSessionSchedulingSystemId.COBALT
			: loaderData?.groupSession?.groupSessionSchedulingSystemId ?? GroupSessionSchedulingSystemId.COBALT;

	const isExternal = groupSessionSchedulingSystemId === GroupSessionSchedulingSystemId.EXTERNAL;
	const hasReservations = (loaderData?.groupSessionReservations ?? []).length > 0;

	const registrantDownloadLink = useMemo(() => {
		if (!params.groupSessionId || !hasReservations) {
			return '';
		}

		return buildBackendDownloadUrl('/reporting/run-report', {
			reportTypeId: ReportTypeId.GROUP_SESSION_RESERVATION_EMAILS,
			groupSessionId: params.groupSessionId,
		});
	}, [hasReservations, params.groupSessionId]);

	const updateFormValue = useCallback((key: keyof typeof formValues, value: typeof formValues[typeof key]) => {
		setIsDirty(true);
		setFormValues((currentValues) => {
			return {
				...currentValues,
				[key]: value,
			};
		});
	}, []);

	const handleSaveForm = useCallback(
		async (options?: { exitAfterSave?: boolean }) => {
			const submission = prepareGroupSessionSubmission(formValues, isExternal);

			if (!isNotDraft) {
				submission.groupSessionStatusId = GROUP_SESSION_STATUS_ID.NEW;
			}

			const promise = !isEdit
				? groupSessionsService.createGroupSession(submission).fetch()
				: groupSessionsService.updateGroupsession(params.groupSessionId!, submission).fetch();
			setIsDirty(false);

			promise
				.then((response) => {
					if (isNotDraft || options?.exitAfterSave) {
						if (isNotDraft) {
							addFlag({
								variant: 'success',
								title: 'Changes published',
								description: 'Your changes are now available on Cobalt',
								actions: [
									{
										title: 'View Session',
										onClick: () => {
											navigate(`/group-sessions/${response.groupSession.urlName}`, {
												state: {
													navigationSource: GroupSessionDetailNavigationSource.ADMIN_LIST,
												},
											});
										},
									},
								],
							});
						}

						navigate('/admin/group-sessions');
					} else {
						navigate('/admin/group-sessions/preview/' + response.groupSession.groupSessionId);
					}
				})
				.catch((e) => {
					setIsDirty(true);
					handleError(e);
				});
		},
		[addFlag, formValues, handleError, isEdit, isExternal, isNotDraft, navigate, params.groupSessionId]
	);

	useEffect(() => {
		if (isPreview) {
			window.scroll(0, 0);
		}
	}, [isPreview]);

	useEffect(() => {
		if (!debouncedSearchQuery) {
			setFormValues((previousValues) => ({
				...previousValues,
				urlName: isEdit ? loaderData?.groupSession?.urlName ?? '' : '',
			}));
			return;
		}

		groupSessionsService
			.validateUrlName(debouncedSearchQuery, isDuplicate ? undefined : params.groupSessionId)
			.fetch()
			.then((response) => {
				setUrlNameValidations((validations) => {
					return {
						...validations,
						[debouncedSearchQuery]: response.groupSessionUrlNameValidationResult,
					};
				});

				setFormValues((previousValues) => ({
					...previousValues,
					urlName: response.groupSessionUrlNameValidationResult.recommendation,
				}));
			});
	}, [debouncedSearchQuery, isDuplicate, isEdit, loaderData?.groupSession?.urlName, params.groupSessionId]);

	if (loaderData === null) {
		return <NoMatch />;
	} else if ((isPreview && isNotDraft) || (isEdit && !isSessionEditable)) {
		return <Navigate to={`/admin/group-sessions/view/${params.groupSessionId}`} replace />;
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
					updateFormValue('startDate', date);
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
						updateFormValue('startTime', currentTarget.value);
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
						updateFormValue('endTime', currentTarget.value);
					}}
				/>
			</div>
		</>
	);

	const showTopTabs = isNotDraft && !isExternal && (!isDuplicate || isView);
	const cancelSessionButton = isNotDraft && isSessionEditable && (
		<Button
			type="button"
			variant="danger"
			className="ms-2"
			onClick={() => {
				setShowConfirmCancelDialog(true);
			}}
		>
			Cancel Session
		</Button>
	);
	const formFields = (
		<Container fluid={showTopTabs}>
			<ConfirmDialog
				size="lg"
				show={navigationBlocker.state === 'blocked'}
				onHide={() => {
					navigationBlocker.reset?.();
				}}
				titleText={`Confirm Exit`}
				bodyText={'You have changes that have not been saved or published, are your sure you want to exit?'}
				dismissText="Cancel"
				confirmText="Exit"
				onConfirm={() => {
					navigationBlocker.proceed?.();
				}}
			/>

			<GroupSessionFormSection
				title="Basic Info"
				description={
					<>
						<p className="mb-4">
							Write a clear, brief title to help people quickly understand what your group session is
							about.
						</p>
						<p className="mb-4">
							A friendly URL will be created from the session title. The friendly URL will appear at the
							end of the regular URL and make the web address easy to read.
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
					disabled={isExternal ? !isDuplicate && isNotDraft : isEdit && hasReservations}
					onChange={({ currentTarget }) => {
						updateFormValue('title', currentTarget.value);
					}}
				/>

				<InputHelper
					type="text"
					label="Friendly URL"
					name="urlName"
					error={urlNameValidations[debouncedSearchQuery]?.available === false ? 'URL is in use' : undefined}
					value={formValues.urlName}
					disabled={
						!formValues.title || (isExternal ? !isDuplicate && isNotDraft : isEdit && hasReservations)
					}
					onChange={({ currentTarget }) => {
						setUrlNameSetByUser(true);
						updateFormValue('urlName', currentTarget.value);
					}}
					onBlur={() => {
						if (!formValues.urlName) {
							setUrlNameSetByUser(false);
						}
					}}
				/>

				{!formValues.title || urlNameValidations[debouncedSearchQuery]?.available === false ? null : (
					<div className="d-flex mt-2">
						<InfoIcon className="me-2 text-p300 flex-shrink-0" width={20} height={20} />
						<p className="mb-0">
							URL will appear as https://{window.location.host}/group-sessions/
							<span className="fw-bold">{urlNameValidations[debouncedSearchQuery]?.recommendation}</span>
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
							updateFormValue('videoconferenceUrl', currentTarget.value);
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
						updateFormValue('seats', parseInt(currentTarget.value));
					}}
				/>
			</GroupSessionFormSection>

			<hr />

			<GroupSessionFormSection
				title={isExternal ? 'Facilitator' : 'Facilitator & Contact'}
				description={
					<>
						<p className="mb-4">Enter the information for the person who will be running this session.</p>

						{!isExternal && (
							<p>
								By default, the facilitator will receive an email whenever a user registers or cancels
								for the group session. You can choose to add a different email address to receive these
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
						updateFormValue('facilitatorName', currentTarget.value);
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
						updateFormValue('facilitatorEmailAddress', currentTarget.value);
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
						checked={formValues.differentEmailAddressForNotifications}
						onChange={({ currentTarget }) => {
							updateFormValue('differentEmailAddressForNotifications', currentTarget.checked);
							updateFormValue(
								'targetEmailAddress',
								currentTarget.checked ? loaderData?.groupSession?.targetEmailAddress ?? '' : ''
							);
						}}
					>
						<InputHelper
							type="email"
							label="Notification Email"
							required={formValues.differentEmailAddressForNotifications}
							name="targetEmailAddress"
							value={formValues.targetEmailAddress}
							onChange={({ currentTarget }) => {
								updateFormValue('targetEmailAddress', currentTarget.value);
							}}
						/>
					</ToggledInput>
				)}
			</GroupSessionFormSection>

			<hr />

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
								updateFormValue('singleSessionFlag', true);
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
								updateFormValue('singleSessionFlag', false);
							}}
						>
							<div className="d-flex mb-3">
								<DatePicker
									className="w-100 me-1"
									labelText="Start Date"
									required
									selected={formValues.startDate || new Date()}
									onChange={(date) => {
										updateFormValue('startDate', date);
									}}
								/>

								<DatePicker
									className="w-100 ms-1"
									labelText="End Date"
									required
									selected={formValues.endDate || new Date()}
									onChange={(date) => {
										updateFormValue('endDate', date);
									}}
								/>
							</div>

							<InputHelper
								label="Description"
								placeholder="Ex. Wednesdays 7-7:30 PM"
								name="dateTimeDescription"
								value={formValues.dateTimeDescription}
								onChange={({ currentTarget }) => {
									updateFormValue('dateTimeDescription', currentTarget.value);
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
							Add an image that represents the subject matter of your group session. Choose one that looks
							good at different sizes — this image will appear across the Cobalt website and mobile apps.
						</p>
						<p className="mb-4">
							Your image should be at least 800×450px. It will be cropped to a 16:9 ratio.
						</p>

						<p className="mb-0">Tips for selecting a good image:</p>

						<ul>
							<li>Features a warm, bold color palette</li>
							<li>
								Has a subject that is one of the following: 1) a headshot, 2) a calming piece of art, 3)
								an abstract image of nature
							</li>
							<li>Avoid scenes that depict low mood, anxiety, or other distress as well as clichés.</li>
						</ul>
					</>
				}
			>
				<GroupSessionImageInput
					imageSrc={formValues.imageUrl}
					onSrcChange={(nextSrc) => {
						updateFormValue('imageUrl', nextSrc);
					}}
				/>

				<div className="d-flex  mt-2">
					<InfoIcon className="me-2 text-p300 flex-shrink-0" width={20} height={20} />
					<p className="mb-0">
						If you choose not to upload an image, a generic placeholder image will be added to your post.
						Free images can be found at{' '}
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
					onChange={(nextValue) => {
						updateFormValue('description', nextValue);
					}}
				/>
			</GroupSessionFormSection>

			{isExternal && (
				<>
					<hr />

					<GroupSessionFormSection
						title="Learn More"
						description="How will participants learn more or sign up for this session?"
					>
						<ToggledInput
							type="radio"
							id="more-info-call"
							className="mb-3"
							label="Call to learn more"
							checked={formValues.groupSessionLearnMoreMethodId === GroupSessionLearnMoreMethodId.PHONE}
							onChange={() => {
								updateFormValue('groupSessionLearnMoreMethodId', GroupSessionLearnMoreMethodId.PHONE);
								updateFormValue('learnMoreDescription', '');
							}}
						>
							<InputHelper
								label="Phone Number"
								value={formValues.learnMoreDescription}
								name="learnMoreDescriptionPhone"
								type="tel"
								onChange={({ currentTarget }) => {
									updateFormValue('learnMoreDescription', currentTarget.value);
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
							checked={formValues.groupSessionLearnMoreMethodId === GroupSessionLearnMoreMethodId.EMAIL}
							onChange={() => {
								updateFormValue('groupSessionLearnMoreMethodId', GroupSessionLearnMoreMethodId.EMAIL);
								updateFormValue('learnMoreDescription', '');
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
									updateFormValue('learnMoreDescription', currentTarget.value);
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
								updateFormValue('groupSessionLearnMoreMethodId', GroupSessionLearnMoreMethodId.URL);
								updateFormValue('learnMoreDescription', '');
							}}
						>
							<InputHelper
								label="External URL"
								name="learnMoreDescriptionUrl"
								value={formValues.learnMoreDescription}
								onChange={({ currentTarget }) => {
									updateFormValue('learnMoreDescription', currentTarget.value);
								}}
								required={
									formValues.groupSessionLearnMoreMethodId === GroupSessionLearnMoreMethodId.URL
								}
								helperText="The external URL may be a link that participants use to register for the session or a link to a webpage with more information."
							/>
						</ToggledInput>
					</GroupSessionFormSection>
				</>
			)}

			<hr />

			<GroupSessionFormSection
				title="Visibility"
				description={
					<>
						<p className="mb-2">
							Visible sessions can be displayed in a collection with other similar group sessions. If no
							collection is selected, then the session will only be displayed in the Upcoming Sessions
							section.
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
						updateFormValue('visibleFlag', true);
					}}
				>
					<InputHelper
						as="select"
						label="Collection"
						name="groupSessionCollectionId"
						value={formValues.groupSessionCollectionId}
						onChange={({ currentTarget }) => {
							updateFormValue('groupSessionCollectionId', currentTarget.value);
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
						updateFormValue('visibleFlag', false);
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
												updateFormValue(
													'tagIds',
													isSelected
														? formValues.tagIds.filter((tagId) => tagId !== tag.tagId)
														: [...formValues.tagIds, tag.tagId]
												);
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

			{!isExternal && (
				<>
					<hr />
					<GroupSessionFormSection
						title="Screening Questions"
						description={
							<>
								<p className="mb-2">
									You may restrict a group session to certain audiences by selecting a set of
									pre-defined screening questions.
								</p>

								<p>
									Attendees must answer “Yes” to all screening questions in a set to reserve a seat.
								</p>
							</>
						}
					>
						<ScreeningFlowQuestionsModal
							show={!!selectedScreeningFlowForModal}
							screeningFlow={selectedScreeningFlowForModal}
							onHide={() => {
								setSelectedScreeningFlowForModal(undefined);
							}}
						/>

						<ToggledInput
							className="mb-3"
							id="no-screening"
							label="Do not screen"
							hideChildren
							checked={
								formValues.screeningFlowId === institution.groupSessionDefaultIntakeScreeningFlowId
							}
							onChange={() => {
								updateFormValue(
									'screeningFlowId',
									institution.groupSessionDefaultIntakeScreeningFlowId
								);
							}}
						/>

						{(loaderData?.screeningFlows ?? [])
							.filter(
								(flow) => flow.screeningFlowId !== institution.groupSessionDefaultIntakeScreeningFlowId
							)
							.map((screeningFlow) => {
								return (
									<ToggledInput
										key={screeningFlow.screeningFlowId}
										id={screeningFlow.screeningFlowId}
										label={screeningFlow.name}
										className="mb-3"
										hideChildren
										detail={
											<Button
												size="sm"
												variant="link"
												className="p-0 text-decoration-none"
												onClick={() => setSelectedScreeningFlowForModal(screeningFlow)}
											>
												View Questions
											</Button>
										}
										checked={formValues.screeningFlowId === screeningFlow.screeningFlowId}
										onChange={({ currentTarget }) => {
											updateFormValue(
												'screeningFlowId',
												currentTarget.checked ? screeningFlow.screeningFlowId : ''
											);
										}}
									/>
								);
							})}
					</GroupSessionFormSection>

					<hr />

					<GroupSessionFormSection
						title="Confirmation Email (optional)"
						description="This text will be added to the default confirmation email we send to anyone who reserves a seat for this group session."
					>
						<Wysiwyg
							className="bg-white"
							initialValue={loaderData.groupSession?.confirmationEmailContent ?? ''}
							onChange={(nextValue) => {
								updateFormValue('confirmationEmailContent', nextValue);
							}}
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
								updateFormValue('sendReminderEmail', currentTarget.checked);
							}}
						>
							<Wysiwyg
								ref={reminderWysiwygRef}
								className="bg-white"
								initialValue={loaderData.groupSession?.reminderEmailContent ?? ''}
								onChange={(nextValue) => {
									updateFormValue('reminderEmailContent', nextValue);
								}}
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
								updateFormValue('sendFollowupEmail', currentTarget.checked);
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
										updateFormValue('followupDayOffset', currentTarget.value);
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
										updateFormValue('followupTimeOfDay', currentTarget.value);
									}}
								/>
							</div>

							<p className="mb-3">
								The follow-up email will be sent{' '}
								<span className="fw-bold text-decoration-underline">
									{formValues.followupDayOffset || '--'} day
									{parseInt(formValues.followupDayOffset || '0', 10) === 1 ? '' : 's'}
								</span>{' '}
								after the session ends at{' '}
								<span className="fw-bold text-docration-underline">
									{formValues.followupTimeOfDay || '--'}
								</span>
							</p>

							<Wysiwyg
								ref={followupWysiwygRef}
								className="mb-3 bg-white"
								initialValue={loaderData.groupSession?.followupEmailContent ?? ''}
								onChange={(nextValue) => {
									updateFormValue('followupEmailContent', nextValue);
								}}
							/>

							<InputHelper
								label="Survey URL"
								value={formValues.followupEmailSurveyUrl}
								name="followupEmailSurveyUrl"
								onChange={({ currentTarget }) => {
									updateFormValue('followupEmailSurveyUrl', currentTarget.value);
								}}
							/>
						</ToggledInput>
					</GroupSessionFormSection>
				</>
			)}
		</Container>
	);

	const footer = (
		<div className={classes.formFooter}>
			<ConfirmDialog
				size="lg"
				show={showConfirmCancelDialog}
				onHide={() => {
					setShowConfirmCancelDialog(false);
				}}
				titleText={'Cancel Group Session'}
				bodyText={`Are you sure you want to cancel this group session?`}
				dismissText="No"
				confirmText="Yes"
				onConfirm={() => {
					groupSessionsService
						.updateGroupSessionStatusById(params.groupSessionId!, GROUP_SESSION_STATUS_ID.CANCELED)
						.fetch()
						.then(() => {
							navigate('/admin/group-sessions');
							addFlag({
								variant: 'success',
								title: 'Group session cancelled',
								description: 'Your session has been cancelled',
								actions: [],
							});
						})
						.catch((e) => {
							handleError(e);
						});
				}}
			/>
			<Container>
				<div className="d-flex justify-content-between">
					<div>
						<Button
							variant="outline-primary"
							type={isPreview || isNotDraft ? 'button' : 'submit'}
							value="exit"
							onClick={() => {
								if (isPreview) {
									navigate(`/admin/group-sessions/edit/${params.groupSessionId}`);
								} else if (isNotDraft) {
									navigate(`/admin/group-sessions/view/${params.groupSessionId}`);
								}
							}}
						>
							{isPreview ? (
								<>
									<LeftChevron /> Back to Edit
								</>
							) : isNotDraft ? (
								'Exit Editor'
							) : (
								'Save & Exit'
							)}
						</Button>

						{cancelSessionButton}
					</div>

					<Button
						variant="primary"
						type={isPreview ? 'button' : 'submit'}
						onClick={() => {
							if (!isPreview) {
								return;
							}

							setShowConfirmPublishDialog(true);
						}}
					>
						{isPreview ? (
							'Publish'
						) : (
							<>
								{isNotDraft ? 'Publish Changes' : 'Next: Preview'} <RightChevron />
							</>
						)}
					</Button>
				</div>
			</Container>
		</div>
	);

	const confirmPublishDialog = (
		<ConfirmDialog
			size="lg"
			show={showConfirmPublishDialog}
			onHide={() => {
				setShowConfirmPublishDialog(false);
			}}
			titleText={`Publish ${isNotDraft ? 'Changes' : 'Group Session'}`}
			bodyText={`Are you ready to publish ${isNotDraft ? 'your changes' : 'your group session'}?`}
			detailText={`Your ${isNotDraft ? 'changes' : 'group session'} will become available on Cobalt immediately`}
			dismissText="Cancel"
			confirmText="Publish"
			onConfirm={() => {
				setShowConfirmPublishDialog(false);

				if (isNotDraft) {
					handleSaveForm();
				} else {
					groupSessionsService
						.updateGroupSessionStatusById(params.groupSessionId!, GROUP_SESSION_STATUS_ID.ADDED)
						.fetch()
						.then((response) => {
							addFlag({
								variant: 'success',
								title: 'Group session published',
								description: 'Your session is now available on Cobalt',
								actions: [
									{
										title: 'View Session',
										onClick: () => {
											navigate(`/group-sessions/${response.groupSession.urlName}`, {
												state: {
													navigationSource: GroupSessionDetailNavigationSource.ADMIN_LIST,
												},
											});
										},
									},
								],
							});

							navigate('/admin/group-sessions');
						})
						.catch((e) => {
							handleError(e);
						});
				}
			}}
		/>
	);

	if (isPreview) {
		const submission = prepareGroupSessionSubmission(formValues, isExternal);

		return (
			<div className="pb-11">
				{confirmPublishDialog}
				<GroupSession groupSession={submission} />
				{footer}
			</div>
		);
	}

	return (
		<>
			<Container fluid className="border-bottom">
				<Container className="py-10">
					<Row>
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h2 className="mb-1">
									{isEdit ? 'Edit' : isView ? 'View' : 'Add'} {isExternal ? 'External' : 'Cobalt'}{' '}
									Group Session
								</h2>
								{isView && isSessionEditable && (
									<div>
										<ButtonLink
											className="text-decoration-none"
											variant="outline-primary"
											to={{
												pathname: `/admin/group-sessions/edit/${params.groupSessionId}`,
											}}
										>
											Edit
										</ButtonLink>

										{cancelSessionButton}
									</div>
								)}
							</div>
							<p className="mb-0 fs-large">
								Complete all <span className="text-danger">*required fields</span> before publishing.
								Published group sessions will appear on the{' '}
								<Link className="fw-normal" to="/group-sessions" target="_blank">
									Group Sessions
								</Link>{' '}
								page of Cobalt.
							</p>
						</Col>
					</Row>
				</Container>
			</Container>

			<Form
				className="pb-11"
				onSubmit={(event) => {
					event.preventDefault();

					// validate description wysiwyg
					if (!formValues.description) {
						descriptionWysiwygRef.current?.quill?.focus();
						descriptionWysiwygRef.current?.quillRef.current?.scrollIntoView({
							behavior: 'auto',
							block: 'center',
						});
						return;
					}

					// validate reminder email wysiwyg
					if (formValues.sendReminderEmail && !formValues.reminderEmailContent) {
						reminderWysiwygRef.current?.quill?.focus();
						reminderWysiwygRef.current?.quillRef.current?.scrollIntoView({
							behavior: 'auto',
							block: 'center',
						});
						return;
					}

					// validate followup email wysiwyg
					if (formValues.sendFollowupEmail && !formValues.followupEmailContent) {
						followupWysiwygRef.current?.quill?.focus();
						followupWysiwygRef.current?.quillRef.current?.scrollIntoView({
							behavior: 'auto',
							block: 'center',
						});
						return;
					}

					if (((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement).value === 'exit') {
						handleSaveForm({ exitAfterSave: true });
					} else if (!isNotDraft) {
						handleSaveForm();
					} else {
						setShowConfirmPublishDialog(true);
					}
				}}
			>
				{confirmPublishDialog}

				{showTopTabs ? (
					<Container className="py-10">
						<Tab.Container id="overview-tabs" defaultActiveKey="details" activeKey={selectedTab}>
							<TabBar
								key="mhic-orders-overview-tabbar"
								className="mb-8"
								value={selectedTab}
								tabs={[
									{
										value: 'details',
										title: 'Details',
									},
									{
										value: 'registrants',
										title: `Registrants (${loaderData?.groupSession?.seatsReserved ?? '0'}/${
											loaderData?.groupSession?.seats ?? '0'
										})`,
									},
								]}
								onTabClick={(value) => {
									searchParams.set('tab', value);
									setSearchParams(searchParams);
								}}
							/>
							<Tab.Content>
								<Tab.Pane eventKey="details">
									{isView ? <GroupSession groupSession={loaderData?.groupSession!} /> : formFields}
								</Tab.Pane>
								<Tab.Pane eventKey="registrants">
									<div className="my-10 d-flex align-items-center">
										<h3>Registrants</h3>

										<Button
											variant="light"
											className="ms-4 text-decoration-none"
											disabled={!registrantDownloadLink}
											href={registrantDownloadLink || undefined}
										>
											<DownloadIcon className="text-primary me-2" />
											Email Addresses
										</Button>
									</div>

									{loaderData?.groupSessionReservations.map((reservation) => {
										return (
											<div key={reservation.groupSessionReservationId}>
												<p className="fw-bold">{reservation.name ?? 'Anonymous'}</p>
												<a href={'mailto:' + reservation.emailAddress}>
													{reservation.emailAddress}
												</a>
												<hr className="my-4" />
											</div>
										);
									})}
								</Tab.Pane>
							</Tab.Content>
						</Tab.Container>
					</Container>
				) : (
					formFields
				)}

				{!isView && footer}
			</Form>
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
		delete groupSessionSubmission.screeningFlowId;
		delete groupSessionSubmission.confirmationEmailContent;
		delete groupSessionSubmission.sendReminderEmail;
		delete groupSessionSubmission.reminderEmailContent;
		delete groupSessionSubmission.sendFollowupEmail;
		delete groupSessionSubmission.followupDayOffset;
		delete groupSessionSubmission.followupTimeOfDay;
		delete groupSessionSubmission.followupEmailContent;
		delete groupSessionSubmission.followupEmailSurveyUrl;

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

	if (!groupSessionSubmission.differentEmailAddressForNotifications) {
		delete groupSessionSubmission.targetEmailAddress;
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
	} else {
		groupSessionSubmission.followupTimeOfDay = moment(groupSessionSubmission.followupTimeOfDay, 'hh:mm A').format(
			'HH:mm'
		);
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
