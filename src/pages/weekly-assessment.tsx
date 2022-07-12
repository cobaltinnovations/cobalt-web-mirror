import cloneDeep from 'lodash/cloneDeep';
import React, { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import classNames from 'classnames';

import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import useHeaderTitle from '@/hooks/use-header-title';
import useQuery from '@/hooks/use-query';
import useAccount from '@/hooks/use-account';

import AsyncPage from '@/components/async-page';
import SurveyQuestion from '@/components/survey-question';
import CollectPhoneModal from '@/components/collect-phone-modal';

import { assessmentService, accountService } from '@/lib/services';
import { Assessment, QUESTION_TYPE, SelectedQuestionAnswer } from '@/lib/models';
import ProgressBar from '@/components/progress-bar';
import useHandleError from '@/hooks/use-handle-error';

const WeeklyAssessment: FC = () => {
	useHeaderTitle('assessment');
	const handleError = useHandleError();

	const history = useHistory<any>();
	const query = useQuery();
	const questionId = query.get('questionId');
	const sessionId = query.get('sessionId');
	const { account, setAccount } = useAccount();
	const { openInCrisisModal } = useInCrisisModal();

	const [assessment, setAssessment] = useState<Assessment | undefined>();
	const [answerChangedByUser, setAnswerChangedByUser] = useState<boolean>(false);
	const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);

	const SUPPORT_ROUTE = useMemo(() => {
		const params = new URLSearchParams({});

		const clinicIds = history.location.state?.routedClinicIds ?? [];
		const providerId = history.location.state?.routedProviderId;
		const supportRoleIds = history.location.state?.routedSupportRoleIds;

		if (Array.isArray(clinicIds)) {
			for (const clinicId of clinicIds) {
				params.append('clinicId', clinicId);
			}
		}

		if (providerId) {
			params.append('providerId', providerId);
		}

		if (Array.isArray(supportRoleIds)) {
			for (const supportRoleId of supportRoleIds) {
				params.append('supportRoleId', supportRoleId);
			}
		}

		return `/connect-with-support${params.toString() ? `?${params.toString()}` : ''}`;
	}, [history.location.state]);

	const fetchData = useCallback(async () => {
		const response = await assessmentService.getEvidenceAssessmentQuestion(questionId, sessionId).fetch();

		setAnswerChangedByUser(false);
		setAssessment(response.assessment);
	}, [questionId, sessionId]);

	useEffect(() => {
		if (!account) return;

		if (!account.phoneNumber) {
			setShowPhoneModal(true);
		}
	}, [account]);

	const navigateForwards = useCallback(
		(submissionResponse: Awaited<ReturnType<typeof submitAnswer>>) => {
			if (submissionResponse?.assessment) {
				history.push(
					`/weekly-assessment?questionId=${submissionResponse.assessment.question.questionId}&sessionId=${submissionResponse.assessment.sessionId}`
				);
			} else {
				history.push(SUPPORT_ROUTE);
			}
		},
		[SUPPORT_ROUTE, history]
	);

	const navigateBackwards = useCallback(() => {
		if (!assessment) return;

		if (assessment.previousQuestionId) {
			history.push(
				`/weekly-assessment?questionId=${assessment.previousQuestionId}&sessionId=${assessment.previousSessionId}`
			);
		}
	}, [assessment, history]);

	const submitAnswer = useCallback(async () => {
		if (!assessment) return;

		try {
			const result = await assessmentService
				.submitEvidenceAssessmentQuestion({
					assessmentAnswers: assessment.question.selectedAssessmentAnswers,
					questionId: assessment.question.questionId,
					sessionId: assessment.sessionId,
				})
				.fetch();

			return result;
		} catch (error) {
			throw error;
		}
	}, [assessment]);

	// Need to use this as a sort of psuedo click handler for QUAD question types
	useEffect(() => {
		if (!assessment) return;
		if (assessment.question.questionType !== QUESTION_TYPE.QUAD) return;
		if (!assessment.question.selectedAssessmentAnswers) return;
		if (!assessment.question.selectedAssessmentAnswers.length) return;
		if (!answerChangedByUser) return;

		async function submitAnswerAndNavigateForwards() {
			try {
				const submissionResponse = await submitAnswer();
				navigateForwards(submissionResponse);
			} catch (error) {
				handleError(error);
			}
		}

		submitAnswerAndNavigateForwards();
	}, [answerChangedByUser, assessment, handleError, navigateForwards, submitAnswer]);

	function handleSurveyQuestionChange(_questionId: string, selectedAssessmentAnswers: SelectedQuestionAnswer[]) {
		if (!assessment) return;
		const assessmentClone = cloneDeep(assessment);

		assessmentClone.question.selectedAssessmentAnswers = selectedAssessmentAnswers;

		setAnswerChangedByUser(true);
		setAssessment(assessmentClone);

		const selectedAnswers = assessment.question.answers.filter((answer) =>
			selectedAssessmentAnswers.find((selectedAnswer) => selectedAnswer.answerId === answer.answerId)
		);
		const isCrisis = selectedAnswers.some((answer) => answer.isCrisis);
		const isCall = selectedAnswers.some((answer) => answer.isCall);

		isCrisis && openInCrisisModal(isCall);
	}

	async function handleBackButtonClick() {
		if (!assessment) return;

		if (assessment.question.selectedAssessmentAnswers && assessment.question.selectedAssessmentAnswers.length) {
			try {
				await submitAnswer();
				navigateBackwards();
			} catch (error) {
				handleError(error);
			}
		} else {
			navigateBackwards();
		}
	}

	async function handleNextButtonClick() {
		try {
			const submissionResponse = await submitAnswer();
			navigateForwards(submissionResponse);
		} catch (error) {
			handleError(error);
		}
	}

	return (
		<>
			<CollectPhoneModal
				show={showPhoneModal}
				onSkip={() => {
					history.push(SUPPORT_ROUTE, { skipAssessment: true });
				}}
				onSuccess={() => {
					setShowPhoneModal(false);
				}}
			/>

			<AsyncPage fetchData={fetchData}>
				<ProgressBar
					current={assessment?.assessmentProgress || 0}
					max={assessment?.assessmentProgressTotal || 0}
				/>

				<Container className="pt-5 pb-5">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							{assessment?.assessmentPrompt && <p className="mb-3">{assessment?.assessmentPrompt}</p>}
							<Form>
								{assessment?.question && (
									<SurveyQuestion
										key={assessment.question.questionId}
										question={assessment.question}
										onChange={handleSurveyQuestionChange}
									/>
								)}
								<div
									className={classNames({
										'd-flex': true,
										'justify-content-end': !assessment?.previousQuestionId,
										'justify-content-between':
											assessment?.previousQuestionId && assessment?.nextQuestionId,
									})}
								>
									{assessment?.previousQuestionId && (
										<Button variant="outline-primary" onClick={handleBackButtonClick}>
											back
										</Button>
									)}
									{assessment?.question.questionType !== QUESTION_TYPE.QUAD && (
										<Button variant="primary" onClick={handleNextButtonClick}>
											{assessment?.nextQuestionId ? 'next' : 'done'}
										</Button>
									)}
								</div>
							</Form>
						</Col>
					</Row>

					{!assessment?.previousQuestionId && (
						<p className="text-center">
							<Link
								to={{
									pathname: SUPPORT_ROUTE,
									state: { skipAssessment: true },
								}}
							>
								skip for now
							</Link>
						</p>
					)}
				</Container>
			</AsyncPage>
		</>
	);
};

export default WeeklyAssessment;
