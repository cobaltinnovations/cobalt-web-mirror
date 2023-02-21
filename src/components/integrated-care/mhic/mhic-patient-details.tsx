import React, { useState } from 'react';
import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { PatientOrderModel } from '@/lib/models';
import useFlags from '@/hooks/use-flags';
import {
	MhicCloseEpisodeModal,
	MhicContactInformationModal,
	MhicDemographicsModal,
	MhicInsuranceModal,
} from '@/components/integrated-care/mhic';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';

interface Props {
	patientOrder: PatientOrderModel;
	pastPatientOrders: PatientOrderModel[];
}

export const MhicPatientDetails = ({ patientOrder, pastPatientOrders }: Props) => {
	const { addFlag } = useFlags();
	const [showDemographicsModal, setShowDemographicsModal] = useState(false);
	const [showInsuranceModal, setShowInsuranceModal] = useState(false);
	const [showContactInformationModal, setShowContactInformationModal] = useState(false);
	const [showCloseEpisodeModal, setShowCloseEpisodeModal] = useState(false);

	return (
		<>
			<MhicDemographicsModal
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
													<Badge bg="outline-dark" pill className="ms-2">
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
							<h4 className="mb-0">Referrals</h4>
						</Col>
					</Row>
					<Row className="mb-6">
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>Most Recent</Card.Title>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row>
											<Col>
												<div className="mb-1 d-flex align-items-center justify-content-between">
													<p className="m-0 fw-bold">
														{patientOrder.orderDateDescription} (Episode:{' '}
														{patientOrder.episodeDurationInDaysDescription})
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
														>
															Close Episode
														</Button>
													</div>
												</div>
												<p className="mb-1 text-gray">
													Referred by: {patientOrder.referringPracticeName}
												</p>
												<p className="m-0 text-gray">{patientOrder.reasonForReferral}</p>
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
												<ul className="mb-0">
													{patientOrder.patientOrderDiagnoses?.map(
														(patientOrderDiagnoses) => {
															return (
																<li
																	key={patientOrderDiagnoses.patientOrderDiagnosisId}
																	className="m-0"
																>
																	{patientOrderDiagnoses.diagnosisName} (
																	{patientOrderDiagnoses.diagnosisId})
																</li>
															);
														}
													)}
												</ul>
											</Col>
										</Row>
									</Container>
								</Card.Body>
							</Card>
						</Col>
					</Row>
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
												{patientOrder.patientOrderMedications?.map((patientOrderMedication) => {
													return (
														<p
															key={patientOrderMedication.patientOrderMedicationId}
															className="m-0"
														>
															{patientOrderMedication.medicationName}
														</p>
													);
												})}
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
									<Card.Title>Care Team</Card.Title>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Practice</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">
													<span className="text-danger">[TODO]</span>
												</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Ordering Provider</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">{patientOrder.orderingProviderDisplayName}</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Billing Provider</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">{patientOrder.billingProviderDisplayName}</p>
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
		</>
	);
};
