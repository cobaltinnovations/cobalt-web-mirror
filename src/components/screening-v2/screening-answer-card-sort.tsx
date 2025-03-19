import React from 'react';
import { ScreeningAnswerOption, ScreeningAnswerSelection } from '@/lib/models';

interface ScreeningAnswerCardSortProps {
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
}

export const ScreeningAnswerCardSort = ({ options, value, onChange }: ScreeningAnswerCardSortProps) => {
	return <p className="text-danger">[TODO]: Card Sort</p>;
};
