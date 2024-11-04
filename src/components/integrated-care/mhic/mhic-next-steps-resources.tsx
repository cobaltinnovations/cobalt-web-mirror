import React, { useCallback, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import { PatientOrderModel, PatientOrderResourcingStatusId, ReferenceDataResponse } from '@/lib/models';
import { MhicCareResourceSearchModal, MhicResourcesModal } from '@/components/integrated-care/mhic';
import InlineAlert from '@/components/inline-alert';

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

				<Button
					onClick={() => {
						setShowCareResourceSearchModal(true);
					}}
				>
					[Temp Button] Open Resource Search
				</Button>
			</div>
		</>
	);
};
