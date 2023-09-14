import AsyncPage from '@/components/async-page';
import InputHelper from '@/components/input-helper';
import ScreeningPromptImage from '@/components/screening-prompt-image';
import useHandleError from '@/hooks/use-handle-error';
import {
	ScreeningAnswerFormatId,
	ScreeningAnswerSelection,
	ScreeningFlowSkipTypeId,
	ScreeningQuestionContextResponse,
	ScreeningConfirmationPrompt,
	UserExperienceTypeId,
	ScreeningAnswerContentHintId,
} from '@/lib/models';
import { screeningService } from '@/lib/services';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Modal, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import { useScreeningNavigation } from './screening.hooks';
import { ReactComponent as CheckMarkIcon } from '@/assets/icons/check.svg';
import classNames from 'classnames';
import useAccount from '@/hooks/use-account';
import { IcScreeningCrisisModal } from '@/components/integrated-care/patient';
import { Helmet } from 'react-helmet';
import { ReactComponent as QuestionMarkIcon } from '@/assets/icons/icon-question-mark.svg';
import { ReactComponent as AppointmentIllustration } from '@/assets/illustrations/appointment.svg';

const ScreeningQuestionsPage = () => {
	const handleError = useHandleError();
	const { institution } = useAccount();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const location = useLocation();
	const [screeningQuestionContextResponse, setScreeningQuestionContextResponse] =
		useState<ScreeningQuestionContextResponse>();

	const { navigateToQuestion, navigateToDestination } = useScreeningNavigation();
	const { screeningQuestionContextId } = useParams<{ screeningQuestionContextId: string }>();
	const [showCrisisModal, setShowCrisisModal] = useState(false);
	const [navigateNext, setNavigateNext] = useState<() => void>();

	const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
	const [answerText, setAnswerText] = useState({} as Record<string, string>);
	const [supplementText, setSupplementText] = useState({} as Record<string, string>);

	// holds details of confirmation prompts (submission error & pre-question)
	const [confirmationPrompt, setConfirmationPrompt] = useState<ScreeningConfirmationPrompt | null>(null);
	// flags whether the confirmation prompt was due to a submission error
	const [isSubmitPrompt, setIsSubmitPrompt] = useState(false);
	const [showHelpModal, setShowHelpModal] = useState(false);

	const clearPrompt = useCallback(() => {
		setConfirmationPrompt(null);
		setIsSubmitPrompt(false);
	}, []);

	const fetchData = useCallback(async () => {
		const request = screeningService.getScreeningQuestionContext(screeningQuestionContextId);
		const response = await request.fetch();

		setScreeningQuestionContextResponse(response);
		window.scrollTo(0, 0);

		if (response.preQuestionScreeningConfirmationPrompt) {
			setConfirmationPrompt(response.preQuestionScreeningConfirmationPrompt);
		} else {
			clearPrompt();
		}
	}, [clearPrompt, screeningQuestionContextId]);

	const submitAnswers = useCallback(
		(submission: {
			answers: string[];
			answerText: Record<string, string>;
			supplementText: Record<string, string>;
			force?: boolean;
		}) => {
			if (!screeningQuestionContextId) {
				return;
			}

			const selections: ScreeningAnswerSelection[] = [
				...submission.answers.map((screeningAnswerOptionId) => {
					const answer: ScreeningAnswerSelection = {
						screeningAnswerOptionId,
					};

					const answerText = submission.supplementText[screeningAnswerOptionId];

					if (answerText) {
						answer.text = answerText;
					}

					return answer;
				}),
				// answers to text questions
				...Object.entries(submission.answerText)
					.filter(([_, text]) => !!text)
					.map(([screeningAnswerOptionId, text]) => ({
						screeningAnswerOptionId,
						text,
					})),
			];
			const submit = screeningService.answerQuestion(screeningQuestionContextId, selections, submission.force);

			setIsSubmitting(true);
			submit
				.fetch()
				.then((r) => {
					const goToNext = () => {
						if (r.nextScreeningQuestionContextId) {
							navigateToQuestion(r.nextScreeningQuestionContextId);
						} else if (r.screeningSessionDestination) {
							navigateToDestination(r.screeningSessionDestination);
						}
					};

					if (
						institution?.integratedCareEnabled &&
						!screeningQuestionContextResponse?.screeningSession.crisisIndicated &&
						r.screeningSession.crisisIndicated
					) {
						setNavigateNext(() => goToNext);
						setShowCrisisModal(true);
					} else {
						goToNext();
					}
				})
				.catch((e) => {
					if (e?.apiError?.metadata?.screeningConfirmationPrompt) {
						const newConfirmationPrompt: ScreeningConfirmationPrompt =
							e?.apiError?.metadata?.screeningConfirmationPrompt;
						setIsSubmitPrompt(true);
						setConfirmationPrompt(newConfirmationPrompt);
					} else {
						handleError(e);
					}
				})
				.finally(() => {
					setIsSubmitting(false);
				});
		},
		[
			handleError,
			institution?.integratedCareEnabled,
			navigateToDestination,
			navigateToQuestion,
			screeningQuestionContextId,
			screeningQuestionContextResponse?.screeningSession.crisisIndicated,
		]
	);

	useEffect(() => {
		if (location.pathname) {
			clearPrompt();
		}
	}, [clearPrompt, location.pathname]);

	useEffect(() => {
		if (
			!screeningQuestionContextResponse?.screeningAnswers ||
			!screeningQuestionContextResponse?.screeningAnswerOptions
		) {
			return;
		}

		setSelectedAnswers(
			screeningQuestionContextResponse.screeningAnswers.map((answer) => answer.screeningAnswerOptionId)
		);
		const { texts, supplements } = screeningQuestionContextResponse.screeningAnswerOptions.reduce(
			(acc, option) => {
				const answer = screeningQuestionContextResponse.screeningAnswers.find(
					(o) => o.screeningAnswerOptionId === option.screeningAnswerOptionId
				);

				if (option.freeformSupplement) {
					acc.supplements[option.screeningAnswerOptionId] = answer?.text ?? '';
				} else {
					acc.texts[option.screeningAnswerOptionId] = answer?.text ?? '';
				}

				return acc;
			},
			{
				texts: {} as Record<string, string>,
				supplements: {} as Record<string, string>,
			}
		);
		setAnswerText(texts);
		setSupplementText(supplements);
	}, [screeningQuestionContextResponse?.screeningAnswerOptions, screeningQuestionContextResponse?.screeningAnswers]);

	const renderedAnswerOptions = useMemo(() => {
		switch (screeningQuestionContextResponse?.screeningQuestion.screeningAnswerFormatId) {
			case ScreeningAnswerFormatId.SINGLE_SELECT:
				return (
					<ToggleButtonGroup
						bsPrefix="cobalt-screening-button-group"
						className="d-flex flex-column"
						type="radio"
						name="screeningAnswerOptionId"
						value={selectedAnswers[0] ?? ''}
					>
						{screeningQuestionContextResponse.screeningAnswerOptions.map((option) => {
							const optionId = option.screeningAnswerOptionId;
							const isChecked = !!selectedAnswers.includes(optionId);

							return (
								<React.Fragment key={optionId}>
									<ToggleButton
										id={optionId}
										key={optionId}
										type="radio"
										name="screeningAnswerOptionId"
										value={optionId}
										className="mb-2"
										variant={isChecked ? 'primary' : 'light'}
										disabled={isSubmitting}
										checked={isChecked}
										onClick={() => {
											if (isSubmitting) {
												return;
											}

											const selection = [optionId];
											setSelectedAnswers(selection);

											if (!option.freeformSupplement) {
												submitAnswers({
													answers: selection,
													answerText,
													supplementText,
												});
											}
										}}
									>
										{option.answerOptionText}
									</ToggleButton>

									{option.freeformSupplement && isChecked && (
										<InputHelper
											id={'' + Math.random()}
											as="textarea"
											className="mb-4"
											value={supplementText[optionId] ?? ''}
											label={option.freeformSupplementText ?? ''}
											disabled={isSubmitting}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												if (isSubmitting) {
													return;
												}

												setSupplementText((curr) => {
													return {
														...curr,
														[optionId]: e.target.value,
													};
												});
											}}
										/>
									)}
								</React.Fragment>
							);
						})}
					</ToggleButtonGroup>
				);

			case ScreeningAnswerFormatId.MULTI_SELECT:
				return (
					<ToggleButtonGroup
						bsPrefix="cobalt-screening-button-group"
						className="d-flex flex-column"
						type="checkbox"
						name="screeningAnswerOptionId"
						value={selectedAnswers}
					>
						{screeningQuestionContextResponse.screeningAnswerOptions.map((option) => {
							const optionId = option.screeningAnswerOptionId;
							const isChecked = !!selectedAnswers.includes(optionId);

							return (
								<React.Fragment key={optionId}>
									<ToggleButton
										id={optionId}
										type="checkbox"
										name="screeningAnswerOptionId"
										key={optionId}
										value={optionId}
										className="d-flex align-items-center mb-2"
										variant={isChecked ? 'primary' : 'light'}
										disabled={isSubmitting}
										onClick={() => {
											if (isSubmitting) {
												return;
											}

											setSelectedAnswers((curr) => {
												if (isChecked) {
													return curr.filter((v) => v !== optionId);
												}
												return [...curr, optionId];
											});
										}}
									>
										<div className="checkmark-wrapper d-flex align-items-center justify-content-center me-2">
											{isChecked && <CheckMarkIcon />}
										</div>
										{option.answerOptionText}
									</ToggleButton>

									{option.freeformSupplement && isChecked && (
										<InputHelper
											as="textarea"
											className="mb-4"
											value={supplementText[option.screeningAnswerOptionId] ?? ''}
											label={option.freeformSupplementText ?? ''}
											autoFocus
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												setSupplementText((curr) => {
													return {
														...curr,
														[option.screeningAnswerOptionId]: e.target.value,
													};
												});
											}}
										/>
									)}
								</React.Fragment>
							);
						})}
					</ToggleButtonGroup>
				);

			case ScreeningAnswerFormatId.FREEFORM_TEXT:
				if (
					screeningQuestionContextResponse.screeningAnswerOptions.some((option) => option.freeformSupplement)
				) {
					throw new Error('Unable to handle Supplements with Text questions');
				}

				return screeningQuestionContextResponse.screeningAnswerOptions.map((option) => (
					<InputHelper
						autoFocus
						key={option.screeningAnswerOptionId}
						disabled={isSubmitting}
						className="mb-2"
						label={option.answerOptionText ?? ''}
						type={
							screeningQuestionContextResponse.screeningQuestion.screeningAnswerContentHintId ===
							ScreeningAnswerContentHintId.EMAIL_ADDRESS
								? 'email'
								: 'text'
						}
						name={option.screeningAnswerOptionId}
						value={answerText[option.screeningAnswerOptionId] ?? ''}
						onChange={(e) => {
							if (isSubmitting) {
								return;
							}

							setAnswerText((current) => {
								return {
									...current,
									[option.screeningAnswerOptionId]: e.target.value,
								};
							});
						}}
					/>
				));

			default:
				return;
		}
	}, [
		answerText,
		isSubmitting,
		screeningQuestionContextResponse?.screeningAnswerOptions,
		screeningQuestionContextResponse?.screeningQuestion.screeningAnswerContentHintId,
		screeningQuestionContextResponse?.screeningQuestion.screeningAnswerFormatId,
		selectedAnswers,
		submitAnswers,
		supplementText,
	]);

	const hideNextBtn = useMemo(() => {
		const isSingleSelect =
			screeningQuestionContextResponse?.screeningQuestion.screeningAnswerFormatId ===
			ScreeningAnswerFormatId.SINGLE_SELECT;
		const previouslyAnswered = screeningQuestionContextResponse?.previouslyAnswered;
		const previouslySkipped = previouslyAnswered && screeningQuestionContextResponse?.screeningAnswers.length === 0;
		const selectedAnswersHaveSupplements = selectedAnswers.some((optionId) => {
			const option = screeningQuestionContextResponse?.screeningAnswerOptions.find(
				(o) => o.screeningAnswerOptionId === optionId
			);

			return option?.freeformSupplement;
		});

		return isSingleSelect && (!previouslyAnswered || previouslySkipped) && !selectedAnswersHaveSupplements;
	}, [
		screeningQuestionContextResponse?.previouslyAnswered,
		screeningQuestionContextResponse?.screeningAnswerOptions,
		screeningQuestionContextResponse?.screeningAnswers.length,
		screeningQuestionContextResponse?.screeningQuestion.screeningAnswerFormatId,
		selectedAnswers,
	]);

	const showSkipBtn = useMemo(() => {
		return screeningQuestionContextResponse?.screeningQuestion.minimumAnswerCount === 0;
	}, [screeningQuestionContextResponse?.screeningQuestion.minimumAnswerCount]);

	const disableNextBtn = useMemo(() => {
		if (!screeningQuestionContextResponse) {
			return isSubmitting;
		} else if (
			screeningQuestionContextResponse.screeningQuestion.screeningAnswerFormatId ===
			ScreeningAnswerFormatId.FREEFORM_TEXT
		) {
			return (
				isSubmitting ||
				// the user has filled inputs for all available options
				Object.values(answerText).filter(Boolean).length !==
					screeningQuestionContextResponse.screeningAnswerOptions.length
			);
		} else if (typeof screeningQuestionContextResponse.screeningQuestion.minimumAnswerCount !== 'number') {
			return (
				isSubmitting ||
				(!confirmationPrompt &&
					selectedAnswers.length > screeningQuestionContextResponse.screeningQuestion.maximumAnswerCount)
			);
		}

		const answerCountMismatch =
			selectedAnswers.length < screeningQuestionContextResponse.screeningQuestion.minimumAnswerCount ||
			selectedAnswers.length > screeningQuestionContextResponse.screeningQuestion.maximumAnswerCount;

		return isSubmitting || (!confirmationPrompt && answerCountMismatch);
	}, [answerText, confirmationPrompt, isSubmitting, screeningQuestionContextResponse, selectedAnswers.length]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Screening</title>
			</Helmet>

			<AsyncPage fetchData={fetchData}>
				{institution?.integratedCareEnabled && (
					<IcScreeningCrisisModal
						show={showCrisisModal}
						onHide={() => {
							setShowCrisisModal(false);
							navigateNext?.();
							setNavigateNext(undefined);
						}}
					/>
				)}

				<Container className="py-8">
					{screeningQuestionContextResponse?.screeningFlowVersion.screeningFlowId ===
						institution.integratedCareScreeningFlowId &&
						institution.userExperienceTypeId === UserExperienceTypeId.STAFF && (
							<Row className="mb-8">
								<Col
									md={{ span: 10, offset: 1 }}
									lg={{ span: 8, offset: 2 }}
									xl={{ span: 6, offset: 3 }}
								>
									<h1 className="mb-8">{screeningQuestionContextResponse?.screening.name}</h1>
									<hr />
								</Col>
							</Row>
						)}

					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							{confirmationPrompt ? (
								<>
									{confirmationPrompt.screeningImageId && (
										<ScreeningPromptImage
											screeningImageId={confirmationPrompt.screeningImageId}
											className="mt-6 mx-auto d-block"
										/>
									)}

									<div
										className="my-6 wysiwyg-display"
										dangerouslySetInnerHTML={{
											__html: confirmationPrompt.text,
										}}
									/>

									<div className="d-flex">
										{(isSubmitPrompt ||
											screeningQuestionContextResponse?.previousScreeningQuestionContextId) && (
											<Button
												disabled={isSubmitting}
												className="me-2"
												type="button"
												onClick={() => {
													if (isSubmitPrompt) {
														clearPrompt();
													} else if (
														screeningQuestionContextResponse?.previousScreeningQuestionContextId
													) {
														navigateToQuestion(
															screeningQuestionContextResponse.previousScreeningQuestionContextId
														);
													}
												}}
											>
												Previous
											</Button>
										)}

										<Button
											disabled={disableNextBtn}
											className="ms-auto"
											onClick={async () => {
												if (isSubmitPrompt) {
													submitAnswers({
														answers: selectedAnswers,
														answerText,
														supplementText,
														force: true,
													});
												} else {
													clearPrompt();
												}
											}}
										>
											{confirmationPrompt.actionText}
										</Button>
									</div>
								</>
							) : (
								<>
									{!!screeningQuestionContextResponse?.screeningQuestion.introText && (
										<div
											className="mb-3"
											dangerouslySetInnerHTML={{
												__html: screeningQuestionContextResponse.screeningQuestion.introText,
											}}
										/>
									)}

									<h3 className="mb-5">
										<div
											className="wysiwyg-display"
											dangerouslySetInnerHTML={{
												__html: screeningQuestionContextResponse?.screeningQuestion
													.questionText!,
											}}
										/>
									</h3>

									<Form
										onSubmit={(e) => {
											e.preventDefault();
											submitAnswers({
												answers: selectedAnswers,
												answerText,
												supplementText,
											});
										}}
									>
										{renderedAnswerOptions}

										{screeningQuestionContextResponse?.screeningQuestion.footerText && (
											<div
												className="mt-3 mb-5 wysiwyg-display"
												dangerouslySetInnerHTML={{
													__html: screeningQuestionContextResponse?.screeningQuestion
														.footerText,
												}}
											/>
										)}

										<div className="d-flex">
											{screeningQuestionContextResponse?.previousScreeningQuestionContextId && (
												<Button
													disabled={isSubmitting}
													type="button"
													onClick={() => {
														navigateToQuestion(
															screeningQuestionContextResponse.previousScreeningQuestionContextId
														);
													}}
												>
													Previous
												</Button>
											)}

											<div className="ms-auto">
												{showSkipBtn && (
													<Button
														variant="outline-primary"
														disabled={isSubmitting}
														className={classNames({
															'me-2': !hideNextBtn,
														})}
														type="button"
														onClick={() => {
															submitAnswers({
																answers: [],
																answerText: {},
																supplementText: {},
															});
														}}
													>
														Skip Question
													</Button>
												)}

												{!hideNextBtn && (
													<Button disabled={disableNextBtn} type="submit">
														Next
													</Button>
												)}
											</div>
										</div>

										{screeningQuestionContextResponse?.screeningFlowVersion.skippable && (
											<div className="d-flex">
												<Button
													variant="link"
													className="mx-auto"
													type="button"
													disabled={isSubmitting}
													onClick={() => {
														if (isSubmitting || !screeningQuestionContextId) {
															return;
														}

														if (
															!window.confirm(
																'Are you sure you want to skip this assessment?'
															)
														) {
															return;
														}

														screeningService
															.skipScreeningQuestionContext(screeningQuestionContextId)
															.fetch()
															.then((response) => {
																navigateToDestination(
																	response.screeningSession
																		.screeningSessionDestination,
																	{ skipped: true }
																);
															})
															.catch((e) => {
																handleError(e);
															});
													}}
												>
													{screeningQuestionContextResponse?.screeningFlowVersion
														.screeningFlowSkipTypeId === ScreeningFlowSkipTypeId.EXIT
														? 'Exit Assessment'
														: 'Skip Assessment'}
												</Button>
											</div>
										)}
									</Form>
								</>
							)}
						</Col>
					</Row>
				</Container>
				{(screeningQuestionContextResponse?.screeningFlowVersion.screeningFlowId ===
					institution.integratedCareIntakeScreeningFlowId ||
					screeningQuestionContextResponse?.screeningFlowVersion.screeningFlowId ===
						institution.integratedCareScreeningFlowId) &&
					institution.userExperienceTypeId === UserExperienceTypeId.PATIENT && (
						<>
							<Container className="py-8">
								<Row>
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
									>
										<div className="text-center">
											<Button
												variant="link"
												className="d-inline-flex align-items-center text-decoration-none"
												onClick={() => {
													setShowHelpModal(true);
												}}
											>
												<QuestionMarkIcon className="me-2" />
												Need help with the assessment?
											</Button>
										</div>
									</Col>
								</Row>
							</Container>
							<Modal
								show={showHelpModal}
								centered
								onHide={() => {
									setShowHelpModal(false);
								}}
							>
								<Modal.Body className="pt-8">
									<AppointmentIllustration className="mb-8 w-100 h-auto" />
									<h3 className="mb-6">Need help with the assessment?</h3>
									<p>
										Call the {institution.integratedCareProgramName} resource center at{' '}
										{institution.integratedCarePhoneNumberDescription}. Mental Health Intake
										Coordinators are available {institution.integratedCareAvailabilityDescription}{' '}
										to answer questions and help connect you to care.
									</p>
								</Modal.Body>
								<Modal.Footer className="pb-6 bg-transparent border-0 text-right">
									<Button
										onClick={() => {
											setShowHelpModal(false);
										}}
									>
										OK
									</Button>
								</Modal.Footer>
							</Modal>
						</>
					)}
			</AsyncPage>
		</>
	);
};

export default ScreeningQuestionsPage;
