import React, { useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import { PatientOrderModel } from '@/lib/models';
import { MhicChangeTriageModal } from '@/components/integrated-care/mhic';
import { useIntegratedCareLoaderData } from '@/routes/ic/landing';
import { useRevalidator } from 'react-router-dom';
import useAccount from '@/hooks/use-account';

interface Props {
	patientOrder: PatientOrderModel;
	disabled?: boolean;
	className?: string;
}

export const MhicTriageCard = ({ patientOrder, disabled, className }: Props) => {
	const { account } = useAccount();
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const [showChangeTriageModal, setShowChangeTriageModal] = useState(false);
	const revalidator = useRevalidator();

	return (
		<>
			<MhicChangeTriageModal
				patientOrder={patientOrder}
				referenceData={referenceDataResponse}
				show={showChangeTriageModal}
				onHide={() => {
					setShowChangeTriageModal(false);
				}}
				onSave={(updatedPatientOrder) => {
					setShowChangeTriageModal(false);
					revalidator.revalidate();
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
								<Button
									variant="light"
									size="sm"
									onClick={() => {
										setShowChangeTriageModal(true);
									}}
									disabled={disabled || !account?.accountCapabilityFlags.canEditIcTriages}
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
