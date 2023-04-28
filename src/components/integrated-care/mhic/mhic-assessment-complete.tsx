import React, { useCallback, useMemo, useState } from 'react';
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
	ScreeningType,
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
import { screeningService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { compact } from 'lodash';

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
	const [notTakenScreeningTypes, setNotTakeScreeningTypes] = useState<ScreeningType[]>([]);

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

	const fetchData = useCallback(async () => {
		if (!patientOrder?.screeningSession?.screeningFlowVersionId) {
			return;
		}

		const { screeningType } = await screeningService
			.getPossibleScreeningTypesForFlowVersionId(patientOrder.screeningSession.screeningFlowVersionId)
			.fetch();

		const takenScreeningTypeIds = compact(
			(patientOrder?.screeningSessionResult?.screeningSessionScreeningResults ?? []).map(
				(sr) => sr.screeningTypeId
			)
		);

		setNotTakeScreeningTypes(
			screeningType.filter((st) => {
				return !takenScreeningTypeIds.includes(st.screeningTypeId);
			})
		);
	}, [
		patientOrder?.screeningSession?.screeningFlowVersionId,
		patientOrder?.screeningSessionResult?.screeningSessionScreeningResults,
	]);

	return (
		<AsyncWrapper fetchData={fetchData}>
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
								/>
							)}
							{patientOrder.patientOrderResourcingStatusId ===
								PatientOrderResourcingStatusId.NEEDS_RESOURCES && (
								<MhicInlineAlert className="mb-6" variant="warning" title="Patient needs resources" />
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
							{patientOrder.patientOrderResourcingStatusId ===
								PatientOrderResourcingStatusId.SENT_RESOURCES && (
								<MhicInlineAlert
									className="mb-6"
									variant="success"
									title={`Resources sent on ${patientOrder.resourcesSentAtDescription}`}
									action={{
										title: 'Review contact history for more details',
										onClick: () => {
											window.alert('[TODO]: where does this link to.');
										},
									}}
								/>
							)}

							{referenceData && (
								<MhicTriageCard
									className="mb-6"
									patientOrder={patientOrder}
									referenceData={referenceData}
									onPatientOrderChange={(patientOrder) => {
										window.alert('[TODO]: Refresh the order on this page');
										console.log(patientOrder);
									}}
								/>
							)}
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
											key={screening.screeningId}
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
											key={screening.screeningId}
											screening={screening}
											referenceData={referenceData}
											id={screening.screeningId}
										/>
									))}
								</>
							)}

							<hr className="mb-8" />

							<div className={classes.scrollAnchor} id="other-assessments" />
							<h3 className="mb-2">Other Assessments</h3>
							<p className="mb-8">These assessments were not applicable to the patient.</p>
							{notTakenScreeningTypes.map((screeningType) => (
								<ScreeningResultCard
									key={screeningType.screeningTypeId}
									screening={{
										screeningVersionId: '',
										screeningId: '',
										screeningVersionNumber: 0,
										screeningTypeId: screeningType.screeningTypeId,
										screeningName: screeningType.description,
										screeningScore: {
											overallScore: undefined,
											personalAccomplishmentScore: 0,
											depersonalizationScore: 0,
											emotionalExhaustionScore: 0,
										},
										belowScoringThreshold: undefined,
									}}
									referenceData={referenceData}
									id={screeningType.screeningTypeId}
								/>
							))}
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
		</AsyncWrapper>
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
		<Card
			bsPrefix="ic-card"
			className={classNames('mb-8', {
				'overflow-hidden': !screening.screeningQuestionResults,
			})}
		>
			<div className={classes.scrollAnchor} id={id} />
			<Card.Header
				className={classNames({
					'border-bottom-0': !screening.screeningQuestionResults,
				})}
			>
				<Card.Title>{screening.screeningName}</Card.Title>
				<div className="button-container">
					<p className="mb-0 fw-semibold me-2">
						Total Score:{' '}
						{screening.screeningScore?.overallScore === undefined ? (
							<>&mdash;</>
						) : (
							<>
								{screening.screeningScore?.overallScore}/
								{
									referenceData?.screeningTypes.find(
										(st) => st.screeningTypeId === screening.screeningTypeId
									)?.overallScoreMaximum
								}
							</>
						)}
					</p>
					{(screening.belowScoringThreshold === undefined || screening.belowScoringThreshold === null) && (
						<NaIcon className="text-gray" />
					)}
					{screening.belowScoringThreshold === false && <DissatisfiedIcon className="text-danger" />}
					{screening.belowScoringThreshold === true && <SatisfiedIcon className="text-success" />}
				</div>
			</Card.Header>
			{screening.screeningQuestionResults && (
				<Card.Body>
					<ol className="m-0 p-0 list-unstyled">
						{screening.screeningQuestionResults.map((question, questionIndex) => {
							const isLastQuestion =
								(screening?.screeningQuestionResults ?? []).length - 1 === questionIndex;

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
													key={answer.screeningAnswerId}
													className={classNames({
														'mb-1': !isLastAnswer,
													})}
												>
													<div className="d-flex align-items-center justify-content-between">
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
			)}
		</Card>
	);
};
