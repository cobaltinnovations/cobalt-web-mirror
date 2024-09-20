import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import React, { useCallback, useRef, useState } from 'react';
import {
	LoaderFunctionArgs,
	unstable_useBlocker as useBlocker,
	useNavigate,
	useParams,
	useRouteLoaderData,
} from 'react-router-dom';
import { Col, Container, Form, Modal, Offcanvas, Row } from 'react-bootstrap';

import {
	AdminContent,
	AdminContentAction,
	Content,
	CONTENT_VISIBILITY_TYPE_ID,
	ContentStatusId,
	ContentType,
	ContentTypeId,
	Tag,
	TagGroup,
} from '@/lib/models';
import {
	AdminContentResponse,
	CreateContentRequest,
	adminService,
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
	AdminTagGroupControl,
} from '@/components/admin';
import Wysiwyg, { WysiwygRef } from '@/components/wysiwyg';
import ConfirmDialog from '@/components/confirm-dialog';
import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import ResourceDisplay from '@/components/resource-display';
import ToggledInput from '@/components/toggled-input';

import NoMatch from '@/pages/no-match';
import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info-fill.svg';
import { createUseThemedStyles } from '@/jss/theme';

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

	request.signal.addEventListener('abort', () => {
		contentRequest?.abort();
		tagGroupsRequest.abort();
		contentTypesRequest.abort();
	});

	const [contentResponse, tagGroupsResponse, contentTypesResponse] = await Promise.all([
		contentRequest?.fetch(),
		tagGroupsRequest.fetch(),
		contentTypesRequest.fetch(),
	]);

	return {
		contentResponse,
		tagGroups: tagGroupsResponse.tagGroups,
		contentTypes: contentTypesResponse.contentTypes,
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
	tagIds: [] as string[],
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
		resourceUrl: !adminContent?.fileUploadId ? adminContent?.url ?? '' : '',
		resourceFileName: adminContent?.filename ?? '',
		resourceFileSize: adminContent?.filesize ?? 0,
		resourceFileUploadId: adminContent?.fileUploadId ?? '',
		resourceFileUrl: adminContent?.fileUploadId ? adminContent?.url : '',
		isShared: adminContent?.sharedFlag !== undefined ? adminContent?.sharedFlag : true,
		imageFileId: adminContent?.imageFileUploadId ?? '',
		imageUrl: adminContent?.imageUrl ?? '',
		description: adminContent?.description ?? '',
		tagIds: adminContent?.tagIds ?? [],
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
	const descriptionWysiwygRef = useRef<WysiwygRef>(null);

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

			return new Promise(async (resolve: (response: AdminContentResponse) => void, reject) => {
				if (isEdit) {
					try {
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
		[addFlag, formValues, isEdit, params.contentId]
	);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			// Validate wysiwyg/rich-text-editor
			if (!formValues.description) {
				descriptionWysiwygRef.current?.quill?.focus();
				descriptionWysiwygRef.current?.quillRef.current?.scrollIntoView({
					behavior: 'auto',
					block: 'center',
				});
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
		[formValues.description, formValues.publishDate, handleError, navigate, updateOrCreateContent]
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
						loaderData.tagGroups,
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
							loaderData.tagGroups,
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
							<InfoIcon className="me-2 text-p500 flex-shrink-0" width={20} height={20} />
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
								<p className="mb-4">
									Add an image that represents the subject matter of your post. Choose one that looks
									good at different sizes — this image will appear across the Cobalt website and
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
										Avoid scenes that depict low mood, anxiety, or other distress as well as
										clichés.
									</li>
								</ul>
							</>
						}
					>
						<AdminFormImageInput
							imageSrc={formValues.imageUrl}
							onSrcChange={(nextId, nextSrc) => {
								updateFormValue('imageFileId', nextId);
								updateFormValue('imageUrl', nextSrc);
							}}
							presignedUploadGetter={(blob) => {
								return adminService.getPresignedUploadUrl({
									contentType: blob.type,
									filename: `${uuidv4()}.jpg`,
									filesize: blob.size,
								}).fetch;
							}}
						/>

						<div className="d-flex  mt-2">
							<InfoIcon className="me-2 text-p500 flex-shrink-0" width={20} height={20} />
							<p className="mb-0">
								If you choose not to upload an image, a generic placeholder image will be added to your
								post. Free images can be found at{' '}
								<a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer">
									unsplash.com
								</a>
							</p>
						</div>
					</AdminFormSection>

					<hr />

					<AdminFormSection
						title="Description"
						description="Provide a concise and engaging description to introduce the resource and convey the benefits of interacting with the full content."
					>
						<Wysiwyg
							ref={descriptionWysiwygRef}
							className="bg-white"
							initialValue={loaderData.contentResponse?.content?.description ?? ''}
							onChange={(nextValue) => {
								updateFormValue('description', nextValue);
							}}
						/>
					</AdminFormSection>

					<hr />

					<AdminFormSection
						title="Tags"
						description="Tags are used to determine which resources are shown first to a user depending on how they answered the initial assessment questions. If no tags are selected, then the resource will be de-prioritized and appear lower in a user’s list of resources."
					>
						{(loaderData?.tagGroups ?? []).map((tagGroup) => {
							return (
								<AdminTagGroupControl
									key={tagGroup.tagGroupId}
									tagGroup={tagGroup}
									selectedTagIds={formValues.tagIds}
									onTagClick={(tag) => {
										const isSelected = formValues.tagIds.includes(tag.tagId);
										updateFormValue(
											'tagIds',
											isSelected
												? formValues.tagIds.filter((tagId) => tagId !== tag.tagId)
												: [...formValues.tagIds, tag.tagId]
										);
									}}
								/>
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
		tagIds: formValues.tagIds,
		searchTerms: formValues.searchTerms,
		sharedFlag: formValues.isShared ?? false,
		contentStatusId: formValues.contentStatusId,
		contentVisibilityTypeId: formValues.contentVisibilityTypeId,
	};
}

function mutateFormValuesToContentPreview(
	formValues: ReturnType<typeof getInitialResourceFormValues>,
	contentTypes: ContentType[],
	tagGroups: TagGroup[],
	contentResponse?: AdminContentResponse
): Content {
	const flattendTags = tagGroups.reduce((previousValue, currentValue) => {
		return [...previousValue, ...(currentValue.tags ?? [])];
	}, [] as Tag[]);

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
		tagIds: formValues.tagIds,
		tags: formValues.tagIds.map((tagId) => flattendTags.find((tag) => tag.tagId === tagId)!),
		neverEmbed: formValues.neverEmbed,
	};
}
