import React from 'react';
import { ScreeningAnswerOption, ScreeningAnswerSelection, ScreeningAnswersQuestionResult } from '@/lib/models';

interface ScreeningAnswerReorderProps {
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
	questionResultsByScreeningAnswerOptionId?: Record<string, ScreeningAnswersQuestionResult>;
}

export const ScreeningAnswerReorder = ({ options, value, onChange }: ScreeningAnswerReorderProps) => {
	return <p className="text-danger">[TODO]: Reorder</p>;
};
