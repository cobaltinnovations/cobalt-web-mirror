import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import React, { FC, useCallback, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { Field, FieldProps, Formik } from 'formik';
import { Helmet } from 'react-helmet';

import AsyncPage from '@/components/async-page';
import SessionCropModal from '@/components/session-crop-modal';
import InputHelper from '@/components/input-helper';
import SessionFormSubmitBanner from '@/components/session-form-submit-banner';

import { adminService, imageUploader, InstitutionFilters, resourceLibraryService } from '@/lib/services';
import {
	Content,
	ContentTypeFilterModel,
	ContentTypeId,
	ContentVisibilityTypeId,
	ROLE_ID,
	TagGroupModel,
	TagModel,
} from '@/lib/models';

import { useCobaltTheme } from '@/jss/theme';

import { getRequiredYupFields } from '@/lib/utils';
import ImageUpload from '@/components/image-upload';
import SessionRemoveImageModal from '@/components/session-remove-image-modal';
import useAccount from '@/hooks/use-account';
import OnYourTimePreview from '@/components/admin-cms/on-your-time-preview';
import Wysiwyg from '@/components/admin-cms/wysiwyg';
import DatePicker from '@/components/date-picker';
import CircleIndicator from '@/components/admin-cms/circle-indicator';
import Breadcrumb from '@/components/breadcrumb';
import useHandleError from '@/hooks/use-handle-error';
import { cloneDeep } from 'lodash';
import classNames from 'classnames';

const onYourTimeContentSchema = yup
	.object()
	.required()
	.shape({
		contentTypeId: yup.string().required().default(''),
		title: yup.string().required().default(''),
		author: yup.string().required().default(''),
		created: yup.string().default(undefined),
		urlRequired: yup.boolean().default(undefined),
		url: yup.string().default('').when('urlRequired', {
			is: true,
			then: yup.string().required(),
		}),
		duration: yup.string().default(''),
		description: yup.string().required().default(''),
		imageUrl: yup.string().default(''),
		visibilityPrivate: yup.boolean().default(false),
		visibilityNetwork: yup.boolean().default(false),
		visibilityPublic: yup.boolean().default(true),
		tagIds: yup.array().of(yup.string().required().default('')).required().default([]),
	});

export type onYourTimeFormData = yup.InferType<typeof onYourTimeContentSchema>;
const requiredFields = getRequiredYupFields<onYourTimeFormData>(onYourTimeContentSchema);

const CreateOnYourTimeContent: FC = () => {
	const theme = useCobaltTheme();
	const handleError = useHandleError();
	const { account } = useAccount();
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const contentId = searchParams.get('contentId');
	const editing = searchParams.get('editing');
	const adding = searchParams.get('adding');
	const returnToAvailable = (searchParams.get('returnToAvailable') ?? '').toLowerCase() === 'true';
	const [showRemoveImageModal, setShowRemoveImageModal] = useState(false);

	const [contentInstitutions, setContentInstitutions] = useState<InstitutionFilters[]>();
	const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
	const [initialValues, setInitialValues] = useState<onYourTimeFormData>();

	const [isEditing, setIsEditing] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const [shouldDisabledInputs] = useState(false);

	const [contentTypes, setContentTypes] = useState<ContentTypeFilterModel[]>([]);
	const [tagGroups, setTagGroups] = useState<TagGroupModel[]>([]);
	const [tags, setTags] = useState<TagModel[]>([]);

	const [contentCropModalImageSource, setContentCropModalImageSource] = useState('');
	const [contentCropModalIsOpen, setContentCropModalIsOpen] = useState<boolean>(false);
	const [imagePreview, setImagePreview] = useState(initialValues ? initialValues.imageUrl : '');
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isSaving, setIsSaving] = useState(false);

	const fetchData = useCallback(async () => {
		setIsEditing(!!editing && editing.toLowerCase() === 'true');
		setIsAdding(!!adding && adding.toLowerCase() === 'true');

		const [contentTypesResponse, contentTagsResponse, institutionsResponse] = await Promise.all([
			resourceLibraryService.getResourceLibraryContentTypes().fetch(),
			adminService.fetchContentTags().fetch(),
			adminService.fetchInstitutions().fetch(),
		]);

		setContentTypes(contentTypesResponse.contentTypes);
		setTagGroups(contentTagsResponse.tagGroups ?? []);
		setTags(contentTagsResponse.tags ?? []);
		setContentInstitutions(institutionsResponse.institutions);

		if (!contentId) {
			return;
		}

		let contentToSet: Content | undefined;

		// Pre populate fields
		if (contentId) {
			const { networkInstitutions, content } = await adminService.fetchAdminContent(contentId).fetch();
			contentToSet = content;

			if (!!networkInstitutions && networkInstitutions.length) {
				setContentInstitutions(networkInstitutions);
			}

			if (editing) {
				setIsEditing(true);

				if (content?.selectedNetworkInstitutions) {
					setSelectedInstitutions(
						content.selectedNetworkInstitutions.map(({ institutionId }) => {
							return institutionId;
						})
					);
				}
			}

			if (adding) {
				setIsAdding(true);
				// setShouldDisabledInputs(true);
			}

			if (contentToSet) {
				setImagePreview(contentToSet.imageUrl);
				setInitialValues({
					contentTypeId: contentToSet.contentTypeId,
					title: contentToSet.title,
					author: contentToSet.author,
					url: contentToSet.url,
					duration: contentToSet.duration,
					created: contentToSet.created ? moment(contentToSet.created).format('YYYY-MM-DD') : undefined,
					imageUrl: contentToSet.imageUrl,
					description: contentToSet.description,
					visibilityPrivate: !content?.visibleToOtherInstitutions || false,
					visibilityPublic: content?.visibilityId === ContentVisibilityTypeId.Public,
					visibilityNetwork: content?.visibilityId === ContentVisibilityTypeId.Network,
					tagIds: contentToSet.tagIds ?? [],
				} as onYourTimeFormData);
			}
		}
	}, [editing, adding, contentId]);

	async function handleSubmit(values: onYourTimeFormData) {
		try {
			if (isUploading) {
				throw new Error('Upload is in progress.');
			}

			setIsSaving(true);

			let visibilityId: ContentVisibilityTypeId | undefined = undefined;
			if (values.visibilityPrivate) {
				visibilityId = ContentVisibilityTypeId.Private;
			} else if (values.visibilityNetwork) {
				visibilityId = ContentVisibilityTypeId.Network;
			} else if (values.visibilityPublic) {
				visibilityId = ContentVisibilityTypeId.Public;
			}

			const submissionValues = {
				contentTypeId: values.contentTypeId,
				title: values.title,
				author: values.author,
				...(values.url && { url: values.url }),
				imageUrl: values.imageUrl,
				description: values.description,
				durationInMinutes: values.duration,
				dateCreated: values.created,
				addToInstitution: isAdding,
				visibilityId,
				institutionIdList: selectedInstitutions,
				tagIds: values.tagIds,
			};

			if (isEditing || isAdding) {
				await adminService.updateContent(contentId, submissionValues)?.fetch();
			} else {
				await adminService.createContent(submissionValues).fetch();
			}

			if (account?.roleId === ROLE_ID.ADMINISTRATOR || account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR) {
				let targetPath = isAdding ? '/cms/available-content' : '/cms/on-your-time';

				if (returnToAvailable) {
					targetPath = '/cms/available-content';
				}

				navigate(`${targetPath}`, {
					state: {
						showSuccess: true,
						isAdding,
						isEditing,
					},
				});
			} else {
				navigate('/on-your-time-thanks');
			}
		} catch (error) {
			handleError(error);
			setIsSaving(false);
		}
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | Add Content</title>
			</Helmet>

			<AsyncPage fetchData={fetchData}>
				{(account?.roleId === ROLE_ID.ADMINISTRATOR || account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR) && (
					<Breadcrumb
						breadcrumbs={[
							{
								to: isAdding ? '/cms/available-content' : '/cms/on-your-time',
								title: isAdding ? 'Available Content' : 'My Content',
							},
							{
								to: location.pathname,
								title: isAdding ? 'Add Public Post' : 'Add Content',
							},
						]}
					/>
				)}

				<Container className="pt-5 pb-32">
					<Row>
						<Col>
							<Formik<onYourTimeFormData>
								enableReinitialize
								validationSchema={onYourTimeContentSchema}
								initialValues={initialValues || onYourTimeContentSchema.cast(undefined)}
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
									return (
										<>
											<SessionCropModal
												imageSource={contentCropModalImageSource}
												show={contentCropModalIsOpen}
												onHide={() => {
													setContentCropModalIsOpen(false);
												}}
												onSave={async (blob) => {
													setContentCropModalIsOpen(false);

													imageUploader(
														blob,
														adminService.getPreSignedUploadUrl({
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
												<Row>
													<Col className="mb-5">
														<h3 className="mb-2">
															{isAdding ? 'Add Public Post' : 'Add On Your Time Content'}
														</h3>
														<span>Required *</span>
													</Col>
												</Row>
												<Row>
													<Col md={10} lg={8}>
														<Card className="mb-5 border-0 p-6">
															<h5 className="mb-5">Details</h5>
															<Row className="mb-5">
																<Col>
																	<div className="d-flex align-items-center">
																		<CircleIndicator>1</CircleIndicator>
																		<InputHelper
																			className="ms-6 flex-fill"
																			label="Content Type"
																			value={values.contentTypeId || ''}
																			as="select"
																			onChange={(event) => {
																				setFieldValue(
																					'contentTypeId',
																					event.target.value
																				);
																				setFieldValue(
																					'urlRequired',
																					event.target.value !==
																						ContentTypeId.InternalBlog
																				);
																			}}
																			required={requiredFields.contentTypeId}
																			error={
																				touched.contentTypeId &&
																				errors.contentTypeId
																					? errors.contentTypeId
																					: ''
																			}
																			disabled={shouldDisabledInputs}
																		>
																			<option value="" disabled>
																				Select...
																			</option>
																			{contentTypes.map((contentType) => {
																				return (
																					<option
																						key={contentType.contentTypeId}
																						value={
																							contentType.contentTypeId
																						}
																					>
																						{contentType.description}
																					</option>
																				);
																			})}
																		</InputHelper>
																	</div>
																</Col>
															</Row>
															<Row className="mb-5">
																<Col>
																	<div className="d-flex align-items-center">
																		<CircleIndicator>2</CircleIndicator>
																		<InputHelper
																			className="ms-6 flex-fill"
																			label="Title"
																			type="text"
																			name="title"
																			value={values.title}
																			as="input"
																			onBlur={handleBlur}
																			onChange={handleChange}
																			required={requiredFields.title}
																			error={
																				touched.title && errors.title
																					? errors.title
																					: ''
																			}
																			disabled={shouldDisabledInputs}
																		/>
																	</div>
																</Col>
															</Row>
															<Row className="mb-5">
																<Col>
																	<div className="d-flex align-items-center">
																		<CircleIndicator>3</CircleIndicator>
																		<InputHelper
																			className="ms-6 flex-fill"
																			label="Author"
																			type="text"
																			name="author"
																			value={values.author}
																			as="input"
																			onBlur={handleBlur}
																			onChange={handleChange}
																			required={requiredFields.author}
																			error={
																				touched.author && errors.author
																					? errors.author
																					: ''
																			}
																			disabled={shouldDisabledInputs}
																		/>
																	</div>
																</Col>
															</Row>
															{values.contentTypeId !== ContentTypeId.InternalBlog && (
																<div className="ps-13">
																	<Row className="mb-5">
																		<Col>
																			<InputHelper
																				label="URL to Content"
																				type="text"
																				name="url"
																				value={values.url}
																				as="input"
																				onBlur={handleBlur}
																				onChange={handleChange}
																				required={
																					requiredFields.url &&
																					values.contentTypeId !==
																						ContentTypeId.InternalBlog
																				}
																				disabled={shouldDisabledInputs}
																				error={
																					touched.url && errors.url
																						? errors.url
																						: ''
																				}
																			/>
																		</Col>
																	</Row>
																	<Row className="mb-5">
																		<Col>
																			<DatePicker
																				showYearDropdown
																				showMonthDropdown
																				dropdownMode="select"
																				labelText="Submitted Date"
																				selected={
																					values.created
																						? moment(
																								values.created
																						  ).toDate()
																						: undefined
																				}
																				onChange={(date) => {
																					setFieldTouched('date', true);
																					setFieldValue(
																						'created',
																						date
																							? moment(date).format(
																									'YYYY-MM-DD'
																							  )
																							: ''
																					);
																				}}
																				disabled={shouldDisabledInputs}
																			/>
																		</Col>
																	</Row>
																</div>
															)}
															<div className="d-flex align-items-center">
																<CircleIndicator>4</CircleIndicator>
																<div className="ms-6 flex-fill">
																	<Row className="mb-5">
																		<Col className="position-relative">
																			<InputHelper
																				label="How many minutes will it take to read/listen/watch?"
																				type="number"
																				name="duration"
																				value={values.duration}
																				as="input"
																				onBlur={handleBlur}
																				onChange={handleChange}
																				required={requiredFields.duration}
																				disabled={shouldDisabledInputs}
																				error={
																					touched.duration && errors.duration
																						? errors.duration
																						: ''
																				}
																			/>
																		</Col>
																	</Row>
																</div>
															</div>
															<Row>
																<Col>
																	<div className="d-flex">
																		<CircleIndicator>5</CircleIndicator>
																		<ImageUpload
																			className="ms-6 flex-fill"
																			imagePreview={imagePreview}
																			isUploading={isUploading}
																			progress={progress}
																			onChange={(file) => {
																				const sourceUrl =
																					URL.createObjectURL(file);

																				setContentCropModalImageSource(
																					sourceUrl
																				);
																				setContentCropModalIsOpen(true);
																			}}
																			onRemove={() => {
																				setShowRemoveImageModal(true);
																			}}
																			disabled={shouldDisabledInputs}
																		/>
																	</div>
																</Col>
															</Row>
															<Row className="mb-5">
																<Col>
																	<div className="d-flex">
																		<CircleIndicator>6</CircleIndicator>
																		{values.contentTypeId ===
																		ContentTypeId.InternalBlog ? (
																			<div className="d-flex flex-column ms-6 flex-fill">
																				<Form.Label
																					className="mb-2"
																					style={{ ...theme.fonts.default }}
																				>
																					Post Content{' '}
																					{requiredFields.description && (
																						<span>*</span>
																					)}
																				</Form.Label>
																				<Field name="description">
																					{({ field, meta }: FieldProps) => {
																						return (
																							<Wysiwyg
																								readOnly={
																									shouldDisabledInputs
																								}
																								initialValue={
																									meta.initialValue
																								}
																								onChange={field.onChange(
																									field.name
																								)}
																							/>
																						);
																					}}
																				</Field>

																				{touched.description &&
																					errors.description && (
																						<p
																							className="text-danger"
																							style={{
																								...theme.fonts.small,
																							}}
																						>
																							description is a required
																							field
																						</p>
																					)}
																			</div>
																		) : (
																			<InputHelper
																				className="ms-6 flex-fill"
																				label="Description"
																				name="description"
																				value={values.description}
																				as="textarea"
																				onBlur={handleBlur}
																				onChange={handleChange}
																				required={requiredFields.description}
																				error={
																					touched.description &&
																					errors.description
																						? errors.description
																						: ''
																				}
																				disabled={shouldDisabledInputs}
																			/>
																		)}
																	</div>
																</Col>
															</Row>
														</Card>
														{!isAdding && (
															<>
																{(account?.roleId === ROLE_ID.ADMINISTRATOR ||
																	account?.roleId ===
																		ROLE_ID.SUPER_ADMINISTRATOR) && (
																	<Card className="mb-5 border-0 p-6">
																		<h5 className="mb-2">Visibility *</h5>
																		<div
																			className="mb-5"
																			style={{ ...theme.fonts.default }}
																		>
																			Choose which institutions are allowed to
																			share this content with their patients.
																		</div>
																		<Form.Group className="mb-5">
																			<Form.Label
																				className="mb-1"
																				style={{ ...theme.fonts.default }}
																			>
																				Allow other institutions to share this
																				content?
																			</Form.Label>
																			<Form.Check
																				type="radio"
																				id="isPrivate-No"
																				name="visibilityPrivate"
																				label="No"
																				checked={values.visibilityPrivate}
																				onChange={() => {
																					setFieldValue(
																						'visibilityPrivate',
																						true
																					);
																					setFieldValue(
																						'visibilityNetwork',
																						false
																					);
																					setFieldValue(
																						'visibilityPublic',
																						false
																					);
																					setSelectedInstitutions([]);
																				}}
																				disabled={shouldDisabledInputs}
																			/>
																			<Form.Check
																				type="radio"
																				id="isPrivate-Yes"
																				name="visibilityPrivate"
																				label="Yes"
																				checked={!values.visibilityPrivate}
																				onChange={() => {
																					setFieldValue(
																						'visibilityPrivate',
																						false
																					);
																				}}
																				disabled={shouldDisabledInputs}
																			/>
																		</Form.Group>
																		<Form.Label
																			className="mb-1"
																			style={{ ...theme.fonts.default }}
																		>
																			Select the level of visibility:
																		</Form.Label>
																		<Form.Group className="mb-5">
																			<Form.Check
																				type="radio"
																				id="visibilityNetwork-Yes"
																				name="visibilityNetwork"
																				label={
																					<>
																						<div
																							style={{
																								...theme.fonts.default,
																							}}
																						>
																							Only other Institutions in
																							my network
																						</div>
																						<div className="text-gray">
																							Visible to patients and
																							providers from selected
																							institutions in my network
																						</div>
																					</>
																				}
																				checked={values.visibilityNetwork}
																				onChange={() => {
																					setFieldValue(
																						'visibilityNetwork',
																						true
																					);
																					setFieldValue(
																						'visibilityPublic',
																						false
																					);
																				}}
																				disabled={
																					shouldDisabledInputs ||
																					values.visibilityPrivate
																				}
																			/>
																			{!!contentInstitutions &&
																				contentInstitutions.length > 0 && (
																					<div className="ms-7 mt-2 mb-3">
																						<Form.Label
																							className="mb-2"
																							style={{
																								...theme.fonts.default,
																							}}
																						>
																							Select the other
																							institutions you will allow
																							to have access to your post:
																						</Form.Label>
																						{contentInstitutions.map(
																							(
																								{ institutionId, name },
																								index
																							) => {
																								return (
																									<Form.Check
																										key={index}
																										type="checkbox"
																										id={
																											institutionId
																										}
																										name={
																											institutionId
																										}
																										label={
																											<div
																												style={{
																													...theme
																														.fonts
																														.default,
																												}}
																											>
																												{name}
																											</div>
																										}
																										checked={selectedInstitutions?.includes(
																											institutionId
																										)}
																										onBlur={
																											handleBlur
																										}
																										onChange={() => {
																											setFieldValue(
																												'visibilityNetwork',
																												true
																											);
																											setFieldValue(
																												'visibilityPublic',
																												false
																											);
																											setSelectedInstitutions(
																												(
																													prevState
																												) => {
																													if (
																														prevState?.includes(
																															institutionId
																														)
																													) {
																														return prevState?.filter(
																															(
																																id
																															) =>
																																id !==
																																institutionId
																														);
																													} else {
																														return [
																															...prevState,
																															institutionId,
																														];
																													}
																												}
																											);
																										}}
																										disabled={
																											shouldDisabledInputs ||
																											values.visibilityPrivate
																										}
																									/>
																								);
																							}
																						)}
																					</div>
																				)}
																			<Form.Check
																				type="radio"
																				id="visibilityPublic-Yes"
																				name="visibilityPublic"
																				label={
																					<>
																						<div
																							style={{
																								...theme.fonts.default,
																							}}
																						>
																							Public
																						</div>
																						<div className="text-gray">
																							Available for use by other
																							institutions
																						</div>
																					</>
																				}
																				checked={values.visibilityPublic}
																				onChange={() => {
																					setFieldValue(
																						'visibilityNetwork',
																						false
																					);
																					setFieldValue(
																						'visibilityPublic',
																						true
																					);
																					setSelectedInstitutions([]);
																				}}
																				disabled={
																					shouldDisabledInputs ||
																					values.visibilityPrivate
																				}
																			/>
																		</Form.Group>
																	</Card>
																)}
															</>
														)}

														{(account?.roleId === ROLE_ID.ADMINISTRATOR ||
															account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR) && (
															<Card className="mb-5 border-0">
																<div
																	className="p-6"
																	style={{
																		borderBottom: `1px solid ${theme.colors.border}`,
																	}}
																>
																	<h5 className="mb-2">Tags</h5>
																	<p>
																		Tags are used to determine which resources are
																		shown first to a patient depending on how they
																		answered the initial assessment questions. If no
																		categories are selected, then the resource will
																		be de-prioritized an appear lower in a patient's
																		list of resources.
																	</p>
																</div>

																<div className="py-6">
																	{tagGroups.map((tagGroup, tagGroupIndex) => {
																		const isLast =
																			tagGroupIndex === tagGroups.length - 1;

																		return (
																			<div
																				key={tagGroup.tagGroupId}
																				className={classNames('px-6', {
																					'mb-6': !isLast,
																				})}
																			>
																				<p>
																					<strong>{tagGroup.name}</strong>
																				</p>

																				{tags.map((tag) => {
																					if (
																						tag.tagGroupId ===
																						tagGroup.tagGroupId
																					) {
																						return (
																							<Form.Check
																								inline
																								bsPrefix="cobalt-form__check--pill"
																								key={tag.tagId}
																								id={tag.tagId}
																								label={tag.name}
																								value={tag.tagId}
																								checked={values.tagIds.includes(
																									tag.tagId
																								)}
																								onChange={({
																									currentTarget,
																								}) => {
																									const tagIdsClone =
																										cloneDeep(
																											values.tagIds
																										);

																									const targetIndex =
																										tagIdsClone.findIndex(
																											(tid) =>
																												tid ===
																												currentTarget.value
																										);

																									if (
																										targetIndex > -1
																									) {
																										tagIdsClone.splice(
																											targetIndex,
																											1
																										);
																									} else {
																										tagIdsClone.push(
																											currentTarget.value
																										);
																									}

																									setFieldValue(
																										'tagIds',
																										tagIdsClone
																									);
																								}}
																							/>
																						);
																					}

																					return null;
																				})}
																			</div>
																		);
																	})}
																</div>
															</Card>
														)}
													</Col>
													<Col md={2} lg={4}>
														<OnYourTimePreview
															description={values.description}
															contentTypeLabel={
																contentTypes.find(
																	(cT) => cT.contentTypeId === values.contentTypeId
																)?.description
															}
															imageUrl={imagePreview}
															title={values.title}
															author={values.author}
															duration={values.duration && `${values.duration} min`}
															url={values.url}
														/>
													</Col>
												</Row>

												<SessionFormSubmitBanner
													title={isEditing ? 'Update Content' : 'Add Content'}
													disabled={isSaving || Object.keys(errors).length > 0}
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

export default CreateOnYourTimeContent;
