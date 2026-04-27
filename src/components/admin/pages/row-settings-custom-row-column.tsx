import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import classNames from 'classnames';
import { CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID, CustomRowModel, isCustomRow } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';
import { createUseThemedStyles } from '@/jss/theme';
import SvgIcon from '@/components/svg-icon';

interface RowSettingsCustomRowColumnProps {
	pageRowColumnId: string;
}

type CustomRowColumnSectionId = 'IMAGE' | 'TEXT';

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
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const pageRow = useMemo(
		() => (currentPageRow && isCustomRow(currentPageRow) ? currentPageRow : undefined),
		[currentPageRow]
	);
	const pageRowColumn = useMemo(
		() => pageRow?.columns.find((column) => column.pageRowColumnId === pageRowColumnId),
		[pageRow, pageRowColumnId]
	);
	const [formValues, setFormValues] = useState({
		description: '',
		imageFileUploadId: '',
		imageUrl: '',
		imageAltText: '',
		contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT,
	});

	useEffect(() => {
		if (!pageRowColumn) {
			return;
		}

		setFormValues({
			description: pageRowColumn.description ?? '',
			imageFileUploadId: pageRowColumn.imageFileUploadId ?? '',
			imageUrl: pageRowColumn.imageUrl ?? '',
			imageAltText: pageRowColumn.imageAltText ?? '',
			contentOrderId: pageRowColumn.contentOrderId ?? CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT,
		});
	}, [pageRowColumn]);

	const persistColumnValues = useCallback(
		async (pr: CustomRowModel, prcId: string, fv: typeof formValues) => {
			const { pageRow: updatedPageRow } = await pagesService
				.updateCustomRowColumn(pr.pageRowId, prcId, {
					description: fv.description,
					imageFileUploadId: fv.imageFileUploadId,
					imageAltText: fv.imageAltText,
				})
				.fetch();

			updatePageRow(updatedPageRow);
		},
		[updatePageRow]
	);

	const persistColumnContentOrder = useCallback(
		async (pr: CustomRowModel, prcId: string, fv: typeof formValues) => {
			const { pageRow: updatedPageRow } = await pagesService
				.updateCustomRowColumn(pr.pageRowId, prcId, {
					description: fv.description,
					imageFileUploadId: fv.imageFileUploadId,
					imageAltText: fv.imageAltText,
					contentOrderId: fv.contentOrderId,
				})
				.fetch();

			updatePageRow(updatedPageRow);
		},
		[updatePageRow]
	);

	const debouncedSubmission = useDebouncedAsyncFunction(
		async (pr: CustomRowModel, prcId: string, fv: typeof formValues) => {
			setIsSaving(true);

			try {
				await persistColumnValues(pr, prcId, fv);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		}
	);

	useEffect(() => {
		return () => {
			debouncedSubmission.cancel();
		};
	}, [debouncedSubmission]);

	const handleInputChange = useCallback(
		({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			setFormValues((previousValue) => {
				const nextValue = {
					...previousValue,
					[currentTarget.name]: currentTarget.value,
				};

				if (pageRow && pageRowColumn) {
					debouncedSubmission(pageRow, pageRowColumn.pageRowColumnId, nextValue);
				}

				return nextValue;
			});
		},
		[debouncedSubmission, pageRow, pageRowColumn]
	);

	const handleQuillChange = useCallback(
		(description: string) => {
			setFormValues((previousValue) => {
				const nextValue = {
					...previousValue,
					description,
				};

				if (pageRow && pageRowColumn) {
					debouncedSubmission(pageRow, pageRowColumn.pageRowColumnId, nextValue);
				}

				return nextValue;
			});
		},
		[debouncedSubmission, pageRow, pageRowColumn]
	);

	const handleUploadComplete = useCallback(
		async (imageFileUploadId: string) => {
			setIsSaving(true);

			try {
				if (!pageRow || !pageRowColumn) {
					throw new Error('pageRow or pageRowColumn is undefined.');
				}

				const nextValue = {
					...formValues,
					imageFileUploadId,
				};

				await persistColumnValues(pageRow, pageRowColumn.pageRowColumnId, nextValue);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[formValues, handleError, pageRow, pageRowColumn, persistColumnValues, setIsSaving]
	);

	const handleImageChange = useCallback(
		({ nextId, nextSrc }: { nextId: string; nextSrc: string }) => {
			setFormValues((previousValue) => ({
				...previousValue,
				imageFileUploadId: nextId,
				imageUrl: nextSrc,
			}));

			if (!nextId && !nextSrc) {
				handleUploadComplete('');
			}
		},
		[handleUploadComplete]
	);

	const handleDragEnd = useCallback(
		async ({ source, destination }: DropResult) => {
			if (!destination || source.index === destination.index || !pageRow || !pageRowColumn) {
				return;
			}

			debouncedSubmission.cancel();

			const previousContentOrderId = formValues.contentOrderId;
			const reorderedSectionIds = getSectionIdsForContentOrder(previousContentOrderId);
			const [removedSectionId] = reorderedSectionIds.splice(source.index, 1);
			reorderedSectionIds.splice(destination.index, 0, removedSectionId);

			const nextContentOrderId = getContentOrderForSectionIds(reorderedSectionIds);
			const nextValue = {
				...formValues,
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

			setFormValues(nextValue);
			updatePageRow(optimisticPageRow);
			setIsSaving(true);

			try {
				await persistColumnContentOrder(pageRow, pageRowColumn.pageRowColumnId, nextValue);
			} catch (error) {
				setFormValues((previousValue) => ({
					...previousValue,
					contentOrderId: previousContentOrderId,
				}));
				updatePageRow(pageRow);
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[
			debouncedSubmission,
			formValues,
			handleError,
			pageRow,
			pageRowColumn,
			persistColumnContentOrder,
			setIsSaving,
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
													<AdminFormImageInput
														className="mb-4"
														imageSrc={formValues.imageUrl}
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
