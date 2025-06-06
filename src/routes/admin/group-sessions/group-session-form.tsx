import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info-fill.svg';
import { ReactComponent as LeftChevron } from '@/assets/icons/icon-chevron-left.svg';
import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import TimeSlotInput from '@/components/time-slot-input';
import ToggledInput from '@/components/toggled-input';
import useHandleError from '@/hooks/use-handle-error';
import {
	CreateGroupSessionRequestBody,
	GroupSessionSchedulingSystemId,
	ReportTypeId,
	groupSessionsService,
	screeningService,
	tagService,
} from '@/lib/services';
import NoMatch from '@/pages/no-match';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row, Tab } from 'react-bootstrap';
import {
	Link,
	LoaderFunctionArgs,
	Navigate,
	unstable_useBlocker as useBlocker,
	useMatch,
	useNavigate,
	useParams,
	useRouteLoaderData,
	useSearchParams,
} from 'react-router-dom';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import { ReactComponent as DownloadIcon } from '@/assets/icons/icon-download.svg';
import GroupSession from '@/components/group-session';
import {
	CONTENT_VISIBILITY_TYPE_ID,
	GROUP_SESSION_STATUS_ID,
	GroupSessionLearnMoreMethodId,
	GroupSessionLocationTypeId,
	GroupSessionModel,
	GroupSessionUrlNameValidationResult,
	ScreeningFlow,
	ScreeningFlowTypeId,
	Tag,
} from '@/lib/models';
import moment from 'moment';
import { SESSION_STATUS } from '@/components/session-status';
import useDebouncedState from '@/hooks/use-debounced-state';
import { ScreeningFlowQuestionsModal } from '@/components/screening-flow-questions-modal';
import TabBar from '@/components/tab-bar';
import ConfirmDialog from '@/components/confirm-dialog';
import useFlags from '@/hooks/use-flags';
import { DateFormats, buildBackendDownloadUrl } from '@/lib/utils';
import { GroupSessionDetailNavigationSource } from '@/routes/group-session-detail';
import useAccount from '@/hooks/use-account';
import { ButtonLink } from '@/components/button-link';
import { AdminFormFooter, AdminFormImageInput, AdminFormSection } from '@/components/admin';
import { getTagGroupErrorMessage } from '@/lib/utils/error-utils';
import { CobaltError } from '@/lib/http-client';
import WysiwygBasic, { wysiwygIsValid } from '@/components/wysiwyg-basic';
import ReactQuill from 'react-quill';
import { ReactComponent as QuestionMarkIcon } from '@/assets/icons/icon-help-fill.svg';

type AdminGroupSessionFormLoaderData = Awaited<ReturnType<typeof loader>>;

export function useAdminGroupSessionFormLoaderData() {
	const isAdminMatch = useMatch({
		path: '/admin/*',
	});

	return useRouteLoaderData(
		isAdminMatch ? 'admin-group-session-form' : 'group-session-form'
	) as AdminGroupSessionFormLoaderData;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const action = params.action;
	const groupSessionId = params.groupSessionId;
	const isAdminRoute = request.url.includes('admin');

	const supportedActions = [
		'add-internal',
		'add-external',
		...(isAdminRoute ? ['edit', 'duplicate', 'preview', 'view'] : []),
	];

	// can add/preview/view edit/duplicate
	// admins can also edit/duplicate them
	const isSupportedAction = !!action && supportedActions.includes(action);

	// add, must not have a group session id.
	const isValidNoId = isSupportedAction && ['add-internal', 'add-external'].includes(action) && !groupSessionId;

	// edit/duplicate/preview/view, must have a group session id.
	const isValidWithId =
		isSupportedAction && ['edit', 'duplicate', 'preview', 'view'].includes(action) && !!groupSessionId;

	if (!isValidNoId && !isValidWithId) {
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
		isAdminRoute,
	};
}

const initialGroupSessionFormValues = {
	title: '',
	urlName: '',
	groupSessionLocationTypeId: undefined as GroupSessionLocationTypeId | undefined,
	videoconferenceUrl: '',
	inPersonLocation: '',
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
	imageFileUploadId: '',
	description: '',
	groupSessionLearnMoreMethodId: GroupSessionLearnMoreMethodId.URL,
	learnMoreDescription: '',
	groupSessionCollectionId: '',
	groupSessionVisibilityTypeId: CONTENT_VISIBILITY_TYPE_ID.PUBLIC,
	collectionFlag: false,
	registrationEndDateFlag: false,
	registrationEndDate: null as Date | null,
	tagGroupIds: [] as string[],
	tags: [] as Tag[],
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
		registrationEndDateTime,
		followupTimeOfDay: formattedFollowupTimeOfDay,
		groupSessionCollectionId,
		...rest
	} = groupSession ?? ({} as GroupSessionModel);

	const startDate = moment(startDateTime);
	const endDate = moment(endDateTime);
	const followupTimeOfDay = formattedFollowupTimeOfDay
		? moment(formattedFollowupTimeOfDay, DateFormats.API.Time).format(DateFormats.UI.TimeSlotInput)
		: '';
	const registrationEndDateTimeMoment = registrationEndDateTime ? moment(registrationEndDateTime) : undefined;

	const mergedDateInputValues = {
		startDate: startDateTime ? startDate.toDate() : initialGroupSessionFormValues.startDate,
		startTime: startDateTime ? startDate.format(DateFormats.UI.TimeSlotInput) : '',
		endTime: endDateTime ? endDate.format(DateFormats.UI.TimeSlotInput) : '',
		endDate: endDateTime ? endDate.toDate() : initialGroupSessionFormValues.endDate,
		followupTimeOfDay: followupTimeOfDay,
		registrationEndDateFlag: !!registrationEndDateTimeMoment,
		registrationEndDate: registrationEndDateTimeMoment ? registrationEndDateTimeMoment.toDate() : undefined,
	};

	return Object.assign(
		{ ...initialGroupSessionFormValues },
		{
			...rest,
			screeningFlowId,
			tagGroupIds:
				groupSession?.tags
					.map((tag) => tag.tagGroupId)
					.filter((currentValue, index, arr) => arr.indexOf(currentValue) === index) ?? [],
			tags: groupSession?.tags ?? [],
			groupSessionCollectionId,
			collectionFlag: groupSessionCollectionId ? true : false,
			// keep initial values when duplicating an existing session
			...(isDuplicate
				? {
						title: '',
						urlName: '',
						startDate: initialGroupSessionFormValues.startDate,
						startTime: '',
						endDate: initialGroupSessionFormValues.endDate,
						endTime: '',
				  }
				: mergedDateInputValues),
		}
	);
}

export const Component = () => {
	const { institution } = useAccount();
	const loaderData = useAdminGroupSessionFormLoaderData();
	const navigate = useNavigate();
	const params = useParams<{ action: string; groupSessionId: string }>();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedTab = searchParams.get('tab') ?? 'details';

	const descriptionWysiwygRef = useRef<ReactQuill>(null);
	const reminderWysiwygRef = useRef<ReactQuill>(null);
	const followupWysiwygRef = useRef<ReactQuill>(null);
	const isPreview = params.action === 'preview';
	const isEdit = params.action === 'edit';
	const isDuplicate = params.action === 'duplicate';
	const isView = params.action === 'view';
	const isNotDraft =
		!isDuplicate &&
		!!loaderData?.groupSession &&
		loaderData?.groupSession?.groupSessionStatusId !== SESSION_STATUS.NEW;

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
	const [debouncedTitleQuery] = useDebouncedState(formValues.title);
	const [debouncedUrlNameQuery] = useDebouncedState(formValues.urlName);
	const [urlNameValidations, setUrlNameValidations] = useState<Record<string, GroupSessionUrlNameValidationResult>>(
		{}
	);

	const [selectedScreeningFlowForModal, setSelectedScreeningFlowForModal] = useState<ScreeningFlow>();

	const [showImageSitesModal, setShowImageSitesModal] = useState(false);
	const [showImageSelectionTipsModal, setShowImageSelectionTipsModal] = useState(false);

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

	const updateFormValue = useCallback((key: keyof typeof formValues, value: (typeof formValues)[typeof key]) => {
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

			setIsDirty(false);

			try {
				const tagGroupErrorMessage = getTagGroupErrorMessage(
					formValues.tagGroupIds,
					formValues.tags,
					loaderData?.tagGroups ?? []
				);
				if (tagGroupErrorMessage) {
					throw CobaltError.fromValidationFailed(tagGroupErrorMessage);
				}

				const response = isEdit
					? await groupSessionsService.updateGroupsession(params.groupSessionId!, submission).fetch()
					: await groupSessionsService.createGroupSession(submission).fetch();

				if (!loaderData?.isAdminRoute) {
					addFlag({
						variant: 'success',
						title: 'Submission Accepted',
						description: 'Your group session has been submitted for review.',
						actions: [],
					});

					navigate('/group-sessions');

					return;
				}

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
			} catch (error) {
				setIsDirty(true);
				handleError(error);
			}
		},
		[
			addFlag,
			formValues,
			handleError,
			isEdit,
			isExternal,
			isNotDraft,
			loaderData?.isAdminRoute,
			loaderData?.tagGroups,
			navigate,
			params.groupSessionId,
		]
	);

	useEffect(() => {
		if (isPreview) {
			window.scroll(0, 0);
		}
	}, [isPreview]);

	useEffect(() => {
		if (!debouncedTitleQuery || urlNameSetByUser) {
			return;
		}

		groupSessionsService
			.validateUrlName(debouncedTitleQuery, isDuplicate ? undefined : params.groupSessionId)
			.fetch()
			.then((response) => {
				setFormValues((previousValues) => ({
					...previousValues,
					urlName: response.groupSessionUrlNameValidationResult.recommendation,
				}));
			});
	}, [debouncedTitleQuery, isDuplicate, params.groupSessionId, urlNameSetByUser]);

	useEffect(() => {
		if (!debouncedUrlNameQuery) {
			return;
		}

		groupSessionsService
			.validateUrlName(debouncedUrlNameQuery, isDuplicate ? undefined : params.groupSessionId)
			.fetch()
			.then((response) => {
				setUrlNameValidations((validations) => {
					return {
						...validations,
						[debouncedUrlNameQuery]: response.groupSessionUrlNameValidationResult,
					};
				});
			});
	}, [debouncedUrlNameQuery, isDuplicate, params.groupSessionId]);

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

	const cancelSessionButton = !isDuplicate && isNotDraft && isSessionEditable && (
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
		<Container>
			<ConfirmDialog
				size="lg"
				show={navigationBlocker.state === 'blocked'}
				onHide={() => {
					navigationBlocker.reset?.();
				}}
				titleText={`Confirm Exit`}
				bodyText={`You have changes that have not been ${
					loaderData?.isAdminRoute ? 'saved or published' : 'submitted'
				}, are you sure you want to exit?`}
				dismissText="Cancel"
				confirmText="Exit"
				onConfirm={() => {
					navigationBlocker.proceed?.();
				}}
			/>

			<AdminFormSection
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
					disabled={isEdit && hasReservations}
					onChange={({ currentTarget }) => {
						updateFormValue('title', currentTarget.value);
					}}
				/>

				<InputHelper
					type="text"
					label="Friendly URL"
					name="urlName"
					error={
						urlNameValidations[debouncedUrlNameQuery]?.available === false ? (
							<>
								URL is in use. We suggest{' '}
								<Button
									size="sm"
									variant="link"
									className="p-0 d-inline-block"
									onClick={() => {
										updateFormValue(
											'urlName',
											urlNameValidations[debouncedUrlNameQuery].recommendation
										);
									}}
								>
									{urlNameValidations[debouncedUrlNameQuery].recommendation}
								</Button>{' '}
								instead.
							</>
						) : undefined
					}
					value={formValues.urlName}
					disabled={!formValues.title || (isEdit && hasReservations)}
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

				{!formValues.title || urlNameValidations[debouncedUrlNameQuery]?.available === false ? null : (
					<div className="d-flex mt-2">
						<InfoIcon className="me-2 text-p500 flex-shrink-0" width={20} height={20} />
						<p className="mb-0">
							URL will appear as https://{window.location.host}/group-sessions/
							<span className="fw-bold">{formValues.urlName}</span>
						</p>
					</div>
				)}
			</AdminFormSection>

			<hr />

			<AdminFormSection
				title="Location"
				description='Select "Online" for events hosted virtually through a video conferencing platform or "In person" for an event at a physical venue.'
			>
				<ToggledInput
					id="locationType-virtual"
					label="Online"
					checked={formValues.groupSessionLocationTypeId === GroupSessionLocationTypeId.VIRTUAL}
					hideChildren={
						isExternal || formValues.groupSessionLocationTypeId === GroupSessionLocationTypeId.IN_PERSON
					}
					onChange={({ currentTarget }) => {
						updateFormValue('groupSessionLocationTypeId', GroupSessionLocationTypeId.VIRTUAL);
					}}
				>
					<InputHelper
						className="mb-2"
						type="text"
						label="Video Link URL (Bluejeans/Zoom, etc.)"
						name="videoconferenceUrl"
						required
						disabled={isEdit && hasReservations}
						value={formValues.videoconferenceUrl}
						onChange={({ currentTarget }) => {
							updateFormValue('videoconferenceUrl', currentTarget.value);
						}}
					/>
					<p className="mb-0 text-muted">
						Include the URL to the Bluejeans/Zoom/etc. address where the session will be hosted.
					</p>
				</ToggledInput>

				<ToggledInput
					id="locationType-inPerson"
					className="mt-3"
					label="In person"
					hideChildren={
						isExternal || formValues.groupSessionLocationTypeId === GroupSessionLocationTypeId.VIRTUAL
					}
					onChange={({ currentTarget }) => {
						updateFormValue('groupSessionLocationTypeId', GroupSessionLocationTypeId.IN_PERSON);
					}}
					checked={formValues.groupSessionLocationTypeId === GroupSessionLocationTypeId.IN_PERSON}
				>
					<InputHelper
						type="text"
						label="Location"
						name="inPersonLocation"
						required
						value={formValues.inPersonLocation}
						onChange={({ currentTarget }) => {
							updateFormValue('inPersonLocation', currentTarget.value);
						}}
					/>
				</ToggledInput>
			</AdminFormSection>

			<hr />

			<AdminFormSection
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
			</AdminFormSection>

			<hr />

			<AdminFormSection
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
			</AdminFormSection>

			<hr />

			<AdminFormSection
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
			</AdminFormSection>

			<hr />

			<AdminFormSection
				title="Registration End Date (optional)"
				description="Set an end date for registration. Users will not be able to register for the event after this date."
			>
				<ToggledInput
					type="switch"
					id="registration-end-date"
					label="Set registration end date"
					checked={formValues.registrationEndDateFlag}
					onChange={({ currentTarget }) => {
						updateFormValue('registrationEndDateFlag', currentTarget.checked);
					}}
				>
					<DatePicker
						className="w-100 mb-2"
						labelText="Expiration Date"
						selected={formValues.registrationEndDate ?? undefined}
						onChange={(date) => {
							updateFormValue('registrationEndDate', date);
						}}
						minDate={new Date()}
					/>
					<p className="mb-0 text-muted">Registration will end at 11:59pm on the date selected.</p>
				</ToggledInput>
			</AdminFormSection>

			<hr />

			<AdminFormSection
				title="Image"
				description={
					<>
						<ConfirmDialog
							size="lg"
							show={showImageSitesModal}
							onHide={() => {
								setShowImageSitesModal(false);
							}}
							titleText="Image Sites"
							bodyText="Websites with images that are free to use:"
							detailText={
								<ul className="mt-4 list-unstyled">
									<li>
										<a href="https://unsplash.com/" target="_blank" rel="noreferrer">
											unsplash.com
										</a>
									</li>
									<li>
										<a href="https://www.pexels.com/" target="_blank" rel="noreferrer">
											pexels.com
										</a>
									</li>
								</ul>
							}
							dismissText="Cancel"
							showDissmissButton={false}
							confirmText="Done"
							onConfirm={() => {
								setShowImageSitesModal(false);
							}}
						/>
						<ConfirmDialog
							size="lg"
							show={showImageSelectionTipsModal}
							onHide={() => {
								setShowImageSelectionTipsModal(false);
							}}
							titleText="Image Selection Tips"
							bodyText="Please follow these guidelines when choose an image:"
							detailText={
								<div className="mt-4">
									<h6 className="text-gray text-uppercase fw-normal">Good Images</h6>
									<ul className="mb-4">
										<li>Have a warm, bold color palette</li>
										<li>
											Feature either a person's face, a calming piece of art, or an abstract image
											of nature
										</li>
										<li>Are at least 800x450 pixels in size</li>
										<li>Can be cropped to different sizes without losing important details</li>
									</ul>
									<h6 className="text-gray text-uppercase fw-normal">Inappropriate Images</h6>
									<ul>
										<li>Depict scenes of low mood, anxiety, or other distress</li>
										<li>Include clichés</li>
										<li>Are smaller than 800x450 pixels</li>
									</ul>
								</div>
							}
							dismissText="Cancel"
							showDissmissButton={false}
							confirmText="Done"
							onConfirm={() => {
								setShowImageSelectionTipsModal(false);
							}}
						/>
						<p className="mb-4">
							Add an image that represents the subject matter of your post.
							<br />
							Your image should be at least 800x450px. It will be cropped to a 16:9 ratio.
						</p>
						<Button
							type="button"
							variant="link"
							className="mb-2 p-0 d-flex text-decoration-none"
							onClick={() => {
								setShowImageSitesModal(true);
							}}
						>
							<QuestionMarkIcon className="me-2 text-p500 flex-shrink-0" width={20} height={20} />
							<p className="mb-0 fw-semibold">Where can I find images?</p>
						</Button>
						<Button
							type="button"
							variant="link"
							className="p-0 d-flex text-decoration-none"
							onClick={() => {
								setShowImageSelectionTipsModal(true);
							}}
						>
							<QuestionMarkIcon className="me-2 text-p500 flex-shrink-0" width={20} height={20} />
							<p className="mb-0 fw-semibold">How do I choose an appropriate image?</p>
						</Button>
					</>
				}
			>
				<AdminFormImageInput
					imageSrc={formValues.imageUrl}
					onSrcChange={(nextId, nextSrc) => {
						updateFormValue('imageFileUploadId', nextId);
						updateFormValue('imageUrl', nextSrc);
					}}
					presignedUploadGetter={(blob, name) => {
						return groupSessionsService.getPresignedUploadUrl({
							contentType: blob.type,
							filename: name,
						}).fetch;
					}}
				/>
				<div className="d-flex mt-2">
					<InfoIcon className="me-2 text-p500 flex-shrink-0" width={20} height={20} />
					<p className="mb-0">A placeholder will be assigned if no image is uploaded.</p>
				</div>
			</AdminFormSection>

			<hr />

			<AdminFormSection
				title="Description"
				description="Describe what your group session is about, who it is for, and any special requirements for participating. Your description should tell potential attendees everything they need to know to make a decision about joining."
			>
				<WysiwygBasic
					ref={descriptionWysiwygRef}
					className="bg-white"
					value={formValues.description}
					onChange={(nextValue) => {
						updateFormValue('description', nextValue);
					}}
				/>
			</AdminFormSection>

			{isExternal && (
				<>
					<hr />

					<AdminFormSection
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
					</AdminFormSection>
				</>
			)}

			<hr />

			<AdminFormSection
				title="Tags"
				description="Tags are used to determine which resources are shown first to a user depending on how they answered the initial assessment questions. If no tags are selected, then the resource will be de-prioritized and appear lower in a user’s list of resources."
			>
				{(loaderData?.tagGroups ?? [])
					.filter((tagGroup) => !tagGroup.deprecated)
					.map((tagGroup) => {
						return (
							<ToggledInput
								key={tagGroup.tagGroupId}
								type="checkbox"
								name="tag-group"
								id={`tag-group-${tagGroup.tagGroupId}`}
								value={tagGroup.tagGroupId}
								label={tagGroup.name}
								checked={formValues.tagGroupIds.includes(tagGroup.tagGroupId)}
								onChange={() => {
									if (formValues.tagGroupIds.includes(tagGroup.tagGroupId)) {
										updateFormValue(
											'tagGroupIds',
											formValues.tagGroupIds.filter((v) => v !== tagGroup.tagGroupId)
										);
									} else {
										updateFormValue('tagGroupIds', [
											...formValues.tagGroupIds,
											tagGroup.tagGroupId,
										]);
									}
								}}
								className="mb-3"
							>
								{(tagGroup.tags ?? [])
									.filter((tag) => !tag.deprecated)
									.map((tag) => (
										<Form.Check
											key={tag.tagId}
											type="checkbox"
											name="tag"
											id={`tag-${tag.tagId}`}
											value={tag.tagId}
											label={tag.name}
											checked={!!formValues.tags.find((t) => t.tagId === tag.tagId)}
											onChange={() => {
												if (!!formValues.tags.find((t) => t.tagId === tag.tagId)) {
													updateFormValue(
														'tags',
														formValues.tags.filter((t) => t.tagId !== tag.tagId)
													);
												} else {
													updateFormValue('tags', [...formValues.tags, tag]);
												}
											}}
										/>
									))}
							</ToggledInput>
						);
					})}
			</AdminFormSection>

			<hr />

			<AdminFormSection
				title="Visibility"
				description={
					<>
						<p className="mb-2">
							Public group sessions are visible in multiple areas on Cobalt. This is the recommended
							setting for most group sessions.
						</p>
						<p className="mb-0">
							Unlisted group sessions are not visible on Cobalt and are only accessible to users who have
							a direct link.
						</p>
					</>
				}
			>
				<ToggledInput
					type="radio"
					id="visibility-on"
					name="visibility"
					label="Public"
					hideChildren
					className="mb-3"
					checked={formValues.groupSessionVisibilityTypeId === CONTENT_VISIBILITY_TYPE_ID.PUBLIC}
					onChange={() => {
						updateFormValue('groupSessionVisibilityTypeId', CONTENT_VISIBILITY_TYPE_ID.PUBLIC);
					}}
				/>
				<ToggledInput
					type="radio"
					id="visibility-off"
					name="visibility"
					label="Unlisted"
					hideChildren
					checked={formValues.groupSessionVisibilityTypeId === CONTENT_VISIBILITY_TYPE_ID.UNLISTED}
					onChange={() => {
						updateFormValue('groupSessionVisibilityTypeId', CONTENT_VISIBILITY_TYPE_ID.UNLISTED);
					}}
				/>
			</AdminFormSection>

			<hr />

			<AdminFormSection
				title="Collection (optional)"
				description={
					<p className="mb-0">Select a collection to group this session with other similar sessions.</p>
				}
			>
				<ToggledInput
					type="switch"
					id="collection"
					label="Add to collection"
					checked={formValues.collectionFlag}
					onChange={({ currentTarget }) => {
						updateFormValue('collectionFlag', currentTarget.checked);
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
						<option value="">Select collection</option>
						{loaderData.groupSessionCollections.map((groupSessionCollection) => {
							return (
								<option
									key={groupSessionCollection.groupSessionCollectionId}
									value={groupSessionCollection.groupSessionCollectionId}
								>
									{groupSessionCollection.title}
								</option>
							);
						})}
					</InputHelper>
				</ToggledInput>
			</AdminFormSection>

			{!isExternal && (
				<>
					{loaderData?.screeningFlows.length > 1 && (
						<>
							<hr />
							<AdminFormSection
								title="Screening Questions"
								description={
									<>
										<p className="mb-2">
											You may restrict a group session to certain audiences by selecting a set of
											pre-defined screening questions.
										</p>

										<p>
											Attendees must answer “Yes” to all screening questions in a set to reserve a
											seat.
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
										formValues.screeningFlowId ===
										institution.groupSessionDefaultIntakeScreeningFlowId
									}
									disabled={isEdit && hasReservations}
									onChange={() => {
										updateFormValue(
											'screeningFlowId',
											institution.groupSessionDefaultIntakeScreeningFlowId
										);
									}}
								/>

								{(loaderData?.screeningFlows ?? [])
									.filter(
										(flow) =>
											flow.screeningFlowId !==
											institution.groupSessionDefaultIntakeScreeningFlowId
									)
									.map((screeningFlow) => {
										return (
											<ToggledInput
												key={screeningFlow.screeningFlowId}
												id={screeningFlow.screeningFlowId}
												label={screeningFlow.name}
												className="mb-3"
												hideChildren
												disabled={isEdit && hasReservations}
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
							</AdminFormSection>
						</>
					)}

					<hr />

					<AdminFormSection
						title="Confirmation Email (optional)"
						description="This text will be added to the default confirmation email we send to anyone who reserves a seat for this group session."
					>
						<WysiwygBasic
							className="bg-white"
							value={formValues.confirmationEmailContent}
							onChange={(nextValue) => {
								updateFormValue('confirmationEmailContent', nextValue);
							}}
						/>
					</AdminFormSection>

					<hr />

					<AdminFormSection title="Other Emails (Optional)">
						<ToggledInput
							type="switch"
							id="send-reminder-email"
							className="mb-3"
							label={
								<div>
									<p className="mb-0">Send Reminder Email</p>
									<p className="fs-small text-muted mb-0">
										Sent shortly before the start of the session
									</p>
								</div>
							}
							checked={formValues.sendReminderEmail}
							onChange={({ currentTarget }) => {
								updateFormValue('sendReminderEmail', currentTarget.checked);
							}}
						>
							<WysiwygBasic
								ref={reminderWysiwygRef}
								className="bg-white"
								value={formValues.reminderEmailContent}
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

							<WysiwygBasic
								ref={followupWysiwygRef}
								className="mb-3 bg-white"
								value={formValues.followupEmailContent}
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
					</AdminFormSection>
				</>
			)}
		</Container>
	);

	const details = isPreview || isView ? <GroupSession groupSession={loaderData?.groupSession!} /> : formFields;

	const footer = (
		<>
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

			<AdminFormFooter
				exitButtonType={!loaderData.isAdminRoute || isPreview || isNotDraft ? 'button' : 'submit'}
				onExit={() => {
					if (loaderData.isAdminRoute) {
						if (isPreview) {
							navigate(`/admin/group-sessions/edit/${params.groupSessionId}`);
						} else if (isNotDraft) {
							navigate(`/admin/group-sessions`);
						}
					} else {
						navigate('/group-sessions');
					}
				}}
				exitLabel={
					loaderData.isAdminRoute ? (
						<>
							{isPreview ? (
								<>
									<LeftChevron /> Back to Edit
								</>
							) : isNotDraft ? (
								'Exit Editor'
							) : (
								'Save & Exit'
							)}
						</>
					) : (
						'Exit'
					)
				}
				extraAction={cancelSessionButton}
				nextButtonType={isPreview ? 'button' : 'submit'}
				onNext={() => {
					if (!isPreview) {
						return;
					}

					setShowConfirmPublishDialog(true);
				}}
				nextLabel={
					loaderData.isAdminRoute ? (
						<>
							{isPreview ? (
								'Publish'
							) : (
								<>
									{isNotDraft ? 'Publish Changes' : 'Next: Preview'} <RightChevron />
								</>
							)}
						</>
					) : (
						'Submit'
					)
				}
			/>
		</>
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
		return (
			<div className="pb-11">
				{confirmPublishDialog}

				{details}

				{footer}
			</div>
		);
	}

	const pageTitle = (
		<Container fluid className="border-bottom">
			<Container className="py-10">
				<Row>
					<Col>
						<div className="d-flex align-items-center justify-content-between">
							<h2 className="mb-1">
								{isEdit ? 'Edit' : isView ? 'View' : 'Add'} {isExternal ? 'External' : 'Cobalt'} Group
								Session
							</h2>
							{isView && isSessionEditable && (
								<div>
									<ButtonLink
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

						{!isView && (
							<p className="mb-0 fs-large">
								Complete all <span className="text-danger">*required fields</span> before publishing.
								Published group sessions will appear on the{' '}
								<Link className="fw-normal" to="/group-sessions" target="_blank">
									Group Sessions
								</Link>{' '}
								page of Cobalt.
							</p>
						)}
					</Col>
				</Row>
			</Container>
		</Container>
	);

	if (isView && !isExternal) {
		let countLabel = '';
		const showCount = !!loaderData.groupSession;

		if (showCount) {
			countLabel = ` (${loaderData?.groupSession?.seatsReserved ?? 0})`;
		}

		return (
			<>
				{pageTitle}

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
									title: `Registrants${countLabel}`,
								},
							]}
							onTabClick={(value) => {
								searchParams.set('tab', value);
								setSearchParams(searchParams);
							}}
						/>
						<Tab.Content>
							<Tab.Pane eventKey="details">{details}</Tab.Pane>
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
			</>
		);
	} else if (isView) {
		return (
			<>
				{pageTitle}

				{details}
			</>
		);
	}

	return (
		<>
			{pageTitle}

			<Form
				className="pb-11"
				onSubmit={(event) => {
					event.preventDefault();

					// validate description wysiwyg
					if (!wysiwygIsValid(descriptionWysiwygRef, { shouldFocus: true, shouldScroll: true })) {
						return;
					}

					// validate reminder email wysiwyg
					if (
						formValues.sendReminderEmail &&
						!wysiwygIsValid(reminderWysiwygRef, { shouldFocus: true, shouldScroll: true })
					) {
						return;
					}

					// validate followup email wysiwyg
					if (
						formValues.sendFollowupEmail &&
						!wysiwygIsValid(followupWysiwygRef, { shouldFocus: true, shouldScroll: true })
					) {
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

				{details}

				{footer}
			</Form>
		</>
	);
};

function prepareGroupSessionSubmission(
	formValues: Partial<typeof initialGroupSessionFormValues>,
	isExternal: boolean
): CreateGroupSessionRequestBody {
	const {
		startDate,
		endDate,
		startTime,
		endTime,
		registrationEndDateFlag,
		registrationEndDate,
		tagGroupIds,
		tags,
		...groupSessionSubmission
	} = formValues;

	let startDateTime = moment(
		`${startDate?.toISOString().split('T')[0]} ${startTime}`,
		`${DateFormats.API.Date} ${DateFormats.UI.TimeSlotInput}`
	).format(DateFormats.API.DateTime);

	let endDateTime = moment(
		`${startDate?.toISOString().split('T')[0]} ${endTime}`,
		`${DateFormats.API.Date} ${DateFormats.UI.TimeSlotInput}`
	).format(DateFormats.API.DateTime);

	if (isExternal) {
		delete groupSessionSubmission.videoconferenceUrl;
		delete groupSessionSubmission.inPersonLocation;
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
			startDateTime = moment(startDate).startOf('day').format(DateFormats.API.DateTime);

			endDateTime = moment(endDate).startOf('day').format(DateFormats.API.DateTime);
		}
	} else {
		delete groupSessionSubmission.groupSessionLearnMoreMethodId;
		delete groupSessionSubmission.learnMoreDescription;

		delete groupSessionSubmission.singleSessionFlag;
		delete groupSessionSubmission.dateTimeDescription;

		if (
			!groupSessionSubmission.differentEmailAddressForNotifications ||
			!groupSessionSubmission.targetEmailAddress
		) {
			delete groupSessionSubmission.targetEmailAddress;
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
			groupSessionSubmission.followupTimeOfDay = moment(
				groupSessionSubmission.followupTimeOfDay,
				DateFormats.UI.TimeSlotInput
			).format(DateFormats.API.Time);
		}
	}

	if (!groupSessionSubmission.collectionFlag) {
		delete groupSessionSubmission.groupSessionCollectionId;
	}

	if (!groupSessionSubmission.groupSessionCollectionId) {
		delete groupSessionSubmission.groupSessionCollectionId;
	}

	if (!groupSessionSubmission.imageUrl) {
		delete groupSessionSubmission.imageUrl;
	}
	if (!groupSessionSubmission.imageFileUploadId) {
		delete groupSessionSubmission.imageFileUploadId;
	}

	if (groupSessionSubmission.groupSessionLocationTypeId === GroupSessionLocationTypeId.VIRTUAL) {
		delete groupSessionSubmission.inPersonLocation;
	} else if (groupSessionSubmission.groupSessionLocationTypeId === GroupSessionLocationTypeId.IN_PERSON) {
		delete groupSessionSubmission.videoconferenceUrl;
	}

	return {
		startDateTime,
		endDateTime,
		groupSessionSchedulingSystemId: isExternal
			? GroupSessionSchedulingSystemId.EXTERNAL
			: GroupSessionSchedulingSystemId.COBALT,
		...(registrationEndDateFlag &&
			registrationEndDate && {
				registrationEndDateTime: `${moment(registrationEndDate).format(DateFormats.API.Date)}T23:59`,
			}),
		tagIds:
			(tags ?? []).filter((tag) => (tagGroupIds ?? []).includes(tag.tagGroupId)).map((tag) => tag.tagId) ?? [],
		...groupSessionSubmission,
	};
}
