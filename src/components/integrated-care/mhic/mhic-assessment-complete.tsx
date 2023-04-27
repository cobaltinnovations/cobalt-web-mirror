import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import {
	PatientOrderModel,
	PatientOrderResourcingStatusId,
	PatientOrderSafetyPlanningStatusId,
	ReferenceDataResponse,
	ScreeningSessionScreeningResult,
} from '@/lib/models';
import TabBar from '@/components/tab-bar';
import {
	MHIC_HEADER_HEIGHT,
	MhicInlineAlert,
	MhicNextStepsCard,
	MhicTriageCard,
} from '@/components/integrated-care/mhic';

import { ReactComponent as DissatisfiedIcon } from '@/assets/icons/sentiment-dissatisfied.svg';
import { ReactComponent as NaIcon } from '@/assets/icons/sentiment-na.svg';
import { ReactComponent as SatisfiedIcon } from '@/assets/icons/sentiment-satisfied.svg';

const useStyles = createUseStyles(() => ({
	scrollAnchor: {
		position: 'relative',
		top: -32 - MHIC_HEADER_HEIGHT,
	},
}));

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
	const { pathname } = useLocation();
	const classes = useStyles();

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
						{patientOrder?.mostRecentScreeningSessionCreatedByAccountDisplayName}
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
						<div className={classes.scrollAnchor} id="results" />
						<h3 className="mb-8">Results</h3>
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
						{patientOrder.patientOrderTriageGroups?.map((triageGroup, triageGroupIndex) => {
							if (triageGroup.patientOrderCareTypeId !== patientOrder.patientOrderCareTypeId) {
								return null;
							}

							return <MhicTriageCard key={triageGroupIndex} className="mb-6" triageGroup={triageGroup} />;
						})}
						<MhicNextStepsCard
							className="mb-8"
							patientOrder={patientOrder}
							onPatientOrderChange={(patientOrder) => {
								window.alert('[TODO]: Refresh the order on this page');
								console.log(patientOrder);
							}}
						/>
						<hr className="mb-8" />

						{conditionsAndSymptomsResults.length > 0 && (
							<>
								<div className={classes.scrollAnchor} id="conditions-and-symptoms" />
								<h3 className="mb-8">Conditions &amp; Symptoms</h3>
								{conditionsAndSymptomsResults.map((screening) => (
									<ScreeningResultCard
										screening={screening}
										referenceData={referenceData}
										id={screening.screeningId}
									/>
								))}
								<hr className="mb-8" />
							</>
						)}

						{completedAssessmentsResults.length > 0 && (
							<>
								<div className={classes.scrollAnchor} id="completed-assessments" />
								<h3 className="mb-8">Completed Assessments</h3>
								{completedAssessmentsResults.map((screening) => (
									<ScreeningResultCard
										screening={screening}
										referenceData={referenceData}
										id={screening.screeningId}
									/>
								))}
							</>
						)}
					</Col>
					<Col md={{ span: 2, offset: 1 }}>
						<TabBar
							className="position-sticky"
							style={{ top: MHIC_HEADER_HEIGHT + 32 }}
							orientation="vertical"
							value="RESULTS"
							tabs={[
								{
									title: 'Results',
									value: '#results',
								},
								...(conditionsAndSymptomsResults.length > 0
									? [
											{
												title: 'Conditions & Symptoms',
												value: '#conditions-and-symptoms',
											},
									  ]
									: []),
								...conditionsAndSymptomsResults.map((result) => ({
									title: result.screeningName ?? '',
									value: `#${result.screeningId}` ?? '#',
									level: 1,
								})),
								...(completedAssessmentsResults.length > 0
									? [
											{
												title: 'Completed Assessments',
												value: '#completed-assessments',
											},
									  ]
									: []),
								...completedAssessmentsResults.map((result) => ({
									title: result.screeningName ?? '',
									value: `#${result.screeningId}` ?? '#',
									level: 1,
								})),
							]}
							onTabClick={(value) => {
								window.location.href = `${pathname}${value}`;
							}}
						/>
					</Col>
				</Row>
			)}
		</Container>
	);
};

const ScreeningResultCard = ({
	screening,
	referenceData,
	id,
}: {
	screening: ScreeningSessionScreeningResult;
	referenceData?: ReferenceDataResponse;
	id?: string;
}) => {
	const classes = useStyles();

	return (
		<Card bsPrefix="ic-card" className="mb-8">
			<div className={classes.scrollAnchor} id={id} />
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
									<div
										className="mb-2"
										dangerouslySetInnerHTML={{ __html: question.screeningQuestionText ?? '' }}
									/>
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
