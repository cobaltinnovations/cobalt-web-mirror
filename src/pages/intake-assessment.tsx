import React, { FC, useState, useCallback, useContext, useMemo, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';

import useAccount from '@/hooks/use-account';

import AsyncPage from '@/components/async-page';
import SurveyQuestion from '@/components/survey-question';

import { assessmentService } from '@/lib/services';
import { Assessment, QUESTION_TYPE, SelectedQuestionAnswer } from '@/lib/models';
import ProgressBar from '@/components/progress-bar';
import Breadcrumb from '@/components/breadcrumb';
import { BookingContext } from '@/contexts/booking-context';
import useHandleError from '@/hooks/use-handle-error';
import HeroContainer from '@/components/hero-container';

const IntakeAssessment: FC = () => {
	const handleError = useHandleError();
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const providerId = searchParams.get('providerId') || '';
	const groupSessionId = searchParams.get('groupSessionId') || '';
	const questionId = searchParams.get('questionId') || '';
	const sessionId = searchParams.get('sessionId') || '';
	const { account } = useAccount();

	const [assessment, setAssessment] = useState<Assessment>();
	const [selectedQuestionAnswers, setSelectedQuestionAnswers] = useState<SelectedQuestionAnswer[]>([]);

	const [isGroupSessionAssessment, setIsGroupSessionAssessment] = useState(false);

	const {
		selectedAppointmentTypeId,
		selectedProvider,
		selectedTimeSlot,
		formattedAvailabilityDate,
		setIsEligible,
		getExitBookingLocation,
	} = useContext(BookingContext);

	const appointmentTypeId = searchParams.get('appointmentTypeId') || selectedAppointmentTypeId;

	const exitUrl = useMemo(() => {
		return getExitBookingLocation(location.state);
	}, [getExitBookingLocation, location.state]);

	const fetchData = useCallback(async () => {
		let response;

		if (providerId) {
			response = await assessmentService
				.getIntakeAssessmentQuestion({ appointmentTypeId, providerId, questionId, sessionId })
				.fetch();

			setIsGroupSessionAssessment(false);
		} else if (groupSessionId) {
			response = await assessmentService
				.getIntakeAssessmentQuestion({ questionId, sessionId, groupSessionId })
				.fetch();

			setIsGroupSessionAssessment(true);
		} else {
			throw new Error('No providerId or groupSessionId found.');
		}

		if (!response) {
			throw new Error('No response found.');
		}

		setAssessment(response.assessment);
		setSelectedQuestionAnswers(response.assessment.question.selectedAssessmentAnswers);
	}, [appointmentTypeId, groupSessionId, providerId, questionId, sessionId]);

	const submitAnswers = async (assessmentAnswers: SelectedQuestionAnswer[]) => {
		if (!assessment) {
			return;
		}

		try {
			const response = await assessmentService
				.submitIntakeAssessmentAnswer({
					assessmentAnswers,
					questionId: assessment.question.questionId,
					sessionId: assessment.sessionId,
				})
				.fetch();

			if (isGroupSessionAssessment) {
				if (typeof response.assessment.bookingAllowed === 'boolean') {
					navigate(`/in-the-studio/group-session-scheduled/${groupSessionId}`, {
						state: {
							...(location.state as Record<string, unknown>),
							passedAssessment: response.assessment.bookingAllowed ? true : false,
						},
					});
					if (response.assessment.bookingAllowed) {
						navigate(`/in-the-studio/group-session-scheduled/${groupSessionId}`, {
							state: {
								...(location.state as Record<string, unknown>),
								passedAssessment: true,
							},
						});
					} else {
						navigate(`/in-the-studio/group-session-scheduled/${groupSessionId}`, {
							state: {
								...(location.state as Record<string, unknown>),
								passedAssessment: false,
							},
						});
					}

					return;
				}

				navigate(
					`/intake-assessment?groupSessionId=${groupSessionId}&questionId=${response.assessment.question.questionId}&sessionId=${response.assessment.sessionId}`,
					{ state: location.state }
				);
			} else {
				if (typeof response.assessment.bookingAllowed === 'boolean') {
					if (response.assessment.bookingAllowed) {
						if (selectedProvider?.schedulingSystemId === 'EPIC' && !account?.epicPatientId) {
							navigate('/ehr-lookup', {
								state: location.state,
							});
						} else {
							const params = new URLSearchParams();
							params.set('promptForPhoneNumber', 'true');
							params.set('providerId', selectedProvider?.providerId ?? '');
							params.set('appointmentTypeId', selectedAppointmentTypeId ?? '');
							params.set('date', formattedAvailabilityDate);
							params.set('time', selectedTimeSlot?.time ?? '');
							params.set('intakeAssessmentId', assessment?.assessmentId);

							navigate(`/confirm-appointment?${params.toString()}`);
						}
					} else {
						setIsEligible(false);
						navigate(exitUrl, {
							state: location.state,
						});
					}

					return;
				}

				navigate(
					`/intake-assessment?providerId=${providerId}&questionId=${response.assessment.question.questionId}&sessionId=${response.assessment.sessionId}`,
					{ state: location.state }
				);
			}
		} catch (e) {
			handleError(e);
		}
	};

	useEffect(() => {
		if (!groupSessionId && (!providerId || !selectedProvider || !selectedTimeSlot)) {
			navigate(exitUrl);
		}
	}, [exitUrl, groupSessionId, navigate, providerId, selectedProvider, selectedTimeSlot]);

	return (
		<AsyncPage fetchData={fetchData}>
			{isGroupSessionAssessment && (
				<Breadcrumb
					breadcrumbs={[
						{
							to: '/',
							title: 'Home',
						},
						{
							to: '/in-the-studio',
							title: 'Group Sessions',
						},
						{
							to: `/in-the-studio/group-session-scheduled/${groupSessionId}`,
							title: 'Group Session',
						},
						{
							to: '/#',
							title: 'Appointment',
						},
					]}
				/>
			)}
			{!isGroupSessionAssessment && (
				<Breadcrumb
					breadcrumbs={[
						{
							to: '/',
							title: 'Home',
						},
						{
							to: exitUrl,
							title: 'Connect with Support',
						},
						{
							to: '/#',
							title: 'Appointment',
						},
					]}
				/>
			)}

			<ProgressBar current={assessment?.assessmentProgress || 0} max={assessment?.assessmentProgressTotal || 0} />

			<HeroContainer>
				<h2 className="mb-0 text-center">Assessment</h2>
			</HeroContainer>

			<Container className="pt-5 pb-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Form
							autoComplete="off"
							autoCorrect="off"
							onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
								e.preventDefault();
							}}
						>
							{assessment?.question && (
								<SurveyQuestion
									key={assessment.question.questionId}
									question={{
										...assessment.question,
										selectedAssessmentAnswers: selectedQuestionAnswers,
									}}
									onChange={(_, selectedAssessmentAswers) => {
										setSelectedQuestionAnswers(selectedAssessmentAswers);
										if (assessment.question.questionType === QUESTION_TYPE.QUAD) {
											submitAnswers(selectedAssessmentAswers);
										}
									}}
								>
									{isGroupSessionAssessment && (
										<p className="mb-5">
											Only people who answer "Yes" are eligible to reserve a seat.
										</p>
									)}
								</SurveyQuestion>
							)}

							<div className="d-flex">
								{assessment?.previousQuestionId && (
									<Button
										type="button"
										variant="outline-primary"
										onClick={() => {
											navigate(
												`/intake-assessment?providerId=${providerId}&questionId=${assessment.previousQuestionId}&sessionId=${assessment.sessionId}`,
												{ state: location.state }
											);
										}}
									>
										Back
									</Button>
								)}

								{assessment?.question.questionType !== QUESTION_TYPE.QUAD && (
									<Button
										type="submit"
										className="ms-auto"
										variant="primary"
										onClick={() => submitAnswers(selectedQuestionAnswers)}
									>
										{assessment?.nextQuestionId ? 'Next' : 'Done'}
									</Button>
								)}
							</div>
						</Form>
					</Col>
				</Row>

				<p className="text-center">
					<Link
						to={
							isGroupSessionAssessment
								? `/in-the-studio/group-session-scheduled/${groupSessionId}`
								: exitUrl
						}
						onClick={(e) => {
							if (!window.confirm('Are you sure you want to exit booking?')) {
								e.preventDefault();
							}
						}}
					>
						exit booking
					</Link>
				</p>
			</Container>
		</AsyncPage>
	);
};

export default IntakeAssessment;
