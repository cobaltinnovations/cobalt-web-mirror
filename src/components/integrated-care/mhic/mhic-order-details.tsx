import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useNavigate, useRevalidator } from 'react-router-dom';

import {
	MhicAssessmentModal,
	MhicCloseEpisodeModal,
	// MhicConsentModal,
	MhicContactInformationModal,
	MhicDemographicsModal,
	MhicEpisodeCard,
	MhicNextStepsAlerts,
	MhicNextStepsAppointment,
	MhicScheduleAssessmentModal,
	MhicScheduleCallCompleteModal,
	MhicSelectAssessmentTypeModal,
	MhicTriageCard,
} from '@/components/integrated-care/mhic';
import NoData from '@/components/no-data';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import {
	// PatientOrderConsentStatusId,
	PatientOrderDispositionId,
	PatientOrderIntakeScreeningStatusId,
	PatientOrderModel,
	PatientOrderOutreachTypeId,
	PatientOrderScheduledOutreach,
	PatientOrderScreeningStatusId,
	PatientOrderTriageStatusId,
	ScreeningSessionScreeningResult,
} from '@/lib/models';
import { integratedCareService } from '@/lib/services';

import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import { useIntegratedCareLoaderData } from '@/routes/ic/landing';
import { MhicVoicemailTaskModal } from './mhic-voicemail-task-modal';

interface Props {
	patientOrder: PatientOrderModel;
	pastPatientOrders: PatientOrderModel[];
}

enum ASSESSMENT_STATUS {
	NO_ASSESSMENT = 'NO_ASSESSMENT',
	SCHEDULED = 'SCHEDULED',
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETE = 'COMPLETE',
}

export const MhicOrderDetails = ({ patientOrder, pastPatientOrders }: Props) => {
	const { institution } = useAccount();
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const navigate = useNavigate();
	const revalidator = useRevalidator();

	const [showScheduleAssessmentModal, setShowScheduleAssessmentModal] = useState(false);
	const [showDemographicsModal, setShowDemographicsModal] = useState(false);
	const [showContactInformationModal, setShowContactInformationModal] = useState(false);
	const [showCloseEpisodeModal, setShowCloseEpisodeModal] = useState(false);
	const [showAddVoicemailTaskModal, setShowAddVoicemailTaskModal] = useState(false);
	const [showSelectAssessmentTypeModal, setShowSelectAssessmentTypeModal] = useState(false);
	const [showScheduleCallCompleteModal, setShowScheduleCallCompleteModal] = useState(false);
	const [scheduledOutreachToEdit, setScheduledOutreachToEdit] = useState<PatientOrderScheduledOutreach>();

	const [screeningSessionScreeningResult, setScreeningSessionScreeningResult] =
		useState<ScreeningSessionScreeningResult>();
	// const [showConsentModal, setShowConsentModal] = useState(false);
	const hasCompletedIntakeScreening =
		patientOrder?.patientOrderIntakeScreeningStatusId === PatientOrderIntakeScreeningStatusId.COMPLETE;
	const { renderedPreScreeningLoader: loadingIntakeScreening, ...intakeScreeningFlow } = useScreeningFlow({
		screeningFlowId: institution?.integratedCareIntakeScreeningFlowId,
		patientOrderId: patientOrder.patientOrderId,
		instantiateOnLoad: false,
	});
	const { renderedPreScreeningLoader: loadingClinicalScreening, ...clinicalScreeningFlow } = useScreeningFlow({
		screeningFlowId: institution?.integratedCareScreeningFlowId,
		patientOrderId: patientOrder.patientOrderId,
		instantiateOnLoad: false,
		disabled: !hasCompletedIntakeScreening,
	});

	const handleCloseEpisodeModalSave = useCallback(
		async (patientOrderClosureReasonId: string) => {
			try {
				await integratedCareService
					.closePatientOrder(patientOrder.patientOrderId, { patientOrderClosureReasonId })
					.fetch();

				setShowCloseEpisodeModal(false);
				revalidator.revalidate();
				addFlag({
					variant: 'success',
					title: 'Episode Closed',
					actions: [],
				});
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, handleError, patientOrder.patientOrderId, revalidator]
	);

	const incompleteVoicemailTask = useMemo(() => {
		return patientOrder.patientOrderVoicemailTasks.find((vmt) => !vmt.completed);
	}, [patientOrder.patientOrderVoicemailTasks]);

	const navigateToAssessment = useCallback(
		(options: { createNew?: boolean; resumeRecent?: boolean; modifiedAssessment?: boolean }) => {
			// if (patientOrder.patientOrderConsentStatusId === PatientOrderConsentStatusId.UNKNOWN) {
			// 	setShowConsentModal(true);
			// } else {
			if (options.createNew) {
				intakeScreeningFlow.createScreeningSession(options.modifiedAssessment);
			} else if (options.resumeRecent) {
				if (!hasCompletedIntakeScreening) {
					intakeScreeningFlow.resumeScreeningSession(patientOrder.mostRecentIntakeScreeningSessionId);
				} else {
					clinicalScreeningFlow.resumeScreeningSession(patientOrder.mostRecentScreeningSessionId);
				}
			}
			// }
		},
		[
			clinicalScreeningFlow,
			hasCompletedIntakeScreening,
			intakeScreeningFlow,
			patientOrder.mostRecentIntakeScreeningSessionId,
			patientOrder.mostRecentScreeningSessionId,
		]
	);

	const isCreatingScreeningSession =
		intakeScreeningFlow.isCreatingScreeningSession || clinicalScreeningFlow.isCreatingScreeningSession;

	const [assessmentStatus, setAssessmentStatus] = useState<ASSESSMENT_STATUS>(ASSESSMENT_STATUS.NO_ASSESSMENT);

	useEffect(() => {
		if (patientOrder.mostRecentIntakeAndClinicalScreeningsSatisfied) {
			setAssessmentStatus(ASSESSMENT_STATUS.COMPLETE);
			return;
		}

		if (patientOrder.patientOrderScreeningStatusId === PatientOrderScreeningStatusId.SCHEDULED) {
			setAssessmentStatus(ASSESSMENT_STATUS.SCHEDULED);
			return;
		}

		if (
			patientOrder.patientOrderIntakeScreeningStatusId === PatientOrderIntakeScreeningStatusId.IN_PROGRESS ||
			patientOrder.patientOrderScreeningStatusId === PatientOrderScreeningStatusId.IN_PROGRESS
		) {
			setAssessmentStatus(ASSESSMENT_STATUS.IN_PROGRESS);
			return;
		}

		setAssessmentStatus(ASSESSMENT_STATUS.NO_ASSESSMENT);
	}, [
		patientOrder.mostRecentIntakeAndClinicalScreeningsSatisfied,
		patientOrder.patientOrderIntakeScreeningStatusId,
		patientOrder.patientOrderScreeningStatusId,
	]);

	if (loadingIntakeScreening || loadingClinicalScreening) {
		return loadingIntakeScreening || loadingClinicalScreening;
	}

	return (
		<>
			<MhicScheduleAssessmentModal
				patientOrder={patientOrder}
				show={showScheduleAssessmentModal}
				onHide={() => {
					setShowScheduleAssessmentModal(false);
				}}
				onSave={() => {
					revalidator.revalidate();
					setShowScheduleAssessmentModal(false);
				}}
			/>

			{/* <MhicConsentModal
				patientOrder={patientOrder}
				show={showConsentModal}
				onHide={() => {
					setShowConsentModal(false);
				}}
				onSave={(updatedPatientOrder) => {
					if (updatedPatientOrder.patientOrderConsentStatusId === PatientOrderConsentStatusId.CONSENTED) {
						navigate(`/ic/mhic/order-assessment/${patientOrder.patientOrderId}`);
					} else {
						revalidator.revalidate();
						setShowConsentModal(false);
					}
				}}
			/> */}

			<MhicAssessmentModal
				show={!!screeningSessionScreeningResult}
				screeningType={referenceDataResponse.screeningTypes.find(
					(st) => st.screeningTypeId === screeningSessionScreeningResult?.screeningTypeId
				)}
				screeningSessionScreeningResult={screeningSessionScreeningResult}
				onHide={() => {
					setScreeningSessionScreeningResult(undefined);
				}}
			/>

			<MhicDemographicsModal
				raceOptions={referenceDataResponse.races}
				ethnicityOptions={referenceDataResponse.ethnicities}
				genderIdentityOptions={referenceDataResponse.genderIdentities}
				patientOrder={patientOrder}
				show={showDemographicsModal}
				onHide={() => {
					setShowDemographicsModal(false);
				}}
				onSave={() => {
					revalidator.revalidate();
					setShowDemographicsModal(false);
				}}
			/>

			<MhicContactInformationModal
				patientOrder={patientOrder}
				show={showContactInformationModal}
				onHide={() => {
					setShowContactInformationModal(false);
				}}
				onSave={() => {
					revalidator.revalidate();
					setShowContactInformationModal(false);
				}}
			/>

			<MhicCloseEpisodeModal
				show={showCloseEpisodeModal}
				onHide={() => {
					setShowCloseEpisodeModal(false);
				}}
				onSave={handleCloseEpisodeModalSave}
			/>

			<MhicVoicemailTaskModal
				patientOrderVoicemailTask={incompleteVoicemailTask}
				patientOrder={patientOrder}
				show={showAddVoicemailTaskModal}
				onHide={() => {
					setShowAddVoicemailTaskModal(false);
				}}
				onSave={() => {
					revalidator.revalidate();
					setShowAddVoicemailTaskModal(false);
				}}
			/>

			<MhicSelectAssessmentTypeModal
				show={showSelectAssessmentTypeModal}
				onHide={() => {
					setShowSelectAssessmentTypeModal(false);
				}}
				onSave={(modifiedAssessment) => {
					setShowSelectAssessmentTypeModal(false);
					navigateToAssessment({
						createNew: true,
						modifiedAssessment,
					});
				}}
			/>

			{scheduledOutreachToEdit && (
				<MhicScheduleCallCompleteModal
					show={showScheduleCallCompleteModal}
					patientOrderScheduledOutreachId={scheduledOutreachToEdit.patientOrderScheduledOutreachId}
					patientOrder={patientOrder}
					onHide={() => {
						setShowScheduleCallCompleteModal(false);
					}}
					onSave={() => {
						revalidator.revalidate();
						setShowScheduleCallCompleteModal(false);
					}}
				/>
			)}

			{patientOrder.patientOrderScheduledOutreaches.length > 0 && (
				<section>
					{patientOrder.patientOrderScheduledOutreaches.map((scheduledOutreach) => (
						<Container fluid>
							<Row>
								<Col>
									<Card bsPrefix="ic-card">
										<Card.Header className="border-0">
											<Card.Title>
												Phone call scheduled with{' '}
												{scheduledOutreach.createdByAccountDisplayName}
											</Card.Title>
											<div className="button-container">
												<Button
													variant="light"
													size="sm"
													onClick={() => {
														setScheduledOutreachToEdit(scheduledOutreach);
														setShowScheduleCallCompleteModal(true);
													}}
												>
													Mark Complete
												</Button>
												<Button
													variant="light"
													className="ms-2 p-2"
													onClick={() => {
														setScheduledOutreachToEdit(scheduledOutreach);
														window.alert('TODO: OPEN EDIT MODAL');
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
														<p className="m-0 text-gray">Date &amp; Time</p>
													</Col>
													<Col xs={9}>
														<p className="m-0">
															{scheduledOutreach.scheduledAtDateTimeDescription}
														</p>
													</Col>
												</Row>
												<Row className="mb-4">
													<Col xs={3}>
														<p className="m-0 text-gray">Contact Type</p>
													</Col>
													<Col xs={9}>
														<p className="m-0">
															{scheduledOutreach.patientOrderOutreachTypeId ===
																PatientOrderOutreachTypeId.MYCHART_MESSAGE &&
																'Mychart Message'}
															{scheduledOutreach.patientOrderOutreachTypeId ===
																PatientOrderOutreachTypeId.PHONE_CALL && 'Phone Call'}
														</p>
													</Col>
												</Row>
												<Row>
													<Col xs={3}>
														<p className="m-0 text-gray">Notes</p>
													</Col>
													<Col xs={9}>
														<p className="m-0">{scheduledOutreach.message}</p>
													</Col>
												</Row>
											</Container>
										</Card.Body>
									</Card>
								</Col>
							</Row>
						</Container>
					))}
				</section>
			)}

			{incompleteVoicemailTask && (
				<section>
					<Container fluid>
						<Row>
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Voicemail Task</Card.Title>
										<div className="button-container">
											<Button
												variant="light"
												size="sm"
												onClick={async () => {
													await integratedCareService
														.completeVoicemailTask(
															incompleteVoicemailTask.patientOrderVoicemailTaskId
														)
														.fetch();

													revalidator.revalidate();
												}}
											>
												Mark Complete
											</Button>
											<Button
												variant="light"
												className="ms-2 p-2"
												onClick={() => {
													setShowAddVoicemailTaskModal(true);
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
													<p className="m-0 text-gray">
														{incompleteVoicemailTask.createdByAccountDisplayName}
													</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">{incompleteVoicemailTask.createdDescription}</p>
												</Col>
											</Row>
											<Row>
												<Col>
													<p className="m-0">{incompleteVoicemailTask.message}</p>
												</Col>
											</Row>
										</Container>
									</Card.Body>
								</Card>
							</Col>
						</Row>
					</Container>
				</section>
			)}

			<section>
				<Container fluid>
					<Row>
						<Col>
							<MhicEpisodeCard patientOrder={patientOrder} />
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid>
					{assessmentStatus === ASSESSMENT_STATUS.COMPLETE && (
						<>
							<Row className="mb-6">
								<Col>
									<div className="d-flex align-items-center justify-content-between">
										<h4 className="mb-0">Assessment</h4>
										<Button
											variant="primary"
											className="d-flex align-items-center"
											onClick={() => {
												navigate(`/ic/mhic/order-assessment/${patientOrder.patientOrderId}`);
											}}
										>
											Review <ExternalIcon className="ms-2" width={20} height={20} />
										</Button>
									</div>
									<p className="mb-0">
										Completed{' '}
										<strong>
											{patientOrder.screeningSession?.completedAtDescription ??
												patientOrder.intakeScreeningSession?.completedAtDescription}
										</strong>{' '}
										by{' '}
										<strong>
											{patientOrder.mostRecentScreeningSessionCreatedByAccountDisplayName ??
												patientOrder.mostRecentIntakeScreeningSessionCreatedByAccountDisplayName}
										</strong>
									</p>
								</Col>
							</Row>

							<MhicNextStepsAlerts
								patientOrder={patientOrder}
								referenceData={referenceDataResponse}
								disabled={patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED}
							/>

							<MhicTriageCard
								className={classNames({
									'mb-6': patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.MHP,
								})}
								patientOrder={patientOrder}
								disabled={patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED}
							/>

							<MhicNextStepsAppointment
								patientOrder={patientOrder}
								disabled={patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED}
							/>
						</>
					)}
					{assessmentStatus === ASSESSMENT_STATUS.NO_ASSESSMENT && (
						<>
							<Row className="mb-6">
								<Col>
									<h4 className="mb-0">Assessment</h4>
								</Col>
							</Row>
							<Row>
								<Col>
									<MhicNextStepsAlerts
										patientOrder={patientOrder}
										referenceData={referenceDataResponse}
										disabled={
											patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED
										}
									/>
									<NoData
										className="mb-6"
										title="No Assessment"
										description="There is no assessment for the patient's most recent referral order"
										actions={[
											{
												variant: 'primary',
												title: 'Start Assessment',
												onClick: () => {
													setShowSelectAssessmentTypeModal(true);
												},
												disabled:
													patientOrder.patientOrderDispositionId ===
														PatientOrderDispositionId.CLOSED || isCreatingScreeningSession,
											},
											{
												variant: 'outline-primary',
												title: 'Schedule Assessment',
												onClick: () => {
													setShowScheduleAssessmentModal(true);
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
					{assessmentStatus === ASSESSMENT_STATUS.SCHEDULED && (
						<>
							<Row className="mb-6">
								<Col>
									<h4 className="mb-0">Assessment</h4>
								</Col>
							</Row>
							<Row>
								<Col>
									<MhicNextStepsAlerts
										patientOrder={patientOrder}
										referenceData={referenceDataResponse}
										disabled={
											patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED
										}
									/>
									<NoData
										className="mb-6 bg-white"
										title="Assessment is Scheduled"
										description={
											patientOrder.patientOrderScheduledScreeningScheduledDateTimeDescription
										}
										actions={[
											{
												variant: 'primary',
												title: 'Start Assessment',
												onClick: () => {
													setShowSelectAssessmentTypeModal(true);
												},
												disabled:
													patientOrder.patientOrderDispositionId ===
														PatientOrderDispositionId.CLOSED || isCreatingScreeningSession,
											},
											{
												variant: 'outline-primary',
												title: 'Edit Appointment Date',
												onClick: () => {
													setShowScheduleAssessmentModal(true);
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
					{assessmentStatus === ASSESSMENT_STATUS.IN_PROGRESS && (
						<>
							<Row className="mb-6">
								<Col>
									<h4 className="mb-0">Assessment</h4>
								</Col>
							</Row>
							<Row>
								<Col>
									<MhicNextStepsAlerts
										patientOrder={patientOrder}
										referenceData={referenceDataResponse}
										disabled={
											patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED
										}
									/>
									<NoData
										className="bg-white"
										title="Assessment in Progress"
										description={`${patientOrder.mostRecentIntakeScreeningSessionCreatedByAccountDisplayName} began the assessment on ${patientOrder.mostRecentIntakeScreeningSessionCreatedAtDescription}`}
										actions={[
											{
												variant: 'primary',
												title: 'Continue Assessment',
												onClick: () => {
													navigateToAssessment({
														resumeRecent: true,
													});
												},
												disabled:
													patientOrder.patientOrderDispositionId ===
													PatientOrderDispositionId.CLOSED,
											},
											{
												variant: 'outline-primary',
												title: 'Retake Assessment',
												onClick: () => {
													setShowSelectAssessmentTypeModal(true);
												},
												disabled:
													patientOrder.patientOrderDispositionId ===
														PatientOrderDispositionId.CLOSED || isCreatingScreeningSession,
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
									<Card.Title>Primary Contact</Card.Title>
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
												<p className="m-0 text-gray">Phone Number</p>
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
												<p className="m-0 text-gray">Date of birth</p>
											</Col>
											<Col>
												<p className="m-0">{patientOrder.patientBirthdateDescription}</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col>
												<p className="m-0 text-gray">Age</p>
											</Col>
											<Col>
												<p className="m-0 text danger">
													{patientOrder.patientAgeOnOrderDateDescription}
												</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col>
												<p className="m-0 text-gray">City</p>
											</Col>
											<Col>
												<p className="m-0 text danger">
													{patientOrder.patientAddress?.locality}
												</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col>
												<p className="m-0 text-gray">State</p>
											</Col>
											<Col>
												<p className="m-0 text danger">{patientOrder.patientAddress?.region}</p>
											</Col>
										</Row>
										<Row>
											<Col>
												<p className="m-0 text-gray">State</p>
											</Col>
											<Col>
												<p className="m-0 text danger">
													{patientOrder.patientAddress?.postalCode}
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
												<p className="m-0 text-gray">Pref. Language</p>
											</Col>
											<Col>
												<p className="m-0">
													{
														referenceDataResponse.languages.find(
															(language) =>
																language.languageCode ===
																patientOrder.patientLanguageCode
														)?.description
													}
												</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col>
												<p className="m-0 text-gray">Race</p>
											</Col>
											<Col>
												<p className="m-0">
													{referenceDataResponse.races.find(
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
													{referenceDataResponse.ethnicities.find(
														(ethnicity) =>
															ethnicity.ethnicityId === patientOrder.patientEthnicityId
													)?.description ?? 'Not Specified'}
												</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col>
												<p className="m-0 text-gray">Birth Sex</p>
											</Col>
											<Col>
												<p className="m-0">
													{referenceDataResponse.birthSexes.find(
														(birthSex) =>
															birthSex.birthSexId === patientOrder.patientBirthSexId
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
													{referenceDataResponse.genderIdentities.find(
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
									<Card.Title>Insurance</Card.Title>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row className="mb-4">
											<Col>
												<p className="m-0">{patientOrder.primaryPayorName}</p>
											</Col>
										</Row>
										<Row>
											<Col>
												<p className="m-0">Plan: {patientOrder.primaryPlanName}</p>
											</Col>
										</Row>
									</Container>
								</Card.Body>
							</Card>
						</Col>
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>Care Preferences</Card.Title>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row className="mb-4">
											<Col>
												<p className="m-0 text-gray">Appointment Type</p>
											</Col>
											<Col>
												<p className="m-0">
													{referenceDataResponse.patientOrderCarePreferences.find(
														(c) =>
															c.patientOrderCarePreferenceId ===
															patientOrder.patientOrderCarePreferenceId
													)?.description ?? 'N/A'}
												</p>
											</Col>
										</Row>
										<Row>
											<Col>
												<p className="m-0 text-gray">Travel Radius</p>
											</Col>
											<Col>
												<p className="m-0">
													{patientOrder.inPersonCareRadiusWithDistanceUnitDescription ??
														'N/A'}
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
									<Card.Title>Comment</Card.Title>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row>
											<Col>
												<div
													dangerouslySetInnerHTML={{
														__html: `<p class="mb-0">${patientOrder.comments?.replace(
															/\n/g,
															'<br/><br/>'
														)}</p>`,
													}}
												/>
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
												<p className="m-0">{patientOrder.orderingProviderDisplayName}</p>
											</Col>
										</Row>
										<hr className="mb-4" />
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">MHIC</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">
													{patientOrder.panelAccountDisplayName ?? 'Unassigned'}
												</p>
											</Col>
										</Row>
										<Row>
											<Col xs={3}>
												<p className="m-0 text-gray">MHP</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">{patientOrder.providerName ?? 'N/A'}</p>
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
								Episodes <span className="text-gray">({pastPatientOrders.length})</span>
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
																	{pastPatientOrder.orderDateDescription} -{' '}
																	{patientOrder.episodeClosedAtDescription} (
																	{pastPatientOrder.episodeDurationInDaysDescription})
																</p>
																<p className="m-0 fw-bold text-gray">
																	{
																		pastPatientOrder.patientOrderDispositionDescription
																	}
																</p>
															</div>
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
