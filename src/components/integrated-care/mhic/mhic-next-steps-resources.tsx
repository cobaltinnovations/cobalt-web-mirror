import React, { useCallback, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';

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
							<p className="m-0">2 resources are currently available for the patient (drag to reorder)</p>
						</div>
						<ul className="list-unstyled m-0">
							<li className="border-top d-flex align-items-center">
								<div className="p-4 flex-shrink-0">Handle</div>
								<div className="py-4 flex-fill">
									<span className="d-block">[Resource Name] ([LocationName])</span>
									<span className="d-block">Add [date] by [Person who created]</span>
								</div>
								<div className="p-4 flex-shrink-0">Remove</div>
							</li>
							<li className="border-top d-flex align-items-center">
								<div className="p-4 flex-shrink-0">Handle</div>
								<div className="py-4 flex-fill">
									<span className="d-block">[Resource Name] ([LocationName])</span>
									<span className="d-block">Add [date] by [Person who created]</span>
								</div>
								<div className="p-4 flex-shrink-0">Remove</div>
							</li>
							<li className="border-top d-flex align-items-center">
								<div className="p-4 flex-shrink-0">Handle</div>
								<div className="py-4 flex-fill">
									<span className="d-block">[Resource Name] ([LocationName])</span>
									<span className="d-block">Add [date] by [Person who created]</span>
								</div>
								<div className="p-4 flex-shrink-0">Remove</div>
							</li>
						</ul>
					</Card.Body>
				</Card>
			</div>
		</>
	);
};
