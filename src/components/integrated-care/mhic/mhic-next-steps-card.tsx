import React, { useCallback, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';

import { PatientOrderModel, PatientOrderResourcingStatusId, PatientOrderSafetyPlanningStatusId } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';
import { MhicResourcesModal, MhicSafetyPlanningModal } from '@/components/integrated-care/mhic';
import { integratedCareService } from '@/lib/services';

interface Props {
	patientOrder: PatientOrderModel;
	onPatientOrderChange(patientOrder: PatientOrderModel): void;
	disabled?: boolean;
	className?: string;
}

export const MhicNextStepsCard = ({ patientOrder, onPatientOrderChange, disabled, className }: Props) => {
	const handleError = useHandleError();
	const [showSafetyPlanningModal, setShowSafetyPlanningModal] = useState(false);
	const [showResourcesModal, setShowResourcesModal] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const handleSafetyPlanningModalSave = useCallback(
		(updatedPatientOrder: PatientOrderModel) => {
			setShowSafetyPlanningModal(false);
			onPatientOrderChange(updatedPatientOrder);
		},
		[onPatientOrderChange]
	);

	const handleResourcesModalSave = useCallback(
		(updatedPatientOrder: PatientOrderModel) => {
			setShowResourcesModal(false);
			onPatientOrderChange(updatedPatientOrder);
		},
		[onPatientOrderChange]
	);

	const handleSafetyPlanningToggleChange = useCallback(
		async ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			try {
				setIsSaving(true);

				const response = await integratedCareService
					.updateSafetyPlanningStatus(patientOrder.patientOrderId, {
						patientOrderSafetyPlanningStatusId: currentTarget.checked
							? PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING
							: PatientOrderSafetyPlanningStatusId.NONE_NEEDED,
					})
					.fetch();

				onPatientOrderChange(response.patientOrder);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[handleError, onPatientOrderChange, patientOrder.patientOrderId]
	);

	const handleResourcesToggleChange = useCallback(
		async ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			try {
				setIsSaving(true);

				const response = await integratedCareService
					.updateResourcingStatus(patientOrder.patientOrderId, {
						patientOrderResourcingStatusId: currentTarget.checked
							? PatientOrderResourcingStatusId.NEEDS_RESOURCES
							: PatientOrderResourcingStatusId.NONE_NEEDED,
					})
					.fetch();

				onPatientOrderChange(response.patientOrder);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[handleError, onPatientOrderChange, patientOrder.patientOrderId]
	);

	return (
		<>
			<MhicSafetyPlanningModal
				patientOrder={patientOrder}
				show={showSafetyPlanningModal}
				onHide={() => {
					setShowSafetyPlanningModal(false);
				}}
				onSave={handleSafetyPlanningModalSave}
			/>

			<MhicResourcesModal
				patientOrder={patientOrder}
				show={showResourcesModal}
				onHide={() => {
					setShowResourcesModal(false);
				}}
				onSave={handleResourcesModalSave}
			/>

			<Card bsPrefix="ic-card" className={className}>
				<Card.Header>
					<Card.Title>Next Steps</Card.Title>
				</Card.Header>
				<Card.Body>
					<div className="mb-4 d-flex align-items-center justify-content-between">
						<Form.Check
							type="switch"
							id="safety-planning-switch"
							label={
								<div>
									<p className="mb-0">Safety Planning</p>
								</div>
							}
							checked={
								patientOrder.patientOrderSafetyPlanningStatusId ===
								PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING
							}
							onChange={handleSafetyPlanningToggleChange}
							disabled={disabled || isSaving}
						/>
						{patientOrder.patientOrderSafetyPlanningStatusId ===
							PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING && (
							<div>
								<Button
									variant="link"
									size="sm"
									className="p-0 fw-semibold text-decoration-none"
									onClick={() => {
										setShowSafetyPlanningModal(true);
									}}
									disabled={disabled || isSaving}
								>
									Mark Complete
								</Button>
							</div>
						)}
					</div>
					<hr className="mb-4" />
					<div className="d-flex align-items-center justify-content-between">
						<Form.Check
							type="switch"
							id="resources-needed-switch"
							label={
								<div>
									<p className="mb-0">Resources</p>
									<p className="mb-0 text-gray">
										{patientOrder.patientOrderResourcingStatusId ===
											PatientOrderResourcingStatusId.SENT_RESOURCES &&
											`Resources sent on ${patientOrder.resourcesSentAtDescription ?? 'N/A'}`}
									</p>
								</div>
							}
							checked={
								patientOrder.patientOrderResourcingStatusId ===
								PatientOrderResourcingStatusId.NEEDS_RESOURCES
							}
							onChange={handleResourcesToggleChange}
							disabled={disabled || isSaving}
						/>
						{patientOrder.patientOrderResourcingStatusId ===
							PatientOrderResourcingStatusId.NEEDS_RESOURCES && (
							<div>
								<Button
									variant="link"
									size="sm"
									className="p-0 fw-semibold text-decoration-none"
									onClick={() => {
										setShowResourcesModal(true);
									}}
									disabled={disabled || isSaving}
								>
									Mark Complete
								</Button>
							</div>
						)}
					</div>
				</Card.Body>
			</Card>
		</>
	);
};
