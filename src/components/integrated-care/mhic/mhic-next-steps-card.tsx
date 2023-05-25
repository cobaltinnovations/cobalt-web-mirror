import React, { useCallback, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { Button, Card, Form } from 'react-bootstrap';

import {
	PatientOrderModel,
	PatientOrderResourcingStatusId,
	PatientOrderSafetyPlanningStatusId,
	ReferenceDataResponse,
} from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { MhicResourcesModal, MhicSafetyPlanningModal } from '@/components/integrated-care/mhic';
import useAccount from '@/hooks/use-account';

interface Props {
	patientOrder: PatientOrderModel;
	referenceData: ReferenceDataResponse;
	disabled?: boolean;
	className?: string;
}

export const MhicNextStepsCard = ({ patientOrder, referenceData, disabled, className }: Props) => {
	const { account } = useAccount();
	const handleError = useHandleError();
	const [showSafetyPlanningModal, setShowSafetyPlanningModal] = useState(false);
	const [showResourcesModal, setShowResourcesModal] = useState(false);
	const revalidator = useRevalidator();
	const [isSaving, setIsSaving] = useState(false);

	const handleSafetyPlanningModalSave = useCallback(
		(updatedPatientOrder: PatientOrderModel) => {
			setShowSafetyPlanningModal(false);
			revalidator.revalidate();
		},
		[revalidator]
	);

	const handleResourcesModalSave = useCallback(
		(updatedPatientOrder: PatientOrderModel) => {
			setShowResourcesModal(false);
			revalidator.revalidate();
		},
		[revalidator]
	);

	const handleSafetyPlanningToggleChange = useCallback(
		async ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			try {
				setIsSaving(true);

				await integratedCareService
					.updateSafetyPlanningStatus(patientOrder.patientOrderId, {
						patientOrderSafetyPlanningStatusId: currentTarget.checked
							? PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING
							: PatientOrderSafetyPlanningStatusId.NONE_NEEDED,
					})
					.fetch();

				revalidator.revalidate();
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[handleError, patientOrder.patientOrderId, revalidator]
	);

	const handleResourcesToggleChange = useCallback(
		async ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			try {
				setIsSaving(true);

				await integratedCareService
					.updateResourcingStatus(patientOrder.patientOrderId, {
						patientOrderResourcingStatusId: currentTarget.checked
							? PatientOrderResourcingStatusId.NEEDS_RESOURCES
							: PatientOrderResourcingStatusId.NONE_NEEDED,
					})
					.fetch();

				revalidator.revalidate();
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[handleError, patientOrder.patientOrderId, revalidator]
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
				referenceData={referenceData}
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
					{/* {patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.MHP && (
						<>
							{patientOrder.appointmentId ? (
								<NoData
									className="mb-4 bg-white"
									title="Appointment is Scheduled"
									description={`${patientOrder.appointmentStartTimeDescription} with ${patientOrder.providerName}`}
									actions={[
										{
											variant: 'primary',
											title: 'Cancel Appointment',
											onClick: () => {
												window.alert('TODO: Cancel appointment UI');
											},
										},
									]}
								/>
							) : (
								<NoData
									className="mb-4"
									title="No Appointment"
									description="The patient's appointment information will appear here"
									actions={[
										{
											variant: 'primary',
											title: 'Schedule Appointment',
											onClick: () => {
												navigate(
													`/ic/mhic/connect-with-support/mhp?patientOrderId=${patientOrder.patientOrderId}`
												);
											},
										},
									]}
								/>
							)}
						</>
					)} */}
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
							disabled={disabled || isSaving || !account?.accountCapabilityFlags.canEditIcSafetyPlanning}
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
									disabled={
										disabled || isSaving || !account?.accountCapabilityFlags.canEditIcSafetyPlanning
									}
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
