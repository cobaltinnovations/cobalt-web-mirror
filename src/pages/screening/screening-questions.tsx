import AsyncPage from '@/components/async-page';
import InputHelper from '@/components/input-helper';
import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import { ScreeningAnswerFormatId, ScreeningAnswerSelection } from '@/lib/models';
import { screeningService } from '@/lib/services';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useOrchestratedRequest, useScreeningNavigation } from './screening.hooks';
import { ReactComponent as CheckMarkIcon } from '@/assets/icons/check.svg';

const ScreeningQuestionsPage = () => {
	const handleError = useHandleError();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { navigateToQuestion, navigateToDestination } = useScreeningNavigation();
	const { screeningQuestionContextId } = useParams<{ screeningQuestionContextId: string }>();

	const [requestInitializer, setRequestInitializer] = useState<string>();
	const {
		response: screeningQuestionContextResponse,
		initialFetch,
		refetch,
	} = useOrchestratedRequest(screeningService.getScreeningQuestionContext(screeningQuestionContextId), {
		initialize: requestInitializer || false,
	});

	const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
	const [answerText, setAnswerText] = useState({} as Record<string, string>);

	const submitAnswers = useCallback(
		(answers: string[]) => {
			if (!screeningQuestionContextId) {
				return;
			}

			const selections: ScreeningAnswerSelection[] = [
				...answers.map((screeningAnswerOptionId) => ({ screeningAnswerOptionId })),
				...Object.entries(answerText)
					.filter(([_, text]) => !!text)
					.map(([screeningAnswerOptionId, text]) => ({
						screeningAnswerOptionId,
						text,
					})),
			];
			const submit = screeningService.answerQuestion(screeningQuestionContextId, selections);

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
					if ((e as any).code !== ERROR_CODES.REQUEST_ABORTED) {
						handleError(e);
					}
				})
				.finally(() => {
					setIsSubmitting(false);
				});
		},
		[answerText, handleError, navigateToDestination, navigateToQuestion, screeningQuestionContextId]
	);

	useEffect(() => {
		refetch(screeningService.getScreeningQuestionContext(screeningQuestionContextId));
		setRequestInitializer(screeningQuestionContextId);
	}, [refetch, screeningQuestionContextId]);

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
		setAnswerText(
			screeningQuestionContextResponse.screeningAnswerOptions.reduce((texts, option) => {
				texts[option.screeningAnswerOptionId] =
					screeningQuestionContextResponse.screeningAnswers.find(
						(o) => o.screeningAnswerOptionId === option.screeningAnswerOptionId
					)?.text ?? '';
				return texts;
			}, {} as Record<string, string>)
		);
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
						onChange={(newId) => {
							const selection = [newId];
							setSelectedAnswers(selection);
							submitAnswers(selection);
						}}
					>
						{screeningQuestionContextResponse.screeningAnswerOptions.map((option) => {
							const isChecked = !!selectedAnswers.includes(option.screeningAnswerOptionId);

							return (
								<ToggleButton
									id={option.screeningAnswerOptionId}
									key={option.screeningAnswerOptionId}
									value={option.screeningAnswerOptionId}
									className="mb-2"
									variant={isChecked ? 'primary' : 'light'}
									disabled={isSubmitting}
								>
									{option.answerOptionText}
								</ToggleButton>
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
						onChange={(newIds) => {
							setSelectedAnswers(newIds);
						}}
					>
						{screeningQuestionContextResponse.screeningAnswerOptions.map((option) => {
							const isChecked = !!selectedAnswers.includes(option.screeningAnswerOptionId);

							return (
								<ToggleButton
									id={option.screeningAnswerOptionId}
									name={option.screeningAnswerOptionId}
									key={option.screeningAnswerOptionId}
									value={option.screeningAnswerOptionId}
									className="d-flex align-items-center mb-2"
									variant={isChecked ? 'primary' : 'light'}
									disabled={isSubmitting}
								>
									<div className="checkmark-wrapper d-flex align-items-center justify-content-center me-2">
										{isChecked && <CheckMarkIcon />}
									</div>
									{option.answerOptionText}
								</ToggleButton>
							);
						})}
					</ToggleButtonGroup>
				);

			case ScreeningAnswerFormatId.FREEFORM_TEXT:
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
	]);

	const hideNextBtn = useMemo(() => {
		const isSingleSelect =
			screeningQuestionContextResponse?.screeningQuestion.screeningAnswerFormatId ===
			ScreeningAnswerFormatId.SINGLE_SELECT;
		const previouslyAnswered = (screeningQuestionContextResponse?.screeningAnswers.length ?? 0) > 0;

		return isSingleSelect && !previouslyAnswered;
	}, [
		screeningQuestionContextResponse?.screeningAnswers.length,
		screeningQuestionContextResponse?.screeningQuestion.screeningAnswerFormatId,
	]);

	const disableNextBtn = useMemo(() => {
		if (!screeningQuestionContextResponse) {
			return isSubmitting;
		} else if (typeof screeningQuestionContextResponse.screeningQuestion.minimumAnswerCount !== 'number') {
			return (
				isSubmitting ||
				selectedAnswers.length > screeningQuestionContextResponse.screeningQuestion.maximumAnswerCount
			);
		}

		return (
			isSubmitting ||
			selectedAnswers.length < screeningQuestionContextResponse.screeningQuestion.minimumAnswerCount ||
			selectedAnswers.length > screeningQuestionContextResponse.screeningQuestion.maximumAnswerCount
		);
	}, [isSubmitting, screeningQuestionContextResponse, selectedAnswers.length]);

	return (
		<AsyncPage fetchData={initialFetch}>
			<Container className="py-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{!!screeningQuestionContextResponse?.screeningQuestion.introText && (
							<p className="mb-3">{screeningQuestionContextResponse.screeningQuestion.introText}</p>
						)}

						<h3 className="mb-5">
							<div
								dangerouslySetInnerHTML={{
									__html: screeningQuestionContextResponse?.screeningQuestion.questionText!,
								}}
							/>
						</h3>

						<Form
							onSubmit={(e) => {
								e.preventDefault();
								submitAnswers(selectedAnswers);
							}}
						>
							{renderedAnswerOptions}

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

								{!hideNextBtn && (
									<Button disabled={disableNextBtn} className="ms-auto" type="submit">
										Next
									</Button>
								)}
							</div>

							<div className="d-flex">
								<Button
									variant="link"
									className="mx-auto"
									type="button"
									onClick={() => {
										if (!screeningQuestionContextId) {
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
									skip assessment
								</Button>
							</div>
						</Form>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default ScreeningQuestionsPage;
