import React from 'react';
import {
	ScreeningAnswerFormatId,
	ScreeningAnswerOption,
	ScreeningAnswerSelection,
	ScreeningAnswersQuestionResult,
	ScreeningQuestion,
} from '@/lib/models';
import {
	ScreeningAnswerCardSort,
	ScreeningAnswerFreeformText,
	ScreeningAnswerMultiSelect,
	ScreeningAnswerReorder,
	ScreeningAnswerSingleSelect,
} from '@/components/screening-v2';

interface ScreeningAnswerProps {
	question: ScreeningQuestion;
	answerOptions: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	maximumAnswerCount: number;
	onChange(value: ScreeningAnswerSelection[]): void;
	questionResultsByScreeningAnswerOptionId?: Record<string, ScreeningAnswersQuestionResult>;
	className?: string;
}

export const ScreeningAnswer = ({
	question,
	answerOptions,
	value,
	maximumAnswerCount,
	onChange,
	questionResultsByScreeningAnswerOptionId,
	className,
}: ScreeningAnswerProps) => {
	return (
		<div className={className}>
			{question.screeningAnswerFormatId === ScreeningAnswerFormatId.CARD_SORT && (
				<ScreeningAnswerCardSort
					question={question}
					options={answerOptions}
					value={value}
					onChange={onChange}
					questionResultsByScreeningAnswerOptionId={questionResultsByScreeningAnswerOptionId}
				/>
			)}
			{question.screeningAnswerFormatId === ScreeningAnswerFormatId.FREEFORM_TEXT && (
				<ScreeningAnswerFreeformText
					options={answerOptions}
					value={value}
					onChange={onChange}
					questionResultsByScreeningAnswerOptionId={questionResultsByScreeningAnswerOptionId}
				/>
			)}
			{question.screeningAnswerFormatId === ScreeningAnswerFormatId.MULTI_SELECT && (
				<ScreeningAnswerMultiSelect
					name={question.screeningQuestionId}
					options={answerOptions}
					value={value}
					maximumAnswerCount={maximumAnswerCount}
					onChange={onChange}
					questionResultsByScreeningAnswerOptionId={questionResultsByScreeningAnswerOptionId}
				/>
			)}
			{question.screeningAnswerFormatId === ScreeningAnswerFormatId.REORDER && (
				<ScreeningAnswerReorder
					question={question}
					options={answerOptions}
					value={value}
					onChange={onChange}
					questionResultsByScreeningAnswerOptionId={questionResultsByScreeningAnswerOptionId}
				/>
			)}
			{question.screeningAnswerFormatId === ScreeningAnswerFormatId.SINGLE_SELECT && (
				<ScreeningAnswerSingleSelect
					name={question.screeningQuestionId}
					options={answerOptions}
					value={value}
					onChange={onChange}
					questionResultsByScreeningAnswerOptionId={questionResultsByScreeningAnswerOptionId}
				/>
			)}
		</div>
	);
};
