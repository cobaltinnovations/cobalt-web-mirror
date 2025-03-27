import React from 'react';
import { ScreeningAnswerOption, ScreeningAnswerSelection, ScreeningAnswersQuestionResult } from '@/lib/models';

interface ScreeningAnswerCardSortProps {
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
	questionResultsByScreeningAnswerOptionId?: Record<string, ScreeningAnswersQuestionResult>;
}

export const ScreeningAnswerCardSort = ({ options, value, onChange }: ScreeningAnswerCardSortProps) => {
	return <p className="text-danger">[TODO]: Card Sort</p>;
};
