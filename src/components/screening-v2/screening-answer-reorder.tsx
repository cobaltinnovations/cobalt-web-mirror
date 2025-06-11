import { cloneDeep } from 'lodash';
import React, { useEffect, useMemo } from 'react';
import {
	ScreeningAnswerOption,
	ScreeningAnswerSelection,
	ScreeningAnswersQuestionResult,
	ScreeningQuestion,
} from '@/lib/models';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { ItemDraggable } from '@/components/screening-v2';

interface ScreeningAnswerReorderProps {
	question: ScreeningQuestion;
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
	questionResultsByScreeningAnswerOptionId?: Record<string, ScreeningAnswersQuestionResult>;
}

export const ScreeningAnswerReorder = ({
	question,
	options,
	value,
	onChange,
	questionResultsByScreeningAnswerOptionId,
}: ScreeningAnswerReorderProps) => {
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
		onChange(options.map((option) => ({ screeningAnswerOptionId: option.screeningAnswerOptionId })));
	}, [onChange, options]);

	const handleDragEnd = async ({ destination, source }: DropResult) => {
		if (!destination) {
			return;
		}

		const valueClone = cloneDeep(value);
		const [removedItem] = valueClone.splice(source.index, 1);
		valueClone.splice(destination.index, 0, removedItem);

		onChange(valueClone);
	};

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Droppable droppableId={question.screeningQuestionId}>
				{(droppableProvided) => (
					<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
						{value.map((card, cardIndex) => {
							const questionResult =
								questionResultsByScreeningAnswerOptionId?.[card.screeningAnswerOptionId];

							return (
								<ItemDraggable
									key={card.screeningAnswerOptionId}
									cardId={card.screeningAnswerOptionId}
									cardIndex={cardIndex}
									cardText={answerStackTextById[card.screeningAnswerOptionId]}
									className="mb-2"
									disabled={!!questionResult}
									variant={questionResult?.displayTypeId}
									correctnessIndicatorId={questionResult?.correctnessIndicatorId}
								/>
							);
						})}
						{droppableProvided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
};
