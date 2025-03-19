import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { ScreeningAnswerSelection, ScreeningConfirmationPrompt, ScreeningQuestionContextResponse } from '@/lib/models';
import { screeningService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { ScreeningAnswer, ScreeningQuestionPrompt } from '@/components/screening-v2';

interface ScreeningQuestionContextProps {
	initialScreeningQuestionContextId: string;
}

export const ScreeningQuestionContext = ({ initialScreeningQuestionContextId }: ScreeningQuestionContextProps) => {
	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [screeningQuestionContextId, setScreeningQuestionContextId] = useState(initialScreeningQuestionContextId);
	const [screeningQuestionContext, setScreeningQuestionContext] = useState<ScreeningQuestionContextResponse>();
	const [confirmationPrompt, setConfirmationPrompt] = useState<ScreeningConfirmationPrompt>();
	const [selectedAnswers, setSelectedAnswers] = useState<ScreeningAnswerSelection[]>([]);

	const fetchData = useCallback(async () => {
		setIsLoading(true);

		try {
			const response = await screeningService.getScreeningQuestionContext(screeningQuestionContextId).fetch();

			setScreeningQuestionContext(response);
			setConfirmationPrompt(response.preQuestionScreeningConfirmationPrompt);
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

	const handlePreviousButtonClick = useCallback(() => {
		if (!screeningQuestionContext?.previousScreeningQuestionContextId) {
			return;
		}

		setScreeningQuestionContextId(screeningQuestionContext.previousScreeningQuestionContextId);
	}, [screeningQuestionContext?.previousScreeningQuestionContextId]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			setIsLoading(true);

			try {
				const { nextScreeningQuestionContextId } = await screeningService
					.answerQuestion(screeningQuestionContextId, selectedAnswers)
					.fetch();

				if (nextScreeningQuestionContextId) {
					setScreeningQuestionContextId(nextScreeningQuestionContextId);
				} else {
					window.alert('Screening complete.');
				}
			} catch (error) {
				handleError(error);
			} finally {
				setIsLoading(false);
			}
		},
		[handleError, screeningQuestionContextId, selectedAnswers]
	);

	if (confirmationPrompt) {
		return (
			<ScreeningQuestionPrompt
				screeningConfirmationPrompt={confirmationPrompt}
				onDismiss={() => {
					setConfirmationPrompt(undefined);
				}}
			/>
		);
	}

	if (!screeningQuestionContext) {
		return null;
	}

	return (
		<Form onSubmit={handleFormSubmit}>
			<fieldset disabled={isLoading}>
				{screeningQuestionContext.screeningQuestion.introText && (
					<p>{screeningQuestionContext.screeningQuestion.introText}</p>
				)}

				<h2>{screeningQuestionContext.screeningQuestion.questionText}</h2>

				<ScreeningAnswer
					className="mb-4"
					question={screeningQuestionContext.screeningQuestion}
					answerOptions={screeningQuestionContext.screeningAnswerOptions}
					value={selectedAnswers}
					onChange={setSelectedAnswers}
				/>

				{screeningQuestionContext.screeningQuestion.footerText && (
					<p>{screeningQuestionContext.screeningQuestion.footerText}</p>
				)}

				<div className="d-flex align-items-center justify-content-between">
					<div>
						{screeningQuestionContext.previousScreeningQuestionContextId && (
							<Button type="button" onClick={handlePreviousButtonClick}>
								Prev
							</Button>
						)}
					</div>
					<div>
						{screeningQuestionContext.screeningQuestion.minimumAnswerCount === 0 && (
							<Button
								type="button"
								variant="outline-primary"
								onClick={() => {
									window.alert('[TODO]: Skip');
								}}
							>
								Skip
							</Button>
						)}
					</div>
					<Button
						type="submit"
						disabled={
							selectedAnswers.length < screeningQuestionContext.screeningQuestion.minimumAnswerCount
						}
					>
						Submit
					</Button>
				</div>
			</fieldset>
		</Form>
	);
};
