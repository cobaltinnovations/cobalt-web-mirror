import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import {
	ScreeningAnswerSelection,
	ScreeningAnswersMessage,
	ScreeningAnswersQuestionResult,
	ScreeningConfirmationPrompt,
	ScreeningQuestionContextResponse,
	ScreeningSessionDestination,
} from '@/lib/models';
import { CobaltError } from '@/lib/http-client';
import { screeningService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { ScreeningAnswer, ScreeningQuestionPrompt } from '@/components/screening-v2';
import InlineAlert from '@/components/inline-alert';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as LeftChevron } from '@/assets/icons/icon-chevron-left.svg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';

const QUESTION_TRANSITION_DURATION_MS = 600;

const useStyles = createUseThemedStyles({
	'@global': {
		'.right-to-left-enter, .right-to-left-enter-active, .right-to-left-exit, .right-to-left-exit-active, .left-to-right-enter, .left-to-right-enter-active, .left-to-right-exit, .left-to-right-exit-active':
			{
				top: 0,
				left: 0,
				right: 0,
				position: 'absolute',
			},
		'.right-to-left-enter': {
			opacity: 0,
			transform: 'translateX(100%)',
		},
		'.right-to-left-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: `all ${QUESTION_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.right-to-left-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.right-to-left-exit-active': {
			opacity: 0,
			transform: 'translateX(-100%)',
			transition: `all ${QUESTION_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.left-to-right-enter ': {
			opacity: 0,
			transform: 'translateX(-100%)',
		},
		'.left-to-right-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: `all ${QUESTION_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.left-to-right-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.left-to-right-exit-active': {
			opacity: 0,
			transform: 'translateX(100%)',
			transition: `all ${QUESTION_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
	},
	questionOuter: {
		position: 'relative',
	},
	question: {
		display: 'block',
	},
});

interface ScreeningQuestionContextProps {
	initialScreeningQuestionContextId: string;
	onScreeningFlowComplete(screeningSessionDestination?: ScreeningSessionDestination): void;
}

export const ScreeningQuestionContext = ({
	initialScreeningQuestionContextId,
	onScreeningFlowComplete,
}: ScreeningQuestionContextProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [screeningQuestionContextId, setScreeningQuestionContextId] = useState(initialScreeningQuestionContextId);
	const [screeningQuestionContext, setScreeningQuestionContext] = useState<ScreeningQuestionContextResponse>();
	const [confirmationPrompt, setConfirmationPrompt] = useState<{
		screeningConfirmationPrompt: ScreeningConfirmationPrompt | undefined;
		isSubmitConfirmationPrompt: boolean;
	}>({
		screeningConfirmationPrompt: undefined,
		isSubmitConfirmationPrompt: false,
	});
	const [selectedAnswers, setSelectedAnswers] = useState<ScreeningAnswerSelection[]>([]);
	const [isNext, setIsNext] = useState(true);
	const [answerConfig, setAnswerConfig] = useState<{
		messages: ScreeningAnswersMessage[];
		nextScreeningQuestionContextId: string;
		questionResultsByScreeningQuestionId: Record<string, ScreeningAnswersQuestionResult>;
	}>();

	const fetchData = useCallback(async () => {
		setIsLoading(true);

		try {
			const response = await screeningService.getScreeningQuestionContext(screeningQuestionContextId).fetch();

			setScreeningQuestionContext(response);
			setConfirmationPrompt({
				screeningConfirmationPrompt: response.previouslyAnswered
					? undefined
					: response.preQuestionScreeningConfirmationPrompt,
				isSubmitConfirmationPrompt: false,
			});
			setSelectedAnswers(
				response.screeningAnswers.map((answer) => ({
					screeningAnswerOptionId: answer.screeningAnswerOptionId,
					...(answer.text && { text: answer.text }),
				}))
			);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [handleError, screeningQuestionContextId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleQuestionPreviousButtonClick = useCallback(() => {
		if (!screeningQuestionContext) {
			return;
		}

		const { preQuestionScreeningConfirmationPrompt, previousScreeningQuestionContextId } = screeningQuestionContext;
		setIsNext(false);

		if (preQuestionScreeningConfirmationPrompt) {
			setConfirmationPrompt({
				screeningConfirmationPrompt: preQuestionScreeningConfirmationPrompt,
				isSubmitConfirmationPrompt: false,
			});
			return;
		}

		if (!previousScreeningQuestionContextId) {
			return;
		}

		setScreeningQuestionContextId(previousScreeningQuestionContextId);
	}, [screeningQuestionContext]);

	const handlePromptPreviousButtonClick = useCallback(() => {
		setIsNext(false);

		if (confirmationPrompt.isSubmitConfirmationPrompt) {
			setConfirmationPrompt({
				screeningConfirmationPrompt: undefined,
				isSubmitConfirmationPrompt: false,
			});
		} else {
			if (!screeningQuestionContext?.previousScreeningQuestionContextId) {
				return;
			}

			setScreeningQuestionContextId(screeningQuestionContext.previousScreeningQuestionContextId);
		}
	}, [confirmationPrompt.isSubmitConfirmationPrompt, screeningQuestionContext?.previousScreeningQuestionContextId]);

	const handleQuestionFormSubmit = useCallback(
		async (event?: React.FormEvent<HTMLFormElement>, force?: boolean) => {
			event?.preventDefault();
			setIsLoading(true);

			try {
				const {
					messages,
					nextScreeningQuestionContextId,
					questionResultsByScreeningQuestionId,
					screeningSessionDestination,
				} = await screeningService.answerQuestion(screeningQuestionContextId, selectedAnswers, force).fetch();

				if ((messages ?? []).length > 0 || questionResultsByScreeningQuestionId) {
					setAnswerConfig({
						messages: messages ?? [],
						questionResultsByScreeningQuestionId: questionResultsByScreeningQuestionId ?? {},
						nextScreeningQuestionContextId: nextScreeningQuestionContextId ?? '',
					});
					return;
				}

				if (nextScreeningQuestionContextId) {
					setScreeningQuestionContextId(nextScreeningQuestionContextId);
				} else {
					onScreeningFlowComplete(screeningSessionDestination);
				}
			} catch (error) {
				if (error instanceof CobaltError) {
					const confirmationPrompt = error.apiError?.metadata?.screeningConfirmationPrompt as
						| ScreeningConfirmationPrompt
						| undefined;

					if (!confirmationPrompt) {
						handleError(error);
						return;
					}

					setConfirmationPrompt({
						screeningConfirmationPrompt: confirmationPrompt,
						isSubmitConfirmationPrompt: true,
					});
					return;
				}

				handleError(error);
			} finally {
				setIsNext(true);
				setIsLoading(false);
			}
		},
		[handleError, onScreeningFlowComplete, screeningQuestionContextId, selectedAnswers]
	);

	const handlePromptSubmit = useCallback(() => {
		setIsNext(true);
		if (confirmationPrompt.isSubmitConfirmationPrompt) {
			handleQuestionFormSubmit(undefined, true);
		} else {
			setConfirmationPrompt({
				screeningConfirmationPrompt: undefined,
				isSubmitConfirmationPrompt: false,
			});
		}
	}, [confirmationPrompt.isSubmitConfirmationPrompt, handleQuestionFormSubmit]);

	if (!screeningQuestionContext) {
		return null;
	}

	return (
		<div className={classes.questionOuter}>
			<TransitionGroup
				component={null}
				childFactory={(child) =>
					React.cloneElement(child, {
						classNames: isNext ? 'right-to-left' : 'left-to-right',
						timeout: QUESTION_TRANSITION_DURATION_MS,
					})
				}
			>
				<CSSTransition
					key={`${screeningQuestionContext.screeningQuestion.screeningQuestionId}-${
						confirmationPrompt.screeningConfirmationPrompt?.screeningConfirmationPromptId ?? 'no-prompt'
					}`}
					timeout={QUESTION_TRANSITION_DURATION_MS}
				>
					<div className={classes.question}>
						{confirmationPrompt.screeningConfirmationPrompt ? (
							<ScreeningQuestionPrompt
								showPreviousButton={
									!!screeningQuestionContext.previousScreeningQuestionContextId ||
									confirmationPrompt.isSubmitConfirmationPrompt
								}
								screeningConfirmationPrompt={confirmationPrompt.screeningConfirmationPrompt}
								onPreviousButtonClick={handlePromptPreviousButtonClick}
								onSubmitButtonClick={handlePromptSubmit}
							/>
						) : (
							<Form onSubmit={handleQuestionFormSubmit}>
								<fieldset disabled={isLoading}>
									{screeningQuestionContext.screeningQuestion.introText && (
										<p className="mb-2">{screeningQuestionContext.screeningQuestion.introText}</p>
									)}

									<h2 className="mb-6">{screeningQuestionContext.screeningQuestion.questionText}</h2>

									<ScreeningAnswer
										className="mb-6"
										question={screeningQuestionContext.screeningQuestion}
										answerOptions={screeningQuestionContext.screeningAnswerOptions}
										value={selectedAnswers}
										onChange={setSelectedAnswers}
									/>

									{screeningQuestionContext.screeningQuestion.footerText && (
										<p className="mb-6">{screeningQuestionContext.screeningQuestion.footerText}</p>
									)}

									{answerConfig?.messages.map((message) => (
										<InlineAlert
											variant={message.displayTypeId.toLocaleLowerCase() as 'primary'}
											title={'TODO: Message Title'}
											description={message.message}
										/>
									))}

									<div className="d-flex align-items-center justify-content-between">
										<div>
											{(screeningQuestionContext.previousScreeningQuestionContextId ||
												screeningQuestionContext.preQuestionScreeningConfirmationPrompt) && (
												<Button
													type="button"
													variant="link"
													className="d-flex align-items-center text-decoration-none ps-3"
													onClick={handleQuestionPreviousButtonClick}
												>
													<LeftChevron className="me-2" />
													Back
												</Button>
											)}
										</div>
										<div>
											{screeningQuestionContext.screeningQuestion.minimumAnswerCount === 0 && (
												<Button
													type="button"
													variant="outline-primary"
													className="d-flex align-items-center text-decoration-none pe-3"
													onClick={() => {
														setIsNext(true);
														setSelectedAnswers([]);
														window.alert('[TODO]: Skip');
													}}
												>
													Skip
													<RightChevron className="ms-1" />
												</Button>
											)}
											<Button
												type="submit"
												variant="primary"
												className="d-flex align-items-center text-decoration-none pe-3"
												disabled={
													selectedAnswers.length <
													screeningQuestionContext.screeningQuestion.minimumAnswerCount
												}
											>
												Next
												<RightChevron className="ms-1" />
											</Button>
										</div>
									</div>
								</fieldset>
							</Form>
						)}
					</div>
				</CSSTransition>
			</TransitionGroup>
		</div>
	);
};
