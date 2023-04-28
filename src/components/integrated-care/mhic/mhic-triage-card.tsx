import React, { useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import { PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import { MhicChangeTriageModal } from '@/components/integrated-care/mhic';

interface Props {
	patientOrder: PatientOrderModel;
	onPatientOrderChange(patientOrder: PatientOrderModel): void;
	referenceData: ReferenceDataResponse;
	disabled?: boolean;
	className?: string;
}

export const MhicTriageCard = ({ patientOrder, onPatientOrderChange, referenceData, disabled, className }: Props) => {
	const [showChangeTriageModal, setShowChangeTriageModal] = useState(false);

	return (
		<>
			<MhicChangeTriageModal
				patientOrder={patientOrder}
				referenceData={referenceData}
				show={showChangeTriageModal}
				onHide={() => {
					setShowChangeTriageModal(false);
				}}
				onSave={(updatedPatientOrder) => {
					setShowChangeTriageModal(false);
					onPatientOrderChange(updatedPatientOrder);
				}}
			/>

			{patientOrder.patientOrderTriageGroups?.map((triageGroup, triageGroupIndex) => {
				if (triageGroup.patientOrderCareTypeId !== patientOrder.patientOrderCareTypeId) {
					return <React.Fragment key={triageGroupIndex} />;
				}

				return (
					<Card key={triageGroupIndex} bsPrefix="ic-card" className={className}>
						<Card.Header>
							<Card.Title>
								Assessment Triage:{' '}
								<span className="text-uppercase">{triageGroup.patientOrderCareTypeDescription}</span>
							</Card.Title>
							<div className="button-container">
								<span className="me-3 text-uppercase text-gray">Enrolled</span>
								<Button
									variant="light"
									size="sm"
									onClick={() => {
										setShowChangeTriageModal(true);
									}}
									disabled={disabled}
								>
									Override
								</Button>
							</div>
						</Card.Header>
						<Card.Body>
							<Container fluid>
								{triageGroup.patientOrderFocusTypes.map((focusType) => (
									<Row key={focusType.patientOrderFocusTypeId}>
										<Col xs={3}>
											<p className="m-0 text-gray">
												{focusType.patientOrderFocusTypeDescription}
											</p>
										</Col>
										<Col xs={9}>
											{focusType.reasons.map((reason, reasonIndex) => (
												<p key={reasonIndex} className="m-0">
													{reason}
												</p>
											))}
										</Col>
									</Row>
								))}
							</Container>
						</Card.Body>
					</Card>
				);
			})}
		</>
	);
};
