import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import {
	PatientOrderModel,
	PatientOrderResourcingStatusId,
	PatientOrderSafetyPlanningStatusId,
	ReferenceDataResponse,
} from '@/lib/models';
import { MhicChangeTriageModal, MhicInlineAlert, MhicResourcesModal } from '@/components/integrated-care/mhic';
import NoData from '@/components/no-data';

import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';

interface Props {
	patientOrder: PatientOrderModel;
	referenceData: ReferenceDataResponse;
	onPatientOrderChange(patientOrder: PatientOrderModel): void;
}

export const MhicAssessmentResults = ({ patientOrder, onPatientOrderChange }: Props) => {
	const navigate = useNavigate();
	const [showChangeTriageModal, setShowChangeTriageModal] = useState(false);
	const [showResourcesModal, setShowResourcesModal] = useState(false);

	const handleResourcesModalSave = useCallback(
		(updatedPatientOrder: PatientOrderModel) => {
			setShowResourcesModal(false);
			onPatientOrderChange(updatedPatientOrder);
		},
		[onPatientOrderChange]
	);

	return (
		<>
			<MhicChangeTriageModal
				show={showChangeTriageModal}
				onHide={() => {
					setShowChangeTriageModal(false);
				}}
				onSave={() => {
					setShowChangeTriageModal(false);
				}}
			/>

			<MhicResourcesModal
				patientOrder={patientOrder}
				show={showResourcesModal}
				onHide={() => {
					setShowResourcesModal(false);
				}}
				onSave={handleResourcesModalSave}
			/>

			<section>
				<Container fluid>
					{!patientOrder.screeningSession && (
						<Row>
							<Col>
								<NoData
									title="No Results Available"
									description="Assessment results will appear after the patient completes the assessment"
									actions={[]}
								/>
							</Col>
						</Row>
					)}
					{patientOrder.screeningSessionResult && (
						<>
							<Row className="mb-6">
								<Col>
									<div className="d-flex align-items-center justify-content-between">
										<h4 className="mb-0">Assessment</h4>
										<Button
											variant="primary"
											className="d-flex align-items-center"
											onClick={() => {
												navigate(`/ic/mhic/orders/${patientOrder.patientOrderId}/assessment`);
											}}
										>
											Review <ExternalIcon className="ms-2" width={20} height={20} />
										</Button>
									</div>
									<p className="mb-0">
										Completed{' '}
										<strong>{patientOrder.screeningSession?.completedAtDescription}</strong> by{' '}
										<strong className="text-danger">[TODO]: completedBy</strong>
									</p>
								</Col>
							</Row>
							{patientOrder.patientOrderSafetyPlanningStatusId ===
								PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING && (
								<MhicInlineAlert
									className="mb-6"
									variant="danger"
									title="Patient needs safety planning"
									description="[TODO]: Reason, Reason, Reason, Reason, Reason, Reason, Reason, Reason, Reason, Reason"
									action={{
										title: '[TODO]: Complete Handoff',
										onClick: () => {
											window.alert('[TODO]: Not sure what this does.');
										},
									}}
								/>
							)}
							{patientOrder.patientOrderSafetyPlanningStatusId ===
								PatientOrderSafetyPlanningStatusId.CONNECTED_TO_SAFETY_PLANNING && (
								<MhicInlineAlert
									className="mb-6"
									variant="success"
									title={`Patient connected to Safety Planning on ${patientOrder.connectedToSafetyPlanningAtDescription}`}
									description="[TODO]: Reason for Safety Planning: [Reason]"
								/>
							)}
							{patientOrder.patientOrderTriageGroups?.map((triageGroup, triageGroupIndex) => (
								<Row key={triageGroupIndex} className="mb-6">
									<Col>
										<Card bsPrefix="ic-card">
											<Card.Header>
												<Card.Title>
													Triage:{' '}
													<span className="text-uppercase">
														{triageGroup.patientOrderCareTypeDescription}
													</span>
												</Card.Title>
												<div className="button-container">
													<Button
														variant="light"
														className="p-2"
														onClick={() => {
															setShowChangeTriageModal(true);
														}}
													>
														<EditIcon className="d-flex" />
													</Button>
												</div>
											</Card.Header>
											<Card.Body key={triageGroupIndex}>
												<Container fluid>
													<Row className="mb-4">
														<Col xs={3}>
															<p className="m-0 text-gray">Care Focus</p>
														</Col>
														<Col xs={9}>
															<p className="m-0">
																{triageGroup.patientOrderFocusTypeDescription}
															</p>
														</Col>
													</Row>
													<Row>
														<Col xs={3}>
															<p className="m-0 text-gray">Reason</p>
														</Col>
														<Col xs={9}>
															{triageGroup.reasons.map((reason, reasonIndex) => (
																<p key={reasonIndex} className="m-0">
																	{reason}
																</p>
															))}
														</Col>
													</Row>
												</Container>
											</Card.Body>
										</Card>
									</Col>
								</Row>
							))}
							{patientOrder.patientOrderResourcingStatusId && (
								<Row>
									<Col>
										<Card bsPrefix="ic-card">
											<Card.Header>
												<Card.Title>Resources</Card.Title>
												<div className="button-container">
													{patientOrder.patientOrderResourcingStatusId ===
														PatientOrderResourcingStatusId.NEEDS_RESOURCES && (
														<Button
															variant="light"
															size="sm"
															onClick={() => {
																setShowResourcesModal(true);
															}}
														>
															Mark as Sent
														</Button>
													)}
												</div>
											</Card.Header>
											<Card.Body>
												{patientOrder.patientOrderResourcingStatusId ===
													PatientOrderResourcingStatusId.NEEDS_RESOURCES && (
													<MhicInlineAlert
														variant="warning"
														title="Resources needed"
														description="Triage indicates the patient needs external resources"
													/>
												)}
												{patientOrder.patientOrderResourcingStatusId ===
													PatientOrderResourcingStatusId.SENT_RESOURCES && (
													<MhicInlineAlert
														variant="success"
														title={`Resources sent on ${patientOrder.resourcesSentAtDescription}`}
														action={{
															title: '[TODO]: Review contact history for more details',
															onClick: () => {
																window.alert('[TODO]: ?');
															},
														}}
													/>
												)}
											</Card.Body>
										</Card>
									</Col>
								</Row>
							)}
						</>
					)}
				</Container>
			</section>
		</>
	);
};
