import React from 'react';
import { Form } from 'react-bootstrap';
import { ScreeningAnswerOption, ScreeningAnswerSelection } from '@/lib/models';

interface ScreeningAnswerFreeformTextProps {
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
}

export const ScreeningAnswerFreeformText = ({ options, value, onChange }: ScreeningAnswerFreeformTextProps) => {
	return (
		<Form.Group>
			{options.map((option) => (
				<Form.Control
					key={option.screeningAnswerOptionId}
					type="text"
					placeholder={option.answerOptionText}
					value={value.find((v) => v.screeningAnswerOptionId === option.screeningAnswerOptionId)?.text}
					onChange={({ currentTarget }) => {
						if (currentTarget.value.trim().length < 1) {
							onChange([]);
							return;
						}

						onChange([
							{
								screeningAnswerOptionId: option.screeningAnswerOptionId,
								text: currentTarget.value.trim(),
							},
						]);
					}}
				/>
			))}
		</Form.Group>
	);
};
