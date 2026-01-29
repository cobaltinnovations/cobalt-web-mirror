import { v4 as uuidv4 } from 'uuid';
import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import classNames from 'classnames';
import {
	ScreeningAnswerOption,
	ScreeningAnswerSelection,
	ScreeningAnswersQuestionResult,
	ScreeningQuestion,
} from '@/lib/models';
import { CardDraggable } from '@/components/screening-v2';
import { createUseThemedStyles } from '@/jss/theme';
import { maskImageSvg } from '@/components/svg-icon';

const useStyles = createUseThemedStyles((theme) => ({
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
				maskSize: 20,
				maskImage: maskImageSvg({ kit: 'fas', icon: 'circle-check' }),
				backgroundColor: `${theme.colors.s500} !important`,
			},
		},
		'&--incorrect': {
			'&:before': {
				maskSize: 20,
				maskImage: maskImageSvg({ kit: 'fas', icon: 'circle-xmark' }),
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
}));

interface ScreeningAnswerCardSortProps {
	question: ScreeningQuestion;
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
	questionResultsByScreeningAnswerOptionId?: Record<string, ScreeningAnswersQuestionResult>;
}

interface CardStackItem {
	id: string;
	text: string;
}

export const ScreeningAnswerCardSort = ({
	question,
	options,
	value,
	onChange,
	questionResultsByScreeningAnswerOptionId,
}: ScreeningAnswerCardSortProps) => {
	const classes = useStyles();
	const [questionStack, setQuestionStack] = useState<CardStackItem[]>([]);
	const [answerStacksById, setAnswerStacksById] = useState<Record<string, CardStackItem[]>>({});
	const renderQuestionHtml = Boolean(question.metadata?.renderQuestionHtml);
	const answerStackTextById = useMemo(
		() =>
			options.reduce(
				(accumulator, currentValue) => ({
					...accumulator,
					[currentValue.screeningAnswerOptionId]: currentValue.answerOptionText ?? '',
				}),
				{} as Record<string, string>
			),
		[options]
	);

	useEffect(() => {
		setQuestionStack(
			value.length > 0
				? []
				: [
						{
							id: uuidv4(),
							text: question.questionText,
						},
				  ]
		);

		setAnswerStacksById(
			options.reduce(
				(accumulator, currentValue) => ({
					...accumulator,
					[currentValue.screeningAnswerOptionId]: value.find(
						(v) => v.screeningAnswerOptionId === currentValue.screeningAnswerOptionId
					)
						? [
								{
									id: uuidv4(),
									text: question.questionText,
								},
						  ]
						: [],
				}),
				{}
			)
		);
	}, [options, question.questionText, value]);

	const handleDragEnd = async ({ destination }: DropResult) => {
		if (!destination) {
			return;
		}

		if (destination.droppableId === 'QUESTION_DROPPABLE') {
			onChange([]);
			return;
		}

		onChange([{ screeningAnswerOptionId: destination.droppableId }]);
	};

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<div className="mb-10 d-flex align-items-center justify-content-around">
				<Droppable droppableId="QUESTION_DROPPABLE">
					{(droppableProvided) => (
						<div
							ref={droppableProvided.innerRef}
							{...droppableProvided.droppableProps}
							className={classes.cardDroppable}
						>
							{questionStack.map((card, cardIndex) => (
								<CardDraggable
									key={card.id}
									cardId={card.id}
									cardIndex={cardIndex}
									cardText={card.text}
									renderHtml={renderQuestionHtml}
								/>
							))}
							{droppableProvided.placeholder}
						</div>
					)}
				</Droppable>
			</div>
			<div className="d-flex align-items-center justify-content-around">
				{Object.entries(answerStacksById).map(([stackId, stackItems]) => {
					const questionResult = questionResultsByScreeningAnswerOptionId?.[stackId];

					return (
						<Droppable key={stackId} droppableId={stackId}>
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
									data-answer-text={answerStackTextById[stackId]}
								>
									{stackItems.map((card, cardIndex) => (
										<CardDraggable
											key={card.id}
											cardId={card.id}
											cardIndex={cardIndex}
											cardText={card.text}
											renderHtml={renderQuestionHtml}
											disabled={!!questionResult}
										/>
									))}
									{droppableProvided.placeholder}
								</div>
							)}
						</Droppable>
					);
				})}
			</div>
		</DragDropContext>
	);
};
