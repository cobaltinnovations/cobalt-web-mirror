import React, { useState } from 'react';
import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import useFlags from '@/hooks/use-flags';
import {
	MhicAssessmentModal,
	MhicCloseEpisodeModal,
	MhicContactInformationModal,
	MhicDemographicsModal,
	MhicInsuranceModal,
	MhicScheduleAssessmentModal,
} from '@/components/integrated-care/mhic';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import NoData from '@/components/no-data';

interface Props {
	patientOrder: PatientOrderModel;
	pastPatientOrders: PatientOrderModel[];
	referenceData: ReferenceDataResponse;
}

export const MhicOrderDetails = ({ patientOrder, pastPatientOrders, referenceData }: Props) => {
	const { addFlag } = useFlags();
	const [assessmentIdToEdit, setAssessmentIdToEdit] = useState('');
	const [showScheduleAssessmentModal, setShowScheduleAssessmentModal] = useState(false);
	const [showAssessmentModal, setShowAssessmentModal] = useState(false);
	const [showDemographicsModal, setShowDemographicsModal] = useState(false);
	const [showInsuranceModal, setShowInsuranceModal] = useState(false);
	const [showContactInformationModal, setShowContactInformationModal] = useState(false);
	const [showCloseEpisodeModal, setShowCloseEpisodeModal] = useState(false);

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
				show={showAssessmentModal}
				onHide={() => {
					setShowAssessmentModal(false);
				}}
			/>

			<MhicDemographicsModal
				raceOptions={referenceData.races}
				ethnicityOptions={referenceData.ethnicities}
				genderIdentityOptions={referenceData.genderIdentities}
				show={showDemographicsModal}
				onHide={() => {
					setShowDemographicsModal(false);
				}}
				onSave={() => {
					setShowDemographicsModal(false);
					addFlag({
						variant: 'success',
						title: 'Demographic Information Saved',
						description: '{Message}',
						actions: [],
					});
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
				show={showContactInformationModal}
				onHide={() => {
					setShowContactInformationModal(false);
				}}
				onSave={() => {
					setShowContactInformationModal(false);
					addFlag({
						variant: 'success',
						title: 'Patient Contact Information Saved',
						description: '{Message}',
						actions: [],
					});
				}}
			/>

			<MhicCloseEpisodeModal
				show={showCloseEpisodeModal}
				onHide={() => {
					setShowCloseEpisodeModal(false);
				}}
				onSave={() => {
					setShowCloseEpisodeModal(false);
					addFlag({
						variant: 'success',
						title: 'Episode Closed',
						description: '{Message}',
						actions: [],
					});
				}}
			/>

			<section>
				<Container fluid>
					<Row>
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>
										Order{' '}
										<span className="text-gray">
											(Episode: {patientOrder.episodeDurationInDaysDescription})
										</span>
									</Card.Title>
									<div className="button-container">
										<Button
											variant="light"
											size="sm"
											onClick={() => {
												setShowCloseEpisodeModal(true);
											}}
										>
											Close Episode
										</Button>
									</div>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Date Referred</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">Nov 12, 2022</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Referral Reason</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">High PHQ-4 score, patient reported panic attacks</p>
											</Col>
										</Row>
										<hr className="mb-4" />
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Practice</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">[Practice Name]</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Ordering Provider</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">[Name]</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Authorizing Provider</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">[Name]</p>
											</Col>
										</Row>
										<Row>
											<Col xs={3}>
												<p className="m-0 text-gray">Billing Provider</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">[Name]</p>
											</Col>
										</Row>
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
							<div className="d-flex align-items-center justify-content-between">
								<h4 className="mb-0">Assessment</h4>
								<Button
									onClick={() => {
										window.alert('[TODO]: Link to start assessment?');
									}}
								>
									Start Assessment
								</Button>
							</div>
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
										variant: 'outline-primary',
										title: 'Schedule Assessment',
										onClick: () => {
											setAssessmentIdToEdit('');
											setShowScheduleAssessmentModal(true);
										},
									},
								]}
							/>
							<NoData
								className="bg-white"
								title="Assessment is Scheduled"
								description="Nov 12, 2023 at 2:30 PM"
								actions={[
									{
										variant: 'primary',
										title: 'View Appointment',
										onClick: () => {
											window.alert('[TODO]: Link to appointment details?');
										},
									},
									{
										variant: 'outline-primary',
										title: 'Edit Appointment Date',
										onClick: () => {
											setAssessmentIdToEdit('xxx');
											setShowScheduleAssessmentModal(true);
										},
									},
								]}
							/>
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid>
					<Row className="mb-6">
						<Col>
							<h4 className="mb-0">Contact</h4>
						</Col>
					</Row>
					<Row className="mb-6">
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
												<p className="m-0">{patientOrder.callbackPhoneNumberDescription}</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Mobile Number</p>
											</Col>
											<Col xs={9}>
												<div className="d-flex align-items-center">
													<p className="m-0">
														<span className="text-danger">
															[TODO]: Patient Mobile Number
														</span>
													</p>
													<Badge bg="outline-primary" pill className="ms-2">
														Preferred
													</Badge>
												</div>
											</Col>
										</Row>
										<Row>
											<Col xs={3}>
												<p className="m-0 text-gray">Email</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">
													<span className="text-danger">[TODO]: Patient Email Address</span>
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
					</Row>
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
													<span className="text-danger">[TODO]</span>
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
													<span className="text-danger">[TODO]</span>
												</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col>
												<p className="m-0 text-gray">Ethnicity</p>
											</Col>
											<Col>
												<p className="m-0">
													<span className="text-danger">[TODO]</span>
												</p>
											</Col>
										</Row>
										<Row>
											<Col>
												<p className="m-0 text-gray">Gender Identity</p>
											</Col>
											<Col>
												<p className="m-0">
													{patientOrder.patientBirthSexId}{' '}
													<span className="text-danger">
														[TODO]: Description instead of Id
													</span>
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
										<Row>
											<Col>
												<p className="m-0">
													<span className="text-danger">[TODO]: Street Address 2</span>
												</p>
											</Col>
										</Row>
										<Row>
											<Col>
												<p className="m-0">
													{patientOrder.patientAddress?.locality},{' '}
													{patientOrder.patientAddress?.region}{' '}
													{patientOrder.patientAddress?.postalCode}{' '}
													<span className="text-danger">
														[TODO]: Should probably a string from the BE
													</span>
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
									<div className="button-container">
										<Button
											variant="light"
											className="p-2"
											onClick={() => {
												setShowInsuranceModal(true);
											}}
										>
											<EditIcon className="d-flex" />
										</Button>
									</div>
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
										<Row>
											<Col>
												<p className="m-0">
													Coverage Until:{' '}
													<span className="text-danger">
														[TODO]: Primary plan expiration date
													</span>
												</p>
											</Col>
										</Row>
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
												<p className="m-0">
													<span className="text-danger">[TODO]</span>
												</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">BHP</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">
													<span className="text-danger">[TODO]</span>
												</p>
											</Col>
										</Row>
										<Row>
											<Col xs={3}>
												<p className="m-0 text-gray">Psychiatrist</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">
													<span className="text-danger">[TODO]</span>
												</p>
											</Col>
										</Row>
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
