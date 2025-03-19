import React from 'react';
import { Form } from 'react-bootstrap';
import { ScreeningAnswerOption, ScreeningAnswerSelection } from '@/lib/models';

interface ScreeningAnswerSingleSelectProps {
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
}

export const ScreeningAnswerSingleSelect = ({ options, value, onChange }: ScreeningAnswerSingleSelectProps) => {
	return (
		<Form.Group>
			{options.map((option) => (
				<Form.Check
					key={option.screeningAnswerOptionId}
					type="radio"
					label={option.answerOptionText}
					value={option.screeningAnswerOptionId}
					checked={value.some(
						({ screeningAnswerOptionId }) => screeningAnswerOptionId === option.screeningAnswerOptionId
					)}
					onChange={({ currentTarget }) => {
						onChange([{ screeningAnswerOptionId: currentTarget.value }]);
					}}
				/>
			))}
		</Form.Group>
	);
};
