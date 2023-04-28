import React, { useCallback, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';

import { PatientOrderModel, PatientOrderResourcingStatusId } from '@/lib/models';
import { MhicResourcesModal } from '@/components/integrated-care/mhic';
import { useRevalidator } from 'react-router-dom';

interface Props {
	patientOrder: PatientOrderModel;
	disabled?: boolean;
	className?: string;
}

export const MhicNextStepsCard = ({ patientOrder, disabled, className }: Props) => {
	const [showResourcesModal, setShowResourcesModal] = useState(false);
	const revalidator = useRevalidator();

	const handleResourcesModalSave = useCallback(
		(updatedPatientOrder: PatientOrderModel) => {
			setShowResourcesModal(false);
			revalidator.revalidate();
		},
		[revalidator]
	);

	return (
		<>
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
					<Card.Title className="text-danger">[TODO]: Next Steps</Card.Title>
				</Card.Header>
				<Card.Body>
					<div className="mb-4 d-flex align-items-center justify-content-between">
						<Form.Check
							type="switch"
							id="safety-planning-switch"
							label={
								<div>
									<p className="mb-0">Safety Planning</p>
									<p className="mb-0 text-gray">Recommended</p>
								</div>
							}
							disabled={disabled}
						/>
						<div>
							<Button
								variant="link"
								size="sm"
								className="p-0 fw-semibold text-decoration-none"
								disabled={disabled}
							>
								Mark Complete
							</Button>
						</div>
					</div>
					<hr className="mb-4" />
					<div className="d-flex align-items-center justify-content-between">
						<Form.Check
							type="switch"
							id="safety-planning-switch"
							label={
								<div>
									<p className="mb-0">Resources</p>
									<p className="mb-0 text-gray">
										{patientOrder.patientOrderResourcingStatusId ===
											PatientOrderResourcingStatusId.NEEDS_RESOURCES && 'Recommended'}
										{patientOrder.patientOrderResourcingStatusId ===
											PatientOrderResourcingStatusId.SENT_RESOURCES &&
											`Resources sent on {patientOrder.resourcesSentAtDescription ?? 'N/A'}`}
									</p>
								</div>
							}
							disabled={disabled}
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
									disabled={disabled}
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
