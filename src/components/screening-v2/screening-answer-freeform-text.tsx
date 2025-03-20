import React, { useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import { ScreeningAnswerOption, ScreeningAnswerSelection } from '@/lib/models';

interface ScreeningAnswerFreeformTextProps {
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
}

export const ScreeningAnswerFreeformText = ({ options, value, onChange }: ScreeningAnswerFreeformTextProps) => {
	const firstOptionRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		firstOptionRef.current?.focus();
	}, []);

	return (
		<Form.Group>
			{options.map((option, optionIndex) => (
				<Form.Control
					ref={optionIndex === 0 ? firstOptionRef : undefined}
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
