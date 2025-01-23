import { cloneDeep } from 'lodash';
import React, { useMemo } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { ResourcesRowModel } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { DraggableItem } from '@/components/admin/pages/draggable-item';

export const RowSettingsResources = () => {
	const handleError = useHandleError();
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

		updatePageRow(pageRowClone);

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			const response = await pagesService
				.updateResourcesRow(currentPageRow.pageRowId, {
					contentIds: pageRowClone.contents.map((c) => c.contentId),
				})
				.fetch();

			updatePageRow(response.pageRow);
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Droppable droppableId="row-settings-resources-droppable" direction="vertical">
				{(droppableProvided) => (
					<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
						{(resourcesRow?.contents ?? []).map((content, contentIndex) => (
							<Draggable
								key={content.contentId}
								draggableId={`row-settings-resources-draggable-${content.contentId}`}
								index={contentIndex}
							>
								{(draggableProvided, draggableSnapshot) => (
									<DraggableItem
										key={content.contentId}
										draggableProvided={draggableProvided}
										draggableSnapshot={draggableSnapshot}
										title={content.contentId}
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
