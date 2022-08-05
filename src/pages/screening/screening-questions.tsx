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

	const { navigateToQuestion, navigateToDestination } = useScreeningNavigation();
	const { screeningQuestionContextId } = useParams<{ screeningQuestionContextId: string }>();

	const [requestInitializer, setRequestInitializer] = useState<string>();
	const { response, initialFetch, refetch } = useOrchestratedRequest(
		screeningService.getScreeningQuestionContext(screeningQuestionContextId),
		{
			initialize: requestInitializer || false,
		}
	);

	const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
	const [answerText, setAnswerText] = useState({} as Record<string, string>);

	const submitAnswers = useCallback(() => {
		if (!screeningQuestionContextId) {
			return;
		}

		const answers: ScreeningAnswerSelection[] = [
			...selectedAnswers.map((screeningAnswerOptionId) => ({ screeningAnswerOptionId })),
			...Object.entries(answerText)
				.filter(([_, text]) => !!text)
				.map(([screeningAnswerOptionId, text]) => ({
					screeningAnswerOptionId,
					text,
				})),
		];
		const submit = screeningService.answerQuestion(screeningQuestionContextId, answers);

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
	}, [
		answerText,
		handleError,
		navigateToDestination,
		navigateToQuestion,
		screeningQuestionContextId,
		selectedAnswers,
	]);

	useEffect(() => {
		refetch(screeningService.getScreeningQuestionContext(screeningQuestionContextId));
		setRequestInitializer(screeningQuestionContextId);
	}, [refetch, screeningQuestionContextId]);

	useEffect(() => {
		if (!response?.screeningAnswers || !response?.screeningAnswerOptions) {
			return;
		}

		setSelectedAnswers(response.screeningAnswers.map((answer) => answer.screeningAnswerOptionId));
		setAnswerText(
			response.screeningAnswerOptions.reduce((texts, option) => {
				texts[option.screeningAnswerOptionId] =
					response.screeningAnswers.find((o) => o.screeningAnswerOptionId === option.screeningAnswerOptionId)
						?.text ?? '';
				return texts;
			}, {} as Record<string, string>)
		);
	}, [response?.screeningAnswerOptions, response?.screeningAnswers]);

	const renderedAnswerOptions = useMemo(() => {
		switch (response?.screeningQuestion.screeningAnswerFormatId) {
			case ScreeningAnswerFormatId.SINGLE_SELECT:
				return (
					<ToggleButtonGroup
						bsPrefix="cobalt-screening-button-group"
						className="d-flex flex-column"
						type="radio"
						name="screeningAnswerOptionId"
						value={selectedAnswers[0] ?? ''}
						onChange={(newId) => {
							setSelectedAnswers([newId]);
						}}
					>
						{response.screeningAnswerOptions.map((option) => {
							const isChecked = !!selectedAnswers.includes(option.screeningAnswerOptionId);

							return (
								<ToggleButton
									id={option.screeningAnswerOptionId}
									key={option.screeningAnswerOptionId}
									value={option.screeningAnswerOptionId}
									className="mb-2"
									variant={isChecked ? 'primary' : 'light'}
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
						{response.screeningAnswerOptions.map((option) => {
							const isChecked = !!selectedAnswers.includes(option.screeningAnswerOptionId);

							return (
								<ToggleButton
									id={option.screeningAnswerOptionId}
									name={option.screeningAnswerOptionId}
									key={option.screeningAnswerOptionId}
									value={option.screeningAnswerOptionId}
									className="d-flex align-items-center mb-2"
									variant={isChecked ? 'primary' : 'light'}
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
				return response.screeningAnswerOptions.map((option) => (
					<InputHelper
						key={option.screeningAnswerOptionId}
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
		response?.screeningAnswerOptions,
		response?.screeningQuestion.screeningAnswerFormatId,
		selectedAnswers,
	]);

	return (
		<AsyncPage fetchData={initialFetch}>
			<Container className="py-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{!!response?.screeningQuestion.introText && (
							<p className="mb-3">{response.screeningQuestion.introText}</p>
						)}

						<h3 className="mb-5">{response?.screeningQuestion.questionText}</h3>

						<Form
							onSubmit={(e) => {
								e.preventDefault();
								submitAnswers();
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
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default ScreeningQuestionsPage;
