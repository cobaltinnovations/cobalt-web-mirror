import AsyncPage from '@/components/async-page';
import InputHelper from '@/components/input-helper';
import ScreeningPromptImage from '@/components/screening-prompt-image';
import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import {
	ScreeningAnswerFormatId,
	ScreeningAnswerSelection,
	ScreeningQuestionContextResponse,
	ScreeningQuestionPrompt,
} from '@/lib/models';
import { screeningService } from '@/lib/services';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useScreeningNavigation } from './screening.hooks';
import { ReactComponent as CheckMarkIcon } from '@/assets/icons/check.svg';
import classNames from 'classnames';

const ScreeningQuestionsPage = () => {
	const handleError = useHandleError();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [screeningQuestionContextResponse, setScreeningQuestionContextResponse] =
		useState<ScreeningQuestionContextResponse>();

	const { navigateToQuestion, navigateToDestination } = useScreeningNavigation();
	const { screeningQuestionContextId } = useParams<{ screeningQuestionContextId: string }>();

	const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
	const [answerText, setAnswerText] = useState({} as Record<string, string>);
	const [supplementText, setSupplementText] = useState({} as Record<string, string>);

	const [questionPrompt, setQuestionPrompt] = useState<ScreeningQuestionPrompt | null>(null);
	const [isSubmitPrompt, setIsSubmitPrompt] = useState(false);

	const clearPrompt = useCallback(() => {
		setQuestionPrompt(null);
		setIsSubmitPrompt(false);
	}, []);

	const fetchData = useCallback(async () => {
		const request = screeningService.getScreeningQuestionContext(screeningQuestionContextId);
		const response = await request.fetch();

		setScreeningQuestionContextResponse(response);

		if (response.preQuestionScreeningConfirmationPrompt) {
			setQuestionPrompt(response.preQuestionScreeningConfirmationPrompt);
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
					if (r.nextScreeningQuestionContextId) {
						navigateToQuestion(r.nextScreeningQuestionContextId);
					} else if (r.screeningSessionDestination) {
						navigateToDestination(r.screeningSessionDestination);
					}
				})
				.catch((e) => {
					if (e?.apiError?.metadata?.screeningConfirmationPrompt) {
						const newConfirmationPrompt: ScreeningQuestionPrompt =
							e?.apiError?.metadata?.screeningConfirmationPrompt;
						setIsSubmitPrompt(true);
						setQuestionPrompt(newConfirmationPrompt);
					} else if ((e as any).code !== ERROR_CODES.REQUEST_ABORTED) {
						handleError(e);
					}
				})
				.finally(() => {
					setIsSubmitting(false);
				});
		},
		[handleError, navigateToDestination, navigateToQuestion, screeningQuestionContextId]
	);

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
						key={option.screeningAnswerOptionId}
						disabled={isSubmitting}
						className="mb-2"
						label={option.answerOptionText ?? ''}
						type="text"
						name={option.screeningAnswerOptionId}
						value={answerText[option.screeningAnswerOptionId]}
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
		} else if (typeof screeningQuestionContextResponse.screeningQuestion.minimumAnswerCount !== 'number') {
			return (
				isSubmitting ||
				(!questionPrompt &&
					selectedAnswers.length > screeningQuestionContextResponse.screeningQuestion.maximumAnswerCount)
			);
		}

		const answerCountMismatch =
			selectedAnswers.length < screeningQuestionContextResponse.screeningQuestion.minimumAnswerCount ||
			selectedAnswers.length > screeningQuestionContextResponse.screeningQuestion.maximumAnswerCount;

		return isSubmitting || (!questionPrompt && answerCountMismatch);
	}, [isSubmitting, questionPrompt, screeningQuestionContextResponse, selectedAnswers.length]);

	return (
		<AsyncPage fetchData={fetchData}>
			<Container className="py-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{questionPrompt ? (
							<>
								{questionPrompt.screeningImageId && (
									<ScreeningPromptImage
										screeningImageId={questionPrompt.screeningImageId}
										className="mt-6 mx-auto d-block"
									/>
								)}

								<div
									className="my-6 wysiwyg-display"
									dangerouslySetInnerHTML={{
										__html: questionPrompt.text,
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
												if (
													!isSubmitPrompt &&
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
										{questionPrompt.actionText}
									</Button>
								</div>
							</>
						) : (
							<>
								{!!screeningQuestionContextResponse?.screeningQuestion.introText && (
									<p className="mb-3">
										{screeningQuestionContextResponse.screeningQuestion.introText}
									</p>
								)}

								<h3 className="mb-5">
									<div
										className="wysiwyg-display"
										dangerouslySetInnerHTML={{
											__html: screeningQuestionContextResponse?.screeningQuestion.questionText!,
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
												__html: screeningQuestionContextResponse?.screeningQuestion.footerText,
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
																response.screeningSession.screeningSessionDestination,
																{ skipped: true }
															);
														})
														.catch((e) => {
															if ((e as any).code !== ERROR_CODES.REQUEST_ABORTED) {
																handleError(e);
															}
														});
												}}
											>
												Skip Assessment
											</Button>
										</div>
									)}
								</Form>
							</>
						)}
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default ScreeningQuestionsPage;
