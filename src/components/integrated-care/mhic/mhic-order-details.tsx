import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import {
	PatientOrderDispositionId,
	PatientOrderModel,
	PatientOrderResourcingStatusId,
	PatientOrderSafetyPlanningStatusId,
	ReferenceDataResponse,
	ScreeningSessionScreeningResult,
} from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import {
	MhicAssessmentModal,
	MhicCloseEpisodeModal,
	MhicContactInformationModal,
	MhicDemographicsModal,
	MhicEpisodeCard,
	MhicInlineAlert,
	MhicInsuranceModal,
	MhicNextStepsCard,
	MhicScheduleAssessmentModal,
	MhicTriageCard,
} from '@/components/integrated-care/mhic';
import NoData from '@/components/no-data';

import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';

interface Props {
	patientOrder: PatientOrderModel;
	pastPatientOrders: PatientOrderModel[];
	referenceData: ReferenceDataResponse;
	onPatientOrderChange(patientOrder: PatientOrderModel): void;
}

export const MhicOrderDetails = ({ patientOrder, onPatientOrderChange, pastPatientOrders, referenceData }: Props) => {
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const navigate = useNavigate();

	const [assessmentIdToEdit, setAssessmentIdToEdit] = useState('');
	const [showScheduleAssessmentModal, setShowScheduleAssessmentModal] = useState(false);
	const [showDemographicsModal, setShowDemographicsModal] = useState(false);
	const [showInsuranceModal, setShowInsuranceModal] = useState(false);
	const [showContactInformationModal, setShowContactInformationModal] = useState(false);
	const [showCloseEpisodeModal, setShowCloseEpisodeModal] = useState(false);
	const [screeningSessionScreeningResult, setScreeningSessionScreeningResult] =
		useState<ScreeningSessionScreeningResult>();

	const handleCloseEpisodeModalSave = useCallback(
		async (patientOrderClosureReasonId: string) => {
			try {
				await integratedCareService
					.closePatientOrder(patientOrder.patientOrderId, { patientOrderClosureReasonId })
					.fetch();

				setShowCloseEpisodeModal(false);
				addFlag({
					variant: 'success',
					title: 'Episode Closed',
					description: '{Message}',
					actions: [],
				});
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, handleError, patientOrder.patientOrderId]
	);

	return (
		<>
			<MhicScheduleAssessmentModal
				assessmentId={assessmentIdToEdit}
				show={showScheduleAssessmentModal}
				onHide={() => {
					setShowScheduleAssessmentModal(false);
				}}
				onSave={() => {
					setShowScheduleAssessmentModal(false);
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

			<MhicDemographicsModal
				raceOptions={referenceData.races}
				ethnicityOptions={referenceData.ethnicities}
				genderIdentityOptions={referenceData.genderIdentities}
				patientOrder={patientOrder}
				show={showDemographicsModal}
				onHide={() => {
					setShowDemographicsModal(false);
				}}
				onSave={(updatedPatientOrder) => {
					setShowDemographicsModal(false);
					onPatientOrderChange(updatedPatientOrder);
				}}
			/>

			<MhicInsuranceModal
				show={showInsuranceModal}
				onHide={() => {
					setShowInsuranceModal(false);
				}}
				onSave={() => {
					setShowInsuranceModal(false);
					addFlag({
						variant: 'success',
						title: 'Insurance Information Saved',
						description: '{Message}',
						actions: [],
					});
				}}
			/>

			<MhicContactInformationModal
				patientOrder={patientOrder}
				show={showContactInformationModal}
				onHide={() => {
					setShowContactInformationModal(false);
				}}
				onSave={(updatedPatientOrder) => {
					setShowContactInformationModal(false);
					onPatientOrderChange(updatedPatientOrder);
				}}
			/>

			<MhicCloseEpisodeModal
				show={showCloseEpisodeModal}
				onHide={() => {
					setShowCloseEpisodeModal(false);
				}}
				onSave={handleCloseEpisodeModalSave}
			/>

			<section>
				<Container fluid>
					<Row>
						<Col>
							<MhicEpisodeCard patientOrder={patientOrder} onPatientOrderChange={onPatientOrderChange} />
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid>
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
											disabled={
												patientOrder.patientOrderDispositionId ===
												PatientOrderDispositionId.CLOSED
											}
										>
											Review <ExternalIcon className="ms-2" width={20} height={20} />
										</Button>
									</div>
									<p className="mb-0">
										Completed{' '}
										<strong>{patientOrder.screeningSession?.completedAtDescription}</strong> by{' '}
										<strong>
											{patientOrder.mostRecentScreeningSessionCreatedByAccountDisplayName}
										</strong>
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
								/>
							)}
							{patientOrder.patientOrderResourcingStatusId ===
								PatientOrderResourcingStatusId.NEEDS_RESOURCES && (
								<MhicInlineAlert
									className="mb-6"
									variant="warning"
									title="Resources needed"
									description="Triage indicates the patient needs external resources"
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
							{patientOrder.patientOrderTriageGroups?.map((triageGroup, triageGroupIndex) => {
								if (triageGroup.patientOrderCareTypeId !== patientOrder.patientOrderCareTypeId) {
									return null;
								}

								return (
									<MhicTriageCard
										key={triageGroupIndex}
										className="mb-6"
										triageGroup={triageGroup}
										disabled={
											patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED
										}
									/>
								);
							})}
							<MhicNextStepsCard
								className="mb-6"
								patientOrder={patientOrder}
								onPatientOrderChange={onPatientOrderChange}
								disabled={patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED}
							/>
						</>
					)}
					{!patientOrder.screeningSession && (
						<>
							<Row className="mb-6">
								<Col>
									<h4 className="mb-0">Assessment</h4>
								</Col>
							</Row>
							<Row>
								<Col>
									<NoData
										className="mb-6"
										title="No Assessment"
										description="There is no assessment for the patient's most recent referral order"
										actions={[
											{
												variant: 'primary',
												title: 'Start Assessment',
												onClick: () => {
													navigate(`orders/${patientOrder.patientOrderId}/assessment`);
												},
												disabled:
													patientOrder.patientOrderDispositionId ===
													PatientOrderDispositionId.CLOSED,
											},
											{
												variant: 'outline-primary',
												title: 'Schedule Assessment',
												onClick: () => {
													setAssessmentIdToEdit('');
													setShowScheduleAssessmentModal(true);
												},
												disabled:
													patientOrder.patientOrderDispositionId ===
													PatientOrderDispositionId.CLOSED,
											},
										]}
									/>
									<NoData
										className="mb-6 bg-white"
										title="Assessment is Scheduled"
										description="Nov 12, 2023 at 2:30 PM"
										actions={[
											{
												variant: 'primary',
												title: 'Start Assessment',
												onClick: () => {
													navigate(`orders/${patientOrder.patientOrderId}/assessment`);
												},
												disabled:
													patientOrder.patientOrderDispositionId ===
													PatientOrderDispositionId.CLOSED,
											},
											{
												variant: 'outline-primary',
												title: 'Edit Appointment Date',
												onClick: () => {
													setAssessmentIdToEdit('xxx');
													setShowScheduleAssessmentModal(true);
												},
												disabled:
													patientOrder.patientOrderDispositionId ===
													PatientOrderDispositionId.CLOSED,
											},
										]}
									/>
									<NoData
										className="bg-white"
										title="Assessment in Progress"
										description="{Patient Name} began the assessment on {Date} at {Time}"
										actions={[
											{
												variant: 'primary',
												title: 'Continue Assessment',
												onClick: () => {
													navigate(`orders/${patientOrder.patientOrderId}/assessment`);
												},
												disabled:
													patientOrder.patientOrderDispositionId ===
													PatientOrderDispositionId.CLOSED,
											},
											{
												variant: 'outline-primary',
												title: 'Retake Assessment',
												onClick: () => {
													navigate(`orders/${patientOrder.patientOrderId}/assessment`);
												},
												disabled:
													patientOrder.patientOrderDispositionId ===
													PatientOrderDispositionId.CLOSED,
											},
										]}
									/>
								</Col>
							</Row>
						</>
					)}
				</Container>
			</section>
			<section>
				<Container fluid>
					<Row className="mb-6">
						<Col>
							<h4 className="mb-0">Contact</h4>
						</Col>
					</Row>
					<Row>
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>Patient</Card.Title>
									<div className="button-container">
										<Button
											variant="light"
											className="p-2"
											onClick={() => {
												setShowContactInformationModal(true);
											}}
											disabled={
												patientOrder.patientOrderDispositionId ===
												PatientOrderDispositionId.CLOSED
											}
										>
											<EditIcon className="d-flex" />
										</Button>
									</div>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Callback Number</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">{patientOrder.patientPhoneNumberDescription}</p>
											</Col>
										</Row>
										<Row>
											<Col xs={3}>
												<p className="m-0 text-gray">Email</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">
													{patientOrder.patientEmailAddress ?? 'Not Available'}
												</p>
											</Col>
										</Row>
									</Container>
								</Card.Body>
							</Card>
						</Col>
					</Row>
					{/* <Row>
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>
										Patient's Father <span className="text-danger">[TODO]: Emergency Contact?</span>
									</Card.Title>
									<div className="button-container">
										<Button variant="light" className="p-2">
											<EditIcon className="d-flex" />
										</Button>
									</div>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row>
											<Col xs={3}>
												<p className="m-0 text-gray">Mobile Phone</p>
											</Col>
											<Col xs={9}>
												<div className="d-flex align-items-center">
													<p className="m-0 text-gray">(000) 000-0000</p>
													<Badge bg="outline-primary" pill className="ms-2">
														Preferred
													</Badge>
												</div>
											</Col>
										</Row>
									</Container>
								</Card.Body>
							</Card>
						</Col>
					</Row> */}
				</Container>
			</section>
			<section>
				<Container fluid>
					<Row className="mb-6">
						<Col>
							<h4 className="mb-0">Patient Information</h4>
						</Col>
					</Row>
					<Row className="mb-6">
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>Basic Info</Card.Title>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row className="mb-4">
											<Col>
												<p className="m-0">{patientOrder.patientDisplayName}</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col>
												<p className="m-0 text-gray">Date of birth</p>
											</Col>
											<Col>
												<p className="m-0">{patientOrder.patientBirthdateDescription}</p>
											</Col>
										</Row>
										<Row>
											<Col>
												<p className="m-0 text-gray">Pref. Language</p>
											</Col>
											<Col>
												<p className="m-0">
													{
														referenceData.languages.find(
															(language) =>
																language.languageCode ===
																patientOrder.patientLanguageCode
														)?.description
													}
												</p>
											</Col>
										</Row>
									</Container>
								</Card.Body>
							</Card>
						</Col>
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>Demographics</Card.Title>
									<div className="button-container">
										<Button
											variant="light"
											className="p-2"
											onClick={() => {
												setShowDemographicsModal(true);
											}}
											disabled={
												patientOrder.patientOrderDispositionId ===
												PatientOrderDispositionId.CLOSED
											}
										>
											<EditIcon className="d-flex" />
										</Button>
									</div>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row className="mb-4">
											<Col>
												<p className="m-0 text-gray">Race</p>
											</Col>
											<Col>
												<p className="m-0">
													{referenceData.races.find(
														(race) => race.raceId === patientOrder.patientRaceId
													)?.description ?? 'Not Specified'}
												</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col>
												<p className="m-0 text-gray">Ethnicity</p>
											</Col>
											<Col>
												<p className="m-0">
													{referenceData.ethnicities.find(
														(ethnicity) =>
															ethnicity.ethnicityId === patientOrder.patientEthnicityId
													)?.description ?? 'Not Specified'}
												</p>
											</Col>
										</Row>
										<Row>
											<Col>
												<p className="m-0 text-gray">Gender Identity</p>
											</Col>
											<Col>
												<p className="m-0">
													{referenceData.genderIdentities.find(
														(genderIdentity) =>
															genderIdentity.genderIdentityId ===
															patientOrder.patientGenderIdentityId
													)?.description ?? 'Not Specified'}
												</p>
											</Col>
										</Row>
									</Container>
								</Card.Body>
							</Card>
						</Col>
					</Row>
					<Row>
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>Address</Card.Title>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row>
											<Col>
												<p className="m-0">{patientOrder.patientAddress?.streetAddress1}</p>
											</Col>
										</Row>
										{patientOrder.patientAddress?.streetAddress2 && (
											<Row>
												<Col>
													<p className="m-0">{patientOrder.patientAddress.streetAddress2}</p>
												</Col>
											</Row>
										)}
										<Row>
											<Col>
												<p className="m-0">
													{patientOrder.patientAddress?.locality},{' '}
													{patientOrder.patientAddress?.region}{' '}
													{patientOrder.patientAddress?.postalCode}{' '}
												</p>
											</Col>
										</Row>
									</Container>
								</Card.Body>
							</Card>
						</Col>
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>Insurance</Card.Title>
									{/* <div className="button-container">
										<Button
											variant="light"
											className="p-2"
											onClick={() => {
												setShowInsuranceModal(true);
											}}
											disabled={
												patientOrder.patientOrderDispositionId ===
												PatientOrderDispositionId.CLOSED
											}
										>
											<EditIcon className="d-flex" />
										</Button>
									</div> */}
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row>
											<Col>
												<p className="m-0">{patientOrder.primaryPayorName}</p>
											</Col>
										</Row>
										<Row>
											<Col>
												<p className="m-0">Plan: {patientOrder.primaryPlanName}</p>
											</Col>
										</Row>
										{/* <Row>
											<Col>
												<p className="m-0">
													Coverage Until:{' '}
													<span className="text-danger">
														[TODO]: Primary plan expiration date
													</span>
												</p>
											</Col>
										</Row> */}
									</Container>
								</Card.Body>
							</Card>
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid>
					<Row className="mb-6">
						<Col>
							<h4 className="mb-0">Clinical</h4>
						</Col>
					</Row>
					<Row className="mb-6">
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>Diagnoses</Card.Title>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row>
											<Col>
												<p
													className={classNames({
														'mb-0': (patientOrder.patientOrderDiagnoses ?? []).length <= 0,
														'mb-2': (patientOrder.patientOrderDiagnoses ?? []).length > 0,
													})}
												>
													{patientOrder.associatedDiagnosis}
												</p>
												{(patientOrder.patientOrderDiagnoses ?? []).length > 0 && (
													<ul className="mb-0">
														{patientOrder.patientOrderDiagnoses?.map(
															(patientOrderDiagnoses) => {
																return (
																	<li
																		key={
																			patientOrderDiagnoses.patientOrderDiagnosisId
																		}
																		className="m-0"
																	>
																		<strong>
																			{patientOrderDiagnoses.diagnosisId}
																		</strong>{' '}
																		{patientOrderDiagnoses.diagnosisName}
																	</li>
																);
															}
														)}
													</ul>
												)}
											</Col>
										</Row>
									</Container>
								</Card.Body>
							</Card>
						</Col>
					</Row>
					{(patientOrder.patientOrderMedications ?? []).length > 0 && (
						<Row className="mb-6">
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Medications</Card.Title>
									</Card.Header>
									<Card.Body>
										<Container fluid>
											<Row>
												<Col>
													{patientOrder.patientOrderMedications?.map(
														(patientOrderMedication) => {
															return (
																<p
																	key={
																		patientOrderMedication.patientOrderMedicationId
																	}
																	className="m-0"
																>
																	{patientOrderMedication.medicationName}
																</p>
															);
														}
													)}
												</Col>
											</Row>
										</Container>
									</Card.Body>
								</Card>
							</Col>
						</Row>
					)}
					<Row>
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>Care Team</Card.Title>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Practice</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">{patientOrder.referringPracticeName}</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">PC Provider</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">
													<span className="text-danger">[TODO]</span>
												</p>
											</Col>
										</Row>
										<hr className="mb-4" />
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">MHIC</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">{patientOrder.panelAccountDisplayName}</p>
											</Col>
										</Row>
										<Row>
											<Col xs={3}>
												<p className="m-0 text-gray">BHP</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">
													<span className="text-danger">[TODO]</span>
												</p>
											</Col>
										</Row>
										{/* <Row>
											<Col xs={3}>
												<p className="m-0 text-gray">Psychiatrist</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">
													<span className="text-danger">[TODO]</span>
												</p>
											</Col>
										</Row> */}
									</Container>
								</Card.Body>
							</Card>
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid>
					<Row className="mb-6">
						<Col>
							<h4 className="mb-0">
								Other Episodes <span className="text-gray">({pastPatientOrders.length})</span>
							</h4>
						</Col>
					</Row>
					{pastPatientOrders.length > 0 && (
						<Row>
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Past</Card.Title>
									</Card.Header>
									<Card.Body>
										<Container fluid>
											{pastPatientOrders.map((pastPatientOrder, pastPatientOrderIndex) => {
												const isLast = pastPatientOrderIndex === pastPatientOrders.length - 1;

												return (
													<Row
														key={pastPatientOrder.orderId}
														className={classNames({ 'mb-4 pb-6 border-bottom': !isLast })}
													>
														<Col>
															<div className="mb-1 d-flex align-items-center justify-content-between">
																<p className="m-0 fw-bold">
																	{pastPatientOrder.orderDateDescription} (Episode:{' '}
																	{pastPatientOrder.episodeDurationInDaysDescription})
																</p>
																<div className="d-flex align-items-center">
																	<p className="m-0 fw-bold text-danger">
																		[TODO]: Episode Status Description
																	</p>
																	<Button
																		variant="primary"
																		size="sm"
																		className="ms-4"
																		onClick={() => {
																			setShowCloseEpisodeModal(true);
																		}}
																		disabled
																	>
																		Reopen
																	</Button>
																</div>
															</div>
															<p className="mb-1 text-gray">
																Referred by: {pastPatientOrder.referringPracticeName}
															</p>
															<p className="m-0 text-gray">
																{pastPatientOrder.reasonForReferral}
															</p>
														</Col>
													</Row>
												);
											})}
										</Container>
									</Card.Body>
								</Card>
							</Col>
						</Row>
					)}
				</Container>
			</section>
		</>
	);
};
