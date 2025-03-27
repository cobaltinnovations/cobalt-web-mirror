import React from 'react';
import {
	ScreeningAnswerFormatId,
	ScreeningAnswerOption,
	ScreeningAnswerSelection,
	ScreeningAnswersQuestionResult,
	ScreeningQuestion as ScreeningQuestionModel,
} from '@/lib/models';
import {
	ScreeningAnswerCardSort,
	ScreeningAnswerFreeformText,
	ScreeningAnswerMultiSelect,
	ScreeningAnswerReorder,
	ScreeningAnswerSingleSelect,
} from '@/components/screening-v2';

interface ScreeningAnswerProps {
	question: ScreeningQuestionModel;
	answerOptions: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
	questionResultsByScreeningAnswerOptionId?: Record<string, ScreeningAnswersQuestionResult>;
	className?: string;
}

export const ScreeningAnswer = ({
	question,
	answerOptions,
	value,
	onChange,
	questionResultsByScreeningAnswerOptionId,
	className,
}: ScreeningAnswerProps) => {
	return (
		<div className={className}>
			{question.screeningAnswerFormatId === ScreeningAnswerFormatId.CARD_SORT && (
				<ScreeningAnswerCardSort
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
					onChange={onChange}
					questionResultsByScreeningAnswerOptionId={questionResultsByScreeningAnswerOptionId}
				/>
			)}
			{question.screeningAnswerFormatId === ScreeningAnswerFormatId.REORDER && (
				<ScreeningAnswerReorder
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
