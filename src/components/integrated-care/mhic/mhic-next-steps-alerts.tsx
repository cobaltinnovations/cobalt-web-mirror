import React, { useCallback, useState } from 'react';
import { useRevalidator } from 'react-router-dom';

import {
	PatientOrderModel,
	PatientOrderResourcingStatusId,
	PatientOrderSafetyPlanningStatusId,
	PatientOrderEncounterDocumentationStatusId,
	ReferenceDataResponse,
} from '@/lib/models';
import useAccount from '@/hooks/use-account';
import { MhicEncounterModal, MhicSafetyPlanningModal } from '@/components/integrated-care/mhic';
import InlineAlert from '@/components/inline-alert';

interface Props {
	patientOrder: PatientOrderModel;
	referenceData: ReferenceDataResponse;
	disabled?: boolean;
	className?: string;
}

export const MhicNextStepsAlerts = ({ patientOrder, referenceData, disabled, className }: Props) => {
	const { account } = useAccount();
	const [showSafetyPlanningModal, setShowSafetyPlanningModal] = useState(false);
	const [showEncounterModal, setShowEncounterModal] = useState(false);
	const revalidator = useRevalidator();

	const handleSafetyPlanningModalSave = useCallback(
		(_updatedPatientOrder: PatientOrderModel) => {
			setShowSafetyPlanningModal(false);
			revalidator.revalidate();
		},
		[revalidator]
	);

	const handleEncounterModalSave = useCallback(
		(_updatedPatientOrder: PatientOrderModel) => {
			setShowEncounterModal(false);
			revalidator.revalidate();
		},
		[revalidator]
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

			<MhicEncounterModal
				patientOrder={patientOrder}
				show={showEncounterModal}
				onHide={() => {
					setShowEncounterModal(false);
				}}
				onSave={handleEncounterModalSave}
			/>

			<div className={className}>
				{patientOrder.patientOrderSafetyPlanningStatusId ===
					PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING && (
					<InlineAlert
						className="mb-6"
						variant="danger"
						title="Patient needs safety planning"
						action={{
							title: 'Mark as complete',
							onClick: () => {
								setShowSafetyPlanningModal(true);
							},
							disabled: disabled || !account?.accountCapabilityFlags.canEditIcSafetyPlanning,
						}}
					/>
				)}

				{patientOrder.patientOrderEncounterDocumentationStatusId ===
					PatientOrderEncounterDocumentationStatusId.NEEDS_DOCUMENTATION && (
					<InlineAlert
						className="mb-6"
						variant="warning"
						title="Encounter sync needed"
						action={{
							title: 'Sync to Epic',
							onClick: () => {
								setShowEncounterModal(true);
							},
							disabled,
						}}
					/>
				)}

				{patientOrder.patientOrderSafetyPlanningStatusId ===
					PatientOrderSafetyPlanningStatusId.CONNECTED_TO_SAFETY_PLANNING && (
					<InlineAlert
						className="mb-6"
						variant="success"
						title={`Patient connected to Safety Planning on ${patientOrder.connectedToSafetyPlanningAtDescription}`}
					/>
				)}

				{patientOrder.patientOrderResourcingStatusId === PatientOrderResourcingStatusId.SENT_RESOURCES && (
					<InlineAlert
						className="mb-6"
						variant="success"
						title={`Resources sent on ${patientOrder.resourcesSentAtDescription}`}
					/>
				)}
			</div>
		</>
	);
};
