import { ReactComponent as LeftChevron } from '@/assets/icons/icon-chevron-left.svg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import {
	AdminFormFooter,
	AdminFormImageInput,
	AdminFormNonImageFileInput,
	AdminFormSection,
	AdminTagGroupControl,
} from '@/components/admin';
import Wysiwyg, { WysiwygRef } from '@/components/wysiwyg';
import ConfirmDialog from '@/components/confirm-dialog';
import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import ResourceDisplay from '@/components/resource-display';
import ToggledInput from '@/components/toggled-input';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import { AdminContent, ContentStatusId, ContentTypeId } from '@/lib/models';
import { CreateContentRequest, adminService, resourceLibraryService, tagService } from '@/lib/services';
import NoMatch from '@/pages/no-match';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import {
	LoaderFunctionArgs,
	Navigate,
	unstable_useBlocker as useBlocker,
	useNavigate,
	useParams,
	useRouteLoaderData,
} from 'react-router-dom';
import moment from 'moment';
import { DateFormats } from '@/lib/utils';
import useAccount from '@/hooks/use-account';

type AdminResourceFormLoaderData = Awaited<ReturnType<typeof loader>>;

export function useAdminResourceFormLoaderData() {
	return useRouteLoaderData('admin-resource-form') as AdminResourceFormLoaderData;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const action = params.action;
	const contentId = params.contentId;

	const supportedActions = ['add', 'edit', 'duplicate', 'preview', 'view'];

	// can add/preview/view edit/duplicate
	// admins can also edit/duplicate them
	const isSupportedAction = !!action && supportedActions.includes(action);

	// add, must not have a content id.
	const isValidNoId = isSupportedAction && ['add'].includes(action) && !contentId;

	// edit/duplicate/preview/view, must have a content id.
	const isValidWithId = isSupportedAction && ['edit', 'duplicate', 'preview', 'view'].includes(action) && !!contentId;

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
	};
}

const initialResourceFormValues = {
	title: '',
	author: '',
	contentTypeId: '',
	contentStatusId: ContentStatusId.DRAFT,
	durationInMinutes: '',
	resourceType: 'url' as 'url' | 'file',
	resourceUrl: '',
	resourceFileUrl: '',
	isShared: false,
	imageUrl: '',
	description: '',
	tagIds: [] as string[],
	searchTerms: '',
	publishDate: new Date(),
	doesExpire: false,
	expirationDate: null as Date | null,
	isRecurring: false,
};

function getInitialResourceFormValues({
	adminContent,
	isDuplicate,
}: {
	adminContent?: AdminContent | null;
	isDuplicate?: boolean;
}): typeof initialResourceFormValues {
	const { ...rest } = adminContent ?? ({} as AdminContent);

	console.log({ rest });
	return Object.assign(
		{ ...initialResourceFormValues },
		{
			...rest,
			tagIds: [],
			// keep initial values when duplicating an existing resource
			...(isDuplicate
				? {
						title: '',
				  }
				: {}),
		}
	);
}

export const Component = () => {
	const loaderData = useAdminResourceFormLoaderData();
	const { institution } = useAccount();
	const navigate = useNavigate();
	const params = useParams<{ action: string; contentId: string }>();
	const handleError = useHandleError();
	const { addFlag } = useFlags();

	const descriptionWysiwygRef = useRef<WysiwygRef>(null);

	const isPreview = params.action === 'preview';
	const isEdit = params.action === 'edit';
	const isDuplicate = params.action === 'duplicate';
	const isView = params.action === 'view';

	const isNotDraft =
		!isDuplicate &&
		loaderData?.contentResponse?.content?.contentStatusId &&
		loaderData?.contentResponse?.content?.contentStatusId !== ContentStatusId.DRAFT;

	const isOwnedByAnotherInstitution =
		!!loaderData?.contentResponse?.content &&
		loaderData.contentResponse.content.ownerInstitution !== institution.name;

	const [formValues, setFormValues] = useState(
		getInitialResourceFormValues({
			isDuplicate,
			adminContent: loaderData?.contentResponse?.content,
		})
	);

	const [isDirty, setIsDirty] = useState(false);
	const navigationBlocker = useBlocker(({ currentLocation, nextLocation }) => {
		// ignore changes in `search`
		const navigatingAway = currentLocation.pathname !== nextLocation.pathname;

		return navigatingAway && isDirty && !isPreview;
	});
	const [showConfirmPublishOrAddDialog, setShowConfirmPublishOrAddDialog] = useState(false);

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
			const submission = prepareResourceSubmission(formValues);

			if (!isNotDraft) {
				// set new status
			}

			const promise = isEdit
				? adminService.updateContent(params.contentId!, submission).fetch()
				: adminService.createContent(submission).fetch();

			setIsDirty(false);

			promise
				.then((response) => {
					if (isNotDraft || options?.exitAfterSave) {
						if (isNotDraft) {
							addFlag({
								variant: 'success',
								title: 'Edits Saved',
								description: 'TODO: Edits saved confirmation text',
								actions: [
									{
										title: 'View Resource',
										onClick: () => {
											navigate(`/admin/resources/preview/${response.adminContent?.contentId}`);
										},
									},
								],
							});
						}

						navigate('/admin/resources');
					} else {
						navigate('/admin/resources/preview/' + response.adminContent?.contentId);
					}
				})
				.catch((e) => {
					setIsDirty(true);
					handleError(e);
				});
		},
		[addFlag, formValues, handleError, isEdit, isNotDraft, navigate, params.contentId]
	);

	useEffect(() => {
		if (isPreview) {
			window.scroll(0, 0);
		}
	}, [isPreview]);

	if (loaderData === null) {
		return <NoMatch />;
	} else if (isPreview && isNotDraft) {
		return <Navigate to={`/admin/resources/view/${params.contentId}`} replace />;
	}

	const formFields = (
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
				description="Lorem ipsum dolor sit amet consectetur. Senectus faucibus morbi elementum viverra urna molestie. Fermentum lacinia fames eu integer. Massa nisi at ut gravida. Purus tempor risus et adipiscing purus tortor eget sapien consectetur. In id scelerisque augue sit nec odio quam vulputate sed."
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
					checked={formValues.resourceType === 'url'}
					onChange={() => {
						updateFormValue('resourceType', 'url');
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
					checked={formValues.resourceType === 'file'}
					onChange={() => {
						updateFormValue('resourceType', 'file');
					}}
				>
					<AdminFormNonImageFileInput
						previewSrc={formValues.resourceFileUrl}
						uploadedFileSrc={formValues.resourceFileUrl}
						onUploadedFileSrcChange={(nextSrc) => {
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
						If your resource is a TED talk, you must have permission from the original creator to share
						their video.
					</p>
				</div>
			</AdminFormSection>

			<hr />

			<AdminFormSection
				title="Image"
				description={
					<>
						<p className="mb-4">
							Add an image that represents the subject matter of your post. Choose one that looks good at
							different sizes — this image will appear across the Cobalt website and mobile apps.
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
				<AdminFormImageInput
					imageSrc={formValues.imageUrl}
					onSrcChange={(nextSrc) => {
						updateFormValue('imageUrl', nextSrc);
					}}
				/>

				<div className="d-flex  mt-2">
					<InfoIcon className="me-2 text-p500 flex-shrink-0" width={20} height={20} />
					<p className="mb-0">
						If you choose not to upload an image, a generic placeholder image will be added to your post.
						Free images can be found at{' '}
						<a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer">
							unsplash.com
						</a>
					</p>
				</div>
			</AdminFormSection>

			<hr />

			<AdminFormSection
				title="Description"
				description="Lorem ipsum dolor sit amet consectetur. Senectus faucibus morbi elementum viverra urna molestie. Fermentum lacinia fames eu integer. Massa nisi at ut gravida. Purus tempor risus et adipiscing purus tortor eget sapien consectetur. In id scelerisque augue sit nec odio quam vulputate sed."
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
	);

	const details =
		isPreview || isView ? (
			<ResourceDisplay trackView={false} content={loaderData?.contentResponse?.content!} />
		) : (
			formFields
		);

	const footer = (
		<AdminFormFooter
			exitButtonType={isPreview || isNotDraft ? 'button' : 'submit'}
			onExit={() => {
				if (isView) {
					navigate(`/admin/resources`);
				} else if (isPreview) {
					navigate(`/admin/resources/edit/${params.contentId}`);
				} else if (isNotDraft) {
					navigate(`/admin/resources`);
				}
			}}
			exitLabel={
				isPreview ? (
					<>
						<LeftChevron /> Back to Edit
					</>
				) : isNotDraft ? (
					'Exit Editor'
				) : isView ? (
					<>
						<LeftChevron /> Back
					</>
				) : (
					'Save & Exit'
				)
			}
			nextButtonType={isPreview || isView ? 'button' : 'submit'}
			onNext={() => {
				if (isView && !isOwnedByAnotherInstitution) {
					navigate(`/admin/resources/edit/${params.contentId}`);
					return;
				} else if (!isPreview) {
					return;
				}

				setShowConfirmPublishOrAddDialog(true);
			}}
			nextLabel={
				isPreview ? (
					'Publish Resource'
				) : isView && isOwnedByAnotherInstitution ? (
					'Add'
				) : isView ? (
					<>
						<EditIcon /> Edit
					</>
				) : (
					<>
						{isNotDraft ? 'Publish Changes' : 'Next: Preview'} <RightChevron />
					</>
				)
			}
			nextVariant={isView ? 'outline-primary' : 'primary'}
		/>
	);

	const confirmPublishOrAddDialog = (
		<ConfirmDialog
			size="lg"
			show={showConfirmPublishOrAddDialog}
			onHide={() => {
				setShowConfirmPublishOrAddDialog(false);
			}}
			titleText={isNotDraft ? 'Publish Changes' : 'Add Resource'}
			bodyText={
				isNotDraft
					? 'Are you ready to publish your changes'
					: `Are you ready to add ${
							isOwnedByAnotherInstitution ? 'this resource' : formValues.title
					  } to Cobalt?`
			}
			detailText={
				isNotDraft
					? 'Your changes will be reflected on Cobalt immediately'
					: isOwnedByAnotherInstitution
					? 'The resource will be added to your Resource Library immediately.'
					: `This resource will become live on the Cobalt Resource Library on ${moment(
							formValues.publishDate
					  ).format(DateFormats.API.Date)}`
			}
			dismissText="Cancel"
			confirmText={isNotDraft ? 'Update' : 'Add Resource'}
			onConfirm={() => {
				setShowConfirmPublishOrAddDialog(false);

				if (isNotDraft) {
					handleSaveForm();
				} else {
					adminService
						.updateContent(params.contentId!, {
							contentStatusId: ContentStatusId.LIVE,
						})
						.fetch()
						.then((response) => {
							const isScheduled = response.adminContent?.contentStatusId === ContentStatusId.SCHEDULED;

							addFlag({
								variant: 'success',
								title: 'Resource published',
								description: isScheduled
									? `Your resource will become live on ${response.adminContent?.publishStartDateDescription}`
									: 'Your resource is now available on Cobalt',
								actions: isScheduled
									? []
									: [
											{
												title: 'View Resource',
												onClick: () => {
													navigate(`/resource-library/${response.content?.contentId}`);
												},
											},
									  ],
							});
							navigate('/admin/resources');
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
				{confirmPublishOrAddDialog}

				{details}

				{footer}
			</div>
		);
	}

	const pageTitle = isView ? null : (
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
	);

	if (isView) {
		return (
			<>
				{pageTitle}

				{details}

				{footer}
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
					if (!formValues.description) {
						descriptionWysiwygRef.current?.quill?.focus();
						descriptionWysiwygRef.current?.quillRef.current?.scrollIntoView({
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
						setShowConfirmPublishOrAddDialog(true);
					}
				}}
			>
				{confirmPublishOrAddDialog}

				{details}

				{footer}
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
		url: formValues.resourceUrl || formValues.resourceFileUrl,
		imageUrl: formValues.imageUrl,
		durationInMinutes: formValues.durationInMinutes,
		description: formValues.description,
		publishStartDate,
		publishEndDate,
		publishRecurring: formValues.isRecurring,
		tagIds: formValues.tagIds,
		searchTerms: formValues.searchTerms,
		sharedFlag: formValues.isShared,
		contentStatusId: formValues.contentStatusId,
	};
}
