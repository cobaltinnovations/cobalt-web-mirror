import React from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

import { HERO_SECTION_ID } from '@/components/admin/pages/section-hero-settings-form';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as LockIcon } from '@/assets/icons/icon-lock.svg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import { DraggableItem } from './draggable-item';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { cloneDeep } from 'lodash';

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
	const { page, setPage, setCurrentPageSectionId, currentPageSection } = usePageBuilderContext();

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

		window.alert('[TODO]: API call to reorder sections');
		setPage(pageClone);
	};

	return (
		<>
			<div
				className={classNames(classes.sectionItem, 'border-bottom', {
					active: currentPageSection?.pageSectionId === HERO_SECTION_ID,
				})}
			>
				<div className={classes.handleOuter}>
					<LockIcon className="text-n300" />
				</div>
				<button
					type="button"
					className={classes.sectionButton}
					onClick={() => setCurrentPageSectionId(HERO_SECTION_ID)}
				>
					<span>Hero</span>
					<RightChevron className="text-n500" />
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
