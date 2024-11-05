import React, { useCallback, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import classNames from 'classnames';

import { PatientOrderModel, PatientOrderResourcingStatusId, ReferenceDataResponse } from '@/lib/models';
import { MhicCareResourceSearchModal, MhicResourcesModal } from '@/components/integrated-care/mhic';
import InlineAlert from '@/components/inline-alert';

import { ReactComponent as DragIndicator } from '@/assets/icons/drag-indicator.svg';
import { ReactComponent as MinusIcon } from '@/assets/icons/icon-minus.svg';

interface Props {
	patientOrder: PatientOrderModel;
	referenceData: ReferenceDataResponse;
	disabled?: boolean;
	className?: string;
}

export const MhicNextStepsResources = ({ patientOrder, referenceData, disabled, className }: Props) => {
	const [showResourcesModal, setShowResourcesModal] = useState(false);
	const [showCareResourceSearchModal, setShowCareResourceSearchModal] = useState(false);
	const revalidator = useRevalidator();

	const handleResourcesModalSave = useCallback(
		(_updatedPatientOrder: PatientOrderModel) => {
			setShowResourcesModal(false);
			revalidator.revalidate();
		},
		[revalidator]
	);

	const [items, setItems] = useState([
		{
			itemId: '0',
			resourceName: 'Merakay',
			locationName: 'Malvern',
			date: '1-1-24',
			createdBy: 'MHIC',
		},
		{
			itemId: '1',
			resourceName: 'Merakay',
			locationName: 'Brookhaven',
			date: '1-1-24',
			createdBy: 'MHIC',
		},
		{
			itemId: '2',
			resourceName: 'Merakay',
			locationName: 'Havertown',
			date: '1-1-24',
			createdBy: 'MHIC',
		},
	]);

	const handleDragEnd = ({ source, destination, type }: DropResult) => {
		if (!destination) {
			return;
		}

		const itemsClone = window.structuredClone(items);
		const [removed] = (itemsClone ?? []).splice(source.index, 1);
		(itemsClone ?? []).splice(destination.index, 0, removed);

		setItems(itemsClone);
	};

	return (
		<>
			<MhicResourcesModal
				patientOrder={patientOrder}
				referenceData={referenceData}
				show={showResourcesModal}
				onHide={() => {
					setShowResourcesModal(false);
				}}
				onSave={handleResourcesModalSave}
			/>

			<MhicCareResourceSearchModal
				show={showCareResourceSearchModal}
				onHide={() => {
					setShowCareResourceSearchModal(false);
				}}
			/>

			<div className={className}>
				{patientOrder.patientOrderResourcingStatusId === PatientOrderResourcingStatusId.NEEDS_RESOURCES && (
					<InlineAlert
						className="mb-6"
						variant="warning"
						title="Patient needs resources"
						action={{
							title: 'Mark as sent',
							onClick: () => {
								setShowResourcesModal(true);
							},
							disabled,
						}}
					/>
				)}

				{patientOrder.patientOrderResourcingStatusId === PatientOrderResourcingStatusId.SENT_RESOURCES && (
					<InlineAlert
						className="mb-6"
						variant="success"
						title={`Resources sent on ${patientOrder.resourcesSentAtDescription}`}
					/>
				)}

				<Card bsPrefix="ic-card">
					<Card.Header>
						<Card.Title>Patient Resources</Card.Title>
						<div className="button-container">
							<Button
								variant="primary"
								size="sm"
								onClick={() => {
									setShowCareResourceSearchModal(true);
								}}
							>
								Find Resources
							</Button>
						</div>
					</Card.Header>
					<Card.Body className="p-0">
						<div className="p-4">
							<p className="m-0">
								{items.length} resource{items.length === 1 ? ' is' : 's are'} currently available for
								the patient (drag to reorder)
							</p>
						</div>
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId="care-resources-droppable">
								{(droppableProvided) => (
									<ul
										ref={droppableProvided.innerRef}
										className="list-unstyled m-0"
										{...droppableProvided.droppableProps}
									>
										{items.map((item, itemIndex) => (
											<Draggable
												key={item.itemId}
												draggableId={`care-resources-draggable-${item.itemId}`}
												index={itemIndex}
											>
												{(draggableProvided, itemDraggableSnapshot) => (
													<li
														ref={draggableProvided.innerRef}
														className={classNames('bg-white d-flex align-items-center', {
															'border-top': !itemDraggableSnapshot.isDragging,
															border: itemDraggableSnapshot.isDragging,
															'shadow-lg': itemDraggableSnapshot.isDragging,
															rounded: itemDraggableSnapshot.isDragging,
														})}
														{...draggableProvided.draggableProps}
													>
														<div
															className="p-4 flex-shrink-0"
															{...draggableProvided.dragHandleProps}
														>
															<DragIndicator className="text-gray" />
														</div>
														<div className="py-4 flex-fill">
															<span className="d-block">
																{item.resourceName} ({item.locationName})
															</span>
															<span className="d-block text-gray">
																Add {item.date} by {item.createdBy}
															</span>
														</div>
														<div className="p-4 flex-shrink-0">
															<Button variant="danger" className="p-2">
																<MinusIcon className="d-flex" />
															</Button>
														</div>
													</li>
												)}
											</Draggable>
										))}
										{droppableProvided.placeholder}
									</ul>
								)}
							</Droppable>
						</DragDropContext>
					</Card.Body>
				</Card>
			</div>
		</>
	);
};
