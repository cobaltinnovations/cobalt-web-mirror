import { cloneDeep } from 'lodash';
import React, { useMemo } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { ResourcesRowModel } from '@/lib/models';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { DraggableItem } from '@/components/admin/pages/draggable-item';

export const RowSettingsResources = () => {
	const { currentPageRow, updatePageRow } = usePageBuilderContext();
	const resourcesRow = useMemo(() => currentPageRow as ResourcesRowModel | undefined, [currentPageRow]);

	const handleDragEnd = async ({ source, destination }: DropResult) => {
		if (!destination) {
			return;
		}

		if (!resourcesRow) {
			return;
		}

		const pageRowClone = cloneDeep(resourcesRow);
		const [removedContent] = pageRowClone.contents.splice(source.index, 1);
		pageRowClone.contents.splice(destination.index, 0, removedContent);

		window.alert('[TODO]: API call to reorder resources');
		updatePageRow(pageRowClone);
	};

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Droppable droppableId="row-settings-resources-droppable" direction="vertical">
				{(droppableProvided) => (
					<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
						{(resourcesRow?.contents ?? []).map((content, contentIndex) => (
							<Draggable
								key={content.pageRowContentId}
								draggableId={`row-settings-resources-draggable-${content.pageRowContentId}`}
								index={contentIndex}
							>
								{(draggableProvided, draggableSnapshot) => (
									<DraggableItem
										key={content.pageRowContentId}
										draggableProvided={draggableProvided}
										draggableSnapshot={draggableSnapshot}
										title={content.pageRowContentId}
									/>
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
