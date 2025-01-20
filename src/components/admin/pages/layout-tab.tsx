import React from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

import { PageSectionModel } from '@/lib/models';
import { HERO_SECTION_ID } from '@/components/admin/pages/section-hero-settings-form';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as LockIcon } from '@/assets/icons/icon-lock.svg';
import { ReactComponent as DragIndicator } from '@/assets/icons/drag-indicator.svg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';

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
	sections: PageSectionModel[];
	currentSection?: PageSectionModel;
	onSectionClick(section: PageSectionModel): void;
	onChange(sections: PageSectionModel[]): void;
	onAddSection(): void;
}

export const LayoutTab = ({ sections, currentSection, onSectionClick, onChange, onAddSection }: LayoutTabProps) => {
	const classes = useStyles();

	const handleHeroSectionClick = () => {
		const heroSection = {
			pageSectionId: HERO_SECTION_ID,
			pageId: 'xxxx-xxxx-xxxx-xxxx',
			name: 'Hero',
			headline: '',
			description: '',
			backgroundColorId: '',
			displayOrder: 0,
		};

		onSectionClick(heroSection);
	};

	const handleDragEnd = async ({ source, destination }: DropResult) => {
		if (!destination) {
			return;
		}

		const sectionsClone = window.structuredClone(sections);
		const [removedSection] = (sectionsClone ?? []).splice(source.index, 1);
		(sectionsClone ?? []).splice(destination.index, 0, removedSection);

		// Optimistically update UI so drag-n-drop feels fast/tight/responsive
		onChange(sectionsClone);

		try {
			// await careResourceService
			// 	.reorderCareResourceLocationPacket(removedSection.pageSectionId, {
			// 		displayOrder: destination.index,
			// 	})
			// 	.fetch();
		} catch (error) {
			// handleError(error);
		} finally {
			// Fire change event again after reorder call to get the "true" order from the backend
			// onChange(itemsClone);
		}
	};

	return (
		<>
			<div
				className={classNames(classes.sectionItem, 'border-bottom', {
					active: currentSection?.pageSectionId === HERO_SECTION_ID,
				})}
			>
				<div className={classes.handleOuter}>
					<LockIcon className="text-n300" />
				</div>
				<button type="button" className={classes.sectionButton} onClick={handleHeroSectionClick}>
					<span>Hero</span>
					<RightChevron className="text-n500" />
				</button>
			</div>
			<DragDropContext onDragEnd={handleDragEnd}>
				<Droppable droppableId="page-sections-droppable" direction="vertical">
					{(droppableProvided) => (
						<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
							{sections.map((section, sectionIndex) => (
								<Draggable
									key={section.pageSectionId}
									draggableId={`page-sections-draggable-${section.pageSectionId}`}
									index={sectionIndex}
								>
									{(draggableProvided, draggableSnapshot) => (
										<div
											ref={draggableProvided.innerRef}
											key={section.pageSectionId}
											className={classNames(classes.sectionItem, {
												active: currentSection?.pageSectionId === section.pageSectionId,
												'shadow-lg': draggableSnapshot.isDragging,
												'border-bottom': !draggableSnapshot.isDragging,
												rounded: draggableSnapshot.isDragging,
											})}
											{...draggableProvided.draggableProps}
										>
											<div className={classes.handleOuter} {...draggableProvided.dragHandleProps}>
												<DragIndicator className="text-gray" />
											</div>
											<button
												type="button"
												className={classes.sectionButton}
												onClick={() => onSectionClick(section)}
											>
												<span className="text-truncate">{section.name}</span>
												<div className="d-flex flex-shrink-0 align-items-center">
													<span className="text-n500">[0] rows</span>
													<RightChevron className="text-n500" />
												</div>
											</button>
										</div>
									)}
								</Draggable>
							))}
							{droppableProvided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
			<div className="p-6 text-right">
				<Button variant="outline-primary" onClick={onAddSection}>
					Add Section
				</Button>
			</div>
		</>
	);
};
