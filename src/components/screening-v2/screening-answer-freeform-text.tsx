import React, { useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import { ScreeningAnswerOption, ScreeningAnswerSelection, ScreeningAnswersQuestionResult } from '@/lib/models';
import InputHelper from '@/components/input-helper';

interface ScreeningAnswerFreeformTextProps {
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
	questionResultsByScreeningAnswerOptionId?: Record<string, ScreeningAnswersQuestionResult>;
}

export const ScreeningAnswerFreeformText = ({ options, value, onChange }: ScreeningAnswerFreeformTextProps) => {
	const firstOptionRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		firstOptionRef.current?.focus();
	}, []);

	return (
		<Form.Group>
			{options.map((option, optionIndex) => {
				const currentValue =
					value.find((v) => v.screeningAnswerOptionId === option.screeningAnswerOptionId)?.text ?? '';

				return (
					<InputHelper
						ref={optionIndex === 0 ? firstOptionRef : undefined}
						key={option.screeningAnswerOptionId}
						type="text"
						value={currentValue}
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
						label={option.answerOptionText ?? ''}
					/>
				);
			})}
		</Form.Group>
	);
};
