import { cloneDeep } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { ResourcesRowModel } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { DraggableItem, PageSectionShelfPage, SelectResourcesModal } from '@/components/admin/pages';
import { ReactComponent as MinusIcon } from '@/assets/icons/icon-minus.svg';

interface RowSettingsResourcesProps {
	onBackButtonClick(event?: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	onDeleteButtonClick(): void;
}

export const RowSettingsResources = ({ onBackButtonClick, onDeleteButtonClick }: RowSettingsResourcesProps) => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const resourcesRow = useMemo(() => currentPageRow as ResourcesRowModel | undefined, [currentPageRow]);
	const [showSelectResourcesModal, setShowSelectResourcesModal] = useState(false);

	const handleResourcesAdd = async (contentIds: string[]) => {
		setIsSaving(true);

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			const { pageRow } = await pagesService.updateResourcesRow(currentPageRow.pageRowId, { contentIds }).fetch();

			updatePageRow(pageRow);
			setShowSelectResourcesModal(false);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDragEnd = async ({ source, destination }: DropResult) => {
		if (!destination || !resourcesRow) {
			return;
		}

		const pageRowClone = cloneDeep(resourcesRow);
		const [removedContent] = pageRowClone.contents.splice(source.index, 1);
		pageRowClone.contents.splice(destination.index, 0, removedContent);

		updatePageRow(pageRowClone);
		setIsSaving(true);

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			const { pageRow } = await pagesService
				.updateResourcesRow(currentPageRow.pageRowId, {
					contentIds: pageRowClone.contents.map((c) => c.contentId),
				})
				.fetch();

			updatePageRow(pageRow);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleRemoveItem = useCallback(
		async (contentId: string) => {
			setIsSaving(true);

			try {
				if (!currentPageRow) {
					throw new Error('currentPageRow is undefined.');
				}

				const { pageRow } = await pagesService
					.deleteResourcesRowContent(currentPageRow.pageRowId, contentId)
					.fetch();

				updatePageRow(pageRow);
			} catch (error) {
				handleError(error);
				setIsSaving(false);
			}
		},
		[currentPageRow, handleError, setIsSaving, updatePageRow]
	);

	return (
		<>
			<SelectResourcesModal
				show={showSelectResourcesModal}
				onHide={() => setShowSelectResourcesModal(false)}
				contentIds={(resourcesRow?.contents ?? []).map((c) => c.contentId)}
				onAdd={handleResourcesAdd}
			/>

			<PageSectionShelfPage
				showBackButton
				onBackButtonClick={onBackButtonClick}
				showDeleteButton
				onDeleteButtonClick={onDeleteButtonClick}
				title={`Resources (${(resourcesRow?.contents ?? []).length})`}
				customHeaderElements={
					<Button className="me-2" size="sm" onClick={() => setShowSelectResourcesModal(true)}>
						Add resources
					</Button>
				}
			>
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
												title={content.title}
												subTitle={content.author}
												aside={
													<Button
														className="flex-shrink-0 ms-2 p-2"
														variant="danger"
														onClick={() => {
															handleRemoveItem(content.contentId);
														}}
													>
														<MinusIcon className="d-flex" />
													</Button>
												}
											/>
										)}
									</Draggable>
								))}
								{droppableProvided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</PageSectionShelfPage>
		</>
	);
};
