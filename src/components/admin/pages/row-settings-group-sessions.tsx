import { cloneDeep } from 'lodash';
import React, { useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { GroupSessionsRowModel } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { DraggableItem, PageSectionShelfPage, SelectGroupSessionsModal } from '@/components/admin/pages';

interface RowSettingsGroupSessionsProps {
	onBackButtonClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const RowSettingsGroupSessions = ({ onBackButtonClick }: RowSettingsGroupSessionsProps) => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const groupSessionsRow = useMemo(() => currentPageRow as GroupSessionsRowModel | undefined, [currentPageRow]);
	const [showSelectGroupSessionsModal, setShowSelectGroupSessionsModal] = useState(false);

	const handleGroupSessionsAdd = async (groupSessionIds: string[]) => {
		setIsSaving(true);

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			const { pageRow } = await pagesService
				.updateGroupSessionsRow(currentPageRow.pageRowId, { groupSessionIds })
				.fetch();

			updatePageRow(pageRow);
			setShowSelectGroupSessionsModal(false);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDragEnd = async ({ source, destination }: DropResult) => {
		if (!destination || !groupSessionsRow) {
			return;
		}

		const pageRowClone = cloneDeep(groupSessionsRow);
		const [removedContent] = pageRowClone.groupSessions.splice(source.index, 1);
		pageRowClone.groupSessions.splice(destination.index, 0, removedContent);

		updatePageRow(pageRowClone);
		setIsSaving(true);

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			const { pageRow } = await pagesService
				.updateGroupSessionsRow(currentPageRow.pageRowId, {
					groupSessionIds: pageRowClone.groupSessions.map((gs) => gs.groupSessionId),
				})
				.fetch();

			updatePageRow(pageRow);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<>
			<SelectGroupSessionsModal
				groupSessionIds={(groupSessionsRow?.groupSessions ?? []).map((gs) => gs.groupSessionId)}
				show={showSelectGroupSessionsModal}
				onHide={() => setShowSelectGroupSessionsModal(false)}
				onAdd={handleGroupSessionsAdd}
			/>

			<PageSectionShelfPage
				showBackButton
				onBackButtonClick={onBackButtonClick}
				showDeleteButton
				onDeleteButtonClick={() => {
					window.alert('[TODO]: Delete group sessions row');
				}}
				title={`Group Sessions (${(groupSessionsRow?.groupSessions ?? []).length})`}
				customHeaderElements={
					<Button className="me-2" size="sm" onClick={() => setShowSelectGroupSessionsModal(true)}>
						Add group sessions
					</Button>
				}
			>
				<DragDropContext onDragEnd={handleDragEnd}>
					<Droppable droppableId="row-settings-group-sessions-droppable" direction="vertical">
						{(droppableProvided) => (
							<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
								{(groupSessionsRow?.groupSessions ?? []).map((groupSession, groupSessionIndex) => (
									<Draggable
										key={groupSession.groupSessionId}
										draggableId={`row-settings-group-sessions-draggable-${groupSession.groupSessionId}`}
										index={groupSessionIndex}
									>
										{(draggableProvided, draggableSnapshot) => (
											<DraggableItem
												key={groupSession.groupSessionId}
												draggableProvided={draggableProvided}
												draggableSnapshot={draggableSnapshot}
												title={groupSession.title}
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
