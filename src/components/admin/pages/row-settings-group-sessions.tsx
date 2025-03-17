import { cloneDeep } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { GroupSessionsRowModel } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { DraggableItem, PageSectionShelfPage, SelectGroupSessionsModal } from '@/components/admin/pages';
import { ReactComponent as MinusIcon } from '@/assets/icons/icon-minus.svg';

interface RowSettingsGroupSessionsProps {
	onBackButtonClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	onDeleteButtonClick(): void;
}

export const RowSettingsGroupSessions = ({ onBackButtonClick, onDeleteButtonClick }: RowSettingsGroupSessionsProps) => {
	const handleError = useHandleError();
	const { setCurrentPageSectionId, currentPageRow, setCurrentPageRowId, updatePageRow, setIsSaving } =
		usePageBuilderContext();
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

	const handleRemoveItem = useCallback(
		async (groupSessionId: string) => {
			setIsSaving(true);

			try {
				if (!currentPageRow) {
					throw new Error('currentPageRow is undefined.');
				}

				const { pageRow } = await pagesService
					.deleteGroupSessionsRowGroupSession(currentPageRow.pageRowId, groupSessionId)
					.fetch();

				updatePageRow(pageRow);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[currentPageRow, handleError, setIsSaving, updatePageRow]
	);

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
				onDeleteButtonClick={onDeleteButtonClick}
				showCloseButton
				onCloseButtonButtonClick={() => {
					setCurrentPageSectionId('');
					setCurrentPageRowId('');
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
												subTitle={`${groupSession.facilitatorName} • ${groupSession.startDateTimeDescription}`}
												aside={
													<Button
														className="flex-shrink-0 ms-2 p-2"
														variant="danger"
														onClick={() => {
															handleRemoveItem(groupSession.groupSessionId);
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
