import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import { PatientOrderModel, ReferenceDataResponse, ScreeningSessionScreeningResult } from '@/lib/models';
import { MhicAssessmentModal, MhicChangeTriageModal, MhicInlineAlert } from '@/components/integrated-care/mhic';
import NoData from '@/components/no-data';

import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';

interface Props {
	patientOrder: PatientOrderModel;
	referenceData: ReferenceDataResponse;
	onPatientOrderChange(patientOrder: PatientOrderModel): void;
}

export const MhicAssessmentResults = ({ patientOrder, referenceData, onPatientOrderChange }: Props) => {
	const navigate = useNavigate();
	const [showChangeTriageModal, setShowChangeTriageModal] = useState(false);
	const [screeningSessionScreeningResult, setScreeningSessionScreeningResult] =
		useState<ScreeningSessionScreeningResult>();

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

			<MhicAssessmentModal
				show={!!screeningSessionScreeningResult}
				screeningType={referenceData.screeningTypes.find(
					(st) => st.screeningTypeId === screeningSessionScreeningResult?.screeningTypeId
				)}
				screeningSessionScreeningResult={screeningSessionScreeningResult}
				onHide={() => {
					setScreeningSessionScreeningResult(undefined);
				}}
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
							<MhicInlineAlert
								className="mb-6"
								variant="danger"
								title="[TODO]: Patient needs safety planning"
								description="[TODO]: Reason, Reason, Reason, Reason, Reason, Reason, Reason, Reason, Reason, Reason"
								action={{
									title: '[TODO]: Complete Handoff',
									onClick: () => {
										window.alert('[TODO]: Not sure what this does.');
									},
								}}
							/>
							<MhicInlineAlert
								className="mb-6"
								variant="success"
								title="[TODO]: Patient connected to Safety Planning on [Date] at [Time]"
								description="[TODO]: Reason for Safety Planning: [Reason]"
							/>
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
							<Row>
								<Col>
									<Card bsPrefix="ic-card">
										<Card.Header>
											<Card.Title>Resources</Card.Title>
											<div className="button-container">
												<Button
													variant="light"
													size="sm"
													onClick={() => {
														window.alert('[TODO]: mark it');
													}}
												>
													Mark as Sent
												</Button>
												<Button
													variant="light"
													size="sm"
													onClick={() => {
														window.alert('[TODO]: ?');
													}}
												>
													Add Request
												</Button>
											</div>
										</Card.Header>
										<Card.Body>
											<MhicInlineAlert
												className="mb-4"
												variant="warning"
												title="[TODO]: Resources needed"
												description="[TODO]: Triage indicates the patient needs external resources"
											/>
											<MhicInlineAlert
												variant="success"
												title="[TODO]: Resources sent on [Date] at [Time]"
												action={{
													title: '[TODO]: Review contact history for more details',
													onClick: () => {
														window.alert('[TODO]: ?');
													},
												}}
											/>
										</Card.Body>
									</Card>
								</Col>
							</Row>
						</>
					)}
				</Container>
			</section>
			{/* {patientOrder.screeningSessionResult && (
				<section>
					<Container fluid>
						<Row className="mb-6">
							<Col>
								<h4 className="mb-0">Assessment Scores</h4>
							</Col>
						</Row>
						<Row>
							<Col>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell header colSpan={5}>
												<span>Assessments &amp; Scores</span>
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{patientOrder.screeningSessionResult?.screeningSessionScreeningResults?.map(
											(screening) => (
												<TableRow key={screening.screeningId}>
													<TableCell width={44} className="pe-0">
														{(screening.belowScoringThreshold === undefined ||
															screening.belowScoringThreshold === null) && (
															<NaIcon className="text-gray" />
														)}
														{screening.belowScoringThreshold === false && (
															<DissatisfiedIcon className="text-danger" />
														)}
														{screening.belowScoringThreshold === true && (
															<SatisfiedIcon className="text-success" />
														)}
													</TableCell>
													<TableCell>
														<span className="fw-semibold">{screening.screeningName}</span>
													</TableCell>
													<TableCell width={72} className="pe-0">
														<span className="text-gray">Score:</span>
													</TableCell>
													<TableCell width={32} className="px-0 text-right">
														<span className="fw-bold">
															{screening.screeningScore?.overallScore ?? (
																<span className="text-gray">N/A</span>
															)}
														</span>
													</TableCell>
													<TableCell width={84} className="text-center">
														{screening.screeningScore?.overallScore !== undefined && (
															<Button
																variant="link"
																size="sm"
																className="p-0 text-decoration-none fw-normal"
																onClick={() => {
																	setScreeningSessionScreeningResult(screening);
																}}
															>
																View
															</Button>
														)}
													</TableCell>
												</TableRow>
											)
										)}
									</TableBody>
								</Table>
							</Col>
						</Row>
					</Container>
				</section>
			)} */}
		</>
	);
};
