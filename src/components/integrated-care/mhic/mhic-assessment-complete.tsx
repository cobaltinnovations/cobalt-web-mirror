import React, { useMemo } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { PatientOrderModel, ReferenceDataResponse, ScreeningSessionScreeningResult } from '@/lib/models';
import { MhicInlineAlert } from '@/components/integrated-care/mhic';
import RenderJson from '@/components/render-json';

import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as DissatisfiedIcon } from '@/assets/icons/sentiment-dissatisfied.svg';
import { ReactComponent as NaIcon } from '@/assets/icons/sentiment-na.svg';
import { ReactComponent as SatisfiedIcon } from '@/assets/icons/sentiment-satisfied.svg';

interface MhicAssessmentCompleteProps {
	referenceData?: ReferenceDataResponse;
	patientOrder?: PatientOrderModel;
	onStartNewAssessment: () => void;
}

export const MhicAssessmentComplete = ({
	patientOrder,
	referenceData,
	onStartNewAssessment,
}: MhicAssessmentCompleteProps) => {
	const conditionsAndSymptomsResults = useMemo(
		() =>
			(patientOrder?.screeningSessionResult?.screeningSessionScreeningResults ?? []).filter(
				({ screeningTypeId }) =>
					screeningTypeId === 'IC_INTRO' ||
					screeningTypeId === 'IC_INTRO_CONDITIONS' ||
					screeningTypeId === 'IC_INTRO_SYMPTOMS'
			),
		[patientOrder?.screeningSessionResult?.screeningSessionScreeningResults]
	);

	const completedAssessmentsResults = useMemo(
		() =>
			(patientOrder?.screeningSessionResult?.screeningSessionScreeningResults ?? []).filter(
				({ screeningTypeId }) =>
					screeningTypeId !== 'IC_INTRO' &&
					screeningTypeId !== 'IC_INTRO_CONDITIONS' &&
					screeningTypeId !== 'IC_INTRO_SYMPTOMS'
			),
		[patientOrder?.screeningSessionResult?.screeningSessionScreeningResults]
	);

	return (
		<Container className="py-10">
			<Row className="mb-11">
				<Col md={{ span: 10, offset: 1 }}>
					<div className="d-flex align-items-center justify-content-between">
						<h2 className="mb-0">Assessment Review</h2>
						<Button onClick={onStartNewAssessment}>Retake Assessment</Button>
					</div>
					<p className="mb-0">
						Completed {patientOrder?.screeningSession?.completedAtDescription} by{' '}
						<span className="text-danger">[TODO]: Who</span>
					</p>
				</Col>
			</Row>
			<Row className="mb-8">
				<Col md={{ span: 10, offset: 1 }}>
					<hr />
				</Col>
			</Row>
			{patientOrder && (
				<Row>
					<Col md={{ span: 7, offset: 1 }}>
						<h3 className="mb-8">Results</h3>
						<MhicInlineAlert
							className="mb-8"
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
						{patientOrder.patientOrderTriageGroups?.map((triageGroup, triageGroupIndex) => (
							<Card key={triageGroupIndex} bsPrefix="ic-card" className="mb-8">
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
												// setShowChangeTriageModal(true);
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
												<p className="m-0">{triageGroup.patientOrderFocusTypeDescription}</p>
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
						))}
						<Card bsPrefix="ic-card" className="mb-8">
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
										className="ms-2"
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
						<hr className="mb-8" />

						{conditionsAndSymptomsResults.length > 0 && (
							<>
								<h3 className="mb-8">Conditions &amp; Symptoms</h3>
								{conditionsAndSymptomsResults.map((screening) => (
									<ScreeningResultCard screening={screening} referenceData={referenceData} />
								))}
								<hr className="mb-8" />
							</>
						)}

						{completedAssessmentsResults.length > 0 && (
							<>
								<h3 className="mb-8">Completed Assessments</h3>
								{completedAssessmentsResults.map((screening) => (
									<ScreeningResultCard screening={screening} referenceData={referenceData} />
								))}
							</>
						)}
					</Col>
					<Col md={{ span: 2, offset: 1 }}>
						<hr />
					</Col>
				</Row>
			)}

			<Row className="mb-6">
				<Col>
					<RenderJson json={patientOrder?.screeningSessionResult} />
				</Col>
			</Row>
		</Container>
	);
};

const ScreeningResultCard = ({
	screening,
	referenceData,
}: {
	screening: ScreeningSessionScreeningResult;
	referenceData?: ReferenceDataResponse;
}) => {
	return (
		<Card bsPrefix="ic-card" className="mb-8">
			<Card.Header>
				<Card.Title>{screening.screeningName}</Card.Title>
				<div className="button-container">
					<p className="mb-0 fw-semibold me-2">
						Total Score: {screening.screeningScore?.overallScore}/
						{
							referenceData?.screeningTypes.find((st) => st.screeningTypeId === screening.screeningTypeId)
								?.overallScoreMaximum
						}
					</p>
					{(screening.belowScoringThreshold === undefined || screening.belowScoringThreshold === null) && (
						<NaIcon className="text-gray" />
					)}
					{screening.belowScoringThreshold === false && <DissatisfiedIcon className="text-danger" />}
					{screening.belowScoringThreshold === true && <SatisfiedIcon className="text-success" />}
				</div>
			</Card.Header>
			<Card.Body>
				<ol className="m-0 p-0 list-unstyled">
					{(screening.screeningQuestionResults ?? []).map((question, questionIndex) => {
						const isLastQuestion = (screening?.screeningQuestionResults ?? []).length - 1 === questionIndex;

						return (
							<li
								key={question.screeningQuestionId}
								className={classNames('d-flex', {
									'border-bottom': !isLastQuestion,
									'mb-4': !isLastQuestion,
									'pb-4': !isLastQuestion,
								})}
							>
								<div>{questionIndex + 1})</div>
								<div className="ps-2 flex-grow-1">
									<p className="mb-2">{question.screeningQuestionText}</p>
									{question.screeningAnswerResults?.map((answer, answerIndex) => {
										const isLastAnswer =
											(question.screeningAnswerResults ?? []).length - 1 === answerIndex;

										return (
											<div
												className={classNames({
													'mb-1': !isLastAnswer,
												})}
											>
												<div
													key={answer.screeningAnswerId}
													className="d-flex align-items-center justify-content-between"
												>
													<h5 className="mb-0">{answer.answerOptionText}</h5>
													<h5 className="mb-0 text-gray flex-shrink-0">
														Score: {answer.score}
													</h5>
												</div>
												{answer.text && <p className="mb-0">{answer.text}</p>}
											</div>
										);
									})}
								</div>
							</li>
						);
					})}
				</ol>
			</Card.Body>
		</Card>
	);
};
