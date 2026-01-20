import moment from 'moment';
import React, { useCallback, useRef, useState } from 'react';
import {
	LoaderFunctionArgs,
	unstable_useBlocker as useBlocker,
	useNavigate,
	useParams,
	useRouteLoaderData,
} from 'react-router-dom';
import { Button, Col, Container, Form, Modal, Offcanvas, Row } from 'react-bootstrap';

import {
	AdminContent,
	AdminContentAction,
	Content,
	CONTENT_VISIBILITY_TYPE_ID,
	ContentAudienceType,
	ContentStatusId,
	ContentType,
	ContentTypeId,
	Tag,
} from '@/lib/models';
import {
	AdminContentResponse,
	CreateContentRequest,
	adminService,
	contentService,
	resourceLibraryService,
	tagService,
} from '@/lib/services';
import { DateFormats } from '@/lib/utils';

import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';

import {
	ADMIN_HEADER_HEIGHT,
	ADMIN_RESOURCE_FORM_FOOTER_SUBMIT_ACTION,
	AdminFormImageInput,
	AdminFormNonImageFileInput,
	AdminFormSection,
	AdminResourceFormFooter,
	AdminResourceFormFooterExternal,
} from '@/components/admin';
import ConfirmDialog from '@/components/confirm-dialog';
import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import ResourceDisplay from '@/components/resource-display';
import ToggledInput from '@/components/toggled-input';

import NoMatch from '@/pages/no-match';
import { createUseThemedStyles } from '@/jss/theme';
import { getTagGroupErrorMessage } from '@/lib/utils/error-utils';
import { CobaltError } from '@/lib/http-client';
import WysiwygBasic, { wysiwygIsValid } from '@/components/wysiwyg-basic';
import ReactQuill from 'react-quill-new';
import SvgIcon from '@/components/svg-icon';

const useStyles = createUseThemedStyles((theme) => ({
	offCanvas: {
		zIndex: '1 !important',
		border: '0 !important',
		boxShadow: theme.elevation.e400,
		backgroundColor: theme.colors.background,
		height: `calc(100vh - ${ADMIN_HEADER_HEIGHT}px) !important`,
		'& .cobalt-modal__body': {
			padding: 0,
		},
	},
}));

type AdminResourceFormLoaderData = Awaited<ReturnType<typeof loader>>;

export function useAdminResourceFormLoaderData() {
	return useRouteLoaderData('admin-resource-form') as AdminResourceFormLoaderData;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const action = params.action;
	const contentId = params.contentId;
	const url = new URL(request.url);
	const startOnPreview = (url.searchParams.get('startOnPreview') ?? '') === 'true';

	const supportedActions = ['add', 'edit', 'preview'];

	// can add/edit
	// admins can also edit them
	const isSupportedAction = !!action && supportedActions.includes(action);
	// add, must not have a content id.
	const isValidNoId = isSupportedAction && ['add'].includes(action) && !contentId;
	// edit, must have a content id.
	const isValidWithId = isSupportedAction && ['edit', 'preview'].includes(action) && !!contentId;

	if (!isValidNoId && !isValidWithId) {
		return null; // page renders a "404" in this case
	}

	const contentRequest = contentId ? adminService.fetchAdminContent(contentId) : null;
	const tagGroupsRequest = tagService.getTagGroups();
	const contentTypesRequest = resourceLibraryService.getResourceLibraryContentTypes();
	const contentAudienceTypesRequest = contentService.fetchContentAudienceTypes();

	request.signal.addEventListener('abort', () => {
		contentRequest?.abort();
		tagGroupsRequest.abort();
		contentTypesRequest.abort();
		contentAudienceTypesRequest.abort();
	});

	const [contentResponse, tagGroupsResponse, contentTypesResponse, contentAudienceTypesResponse] = await Promise.all([
		contentRequest?.fetch(),
		tagGroupsRequest.fetch(),
		contentTypesRequest.fetch(),
		contentAudienceTypesRequest.fetch(),
	]);

	return {
		contentResponse,
		tagGroups: tagGroupsResponse.tagGroups,
		contentTypes: contentTypesResponse.contentTypes,
		contentAudienceTypeGroups: contentAudienceTypesResponse.contentAudienceTypeGroups,
		contentAudienceTypes: contentAudienceTypesResponse.contentAudienceTypes,
		startOnPreview,
	};
}

enum RESOURCE_TYPE {
	URL = 'URL',
	FILE = 'FILE',
}

const initialResourceFormValues = {
	title: '',
	author: '',
	contentTypeId: '',
	contentStatusId: ContentStatusId.DRAFT,
	durationInMinutes: '',
	resourceType: RESOURCE_TYPE.URL as RESOURCE_TYPE,
	resourceUrl: '',
	resourceFileName: '',
	resourceFileSize: 0,
	resourceFileUploadId: '',
	resourceFileUrl: '',
	isShared: true,
	imageFileId: '',
	imageUrl: '',
	description: '',
	contentAudienceTypeGroupIds: [] as string[],
	contentAudienceTypes: [] as ContentAudienceType[],
	tagGroupIds: [] as string[],
	tags: [] as Tag[],
	searchTerms: '',
	publishDate: new Date(),
	doesExpire: false,
	expirationDate: null as Date | null,
	isRecurring: false,
	neverEmbed: false,
	contentVisibilityTypeId: CONTENT_VISIBILITY_TYPE_ID.PUBLIC,
};

function getInitialResourceFormValues({
	adminContent,
}: {
	adminContent?: AdminContent | null;
}): typeof initialResourceFormValues {
	return {
		title: adminContent?.title ?? '',
		author: adminContent?.author ?? '',
		contentTypeId: adminContent?.contentTypeId ?? '',
		contentStatusId: adminContent?.contentStatusId ?? ContentStatusId.DRAFT,
		durationInMinutes: adminContent?.durationInMinutes ? String(adminContent?.durationInMinutes) : '',
		resourceType: adminContent?.fileUploadId ? RESOURCE_TYPE.FILE : RESOURCE_TYPE.URL,
		resourceUrl: !adminContent?.fileUploadId ? (adminContent?.url ?? '') : '',
		resourceFileName: adminContent?.filename ?? '',
		resourceFileSize: adminContent?.filesize ?? 0,
		resourceFileUploadId: adminContent?.fileUploadId ?? '',
		resourceFileUrl: adminContent?.fileUploadId ? adminContent?.url : '',
		isShared: adminContent?.sharedFlag !== undefined ? adminContent?.sharedFlag : true,
		imageFileId: adminContent?.imageFileUploadId ?? '',
		imageUrl: adminContent?.imageUrl ?? '',
		description: adminContent?.description ?? '',
		contentAudienceTypeGroupIds:
			adminContent?.contentAudienceTypes
				.map((cat) => cat.contentAudienceTypeGroupId)
				.filter((currentValue, index, arr) => arr.indexOf(currentValue) === index) ?? [],
		contentAudienceTypes: adminContent?.contentAudienceTypes ?? [],
		tagGroupIds:
			adminContent?.tags
				.map((tag) => tag.tagGroupId)
				.filter((currentValue, index, arr) => arr.indexOf(currentValue) === index) ?? [],
		tags: adminContent?.tags ?? [],
		searchTerms: adminContent?.searchTerms ?? '',
		publishDate: adminContent?.publishStartDate ? moment(adminContent.publishStartDate).toDate() : new Date(),
		doesExpire: !!adminContent?.publishEndDate,
		expirationDate: adminContent?.publishEndDate ? moment(adminContent.publishEndDate).toDate() : null,
		isRecurring: adminContent?.publishRecurring ?? false,
		neverEmbed: adminContent?.neverEmbed ?? false,
		contentVisibilityTypeId: adminContent?.contentVisibilityTypeId ?? CONTENT_VISIBILITY_TYPE_ID.PUBLIC,
	};
}

export const Component = () => {
	const classes = useStyles();
	const loaderData = useAdminResourceFormLoaderData();
	const navigate = useNavigate();
	const params = useParams<{ action: string; contentId: string }>();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const descriptionWysiwygRef = useRef<ReactQuill>(null);

	const isAdd = params.action === 'add';
	const isEdit = params.action === 'edit';
	const isPreview = params.action === 'preview';
	const isDraft =
		!loaderData?.contentResponse?.content?.contentStatusId ||
		loaderData?.contentResponse?.content?.contentStatusId === ContentStatusId.DRAFT;
	const isExpired = loaderData?.contentResponse?.content?.contentStatusId === ContentStatusId.EXPIRED;

	const [formValues, setFormValues] = useState(
		getInitialResourceFormValues({
			adminContent: loaderData?.contentResponse?.content,
		})
	);

	const [showPreviewModal, setShowPreviewModal] = useState(loaderData?.startOnPreview ?? false);
	const [showConfirmPublishDialog, setShowConfirmPublishDialog] = useState(false);
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showRemoveDialog, setShowRemoveDialog] = useState(false);
	const [showImageSitesModal, setShowImageSitesModal] = useState(false);
	const [showImageSelectionTipsModal, setShowImageSelectionTipsModal] = useState(false);

	const [isDirty, setIsDirty] = useState(false);
	const navigationBlocker = useBlocker(({ currentLocation, nextLocation }) => {
		// ignore changes in `search`
		const navigatingAway = currentLocation.pathname !== nextLocation.pathname;
		return navigatingAway && isDirty;
	});

	const updateFormValue = useCallback((key: keyof typeof formValues, value: (typeof formValues)[typeof key]) => {
		setIsDirty(true);
		setFormValues((previousValue) => {
			return {
				...previousValue,
				[key]: value,
			};
		});
	}, []);

	const updateOrCreateContent = useCallback(
		(showFlag?: boolean) => {
			const submission = prepareResourceSubmission(formValues);

			const tagGroupErrorMessage = getTagGroupErrorMessage(
				formValues.tagGroupIds,
				formValues.tags,
				loaderData?.tagGroups ?? []
			);

			return new Promise(async (resolve: (response: AdminContentResponse) => void, reject) => {
				if (isEdit) {
					try {
						if (tagGroupErrorMessage) {
							throw CobaltError.fromValidationFailed(tagGroupErrorMessage);
						}

						if (!params.contentId) {
							throw new Error('params.contentId is undefined.');
						}

						const response = await adminService.updateContent(params.contentId, submission).fetch();

						if (showFlag) {
							addFlag({
								variant: 'success',
								title: 'Resource Updated',
								actions: [],
							});
						}

						setIsDirty(false);
						resolve(response);
					} catch (error) {
						reject(error);
					}

					return;
				}

				try {
					if (tagGroupErrorMessage) {
						throw CobaltError.fromValidationFailed(tagGroupErrorMessage);
					}

					const response = await adminService.createContent(submission).fetch();

					if (showFlag) {
						addFlag({
							variant: 'success',
							title: 'Resource Created',
							actions: [],
						});
					}

					setIsDirty(false);
					resolve(response);
				} catch (error) {
					reject(error);
				}
			});
		},
		[addFlag, formValues, isEdit, loaderData?.tagGroups, params.contentId]
	);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (!wysiwygIsValid(descriptionWysiwygRef, { shouldFocus: true, shouldScroll: true })) {
				return;
			}

			const { value } = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
			const isScheduled = moment(formValues.publishDate).isAfter(moment());

			if (value === ADMIN_RESOURCE_FORM_FOOTER_SUBMIT_ACTION.PUBLISH) {
				if (isScheduled) {
					await updateOrCreateContent(true);
					navigate(-1);
				} else {
					setShowConfirmPublishDialog(true);
				}
			} else if (value === ADMIN_RESOURCE_FORM_FOOTER_SUBMIT_ACTION.DRAFT) {
				try {
					await updateOrCreateContent(true);
					navigate(-1);
				} catch (error) {
					handleError(error);
				}
			} else {
				return;
			}
		},
		[formValues.publishDate, handleError, navigate, updateOrCreateContent]
	);

	const handlePublishModalConfirm = useCallback(async () => {
		try {
			const { adminContent } = await updateOrCreateContent(false);

			if (!adminContent) {
				throw new Error('content is undefined.');
			}

			const response = await adminService.publishContent(adminContent.contentId).fetch();

			addFlag({
				variant: 'success',
				title: 'Resource Published',
				description: 'Your resource is now available on Cobalt',
				actions: [
					{
						title: 'View Resource',
						onClick: () => {
							if (!response.content) {
								return;
							}

							window.open(
								`/resource-library/${response.content?.contentId}`,
								'_blank',
								'noopener, noreferrer'
							);
						},
					},
				],
			});

			navigate(-1);
		} catch (error) {
			handleError(error);
		}
	}, [addFlag, handleError, navigate, updateOrCreateContent]);

	const handleAdd = useCallback(async () => {
		try {
			const contentId = loaderData?.contentResponse?.content?.contentId;

			if (!contentId) {
				throw new Error('contentId is undefined.');
			}

			const response = await adminService.addContent(contentId).fetch();
			addFlag({
				variant: 'success',
				title: 'Resource added',
				description: `${response.content?.title} is now available on Cobalt`,
				actions: [],
			});

			navigate(-1);
		} catch (error) {
			handleError(error);
		}
	}, [addFlag, handleError, loaderData, navigate]);

	const handleRemove = useCallback(async () => {
		try {
			const contentId = loaderData?.contentResponse?.content?.contentId;

			if (!contentId) {
				throw new Error('contentId is undefined.');
			}

			const response = await adminService.removeContent(contentId).fetch();
			addFlag({
				variant: 'success',
				title: 'Resource removed',
				description: `${response.content?.title} is no longer available on Cobalt`,
				actions: [],
			});

			navigate(-1);
		} catch (error) {
			handleError(error);
		}
	}, [addFlag, handleError, loaderData, navigate]);

	/* --------------------------------------------------------*/
	/* If loader failed */
	/* --------------------------------------------------------*/
	if (loaderData === null) {
		return <NoMatch />;
	}

	/* --------------------------------------------------------*/
	/* Preview view for content from external institutions */
	/* --------------------------------------------------------*/
	if (isPreview) {
		const canRemove = !!loaderData.contentResponse?.content?.actions.includes(AdminContentAction.REMOVE);

		return (
			<>
				<ConfirmDialog
					size="lg"
					show={showAddDialog}
					onHide={() => {
						setShowAddDialog(false);
					}}
					titleText="Add Resource"
					bodyText="Are you ready to add this resource to Cobalt?"
					detailText="The resource will be added to your Resource Library immediately."
					dismissText="Cancel"
					confirmText="Add"
					onConfirm={handleAdd}
				/>

				<ConfirmDialog
					size="lg"
					show={showRemoveDialog}
					onHide={() => {
						setShowRemoveDialog(false);
					}}
					titleText="Remove Resource"
					bodyText={`Are you sure you want to remove ${loaderData?.contentResponse?.content?.title}?`}
					detailText="This resource will be removed from your Resource Library."
					dismissText="Cancel"
					confirmText="Remove"
					onConfirm={handleRemove}
					destructive
				/>

				<ResourceDisplay
					trackView={false}
					content={mutateFormValuesToContentPreview(
						formValues,
						loaderData.contentTypes,
						loaderData.contentResponse
					)}
					className="pb-40"
				/>
				<AdminResourceFormFooterExternal
					onClosePreview={() => {
						navigate(-1);
					}}
					showRemove={canRemove}
					onRemove={() => {
						setShowRemoveDialog(true);
					}}
					onAdd={() => {
						setShowAddDialog(true);
					}}
				/>
			</>
		);
	}

	/* --------------------------------------------------------*/
	/* Edit view for content from internal institutions */
	/* --------------------------------------------------------*/
	return (
		<>
			<ConfirmDialog
				size="lg"
				show={showConfirmPublishDialog}
				onHide={() => {
					setShowConfirmPublishDialog(false);
				}}
				titleText={isEdit ? 'Update Resource' : 'Publish Resource'}
				bodyText={
					isEdit
						? `Do you want to update "${formValues.title}" on Cobalt?`
						: `Are you ready to publish "${formValues.title}" to Cobalt?`
				}
				detailText={
					isEdit
						? 'Any changes will be published immediately'
						: `This resource will become live on the Cobalt Resource Library on ${moment(
								formValues.publishDate
							).format('MM/DD/YY')}.`
				}
				dismissText="Cancel"
				confirmText={isEdit ? 'Update' : 'Publish Resource'}
				onConfirm={handlePublishModalConfirm}
			/>

			<Offcanvas
				backdrop={false}
				className={classes.offCanvas}
				placement="bottom"
				show={showPreviewModal}
				onHide={() => {
					setShowPreviewModal(false);
				}}
			>
				<Modal.Body>
					<ResourceDisplay
						trackView={false}
						content={mutateFormValuesToContentPreview(
							formValues,
							loaderData.contentTypes,
							loaderData.contentResponse
						)}
						className="pb-40"
					/>
				</Modal.Body>
			</Offcanvas>

			<Container fluid className="border-bottom">
				<Container className="py-10">
					<Row>
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h2 className="mb-1">{isEdit ? 'Edit' : 'Add'} Resource</h2>
							</div>
							<p className="mb-0 fs-large">
								Complete all <span className="text-danger">*required fields</span> before publishing.
							</p>
						</Col>
					</Row>
				</Container>
			</Container>

			<Form className="pb-11" onSubmit={handleFormSubmit}>
				<Container className="pb-10">
					<ConfirmDialog
						size="lg"
						show={navigationBlocker.state === 'blocked'}
						onHide={() => {
							navigationBlocker.reset?.();
						}}
						titleText="Confirm Exit"
						bodyText="You have changes that have not been saved or published, are you sure you want to exit?"
						dismissText="Cancel"
						confirmText="Exit"
						onConfirm={() => {
							navigationBlocker.proceed?.();
						}}
					/>

					<AdminFormSection
						title="Basic Info"
						description="These details are required for making your resource accessible and reader-friendly."
					>
						<InputHelper
							className="mb-3"
							label="Title"
							required
							name="title"
							value={formValues.title}
							onChange={({ currentTarget }) => {
								updateFormValue('title', currentTarget.value);
							}}
						/>

						<InputHelper
							className="mb-3"
							label="Author"
							required
							name="author"
							value={formValues.author}
							onChange={({ currentTarget }) => {
								updateFormValue('author', currentTarget.value);
							}}
						/>

						<InputHelper
							className="mb-3"
							as="select"
							label="Content Type"
							required
							name="contentTypeId"
							value={formValues.contentTypeId}
							onChange={({ currentTarget }) => {
								updateFormValue('contentTypeId', currentTarget.value);
							}}
						>
							<option value="">Content Type</option>
							{loaderData.contentTypes.map((contentType) => {
								return (
									<option key={contentType.contentTypeId} value={contentType.contentTypeId}>
										{contentType.description}
									</option>
								);
							})}
						</InputHelper>

						<InputHelper
							type="number"
							label="How many minutes will it take to read/listen/watch?"
							name="durationInMinutes"
							value={formValues.durationInMinutes}
							onChange={({ currentTarget }) => {
								updateFormValue('durationInMinutes', currentTarget.value);
							}}
						/>
					</AdminFormSection>

					<hr />

					<AdminFormSection
						title="Resource URL"
						description="Provide the web address to where the content is hosted or upload a file to receive a new URL."
					>
						<ToggledInput
							className="mb-3"
							id="resource-url"
							label="URL"
							checked={formValues.resourceType === RESOURCE_TYPE.URL}
							onChange={() => {
								updateFormValue('resourceType', RESOURCE_TYPE.URL);
							}}
						>
							<InputHelper
								type="text"
								label="Web address to content"
								name="resourceUrl"
								value={formValues.resourceUrl}
								onChange={({ currentTarget }) => {
									updateFormValue('resourceUrl', currentTarget.value);
								}}
							/>
						</ToggledInput>

						<ToggledInput
							id="resource-file"
							label="File upload"
							checked={formValues.resourceType === RESOURCE_TYPE.FILE}
							onChange={() => {
								updateFormValue('resourceType', RESOURCE_TYPE.FILE);
							}}
						>
							<AdminFormNonImageFileInput
								defaultFileName={formValues.resourceFileName}
								defaultFileSize={formValues.resourceFileSize}
								previewSrc={formValues.resourceFileUrl}
								uploadedFileSrc={formValues.resourceFileUrl}
								onUploadedFileChange={(nextId, nextSrc) => {
									updateFormValue('resourceFileUploadId', nextId);
									updateFormValue('resourceFileUrl', nextSrc);
								}}
							/>
						</ToggledInput>
					</AdminFormSection>

					<hr />

					<AdminFormSection
						title="Sharing"
						description="Turn on sharing to allow other institutions to add this resource to their libraries."
					>
						<ToggledInput
							type="switch"
							id="content-is-shared"
							label="Allow other institutions to display this content?"
							checked={formValues.isShared}
							onChange={({ currentTarget }) => {
								updateFormValue('isShared', currentTarget.checked);
							}}
							hideChildren
						/>

						<div className="d-flex  mt-2">
							<SvgIcon kit="fas" icon="circle-info" size={16} className="me-2 text-n500 flex-shrink-0" />
							<p className="mb-0">
								If your resource is a TED talk, you must have permission from the original creator to
								share their video.
							</p>
						</div>
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
													Feature either a person's face, a calming piece of art, or an
													abstract image of nature
												</li>
												<li>Are at least 800x450 pixels in size</li>
												<li>
													Can be cropped to different sizes without losing important details
												</li>
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
									<SvgIcon
										kit="fas"
										icon="circle-question"
										size={20}
										className="me-2 text-p500 flex-shrink-0"
									/>
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
									<SvgIcon
										kit="fas"
										icon="circle-question"
										size={20}
										className="me-2 text-p500 flex-shrink-0"
									/>
									<p className="mb-0 fw-semibold">How do I choose an appropriate image?</p>
								</Button>
							</>
						}
					>
						<AdminFormImageInput
							imageSrc={formValues.imageUrl}
							onSrcChange={(nextId, nextSrc) => {
								updateFormValue('imageFileId', nextId);
								updateFormValue('imageUrl', nextSrc);
							}}
							presignedUploadGetter={(blob, name) => {
								return adminService.getPresignedUploadUrl({
									contentType: blob.type,
									filename: name,
									filesize: blob.size,
								}).fetch;
							}}
						/>
						<div className="d-flex mt-2">
							<SvgIcon kit="fas" icon="circle-info" size={16} className="me-2 text-n500 flex-shrink-0" />
							<p className="mb-0">A placeholder will be assigned if no image is uploaded.</p>
						</div>
					</AdminFormSection>

					<hr />

					<AdminFormSection
						title="Description"
						description="Provide a concise and engaging description to introduce the resource and convey the benefits of interacting with the full content."
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

					<hr />

					<AdminFormSection title="Target" description="Specify who this resource will help.">
						{(loaderData.contentAudienceTypeGroups ?? []).map((catg) => (
							<ToggledInput
								key={catg.contentAudienceTypeGroupId}
								type="checkbox"
								name="target-group"
								id={`target-group-${catg.contentAudienceTypeGroupId}`}
								value={catg.contentAudienceTypeGroupId}
								label={catg.description}
								checked={formValues.contentAudienceTypeGroupIds.includes(
									catg.contentAudienceTypeGroupId
								)}
								onChange={() => {
									if (
										formValues.contentAudienceTypeGroupIds.includes(catg.contentAudienceTypeGroupId)
									) {
										updateFormValue(
											'contentAudienceTypeGroupIds',
											formValues.contentAudienceTypeGroupIds.filter(
												(v) => v !== catg.contentAudienceTypeGroupId
											)
										);
									} else {
										updateFormValue('contentAudienceTypeGroupIds', [
											...formValues.contentAudienceTypeGroupIds,
											catg.contentAudienceTypeGroupId,
										]);
									}
								}}
								className="mb-3"
							>
								{(loaderData.contentAudienceTypes ?? [])
									.filter((cat) => cat.contentAudienceTypeGroupId === catg.contentAudienceTypeGroupId)
									.map((cat: ContentAudienceType) => (
										<Form.Check
											key={cat.contentAudienceTypeId}
											type="checkbox"
											name="target"
											id={`target-${cat.contentAudienceTypeId}`}
											value={cat.contentAudienceTypeId}
											label={cat.description}
											checked={
												!!formValues.contentAudienceTypes.find(
													(v) => v.contentAudienceTypeId === cat.contentAudienceTypeId
												)
											}
											onChange={() => {
												if (
													!!formValues.contentAudienceTypes.find(
														(v) => v.contentAudienceTypeId === cat.contentAudienceTypeId
													)
												) {
													updateFormValue(
														'contentAudienceTypes',
														formValues.contentAudienceTypes.filter(
															(v) => v.contentAudienceTypeId !== cat.contentAudienceTypeId
														)
													);
												} else {
													updateFormValue('contentAudienceTypes', [
														...formValues.contentAudienceTypes,
														cat,
													]);
												}
											}}
										/>
									))}
							</ToggledInput>
						))}
					</AdminFormSection>

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
						title="Search Terms (optional)"
						description="Include key words or phrases that will help surface this content in search results.  What you type here will not be visible to users."
					>
						<InputHelper
							className="mb-3"
							as="textarea"
							label="Search Terms"
							name="searchTerms"
							value={formValues.searchTerms}
							onChange={({ currentTarget }) => {
								updateFormValue('searchTerms', currentTarget.value);
							}}
						/>
					</AdminFormSection>

					<hr />

					<AdminFormSection
						title="Visibility"
						description={
							<>
								<p className="mb-2">
									Public content is visible everywhere on Cobalt once it is published (resource
									library, homepage, etc.)
								</p>
								<p className="mb-0">
									Unlisted content is only accessible to users who have a direct link (e.g. from a
									community page or their personal recommendations)
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
							checked={formValues.contentVisibilityTypeId === CONTENT_VISIBILITY_TYPE_ID.PUBLIC}
							onChange={() => {
								updateFormValue('contentVisibilityTypeId', CONTENT_VISIBILITY_TYPE_ID.PUBLIC);
							}}
						/>
						<ToggledInput
							type="radio"
							id="visibility-off"
							name="visibility"
							label="Unlisted"
							hideChildren
							checked={formValues.contentVisibilityTypeId === CONTENT_VISIBILITY_TYPE_ID.UNLISTED}
							onChange={() => {
								updateFormValue('contentVisibilityTypeId', CONTENT_VISIBILITY_TYPE_ID.UNLISTED);
							}}
						/>
					</AdminFormSection>

					<hr />

					<AdminFormSection
						title="Scheduling"
						description="Set a date for your content to publish to Cobalt. If the date selected is today, then the resource will automatically be made live after you preview and confirm. If the date selected is in the future, then the resource will become live on the date selected."
					>
						<DatePicker
							className="mb-4"
							labelText="Date"
							required
							selected={formValues.publishDate || new Date()}
							onChange={(date) => {
								updateFormValue('publishDate', date);
							}}
						/>

						<ToggledInput
							type="switch"
							id="content-does-expire"
							label={
								<>
									Expiry
									<span className="d-block text-muted">
										Set a date for your content to be removed from the Resource Library
									</span>
								</>
							}
							checked={formValues.doesExpire}
							onChange={({ currentTarget }) => {
								updateFormValue('doesExpire', currentTarget.checked);
							}}
						>
							<DatePicker
								className="w-100 mb-2"
								labelText="Expiration Date"
								selected={formValues.expirationDate ?? undefined}
								onChange={(date) => {
									updateFormValue('expirationDate', date);
								}}
							/>

							<Form.Check
								type="checkbox"
								id="content-is-recurring"
								label="Recurring (re-publish and expire content every year on the same day)"
								checked={formValues.isRecurring}
								onChange={({ currentTarget }) => {
									updateFormValue('isRecurring', currentTarget.checked);
								}}
							/>
						</ToggledInput>
					</AdminFormSection>
				</Container>
				<AdminResourceFormFooter
					showDraftButton={isDraft}
					draftButtonText={isAdd ? 'Save as Draft' : 'Save Draft'}
					showPreviewButton={true}
					previewActionText={showPreviewModal ? 'Close Preview' : 'Preview'}
					mainActionText={isDraft || (isEdit && isExpired) ? 'Publish' : 'Save Updates'}
					onCancel={() => {
						navigate(-1);
					}}
					onPreview={() => {
						setShowPreviewModal(!showPreviewModal);
					}}
				/>
			</Form>
		</>
	);
};

function prepareResourceSubmission(formValues: Partial<typeof initialResourceFormValues>): CreateContentRequest {
	const publishStartDate = moment(formValues.publishDate).format(DateFormats.API.Date);

	const publishEndDate =
		formValues.doesExpire && formValues.expirationDate
			? moment(formValues.expirationDate).format(DateFormats.API.Date)
			: undefined;

	return {
		contentTypeId: formValues.contentTypeId as ContentTypeId,
		title: formValues.title,
		author: formValues.author,
		url: formValues.resourceType === RESOURCE_TYPE.URL ? formValues.resourceUrl : undefined,
		...(formValues.resourceType === RESOURCE_TYPE.FILE &&
			formValues.resourceFileUploadId && {
				fileUploadId: formValues.resourceFileUploadId,
			}),
		...(formValues.imageFileId && { imageFileUploadId: formValues.imageFileId }),
		...(formValues.durationInMinutes && { durationInMinutes: formValues.durationInMinutes }),
		description: formValues.description,
		publishStartDate,
		publishEndDate,
		publishRecurring: formValues.isRecurring,
		tagIds:
			(formValues.tags ?? [])
				.filter((tag) => (formValues.tagGroupIds ?? []).includes(tag.tagGroupId))
				.map((tag) => tag.tagId) ?? [],
		searchTerms: formValues.searchTerms,
		sharedFlag: formValues.isShared ?? false,
		contentStatusId: formValues.contentStatusId,
		contentVisibilityTypeId: formValues.contentVisibilityTypeId,
		contentAudienceTypeIds:
			(formValues.contentAudienceTypes ?? [])
				.filter((cat) =>
					(formValues.contentAudienceTypeGroupIds ?? []).includes(cat.contentAudienceTypeGroupId)
				)
				.map((cat) => cat.contentAudienceTypeId) ?? [],
	};
}

function mutateFormValuesToContentPreview(
	formValues: ReturnType<typeof getInitialResourceFormValues>,
	contentTypes: ContentType[],
	contentResponse?: AdminContentResponse
): Content {
	const contentType = contentTypes.find((ct) => ct.contentTypeId === formValues.contentTypeId);

	return {
		contentId: '',
		contentTypeId: formValues.contentTypeId as ContentTypeId,
		title: formValues.title,
		url: formValues.resourceType === RESOURCE_TYPE.URL ? formValues.resourceUrl : formValues.resourceFileUrl,
		imageUrl: formValues.imageUrl,
		description: formValues.description,
		author: formValues.author,
		created: contentResponse?.adminContent?.dateCreated ?? moment(new Date()).format('YYYY-MM-DD'),
		createdDescription:
			contentResponse?.adminContent?.dateCreatedDescription ?? moment(new Date()).format('MM/DD/YY'),
		lastUpdated: '',
		lastUpdatedDescription: '',
		contentTypeDescription: contentType?.description ?? '',
		callToAction: contentType?.callToAction ?? '',
		newFlag: false,
		duration: formValues.durationInMinutes,
		durationInMinutes: parseInt(formValues.durationInMinutes, 10),
		durationInMinutesDescription: `${formValues.durationInMinutes} min`,
		tagIds:
			formValues.tags
				.filter((tag) => (formValues.tagGroupIds ?? []).includes(tag.tagGroupId))
				.map((tag) => tag.tagId) ?? [],
		tags: formValues.tags.filter((tag) => (formValues.tagGroupIds ?? []).includes(tag.tagGroupId)),
		neverEmbed: formValues.neverEmbed,
	};
}
