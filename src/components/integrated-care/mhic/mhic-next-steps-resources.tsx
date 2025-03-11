import React, { useCallback, useEffect, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import classNames from 'classnames';

import {
	PatientOrderModel,
	PatientOrderResourcingStatusId,
	ReferenceDataResponse,
	ResourcePacketLocation,
} from '@/lib/models';
import { careResourceService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import {
	MhicCareResourcePreviewModal,
	MhicCareResourceSearchModal,
	MhicResourcesModal,
} from '@/components/integrated-care/mhic';
import InlineAlert from '@/components/inline-alert';

import { ReactComponent as DragIndicator } from '@/assets/icons/drag-indicator.svg';
import { ReactComponent as MinusIcon } from '@/assets/icons/icon-minus.svg';
import ConfirmDialog from '@/components/confirm-dialog';

interface Props {
	patientOrder: PatientOrderModel;
	referenceData: ReferenceDataResponse;
	disabled?: boolean;
	className?: string;
}

export const MhicNextStepsResources = ({ patientOrder, referenceData, disabled, className }: Props) => {
	const { institution } = useAccount();
	const handleError = useHandleError();
	const [showResourcesModal, setShowResourcesModal] = useState(false);
	const [showCareResourceSearchModal, setShowCareResourceSearchModal] = useState(false);
	const [showCareResourcePreviewModal, setShowCareResourcePreviewModal] = useState(false);
	const [careResourceLocations, setCareResourceLocations] = useState<ResourcePacketLocation[]>([]);
	const revalidator = useRevalidator();
	const [showExampleMessageModal, setShowExampleMessageModal] = useState(false);

	const handleResourcesModalSave = useCallback(
		(_updatedPatientOrder: PatientOrderModel) => {
			setShowResourcesModal(false);
			revalidator.revalidate();
		},
		[revalidator]
	);

	// In order to not have the drag-n-drop jump around during API calls
	// clone the packet into its own state
	useEffect(() => {
		setCareResourceLocations(patientOrder.resourcePacket?.careResourceLocations ?? []);
	}, [patientOrder]);

	const handleDragEnd = async ({ source, destination }: DropResult) => {
		if (!destination) {
			return;
		}

		const itemsClone = window.structuredClone(careResourceLocations);
		const [removed] = (itemsClone ?? []).splice(source.index, 1);
		(itemsClone ?? []).splice(destination.index, 0, removed);

		// Optimistically update UI so drag-n-drop feels fast/tight/responsive
		setCareResourceLocations(itemsClone);

		try {
			await careResourceService
				.reorderCareResourceLocationPacket(removed.resourcePacketCareResourceLocationId, {
					displayOrder: destination.index,
				})
				.fetch();
		} catch (error) {
			handleError(error);
		} finally {
			// Revalidate after reorder call to get the "true" order from the backend
			// This will automatically fire the useEffect above to update the internal drag-n-drop state
			revalidator.revalidate();
		}
	};

	const handleMinusButtonClick = async (resourcePacketLocation: ResourcePacketLocation) => {
		try {
			await careResourceService
				.removeCareResourceLocationToPatientOrderResourcePacket(
					resourcePacketLocation.resourcePacketCareResourceLocationId
				)
				.fetch();

			revalidator.revalidate();
		} catch (error) {
			handleError(error);
		}
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
				patientOrder={patientOrder}
				show={showCareResourceSearchModal}
				onHide={() => {
					setShowCareResourceSearchModal(false);
				}}
			/>

			<MhicCareResourcePreviewModal
				patientOrder={patientOrder}
				show={showCareResourcePreviewModal}
				onHide={() => {
					setShowCareResourcePreviewModal(false);
				}}
			/>

			<ConfirmDialog
				size="lg"
				show={showExampleMessageModal}
				titleText="Example Message"
				bodyText={`Copy & paste the following message into ${institution.myChartName}`}
				showDissmissButton={false}
				detailText={
					<div
						className="mt-4"
						dangerouslySetInnerHTML={{
							__html: patientOrder.resourcePacket?.patientMessage ?? '',
						}}
					/>
				}
				dismissText={''}
				confirmText="Done"
				onConfirm={() => {
					setShowExampleMessageModal(false);
				}}
				onHide={() => {
					setShowExampleMessageModal(false);
				}}
			/>

			<div className={className}>
				{patientOrder.patientOrderResourcingStatusId === PatientOrderResourcingStatusId.NEEDS_RESOURCES && (
					<>
						<InlineAlert
							className="mb-6"
							variant="warning"
							title="Patient needs resources"
							description={
								institution.resourcePacketsEnabled ? (
									<>
										Remember to send a{' '}
										<Button
											variant="link"
											className="p-0 m-0 fw-normal"
											onClick={() => {
												setShowExampleMessageModal(true);
											}}
										>
											{institution.myChartName} message
										</Button>{' '}
										to the patient once resources are available.
									</>
								) : undefined
							}
							action={{
								title: 'Mark as sent',
								onClick: () => {
									setShowResourcesModal(true);
								},
								disabled,
							}}
						/>
					</>
				)}

				{patientOrder.patientOrderResourcingStatusId === PatientOrderResourcingStatusId.SENT_RESOURCES && (
					<InlineAlert
						className="mb-6"
						variant="success"
						title={`Resources sent on ${patientOrder.resourcesSentAtDescription}`}
						description={
							institution.resourcePacketsEnabled ? (
								<>
									View{' '}
									<Button
										variant="link"
										className="p-0 m-0 fw-normal"
										onClick={() => {
											setShowExampleMessageModal(true);
										}}
									>
										{institution.myChartName} example message
									</Button>
								</>
							) : undefined
						}
					/>
				)}

				{institution.resourcePacketsEnabled && (
					<Card bsPrefix="ic-card">
						<Card.Header>
							<Card.Title>Patient Resources</Card.Title>
							<div className="button-container">
								<Button
									variant="link"
									className="text-decoration-none"
									size="sm"
									onClick={() => {
										setShowCareResourcePreviewModal(true);
									}}
								>
									Preview
								</Button>
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
									{careResourceLocations.length} resource
									{careResourceLocations.length === 1 ? ' is' : 's are'} currently available for the
									patient (drag to reorder)
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
											{careResourceLocations.map((crl, itemIndex) => (
												<Draggable
													key={crl.resourcePacketCareResourceLocationId}
													draggableId={`care-resources-draggable-${crl.resourcePacketCareResourceLocationId}`}
													index={itemIndex}
												>
													{(draggableProvided, itemDraggableSnapshot) => (
														<li
															ref={draggableProvided.innerRef}
															className={classNames(
																'bg-white d-flex align-items-center',
																{
																	'border-top': !itemDraggableSnapshot.isDragging,
																	border: itemDraggableSnapshot.isDragging,
																	'shadow-lg': itemDraggableSnapshot.isDragging,
																	rounded: itemDraggableSnapshot.isDragging,
																}
															)}
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
																	{crl.careResourceLocationName} (
																	{crl.careResourceLocationName})
																</span>
																<span className="d-block text-gray">
																	Added {crl.addedDateDescription} by{' '}
																	{crl.addedByDisplayName}
																</span>
															</div>
															<div className="p-4 flex-shrink-0">
																<Button
																	variant="danger"
																	className="p-2"
																	onClick={() => {
																		handleMinusButtonClick(crl);
																	}}
																>
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
				)}
			</div>
		</>
	);
};
