import React, { useMemo } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ResourcesRowModel } from '@/lib/models';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { DraggableItem } from '@/components/admin/pages/draggable-item';

export const RowSettingsResources = () => {
	const { currentPageRow } = usePageBuilderContext();
	const resourcesRow = useMemo(() => currentPageRow as ResourcesRowModel | undefined, [currentPageRow]);

	return (
		<DragDropContext
			onDragEnd={() => {
				window.alert('[TODO]: DropEnd for resources');
			}}
		>
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
