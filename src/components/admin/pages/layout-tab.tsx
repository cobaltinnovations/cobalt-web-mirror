import React from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

import { HERO_SECTION_ID } from '@/components/admin/pages/section-hero-settings-form';
import { createUseThemedStyles } from '@/jss/theme';
import { DraggableItem } from './draggable-item';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { cloneDeep } from 'lodash';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import SvgIcon from '@/components/svg-icon';
import {
	isGroupSessionsRow,
	isMailingListRow,
	isResourcesRow,
	isTagGroupRow,
	isTagRow,
	PageRowUnionModel,
	ResourcesRowModel,
} from '@/lib/models';

const useStyles = createUseThemedStyles((theme) => ({
	sectionItem: {
		display: 'flex',
		alignItems: 'center',
		background: theme.colors.n0,
		transition: '0.3s background-color',
		'&:hover': {
			backgroundColor: theme.colors.n50,
		},
		'&.active': {
			backgroundColor: theme.colors.n75,
		},
	},
	handleOuter: {
		padding: 16,
		flexShrink: 0,
	},
	sectionButton: {
		flex: 1,
		border: 0,
		minWidth: 0,
		display: 'flex',
		cursor: 'pointer',
		textAlign: 'left',
		appearance: 'none',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '16px 16px 16px 0',
		backgroundColor: 'transparent',
	},
}));

interface LayoutTabProps {
	onAddRowButtonClick(): void;
}

export const LayoutTab = ({ onAddRowButtonClick }: LayoutTabProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const {
		page,
		setPage,
		setCurrentPageSectionId,
		setCurrentPageRowId,
		currentPageSection,
		currentPageRow,
		setIsSaving,
	} = usePageBuilderContext();

	const contentSection = page?.pageSections[0];
	const pageRows = contentSection?.pageRows ?? [];

	const getSubTitleForPageRow = (pageRow: PageRowUnionModel) => {
		if (isTagGroupRow(pageRow)) {
			return pageRow.tagGroup.name;
		}

		if (isTagRow(pageRow)) {
			return pageRow.tag.name;
		}

		if (isMailingListRow(pageRow)) {
			return 'Subscribe';
		}

		if (isGroupSessionsRow(pageRow)) {
			return `${pageRow.groupSessions.length} Session${pageRow.groupSessions.length === 1 ? '' : 's'}`;
		}

		if (isResourcesRow(pageRow)) {
			const resourceRow = pageRow as ResourcesRowModel;
			return `${resourceRow.contents.length} Resource${resourceRow.contents.length === 1 ? '' : 's'}`;
		}

		if ('columnThree' in pageRow) {
			return '3 columns';
		}

		if ('columnTwo' in pageRow) {
			return '2 columns';
		}

		if ('columnOne' in pageRow) {
			return '1 column';
		}

		return '';
	};

	const handleDragEnd = async ({ source, destination }: DropResult) => {
		if (!destination) {
			return;
		}

		if (!page || !contentSection) {
			return;
		}

		const pageClone = cloneDeep(page);
		const [removedRow] = pageClone.pageSections[0].pageRows.splice(source.index, 1);
		pageClone.pageSections[0].pageRows.splice(destination.index, 0, removedRow);

		setPage(pageClone);
		setIsSaving(true);

		try {
			if (!page) {
				throw new Error('page is undefined.');
			}

			const { pageRows } = await pagesService
				.reorderPageSectionRows(contentSection.pageSectionId, {
					pageRowIds: pageClone.pageSections[0].pageRows.map((pr) => pr.pageRowId),
				})
				.fetch();

			pageClone.pageSections[0].pageRows = pageRows;
			setPage(pageClone);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<>
			<div
				className={classNames(classes.sectionItem, 'border-bottom', {
					active: currentPageSection?.pageSectionId === HERO_SECTION_ID,
				})}
			>
				<div className={classes.handleOuter}>
					<SvgIcon kit="far" icon="lock" size={20} className="text-n300" />
				</div>
				<button
					type="button"
					className={classes.sectionButton}
					onClick={() => setCurrentPageSectionId(HERO_SECTION_ID)}
				>
					<span>Hero</span>
					<SvgIcon kit="far" icon="chevron-right" size={16} className="text-n500" />
				</button>
			</div>
			<DragDropContext onDragEnd={handleDragEnd}>
				<Droppable droppableId="page-rows-droppable" direction="vertical">
					{(droppableProvided) => (
						<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
							{pageRows.map((pageRow, rowIndex) => (
								<Draggable
									key={pageRow.pageRowId}
									draggableId={`page-rows-draggable-${pageRow.pageRowId}`}
									index={rowIndex}
								>
									{(draggableProvided, draggableSnapshot) => (
										<DraggableItem
											key={pageRow.pageRowId}
											draggableProvided={draggableProvided}
											draggableSnapshot={draggableSnapshot}
											active={currentPageRow?.pageRowId === pageRow.pageRowId}
											onClick={() => {
												setCurrentPageSectionId(contentSection?.pageSectionId ?? '');
												setCurrentPageRowId(pageRow.pageRowId);
											}}
											title={pageRow.name}
											subTitle={getSubTitleForPageRow(pageRow)}
										/>
									)}
								</Draggable>
							))}
							{droppableProvided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
			<div className="p-6 text-right">
				<Button
					variant="light"
					onClick={() => {
						if (!contentSection) {
							return;
						}

						setCurrentPageSectionId(contentSection.pageSectionId);
						setCurrentPageRowId('');
						onAddRowButtonClick();
					}}
				>
					Add Row
				</Button>
			</div>
		</>
	);
};
