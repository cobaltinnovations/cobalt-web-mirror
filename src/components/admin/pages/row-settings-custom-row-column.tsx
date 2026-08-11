import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import classNames from 'classnames';
import { CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID, CustomRowModel, ImageModel, isCustomRow } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';
import { AdminFormImageInputV2 } from '@/components/admin/admin-form-image-input-v2';
import { createUseThemedStyles } from '@/jss/theme';
import SvgIcon from '@/components/svg-icon';
import { PAGE_BUILDER_PLACEHOLDER_IMAGE_SRC } from './page-builder-placeholder';
import useAccount from '@/hooks/use-account';
import { getPageBuilderImageAssociationRequest } from './page-builder-image';

interface RowSettingsCustomRowColumnProps {
	pageRowColumnId: string;
}

type CustomRowColumnSectionId = 'IMAGE' | 'TEXT';

interface CustomRowColumnFormValues {
	description: string;
	image?: ImageModel;
	imageFileUploadId: string;
	imageUrl: string;
	imageAltText: string;
	usePlaceholderImage: boolean;
	contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID;
}

const SECTION_TITLE_BY_ID: Record<CustomRowColumnSectionId, string> = {
	IMAGE: 'Image',
	TEXT: 'Text',
};

const useStyles = createUseThemedStyles((theme) => ({
	section: {
		'& + &': {
			borderTop: `1px solid ${theme.colors.border}`,
		},
		'&.dragging': {
			borderRadius: 8,
			backgroundColor: theme.colors.n0,
			boxShadow: theme.elevation.e200,
		},
	},
	sectionDragHandle: {
		display: 'flex',
		cursor: 'grab',
		alignItems: 'center',
		justifyContent: 'center',
		color: theme.colors.n500,
		'&:active': {
			cursor: 'grabbing',
		},
	},
}));

const getSectionIdsForContentOrder = (contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID): CustomRowColumnSectionId[] =>
	contentOrderId === CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.TEXT_THEN_IMAGE ? ['TEXT', 'IMAGE'] : ['IMAGE', 'TEXT'];

const getContentOrderForSectionIds = (sectionIds: CustomRowColumnSectionId[]): CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID =>
	sectionIds[0] === 'TEXT'
		? CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.TEXT_THEN_IMAGE
		: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT;

export const RowSettingsCustomRowColumn = ({ pageRowColumnId }: RowSettingsCustomRowColumnProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { institution } = useAccount();
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const pageRow = useMemo(
		() => (currentPageRow && isCustomRow(currentPageRow) ? currentPageRow : undefined),
		[currentPageRow]
	);
	const pageRowColumn = useMemo(
		() => pageRow?.columns.find((column) => column.pageRowColumnId === pageRowColumnId),
		[pageRow, pageRowColumnId]
	);
	const [formValues, setFormValues] = useState<CustomRowColumnFormValues>({
		description: '',
		image: undefined,
		imageFileUploadId: '',
		imageUrl: '',
		imageAltText: '',
		usePlaceholderImage: false,
		contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT,
	});
	const formValuesRef = useRef(formValues);
	const formColumnIdRef = useRef<string>();
	const hasUnsavedChangesRef = useRef(false);
	const persistenceQueueRef = useRef<Promise<void>>(Promise.resolve());
	const pendingPersistenceCountRef = useRef(0);

	const persistColumnValues = useCallback(
		async (pr: CustomRowModel, prcId: string, fv: CustomRowColumnFormValues) => {
			const { pageRow: updatedPageRow } = await pagesService
				.updateCustomRowColumn(pr.pageRowId, prcId, {
					description: fv.description,
					...getPageBuilderImageAssociationRequest(fv, institution.imageRepositoryEnabled),
					imageAltText: fv.imageAltText,
					usePlaceholderImage: fv.usePlaceholderImage,
				})
				.fetch();

			updatePageRow(updatedPageRow);
		},
		[institution.imageRepositoryEnabled, updatePageRow]
	);

	const persistColumnContentOrder = useCallback(
		async (pr: CustomRowModel, prcId: string, fv: CustomRowColumnFormValues) => {
			const { pageRow: updatedPageRow } = await pagesService
				.updateCustomRowColumn(pr.pageRowId, prcId, {
					description: fv.description,
					...getPageBuilderImageAssociationRequest(fv, institution.imageRepositoryEnabled),
					imageAltText: fv.imageAltText,
					usePlaceholderImage: fv.usePlaceholderImage,
					contentOrderId: fv.contentOrderId,
				})
				.fetch();

			updatePageRow(updatedPageRow);
		},
		[institution.imageRepositoryEnabled, updatePageRow]
	);

	const runPersistence = useCallback(
		async (persistence: () => Promise<void>) => {
			pendingPersistenceCountRef.current += 1;
			setIsSaving(true);

			const queuedPersistence = persistenceQueueRef.current.then(persistence);
			persistenceQueueRef.current = queuedPersistence.catch(() => undefined);

			try {
				await queuedPersistence;
			} finally {
				pendingPersistenceCountRef.current -= 1;

				if (pendingPersistenceCountRef.current === 0) {
					setIsSaving(false);
				}
			}
		},
		[setIsSaving]
	);

	const persistFormValues = useCallback(
		async (pr: CustomRowModel, prcId: string, fv: CustomRowColumnFormValues) => {
			try {
				await runPersistence(() => persistColumnValues(pr, prcId, fv));

				if (formValuesRef.current === fv) {
					hasUnsavedChangesRef.current = false;
				}
			} catch (error) {
				handleError(error);
			}
		},
		[handleError, persistColumnValues, runPersistence]
	);

	const debouncedSubmission = useDebouncedAsyncFunction(
		async (pr: CustomRowModel, prcId: string, fv: CustomRowColumnFormValues) => {
			await persistFormValues(pr, prcId, fv);
		}
	);

	useEffect(() => {
		const previousColumnId = formColumnIdRef.current;
		const nextColumnId = pageRowColumn?.pageRowColumnId;

		if (previousColumnId && previousColumnId !== nextColumnId) {
			void debouncedSubmission.flush();
		}

		if (!pageRowColumn) {
			formColumnIdRef.current = undefined;
			hasUnsavedChangesRef.current = false;
			return;
		}

		if (previousColumnId === nextColumnId && hasUnsavedChangesRef.current) {
			return;
		}

		const nextValues: CustomRowColumnFormValues = {
			description: pageRowColumn.description ?? '',
			image: pageRowColumn.image,
			imageFileUploadId: pageRowColumn.imageFileUploadId ?? '',
			imageUrl: pageRowColumn.imageUrl ?? '',
			imageAltText: pageRowColumn.imageAltText ?? '',
			usePlaceholderImage: pageRowColumn.usePlaceholderImage ?? false,
			contentOrderId: pageRowColumn.contentOrderId ?? CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT,
		};

		formColumnIdRef.current = nextColumnId;
		formValuesRef.current = nextValues;
		hasUnsavedChangesRef.current = false;
		setFormValues(nextValues);
	}, [debouncedSubmission, pageRowColumn]);

	useEffect(() => {
		return () => {
			void debouncedSubmission.flush();
		};
	}, [debouncedSubmission]);

	const setLocalFormValues = useCallback((nextValues: CustomRowColumnFormValues) => {
		formValuesRef.current = nextValues;
		hasUnsavedChangesRef.current = true;
		setFormValues(nextValues);
	}, []);

	const handleInputChange = useCallback(
		({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			const nextValue = {
				...formValuesRef.current,
				[currentTarget.name]: currentTarget.value,
			} as CustomRowColumnFormValues;

			setLocalFormValues(nextValue);

			if (pageRow && pageRowColumn) {
				debouncedSubmission(pageRow, pageRowColumn.pageRowColumnId, nextValue);
			}
		},
		[debouncedSubmission, pageRow, pageRowColumn, setLocalFormValues]
	);

	const handleQuillChange = useCallback(
		(description: string) => {
			const nextValue = {
				...formValuesRef.current,
				description,
			};

			setLocalFormValues(nextValue);

			if (pageRow && pageRowColumn) {
				debouncedSubmission(pageRow, pageRowColumn.pageRowColumnId, nextValue);
			}
		},
		[debouncedSubmission, pageRow, pageRowColumn, setLocalFormValues]
	);

	const handleUploadComplete = useCallback(
		async (imageFileUploadId: string) => {
			if (!pageRow || !pageRowColumn || formColumnIdRef.current !== pageRowColumn.pageRowColumnId) {
				handleError(new Error('pageRow or pageRowColumn is undefined or no longer active.'));
				return;
			}

			const nextValue = {
				...formValuesRef.current,
				imageFileUploadId,
				usePlaceholderImage: false,
			};

			setLocalFormValues(nextValue);
			debouncedSubmission.cancel();
			await persistFormValues(pageRow, pageRowColumn.pageRowColumnId, nextValue);
		},
		[debouncedSubmission, handleError, pageRow, pageRowColumn, persistFormValues, setLocalFormValues]
	);

	const handleImageChange = useCallback(
		({ nextId, nextSrc }: { nextId: string; nextSrc: string }) => {
			const nextValue = {
				...formValuesRef.current,
				imageFileUploadId: nextId,
				imageUrl: nextSrc,
				usePlaceholderImage: false,
			};

			setLocalFormValues(nextValue);

			if (!nextId && !nextSrc) {
				void handleUploadComplete('');
			}
		},
		[handleUploadComplete, setLocalFormValues]
	);

	const handleRepositoryImageChange = useCallback(
		async (image?: ImageModel) => {
			if (!pageRow || !pageRowColumn || formColumnIdRef.current !== pageRowColumn.pageRowColumnId) {
				handleError(new Error('pageRow or pageRowColumn is undefined or no longer active.'));
				return;
			}

			const nextValue: CustomRowColumnFormValues = {
				...formValuesRef.current,
				image,
				imageFileUploadId: image?.fileUploadId ?? '',
				imageUrl: image?.url ?? '',
				usePlaceholderImage: false,
			};

			setLocalFormValues(nextValue);
			debouncedSubmission.cancel();
			await persistFormValues(pageRow, pageRowColumn.pageRowColumnId, nextValue);
		},
		[debouncedSubmission, handleError, pageRow, pageRowColumn, persistFormValues, setLocalFormValues]
	);

	const handleDragEnd = useCallback(
		async ({ source, destination }: DropResult) => {
			if (!destination || source.index === destination.index || !pageRow || !pageRowColumn) {
				return;
			}

			const hadUnsavedChanges = hasUnsavedChangesRef.current;
			const previousContentOrderId = formValuesRef.current.contentOrderId;
			const reorderedSectionIds = getSectionIdsForContentOrder(previousContentOrderId);
			const [removedSectionId] = reorderedSectionIds.splice(source.index, 1);
			reorderedSectionIds.splice(destination.index, 0, removedSectionId);

			const nextContentOrderId = getContentOrderForSectionIds(reorderedSectionIds);
			const nextValue = {
				...formValuesRef.current,
				contentOrderId: nextContentOrderId,
			};
			const optimisticPageRow = {
				...pageRow,
				columns: pageRow.columns.map((column) =>
					column.pageRowColumnId === pageRowColumn.pageRowColumnId
						? { ...column, contentOrderId: nextContentOrderId }
						: column
				),
			};

			setLocalFormValues(nextValue);
			updatePageRow(optimisticPageRow);
			debouncedSubmission.cancel();

			try {
				await runPersistence(() =>
					persistColumnContentOrder(pageRow, pageRowColumn.pageRowColumnId, nextValue)
				);

				if (formValuesRef.current === nextValue) {
					hasUnsavedChangesRef.current = false;
				}
			} catch (error) {
				const hasNewerChanges = formValuesRef.current !== nextValue;
				const rolledBackValue = {
					...formValuesRef.current,
					contentOrderId: previousContentOrderId,
				};

				formValuesRef.current = rolledBackValue;
				hasUnsavedChangesRef.current = hadUnsavedChanges || hasNewerChanges;
				setFormValues(rolledBackValue);
				updatePageRow(pageRow);
				handleError(error);
			}
		},
		[
			debouncedSubmission,
			handleError,
			pageRow,
			pageRowColumn,
			persistColumnContentOrder,
			runPersistence,
			setLocalFormValues,
			updatePageRow,
		]
	);

	const orderedSectionIds = useMemo(
		() => getSectionIdsForContentOrder(formValues.contentOrderId),
		[formValues.contentOrderId]
	);

	if (!pageRow || !pageRowColumn) {
		return null;
	}

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Droppable droppableId={`custom-row-column-sections-${pageRowColumnId}`} direction="vertical">
				{(droppableProvided) => (
					<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
						{orderedSectionIds.map((sectionId, sectionIndex) => (
							<Draggable
								key={sectionId}
								draggableId={`custom-row-column-section-${pageRowColumnId}-${sectionId}`}
								index={sectionIndex}
							>
								{(draggableProvided, draggableSnapshot) => (
									<div
										ref={draggableProvided.innerRef}
										{...draggableProvided.draggableProps}
										className={classNames(classes.section, {
											dragging: draggableSnapshot.isDragging,
										})}
									>
										<CollapseButton
											title={SECTION_TITLE_BY_ID[sectionId]}
											initialShow
											leadingElement={
												<div
													{...(draggableProvided.dragHandleProps ?? {})}
													className={classes.sectionDragHandle}
												>
													<SvgIcon kit="far" icon="grip-lines" size={16} />
												</div>
											}
										>
											{sectionId === 'IMAGE' ? (
												<Form.Group className="mb-6">
													{institution.imageRepositoryEnabled ? (
														<AdminFormImageInputV2
															className="mb-4"
															buttonClassName="d-block w-100"
															value={formValues.image}
															placeholderImageSrc={
																formValues.usePlaceholderImage
																	? PAGE_BUILDER_PLACEHOLDER_IMAGE_SRC
																	: undefined
															}
															allowRemovePlaceholderImage
															onChange={(image) => {
																void handleRepositoryImageChange(image);
															}}
														/>
													) : (
														<AdminFormImageInput
															className="mb-4"
															imageSrc={formValues.imageUrl}
															placeholderImageSrc={
																formValues.usePlaceholderImage
																	? PAGE_BUILDER_PLACEHOLDER_IMAGE_SRC
																	: undefined
															}
															allowRemovePlaceholderImage
															onSrcChange={(nextId, nextSrc) => {
																handleImageChange({ nextId, nextSrc });
															}}
															onUploadComplete={handleUploadComplete}
															presignedUploadGetter={(blob, name) => {
																return pagesService.createPresignedFileUpload({
																	contentType: blob.type,
																	filename: name,
																}).fetch;
															}}
															cropImage={false}
														/>
													)}
													<InputHelper
														type="text"
														label="Image alt text"
														name="imageAltText"
														value={formValues.imageAltText}
														onChange={handleInputChange}
													/>
												</Form.Group>
											) : (
												<Form.Group className="mb-0">
													<WysiwygBasic
														toolbarPreset="page-builder"
														height={420}
														value={formValues.description}
														onChange={(value) => {
															handleQuillChange(value);
														}}
													/>
												</Form.Group>
											)}
										</CollapseButton>
									</div>
								)}
							</Draggable>
						))}
						{droppableProvided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
};
