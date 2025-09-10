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
	onAddSectionButtonClick(): void;
}

export const LayoutTab = ({ onAddSectionButtonClick }: LayoutTabProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { page, setPage, setCurrentPageSectionId, currentPageSection, setIsSaving } = usePageBuilderContext();

	const handleDragEnd = async ({ source, destination }: DropResult) => {
		if (!destination) {
			return;
		}

		if (!page) {
			return;
		}

		const pageClone = cloneDeep(page);
		const [removedSection] = pageClone.pageSections.splice(source.index, 1);
		pageClone.pageSections.splice(destination.index, 0, removedSection);

		setPage(pageClone);
		setIsSaving(true);

		try {
			if (!page) {
				throw new Error('page is undefined.');
			}

			const { pageSections } = await pagesService
				.reorderPageSections(page.pageId, {
					pageSectionIds: pageClone.pageSections.map((ps) => ps.pageSectionId),
				})
				.fetch();

			pageClone.pageSections = pageSections;
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
				<Droppable droppableId="page-sections-droppable" direction="vertical">
					{(droppableProvided) => (
						<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
							{(page?.pageSections ?? []).map((section, sectionIndex) => (
								<Draggable
									key={section.pageSectionId}
									draggableId={`page-sections-draggable-${section.pageSectionId}`}
									index={sectionIndex}
								>
									{(draggableProvided, draggableSnapshot) => (
										<DraggableItem
											key={section.pageSectionId}
											draggableProvided={draggableProvided}
											draggableSnapshot={draggableSnapshot}
											active={currentPageSection?.pageSectionId === section.pageSectionId}
											onClick={() => setCurrentPageSectionId(section.pageSectionId)}
											title={section.name}
											asideTitle={`${section.pageRows.length} rows`}
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
				<Button variant="outline-primary" onClick={onAddSectionButtonClick}>
					Add Section
				</Button>
			</div>
		</>
	);
};
