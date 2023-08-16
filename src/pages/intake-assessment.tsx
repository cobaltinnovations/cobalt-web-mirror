import React, { FC, useState, useCallback, useContext, useMemo, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

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
	const questionId = searchParams.get('questionId') || '';
	const sessionId = searchParams.get('sessionId') || '';

	const [assessment, setAssessment] = useState<Assessment>();
	const [selectedQuestionAnswers, setSelectedQuestionAnswers] = useState<SelectedQuestionAnswer[]>([]);

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
		} else {
			throw new Error('No providerId or groupSessionId found.');
		}

		if (!response) {
			throw new Error('No response found.');
		}

		setAssessment(response.assessment);
		setSelectedQuestionAnswers(response.assessment.question.selectedAssessmentAnswers);
	}, [appointmentTypeId, providerId, questionId, sessionId]);

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

			if (typeof response.assessment.bookingAllowed === 'boolean') {
				if (response.assessment.bookingAllowed) {
					const params = new URLSearchParams();
					if (selectedProvider?.phoneNumberRequiredForAppointment) {
						params.set('promptForPhoneNumber', 'true');
					}

					params.set('providerId', selectedProvider?.providerId ?? '');
					params.set('appointmentTypeId', selectedAppointmentTypeId ?? '');
					params.set('date', formattedAvailabilityDate);
					params.set('time', selectedTimeSlot?.time ?? '');
					params.set('intakeAssessmentId', assessment?.assessmentId);

					window.location.href = `/confirm-appointment?${params.toString()}`;
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
		} catch (e) {
			handleError(e);
		}
	};

	useEffect(() => {
		if (!providerId || !selectedProvider || !selectedTimeSlot) {
			navigate(exitUrl);
		}
	}, [exitUrl, navigate, providerId, selectedProvider, selectedTimeSlot]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Assessment</title>
			</Helmet>

			<AsyncPage fetchData={fetchData}>
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

				<ProgressBar
					current={assessment?.assessmentProgress || 0}
					max={assessment?.assessmentProgressTotal || 0}
				/>

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
									/>
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
							to={exitUrl}
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
		</>
	);
};

export default IntakeAssessment;
