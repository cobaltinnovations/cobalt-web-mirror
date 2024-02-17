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
import { MhicResourcesModal, MhicSafetyPlanningModal } from '@/components/integrated-care/mhic';
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
	const [showResourcesModal, setShowResourcesModal] = useState(false);
	const revalidator = useRevalidator();

	const handleSafetyPlanningModalSave = useCallback(
		(_updatedPatientOrder: PatientOrderModel) => {
			setShowSafetyPlanningModal(false);
			revalidator.revalidate();
		},
		[revalidator]
	);

	const handleResourcesModalSave = useCallback(
		(_updatedPatientOrder: PatientOrderModel) => {
			setShowResourcesModal(false);
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

			<MhicResourcesModal
				patientOrder={patientOrder}
				referenceData={referenceData}
				show={showResourcesModal}
				onHide={() => {
					setShowResourcesModal(false);
				}}
				onSave={handleResourcesModalSave}
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

				{patientOrder.patientOrderEncounterDocumentationStatusId ===
					PatientOrderEncounterDocumentationStatusId.NEEDS_DOCUMENTATION && (
					<InlineAlert
						className="mb-6"
						variant="warning"
						title="Encounter sync needed"
						action={{
							title: 'Sync to Epic',
							onClick: () => {
								alert('TODO');
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
