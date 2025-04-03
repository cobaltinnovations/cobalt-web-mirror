import { v4 as uuidv4 } from 'uuid';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import {
	ScreeningAnswersMessage,
	ScreeningAnswersQuestionResult,
	ScreeningQuestionContextResponse,
	ScreeningSessionDestination,
} from '@/lib/models';
import { screeningService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { CardDraggable, CardDraggableStatic } from '@/components/screening-v2';
import InlineAlert from '@/components/inline-alert';
import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import checkCircleFill from '@/assets/icons/screening-v2/check-circle-fill.svg';
import cancelFill from '@/assets/icons/screening-v2/cancel-fill.svg';
import { cloneDeep } from 'lodash';
import { Button, Collapse } from 'react-bootstrap';

const CARD_FLIP_DURATION_MS = 200;
const CARD_FALL_DURATION_MS = 200;

const useStyles = createUseThemedStyles((theme) => ({
	questionOuter: {
		position: 'relative',
	},
	allCardsSorted: {
		width: 300,
		height: 200,
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
	},
	cardDroppable: {
		padding: 8,
		width: 300,
		height: 200,
		borderRadius: 8,
		position: 'relative',
		backgroundColor: theme.colors.n50,
		border: `1px dashed ${theme.colors.n100}`,
		'&:before': {
			top: 16,
			left: 16,
			zIndex: 2,
			width: 20,
			height: 20,
			content: '""',
			position: 'absolute',
			pointerEvents: 'none',
		},
		'&:after': {
			zIndex: 0,
			top: '50%',
			left: '50%',
			textAlign: 'center',
			position: 'absolute',
			pointerEvents: 'none',
			transform: 'translate(-50%, -50%)',
			content: 'attr(data-answer-text)',
		},
		'&--correct': {
			'&:before': {
				maskImage: `url(${checkCircleFill}) !important`,
				backgroundColor: `${theme.colors.s500} !important`,
			},
		},
		'&--incorrect': {
			'&:before': {
				maskImage: `url(${cancelFill}) !important`,
				backgroundColor: `${theme.colors.n500} !important`,
			},
		},
		'&--success': {
			borderColor: theme.colors.s500,
		},
		'&--danger': {
			borderColor: theme.colors.d500,
		},
	},
	'@global': {
		'.card-flip-enter': {
			opacity: 0,
			pointerEvents: 'none',
			transform: 'translateY(-100%) rotate(-90deg)',
		},
		'.card-flip-enter-active': {
			opacity: 1,
			transform: 'translate(0, 0) rotate(0deg)',
			transition: `all ${CARD_FLIP_DURATION_MS}ms`,
		},
		'.card-fall-exit': {
			opacity: 1,
			transform: 'translate(0, 0) rotate(0deg)',
		},
		'.card-fall-exit-active': {
			opacity: 0,
			transform: 'translateY(50%) rotate(-15deg)',
			transition: `all ${CARD_FALL_DURATION_MS}ms`,
		},
	},
}));

interface ScreeningQuestionContextCardSortProps {
	initialScreeningQuestionContextId: string;
	onScreeningFlowComplete(screeningSessionDestination?: ScreeningSessionDestination): void;
}

interface CardStack {
	cardStackId: string;
	text: string | undefined;
	card: CardStackItem | undefined;
}
interface CardStackItem {
	id: string;
	text: string;
}

export const ScreeningQuestionContextCardSort = ({
	initialScreeningQuestionContextId,
	onScreeningFlowComplete,
}: ScreeningQuestionContextCardSortProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [screeningQuestionContextId, setScreeningQuestionContextId] = useState(initialScreeningQuestionContextId);
	const [screeningQuestionContext, setScreeningQuestionContext] = useState<ScreeningQuestionContextResponse>();
	const [answerConfig, setAnswerConfig] = useState<{
		messages: ScreeningAnswersMessage[];
		nextScreeningQuestionContextId: string;
		questionResultsByScreeningAnswerOptionId: Record<string, ScreeningAnswersQuestionResult>;
		screeningSessionDestination?: ScreeningSessionDestination;
	}>();

	const isFirstQuestion = useRef(true);
	const [card, setCard] = useState<CardStackItem>();
	const [questionStack, setQuestionStack] = useState<CardStack>();
	const [answerStacks, setAnswerStacks] = useState<CardStack[]>([]);
	const [allCardsSorted, setAllCardsSorted] = useState(false);

	const fetchData = useCallback(async () => {
		setIsLoading(true);

		try {
			const response = await screeningService.getScreeningQuestionContext(screeningQuestionContextId).fetch();
			const card = {
				id: uuidv4(),
				text: response.screeningQuestion.questionText,
			};

			setScreeningQuestionContext(response);
			setCard(card);
			setQuestionStack({
				cardStackId: 'QUESTION_STACK',
				text: '',
				card: card,
			});

			if (isFirstQuestion.current) {
				setAnswerStacks(
					response.screeningAnswerOptions.map((screeningAnswerOption) => ({
						cardStackId: screeningAnswerOption.screeningAnswerOptionId,
						text: screeningAnswerOption.answerOptionText,
						card: undefined,
					}))
				);

				isFirstQuestion.current = false;
			}
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [handleError, screeningQuestionContextId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const submitScreeningAnswer = useCallback(
		async (screeningAnswerOptionId: string) => {
			setIsLoading(true);

			try {
				const {
					messages,
					nextScreeningQuestionContextId,
					questionResultsByScreeningAnswerOptionId,
					screeningSessionDestination,
				} = await screeningService
					.answerQuestion(screeningQuestionContextId, [{ screeningAnswerOptionId }])
					.fetch();

				if (messages.length > 0 || Object.entries(questionResultsByScreeningAnswerOptionId).length > 0) {
					setAnswerConfig({
						messages,
						questionResultsByScreeningAnswerOptionId,
						nextScreeningQuestionContextId: nextScreeningQuestionContextId ?? '',
						screeningSessionDestination,
					});
				}

				if (nextScreeningQuestionContextId) {
					setScreeningQuestionContextId(nextScreeningQuestionContextId);
				} else {
					setAllCardsSorted(true);
				}
			} catch (error) {
				handleError(error);
			} finally {
				setIsLoading(false);
			}
		},
		[handleError, screeningQuestionContextId]
	);

	const handleCardMouseDown = useCallback(() => {
		if (!screeningQuestionContext) {
			return;
		}

		setAnswerConfig(undefined);
		setAnswerStacks(
			screeningQuestionContext.screeningAnswerOptions.map((screeningAnswerOption) => ({
				cardStackId: screeningAnswerOption.screeningAnswerOptionId,
				text: screeningAnswerOption.answerOptionText,
				card: undefined,
			}))
		);
	}, [screeningQuestionContext]);

	const handleDragEnd = useCallback(
		({ destination }: DropResult) => {
			if (!destination || destination.droppableId === questionStack?.cardStackId) {
				return;
			}

			const cardClone = cloneDeep(card);
			setQuestionStack((previousValue) =>
				previousValue
					? {
							...previousValue,
							card: undefined,
					  }
					: undefined
			);
			setAnswerStacks((previousValue) =>
				previousValue.map((as) =>
					as.cardStackId === destination.droppableId
						? {
								...as,
								card: cardClone,
						  }
						: {
								...as,
								card: undefined,
						  }
				)
			);

			const selectedAnswerStack = answerStacks.find((as) => as.cardStackId === destination.droppableId);
			if (selectedAnswerStack) {
				submitScreeningAnswer(selectedAnswerStack.cardStackId);
			}
		},
		[answerStacks, card, questionStack?.cardStackId, submitScreeningAnswer]
	);

	if (!screeningQuestionContext) {
		return null;
	}

	return (
		<div className={classes.questionOuter}>
			<DragDropContext onDragEnd={handleDragEnd}>
				<div className="mb-10 d-flex align-items-center justify-content-around">
					{allCardsSorted ? (
						<div className={classes.allCardsSorted}>
							<p>All Cards Sorted</p>
							<Button variant="light" onClick={() => onScreeningFlowComplete()}>
								Next
							</Button>
						</div>
					) : (
						<>
							{questionStack && (
								<Droppable droppableId={questionStack.cardStackId}>
									{(droppableProvided) => (
										<div
											ref={droppableProvided.innerRef}
											{...droppableProvided.droppableProps}
											className={classes.cardDroppable}
										>
											<CSSTransition
												in={!!questionStack.card}
												timeout={CARD_FLIP_DURATION_MS}
												classNames="card-flip"
												mountOnEnter
												unmountOnExit
											>
												<CardDraggable
													onMouseDown={handleCardMouseDown}
													cardId={questionStack.card?.id}
													cardText={questionStack.card?.text}
													cardIndex={0}
												/>
											</CSSTransition>
											{droppableProvided.placeholder}
										</div>
									)}
								</Droppable>
							)}
						</>
					)}
				</div>
				<div className="d-flex align-items-center justify-content-around">
					{answerStacks.map((answerStack, answerStackIndex) => {
						const questionResult =
							answerConfig?.questionResultsByScreeningAnswerOptionId?.[answerStack.cardStackId];

						return (
							<Droppable key={answerStackIndex} droppableId={answerStack.cardStackId}>
								{(droppableProvided) => (
									<div
										ref={droppableProvided.innerRef}
										{...droppableProvided.droppableProps}
										className={classNames(classes.cardDroppable, {
											[`${
												classes.cardDroppable
											}--${questionResult?.displayTypeId.toLocaleLowerCase()}`]:
												questionResult?.displayTypeId,
											[`${
												classes.cardDroppable
											}--${questionResult?.correctnessIndicatorId.toLocaleLowerCase()}`]:
												questionResult?.correctnessIndicatorId,
										})}
										data-answer-text={answerStack.text}
									>
										<CSSTransition
											in={!!answerStack.card}
											timeout={CARD_FALL_DURATION_MS}
											classNames="card-fall"
											mountOnEnter
											unmountOnExit
										>
											<CardDraggableStatic cardText={answerStack.card?.text} />
										</CSSTransition>
									</div>
								)}
							</Droppable>
						);
					})}
				</div>
			</DragDropContext>
			<Collapse in={(answerConfig?.messages ?? []).length > 0}>
				<div>
					<div className="pt-10">
						{answerConfig?.messages.map((message, messageIndex) => (
							<InlineAlert
								key={messageIndex}
								variant={message.displayTypeId.toLocaleLowerCase() as 'primary'}
								title={message.title}
								description={<div dangerouslySetInnerHTML={{ __html: message.message ?? '' }}></div>}
							/>
						))}
					</div>
				</div>
			</Collapse>
		</div>
	);
};
