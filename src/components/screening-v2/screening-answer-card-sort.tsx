import { v4 as uuidv4 } from 'uuid';
import React, { useEffect, useMemo, useState } from 'react';
import {
	ScreeningAnswerOption,
	ScreeningAnswerSelection,
	ScreeningAnswersQuestionResult,
	ScreeningQuestion,
} from '@/lib/models';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { CardDraggable } from '@/components/screening-v2';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	cardDroppable: {
		padding: 8,
		width: 300,
		height: 200,
		borderRadius: 8,
		position: 'relative',
		backgroundColor: theme.colors.n50,
		border: `1px dashed ${theme.colors.n100}`,
		'&:after': {
			content: 'attr(data-answer-text)',
		},
	},
	droppableText: {
		zIndex: 0,
		top: '50%',
		left: '50%',
		position: 'absolute',
		pointerEvents: 'none',
		transform: 'translate(-50%, -50%)',
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

export const ScreeningAnswerCardSort = ({ question, options, value, onChange }: ScreeningAnswerCardSortProps) => {
	const classes = useStyles();
	const [questionStack, setQuestionStack] = useState<CardStackItem[]>([]);
	const [answerStacksById, setAnswerStacksById] = useState<Record<string, CardStackItem[]>>({});
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
								/>
							))}
							{droppableProvided.placeholder}
						</div>
					)}
				</Droppable>
			</div>
			<div className="d-flex align-items-center justify-content-around">
				{Object.entries(answerStacksById).map(([stackId, stackItems]) => (
					<Droppable key={stackId} droppableId={stackId}>
						{(droppableProvided) => (
							<div
								ref={droppableProvided.innerRef}
								{...droppableProvided.droppableProps}
								className={classes.cardDroppable}
								data-answer-text={answerStackTextById[stackId]}
							>
								{stackItems.map((card, cardIndex) => (
									<CardDraggable
										key={card.id}
										cardId={card.id}
										cardIndex={cardIndex}
										cardText={card.text}
									/>
								))}
								{droppableProvided.placeholder}
							</div>
						)}
					</Droppable>
				))}
			</div>
		</DragDropContext>
	);
};
