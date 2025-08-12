import { compact } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';
import { Helmet } from 'react-helmet';

import {
	AnalyticsNativeEventTypeId,
	PatientOrderConsentStatusId,
	PatientOrderDispositionId,
	PatientOrderModel,
	PatientOrderSafetyPlanningStatusId,
	ScreeningSessionScreeningResult,
	ScreeningType,
} from '@/lib/models';
import TabBar from '@/components/tab-bar';
import {
	MHIC_HEADER_HEIGHT,
	MhicFlagOrderForSafetyPlanning,
	MhicNextStepsAlerts,
	MhicNextStepsAppointment,
	MhicNextStepsResources,
	MhicTriageCard,
} from '@/components/integrated-care/mhic';

import { ReactComponent as NaIcon } from '@/assets/icons/sentiment-na.svg';
import { useIntegratedCareLoaderData } from '@/routes/ic/landing';
import { analyticsService, integratedCareService, screeningService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';

import { useCopyTextToClipboard } from '@/hooks/use-copy-text-to-clipboard';
import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import useHandleError from '@/hooks/use-handle-error';
import InlineAlert from '@/components/inline-alert';
import { MhicResetAssessmentModel } from '@/components/integrated-care/mhic/mhic-reset-assessment-modal';
import useFlags from '@/hooks/use-flags';
import { ReactComponent as ResetIcon } from '@/assets/icons/icon-before.svg';
import SvgIcon from '@/components/svg-icon';

const useStyles = createUseStyles(() => ({
	scrollAnchor: {
		position: 'relative',
		top: -32 - MHIC_HEADER_HEIGHT,
	},
}));

interface MhicAssessmentCompleteProps {
	patientOrder?: PatientOrderModel;
	onStartNewAssessment: () => void;
}

export const MhicAssessmentComplete = ({ patientOrder, onStartNewAssessment }: MhicAssessmentCompleteProps) => {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const classes = useStyles();
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const [notTakenScreeningTypes, setNotTakeScreeningTypes] = useState<ScreeningType[]>([]);

	const [isExportingResults, setIsExportingResults] = useState(false);
	const copyTextToClipboard = useCopyTextToClipboard();
	const handleError = useHandleError();
	const [showResetModel, setShowResetModel] = useState(false);
	const { addFlag } = useFlags();

	const eligilityResults = useMemo(
		() => patientOrder?.intakeScreeningSessionResult?.screeningSessionScreeningResults ?? [],
		[patientOrder?.intakeScreeningSessionResult?.screeningSessionScreeningResults]
	);

	const completedAssessmentsResults = useMemo(
		() => patientOrder?.screeningSessionResult?.screeningSessionScreeningResults ?? [],
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

		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ORDER_ASSESSMENT_RESULTS, {
			patientOrderId: patientOrder.patientOrderId,
		});
	}, [
		patientOrder?.patientOrderId,
		patientOrder?.screeningSession?.screeningFlowVersionId,
		patientOrder?.screeningSessionResult?.screeningSessionScreeningResults,
	]);

	const handleExportResultsClick = useCallback(async () => {
		if (patientOrder) {
			analyticsService.persistEvent(
				AnalyticsNativeEventTypeId.CLICKTHROUGH_MHIC_EXPORT_ORDER_ASSESSMENT_RESULTS,
				{
					patientOrderId: patientOrder.patientOrderId,
				}
			);
		}

		try {
			if (!patientOrder) {
				throw new Error('patientOrder is undefined');
			}

			setIsExportingResults(true);

			const { clinicalReport } = await integratedCareService
				.getClinicalReport(patientOrder.patientOrderId)
				.fetch();

			copyTextToClipboard(clinicalReport, {
				successTitle: 'Report copied to clipboard',
				successDescription:
					'The clinical report was copied to your clipboard. Paste the report into Epic to edit.',
				errorTitle: 'Failed to copy report',
				errorDesctiption: 'Please try again.',
			});
		} catch (error) {
			handleError(error);
		} finally {
			setIsExportingResults(false);
		}
	}, [copyTextToClipboard, handleError, patientOrder]);

	const handleResetPatientOrder = useCallback(async () => {
		try {
			if (!patientOrder) {
				throw new Error('patientOrder is undefined');
			}

			const response = await integratedCareService.resetPatientOrder(patientOrder.patientOrderId).fetch();

			setShowResetModel(false);
			addFlag({
				variant: 'success',
				title: 'Success',
				description: 'Patient order was reset.',
				actions: [],
			});

			analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_MHIC_RETAKE_ORDER_ASSESSMENT, {
				patientOrderId: patientOrder.patientOrderId,
			});

			navigate(`/ic/mhic/my-patients/all/${response.patientOrder.patientOrderId}`);
		} catch (error) {
			handleError(error);
		}
	}, [addFlag, handleError, navigate, patientOrder]);

	const canFlagForSafetyPlanning =
		!!patientOrder &&
		patientOrder.patientOrderDispositionId === PatientOrderDispositionId.OPEN &&
		[PatientOrderSafetyPlanningStatusId.UNKNOWN, PatientOrderSafetyPlanningStatusId.NONE_NEEDED].includes(
			patientOrder.patientOrderSafetyPlanningStatusId ?? PatientOrderSafetyPlanningStatusId.UNKNOWN
		);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Assessment Results</title>
			</Helmet>

			<MhicResetAssessmentModel
				show={showResetModel}
				onHide={() => {
					setShowResetModel(false);
				}}
				onReset={handleResetPatientOrder}
			/>

			<Container className="py-10">
				{patientOrder && (
					<>
						<Row className="mb-11">
							<Col md={{ span: 10, offset: 1 }}>
								<div className="d-flex align-items-center justify-content-between">
									<h2 className="mb-0">Assessment Review</h2>
									<div className="d-flex align-items-center">
										<Button
											variant="link"
											className="me-2 text-decoration-none d-flex align-items-center"
											onClick={() => {
												setShowResetModel(true);
											}}
											disabled={
												patientOrder.patientOrderDispositionId !==
												PatientOrderDispositionId.OPEN
											}
										>
											<ResetIcon className="me-1" />
											Reset
										</Button>
										<Button
											className="d-flex align-items-center"
											onClick={handleExportResultsClick}
											disabled={isExportingResults}
										>
											Export Results
											<ExternalIcon className="ms-2" width={20} height={20} />
										</Button>
									</div>
								</div>
								<p className="mb-0">
									Completed{' '}
									{patientOrder.screeningSession?.completedAtDescription ??
										patientOrder.intakeScreeningSession?.completedAtDescription}{' '}
									by{' '}
									{patientOrder.mostRecentScreeningSessionCreatedByAccountDisplayName ??
										patientOrder.mostRecentIntakeScreeningSessionCreatedByAccountDisplayName}
								</p>
							</Col>
						</Row>
						<Row className="mb-8">
							<Col md={{ span: 10, offset: 1 }}>
								<hr />
							</Col>
						</Row>
						<Row>
							<Col md={{ span: 7, offset: 1 }}>
								<div className={classes.scrollAnchor} id="results" />
								<div className="mb-8 d-flex align-items-center justify-content-between">
									<h3 className="mb-0">Results</h3>

									{canFlagForSafetyPlanning && (
										<MhicFlagOrderForSafetyPlanning patientOrderId={patientOrder.patientOrderId} />
									)}
								</div>
								{patientOrder.patientOrderConsentStatusId === PatientOrderConsentStatusId.REJECTED && (
									<Row className="mb-4">
										<Col>
											<InlineAlert
												variant="warning"
												title="Patient rejected consent to Integrated Care services"
											/>
										</Col>
									</Row>
								)}
								<MhicNextStepsAlerts
									patientOrder={patientOrder}
									referenceData={referenceDataResponse}
									disabled={patientOrder.patientOrderDispositionId !== PatientOrderDispositionId.OPEN}
								/>
								<MhicTriageCard
									className="mb-6"
									patientOrder={patientOrder}
									disabled={patientOrder.patientOrderDispositionId !== PatientOrderDispositionId.OPEN}
								/>
								<MhicNextStepsAppointment
									className="mb-6"
									patientOrder={patientOrder}
									disabled={patientOrder.patientOrderDispositionId !== PatientOrderDispositionId.OPEN}
								/>
								<hr className="mb-8" />

								<div className="mb-8">
									<h3 className="mb-0">Resources</h3>
								</div>
								<MhicNextStepsResources
									patientOrder={patientOrder}
									referenceData={referenceDataResponse}
									disabled={patientOrder.patientOrderDispositionId !== PatientOrderDispositionId.OPEN}
								/>
								<hr className="mb-8" />

								{eligilityResults.length > 0 && (
									<>
										<div className={classes.scrollAnchor} id="eligibility" />
										<h3 className="mb-8">Eligibility</h3>
										{eligilityResults.map((screening) => (
											<ScreeningResultCard
												key={screening.screeningId}
												screening={screening}
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
												id={screening.screeningId}
											/>
										))}
									</>
								)}

								<AsyncWrapper fetchData={fetchData}>
									<>
										{notTakenScreeningTypes.length > 0 && (
											<>
												<hr className="mb-8" />
												<div className={classes.scrollAnchor} id="other-assessments" />
												<h3 className="mb-2">Other Assessments</h3>
												<p className="mb-8">
													These assessments were not applicable to the patient.
												</p>
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
														id={screeningType.screeningTypeId}
													/>
												))}
											</>
										)}
									</>
								</AsyncWrapper>
							</Col>
							<Col md={{ span: 2, offset: 1 }}>
								<TabBar
									key="mhic-assessment-tabbar"
									className="position-sticky"
									style={{ top: MHIC_HEADER_HEIGHT + 32 }}
									orientation="vertical"
									value="RESULTS"
									tabs={[
										{
											title: 'Results',
											value: '#results',
										},
										...(eligilityResults.length > 0
											? [
													{
														title: 'Eligibility',
														value: '#eligibility',
													},
											  ]
											: []),
										...eligilityResults.map((result) => ({
											title: result.screeningName ?? '',
											value: result.screeningId ? `#${result.screeningId}` : '#',
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
											value: result.screeningId ? `#${result.screeningId}` : '#',
											level: 1,
										})),
										...(notTakenScreeningTypes.length > 0
											? [
													{
														title: 'Other Assessments',
														value: '#other-assessments',
													},
											  ]
											: []),
										...notTakenScreeningTypes.map((result) => ({
											title: result.description ?? '',
											value: result.screeningTypeId ? `#${result.screeningTypeId}` : '#',
											level: 1,
										})),
									]}
									onTabClick={(value) => {
										navigate(`${pathname}${value}`);
									}}
								/>
							</Col>
						</Row>
					</>
				)}
			</Container>
		</>
	);
};

const ScreeningResultCard = ({ screening, id }: { screening: ScreeningSessionScreeningResult; id?: string }) => {
	const { referenceDataResponse } = useIntegratedCareLoaderData();
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
									referenceDataResponse?.screeningTypes.find(
										(st) => st.screeningTypeId === screening.screeningTypeId
									)?.overallScoreMaximum
								}
							</>
						)}
					</p>
					{(screening.belowScoringThreshold === undefined || screening.belowScoringThreshold === null) && (
						<NaIcon className="text-gray" />
					)}
					{screening.belowScoringThreshold === false && (
						<SvgIcon kit="far" icon="face-frown-slight" className="text-danger" />
					)}
					{screening.belowScoringThreshold === true && (
						<SvgIcon kit="far" icon="face-smile" className="text-success" />
					)}
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
