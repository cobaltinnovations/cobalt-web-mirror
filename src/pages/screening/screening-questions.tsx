import AsyncPage from '@/components/async-page';
import InputHelper from '@/components/input-helper';
import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import { ScreeningAnswerFormatId, ScreeningAnswerSelection } from '@/lib/models';
import { screeningService } from '@/lib/services';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Container, Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useOrchestratedRequest, useScreeningNavigation } from './screening.hooks';

const ScreeningQuestionsPage = () => {
	const handleError = useHandleError();

	const { navigateToQuestion, navigateToDestination } = useScreeningNavigation();
	const { screeningQuestionContextId } = useParams<{ screeningQuestionContextId: string }>();

	const [requestInitializer, setRequestInitializer] = useState<string>();
	const { response, initialFetch, refetch } = useOrchestratedRequest(
		screeningService.getScreeningQuestionContext(screeningQuestionContextId),
		{
			initialize: requestInitializer || false,
		}
	);

	const [selectedAnswers, setSelectedAnswers] = useState<ScreeningAnswerSelection[]>([]);

	const submitAnswers = useCallback(() => {
		const submit = screeningService.answerQuestion(screeningQuestionContextId, selectedAnswers);

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
			});
	}, [handleError, navigateToDestination, navigateToQuestion, screeningQuestionContextId, selectedAnswers]);

	useEffect(() => {
		refetch(screeningService.getScreeningQuestionContext(screeningQuestionContextId));
		setRequestInitializer(screeningQuestionContextId);
	}, [refetch, screeningQuestionContextId]);

	useEffect(() => {
		if (!response?.screeningAnswers) {
			return;
		}

		setSelectedAnswers(response.screeningAnswers);
	}, [response?.screeningAnswers]);

	const renderedAnswerOptions = useMemo(() => {
		switch (response?.screeningQuestion.screeningAnswerFormatId) {
			case ScreeningAnswerFormatId.SINGLE_SELECT:
				return (
					<ToggleButtonGroup
						type="radio"
						name="screeningAnswerOptionId"
						value={selectedAnswers}
						onChange={(newId) => {
							setSelectedAnswers([{ screeningAnswerOptionId: newId }]);
						}}
					>
						{response.screeningAnswerOptions.map((option) => {
							return (
								<ToggleButton
									id={option.screeningAnswerOptionId}
									key={option.screeningAnswerOptionId}
									value={option.screeningAnswerOptionId}
									checked={
										!!selectedAnswers.find(
											(o) => o.screeningAnswerOptionId === option.screeningAnswerOptionId
										)
									}
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
						type="checkbox"
						name="screeningAnswerOptionId"
						value={selectedAnswers}
						onChange={(newIds) => {
							setSelectedAnswers(newIds.map((screeningAnswerOptionId) => ({ screeningAnswerOptionId })));
						}}
					>
						{response.screeningAnswerOptions.map((option) => {
							return (
								<ToggleButton
									id={option.screeningAnswerOptionId}
									name={option.screeningAnswerOptionId}
									key={option.screeningAnswerOptionId}
									value={option.screeningAnswerOptionId}
									checked={
										!!selectedAnswers.find(
											(o) => o.screeningAnswerOptionId === option.screeningAnswerOptionId
										)
									}
								>
									{option.answerOptionText}
								</ToggleButton>
							);
						})}
					</ToggleButtonGroup>
				);

			case ScreeningAnswerFormatId.FREEFORM_TEXT:
				return response.screeningAnswerOptions.map((option) => (
					<InputHelper
						className="mb-2"
						label="Facilitator Email"
						type="text"
						name={option.screeningAnswerOptionId}
						value={
							selectedAnswers.find((o) => o.screeningAnswerOptionId === option.screeningAnswerOptionId)
								?.text
						}
						onChange={(e) => {
							setSelectedAnswers((current) =>
								current.map((o) => {
									if (o.screeningAnswerOptionId === option.screeningAnswerOptionId) {
										return {
											...o,
											text: e.target.value,
										};
									}

									return o;
								})
							);
						}}
					/>
				));
			default:
				return;
		}
	}, [response?.screeningAnswerOptions, response?.screeningQuestion.screeningAnswerFormatId, selectedAnswers]);

	return (
		<AsyncPage fetchData={initialFetch}>
			<Container className="py-5">
				<h3 className="mb-5">{response?.screeningQuestion.questionText}</h3>

				<Form
					onSubmit={(e) => {
						e.preventDefault();
						submitAnswers();
						console.log('selected answers', selectedAnswers);
					}}
				>
					{renderedAnswerOptions}

					<div className="d-flex">
						{response?.previousScreeningQuestionContextId && (
							<Button
								type="button"
								onClick={() => {
									navigateToQuestion(response.previousScreeningQuestionContextId);
								}}
							>
								Previous
							</Button>
						)}

						<Button className="ms-auto" type="submit">
							Next
						</Button>
					</div>
				</Form>
			</Container>
		</AsyncPage>
	);
};

export default ScreeningQuestionsPage;
