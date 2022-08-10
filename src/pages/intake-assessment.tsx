import React, { FC, useState, useCallback, useContext, useMemo, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';

import useAccount from '@/hooks/use-account';

import AsyncPage from '@/components/async-page';
import SurveyQuestion from '@/components/survey-question';

import { assessmentService, accountService, CreateAppointmentData, appointmentService } from '@/lib/services';
import { Assessment, QUESTION_TYPE, SelectedQuestionAnswer } from '@/lib/models';
import ProgressBar from '@/components/progress-bar';
import Breadcrumb from '@/components/breadcrumb';
import { BookingContext } from '@/contexts/booking-context';
import CollectContactInfoModal from '@/components/collect-contact-info-modal';
import ConfirmProviderBookingModal from '@/components/confirm-provider-booking-modal';
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
	const { account, setAccount } = useAccount();

	const [isSavingInfo, setIsSavingInfo] = useState(false);
	const [isBooking, setIsBooking] = useState(false);
	const [assessment, setAssessment] = useState<Assessment>();
	const [selectedQuestionAnswers, setSelectedQuestionAnswers] = useState<SelectedQuestionAnswer[]>([]);

	const [collectedPhoneNumebr, setCollectedPhoneNumber] = useState(account?.phoneNumber ?? '');
	const [collectedEmail, setCollectedEmail] = useState(account?.emailAddress ?? '');
	const [showCollectInfoModal, setShowCollectInfoModal] = useState(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);

	const [isGroupSessionAssessment, setIsGroupSessionAssessment] = useState(false);

	const {
		selectedAppointmentTypeId,
		setSelectedDate,
		selectedProvider,
		setSelectedProvider,
		selectedTimeSlot,
		setSelectedTimeSlot,
		timeSlotEndTime,
		formattedAvailabilityDate,
		formattedModalDate,

		promptForEmail,
		promptForPhoneNumber,
		setPromptForPhoneNumber,

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
						} else if (promptForEmail || promptForPhoneNumber) {
							setShowCollectInfoModal(true);
						} else {
							setShowConfirmationModal(true);
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
			<CollectContactInfoModal
				promptForEmail={promptForEmail}
				promptForPhoneNumber={promptForPhoneNumber}
				show={showCollectInfoModal}
				collectedEmail={collectedEmail}
				collectedPhoneNumber={collectedPhoneNumebr}
				onHide={() => {
					setShowCollectInfoModal(false);
				}}
				onSubmit={async ({ email, phoneNumber }) => {
					if (!account || isSavingInfo) {
						return;
					}

					setIsSavingInfo(true);

					try {
						if (promptForEmail) {
							const accountResponse = await accountService
								.updateEmailAddressForAccountId(account.accountId, {
									emailAddress: email,
								})
								.fetch();

							setCollectedEmail(email);
							setAccount(accountResponse.account);
						}

						if (promptForPhoneNumber) {
							const accountResponse = await accountService
								.updatePhoneNumberForAccountId(account.accountId, {
									phoneNumber,
								})
								.fetch();

							setCollectedPhoneNumber(phoneNumber);
							setAccount(accountResponse.account);
						}

						setShowCollectInfoModal(false);
						setShowConfirmationModal(true);
					} catch (error) {
						handleError(error);
					}

					setIsSavingInfo(false);
				}}
			/>

			{providerId && selectedProvider && selectedTimeSlot && (
				<ConfirmProviderBookingModal
					show={showConfirmationModal}
					formattedDate={formattedModalDate}
					provider={selectedProvider}
					selectedTimeSlot={selectedTimeSlot}
					timeSlotEndTime={timeSlotEndTime}
					onHide={() => {
						setShowConfirmationModal(false);
					}}
					onConfirm={async () => {
						if (isBooking) {
							return;
						}

						try {
							setIsBooking(true);
							const appointmentData: CreateAppointmentData = {
								providerId: selectedProvider.providerId,
								appointmentTypeId: selectedAppointmentTypeId,
								date: formattedAvailabilityDate,
								time: selectedTimeSlot.time,
								intakeAssessmentId: assessment?.assessmentId,
							};

							if (promptForEmail) {
								appointmentData.emailAddress = collectedEmail;
							}

							if (promptForPhoneNumber) {
								appointmentData.phoneNumber = collectedPhoneNumebr;
							}

							const response = await appointmentService.createAppointment(appointmentData).fetch();

							setShowConfirmationModal(false);
							setSelectedDate(undefined);
							setSelectedProvider(undefined);
							setSelectedTimeSlot(undefined);

							navigate(`/my-calendar?appointmentId=${response.appointment.appointmentId}`, {
								state: {
									successBooking: true,
									emailAddress: response.account.emailAddress,
								},
							});
						} catch (e) {
							if ((e as any).metadata?.accountPhoneNumberRequired) {
								setPromptForPhoneNumber(true);
								setShowConfirmationModal(false);
								setShowCollectInfoModal(true);
							} else {
								handleError(e);
							}
						}

						setIsBooking(false);
					}}
				/>
			)}

			{isGroupSessionAssessment && (
				<Breadcrumb
					breadcrumbs={[
						{
							to: '/',
							title: 'home',
						},
						{
							to: '/in-the-studio',
							title: 'in the studio',
						},
						{
							to: `/in-the-studio/group-session-scheduled/${groupSessionId}`,
							title: 'studio session',
						},
						{
							to: '/#',
							title: 'appointment',
						},
					]}
				/>
			)}
			{!isGroupSessionAssessment && (
				<Breadcrumb
					breadcrumbs={[
						{
							to: '/',
							title: 'home',
						},
						{
							to: exitUrl,
							title: 'connect with support',
						},
						{
							to: '/#',
							title: 'appointment',
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
										back
									</Button>
								)}

								{assessment?.question.questionType !== QUESTION_TYPE.QUAD && (
									<Button
										type="submit"
										className="ms-auto"
										variant="primary"
										onClick={() => submitAnswers(selectedQuestionAnswers)}
									>
										{assessment?.nextQuestionId ? 'next' : 'done'}
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
