import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { BACKGROUND_COLOR_ID, CustomRowModel, isCustomRow, ROW_PADDING_ID } from '@/lib/models';
import { pagesService } from '@/lib/services';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import SvgIcon from '@/components/svg-icon';
import { createUseThemedStyles } from '@/jss/theme';

const MAX_COLUMNS = 4;
const COLUMN_LABELS = ['A', 'B', 'C', 'D'];

interface RowSettingsCustomRowProps {
	onColumnClick?(pageRowColumnId: string, columnLabel: string): void;
}

const useStyles = createUseThemedStyles((theme) => ({
	divider: {
		margin: '0 -24px 24px',
		borderTop: `1px solid ${theme.colors.border}`,
	},
	sectionHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	sectionTitle: {
		margin: 0,
		...theme.fonts.default,
		...theme.fonts.headingBold,
	},
	addColumnButton: {
		gap: 8,
		border: 0,
		display: 'inline-flex',
		alignItems: 'center',
		borderRadius: 999,
		padding: '10px 18px',
		backgroundColor: theme.colors.p500,
		color: `${theme.colors.n0} !important`,
		'&:hover, &:focus, &:active': {
			border: 0,
			boxShadow: 'none',
			backgroundColor: theme.colors.p500,
			color: `${theme.colors.n0} !important`,
		},
		'&:disabled': {
			opacity: 0.5,
			cursor: 'not-allowed',
			backgroundColor: theme.colors.p500,
			color: `${theme.colors.n0} !important`,
		},
	},
	emptyState: {
		padding: 32,
		display: 'flex',
		minHeight: 198,
		borderRadius: 12,
		textAlign: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
		backgroundColor: theme.colors.n50,
		border: `1px solid ${theme.colors.n100}`,
	},
	emptyStateTitle: {
		margin: '0 0 8px',
		...theme.fonts.default,
		...theme.fonts.headingBold,
	},
	emptyStateDescription: {
		margin: '0 0 24px',
		color: theme.colors.n500,
	},
	columnsList: {
		display: 'flex',
		width: 'calc(100% + 12px)',
		margin: '0 -6px',
		alignItems: 'stretch',
	},
	columnItem: {
		padding: '0 6px',
		boxSizing: 'border-box',
	},
	columnCard: {
		height: '100%',
		padding: 6,
		borderRadius: 8,
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
		transition: 'box-shadow 150ms ease, border-color 150ms ease',
		'&:hover': {
			boxShadow: theme.elevation.e200,
			borderColor: theme.colors.n300,
		},
		'&.dragging': {
			boxShadow: theme.elevation.e400,
			borderColor: theme.colors.n300,
		},
		'&:hover $columnPreviewOverlay, &.dragging $columnPreviewOverlay': {
			opacity: 1,
		},
	},
	columnPreview: {
		width: '100%',
		border: 0,
		height: 110,
		display: 'flex',
		padding: 0,
		borderRadius: 4,
		position: 'relative',
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center',
		background: 'transparent',
		backgroundColor: theme.colors.n50,
	},
	columnPreviewLabel: {
		...theme.fonts.default,
		...theme.fonts.headingBold,
	},
	columnPreviewOverlay: {
		inset: 0,
		opacity: 0,
		display: 'flex',
		position: 'absolute',
		alignItems: 'center',
		borderRadius: 'inherit',
		justifyContent: 'center',
		transition: 'opacity 150ms ease',
		backgroundColor: 'rgba(41, 40, 39, 0.7)',
		color: theme.colors.n0,
	},
	columnHandle: {
		height: 28,
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

export const RowSettingsCustomRow = ({ onColumnClick }: RowSettingsCustomRowProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const columnLabelsByIdRef = useRef<Record<string, string>>({});
	const pageRow = useMemo(
		() => (currentPageRow && isCustomRow(currentPageRow) ? currentPageRow : undefined),
		[currentPageRow]
	);
	const columns = useMemo(
		() =>
			pageRow
				? [...pageRow.columns].sort(
						(leftColumn, rightColumn) => leftColumn.columnDisplayOrder - rightColumn.columnDisplayOrder
				  )
				: [],
		[pageRow]
	);
	const [formValues, setFormValues] = useState({
		name: '',
		backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
		paddingId: ROW_PADDING_ID.MEDIUM,
	});

	useEffect(() => {
		if (!pageRow) {
			return;
		}

		setFormValues({
			name: pageRow.name ?? '',
			backgroundColorId: pageRow.backgroundColorId ?? BACKGROUND_COLOR_ID.WHITE,
			paddingId: pageRow.paddingId ?? ROW_PADDING_ID.MEDIUM,
		});
	}, [pageRow]);

	useEffect(() => {
		const activeColumnIds = new Set(columns.map((column) => column.pageRowColumnId));
		const assignedLabels = new Set(Object.values(columnLabelsByIdRef.current));

		columns.forEach((column) => {
			if (columnLabelsByIdRef.current[column.pageRowColumnId]) {
				return;
			}

			const nextLabel = COLUMN_LABELS.find((columnLabel) => !assignedLabels.has(columnLabel));

			if (!nextLabel) {
				return;
			}

			columnLabelsByIdRef.current[column.pageRowColumnId] = nextLabel;
			assignedLabels.add(nextLabel);
		});

		Object.keys(columnLabelsByIdRef.current).forEach((pageRowColumnId) => {
			if (!activeColumnIds.has(pageRowColumnId)) {
				delete columnLabelsByIdRef.current[pageRowColumnId];
			}
		});
	}, [columns]);

	const debouncedSubmission = useDebouncedAsyncFunction(async (pr: CustomRowModel, fv: typeof formValues) => {
		setIsSaving(true);

		try {
			const { pageRow: updatedPageRow } = await pagesService
				.updatePageRow(pr.pageRowId, {
					name: fv.name,
					backgroundColorId: fv.backgroundColorId,
					paddingId: fv.paddingId,
				})
				.fetch();

			updatePageRow(updatedPageRow);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	});

	const handleInputChange = useCallback(
		({ currentTarget }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			setFormValues((previousValue) => {
				const nextValue = {
					...previousValue,
					[currentTarget.name]: currentTarget.value,
				};

				if (pageRow) {
					debouncedSubmission(pageRow, nextValue);
				}

				return nextValue;
			});
		},
		[debouncedSubmission, pageRow]
	);

	const handleAddColumn = useCallback(() => {
		if (!pageRow || columns.length >= MAX_COLUMNS) {
			return;
		}

		setIsSaving(true);

		pagesService
			.createCustomRowColumn(pageRow.pageRowId)
			.fetch()
			.then(({ pageRow: updatedPageRow }) => {
				updatePageRow(updatedPageRow);
			})
			.catch((error) => {
				handleError(error);
			})
			.finally(() => {
				setIsSaving(false);
			});
	}, [columns.length, handleError, pageRow, setIsSaving, updatePageRow]);

	const handleDragEnd = useCallback(
		async ({ source, destination }: DropResult) => {
			if (!pageRow || !destination || destination.index === source.index) {
				return;
			}

			const nextColumns = [...columns];
			const [removedColumn] = nextColumns.splice(source.index, 1);
			nextColumns.splice(destination.index, 0, removedColumn);

			const optimisticPageRow: CustomRowModel = {
				...pageRow,
				columns: nextColumns.map((column, columnIndex) => ({
					...column,
					columnDisplayOrder: columnIndex,
				})),
			};

			updatePageRow(optimisticPageRow);
			setIsSaving(true);

			try {
				const { pageRow: updatedPageRow } = await pagesService
					.reorderCustomRowColumns(pageRow.pageRowId, {
						pageRowColumnIds: nextColumns.map((column) => column.pageRowColumnId),
					})
					.fetch();

				updatePageRow(updatedPageRow);
			} catch (error) {
				updatePageRow(pageRow);
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[columns, handleError, pageRow, setIsSaving, updatePageRow]
	);

	if (!pageRow) {
		return null;
	}

	const columnWidth = `${100 / Math.max(columns.length, 1)}%`;

	return (
		<>
			<InputHelper
				className="mb-4"
				type="text"
				label="Row Name"
				name="name"
				value={formValues.name}
				onChange={handleInputChange}
				required
			/>
			<InputHelper
				className="mb-6"
				as="select"
				label="Background color"
				name="backgroundColorId"
				value={formValues.backgroundColorId}
				onChange={handleInputChange}
			>
				<option value={BACKGROUND_COLOR_ID.WHITE}>White</option>
				<option value={BACKGROUND_COLOR_ID.NEUTRAL}>Neutral</option>
			</InputHelper>
			<InputHelper
				className="mb-6"
				as="select"
				label="Padding"
				name="paddingId"
				value={formValues.paddingId}
				onChange={handleInputChange}
			>
				<option value={ROW_PADDING_ID.SMALL}>Small</option>
				<option value={ROW_PADDING_ID.MEDIUM}>Medium</option>
				<option value={ROW_PADDING_ID.LARGE}>Large</option>
			</InputHelper>
			<div className={classes.divider} />
			<div className={classes.sectionHeader}>
				<h5 className={classes.sectionTitle}>
					{columns.length > 0 ? `Columns (${columns.length})` : 'Columns'}
				</h5>
				<Button
					className={classes.addColumnButton}
					onClick={handleAddColumn}
					type="button"
					disabled={columns.length >= MAX_COLUMNS}
				>
					<SvgIcon kit="fas" icon="plus" size={12} />
					Add Column
				</Button>
			</div>
			{columns.length === 0 ? (
				<div className={classes.emptyState}>
					<h4 className={classes.emptyStateTitle}>No columns added</h4>
					<p className={classes.emptyStateDescription}>Add up to 4 columns</p>
					<Button className={classes.addColumnButton} onClick={handleAddColumn} type="button">
						<SvgIcon kit="fas" icon="plus" size={12} />
						Add Column
					</Button>
				</div>
			) : (
				<DragDropContext onDragEnd={handleDragEnd}>
					<Droppable droppableId={`custom-row-columns-${pageRow.pageRowId}`} direction="horizontal">
						{(droppableProvided) => (
							<div
								ref={droppableProvided.innerRef}
								{...droppableProvided.droppableProps}
								className={classes.columnsList}
							>
								{columns.map((column, columnIndex) => (
									<Draggable
										key={column.pageRowColumnId}
										draggableId={`custom-row-column-${column.pageRowColumnId}`}
										index={columnIndex}
									>
										{(draggableProvided, draggableSnapshot) => {
											const columnLabel =
												columnLabelsByIdRef.current[column.pageRowColumnId] ??
												COLUMN_LABELS[columnIndex] ??
												`Column ${columnIndex + 1}`;

											return (
												<div
													ref={draggableProvided.innerRef}
													{...draggableProvided.draggableProps}
													className={classes.columnItem}
													style={{
														width: columnWidth,
														flexBasis: columnWidth,
														flexShrink: 0,
														boxSizing: 'border-box',
														...draggableProvided.draggableProps.style,
													}}
												>
													<div
														className={`${classes.columnCard}${
															draggableSnapshot.isDragging ? ' dragging' : ''
														}`}
													>
														<button
															type="button"
															className={classes.columnPreview}
															onClick={() => {
																onColumnClick?.(column.pageRowColumnId, columnLabel);
															}}
														>
															<span className={classes.columnPreviewLabel}>
																{columnLabel}
															</span>
															<div className={classes.columnPreviewOverlay}>
																<SvgIcon kit="far" icon="pen" size={20} />
															</div>
														</button>
														<div
															className={classes.columnHandle}
															{...draggableProvided.dragHandleProps}
														>
															<SvgIcon kit="far" icon="grip-lines" size={16} />
														</div>
													</div>
												</div>
											);
										}}
									</Draggable>
								))}
								{droppableProvided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			)}
		</>
	);
};
