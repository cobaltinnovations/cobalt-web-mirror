import React from 'react';
import { Collapse, Form } from 'react-bootstrap';
import { ScreeningAnswerOption, ScreeningAnswerSelection } from '@/lib/models';

interface ScreeningAnswerSingleSelectProps {
	name: string;
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
}

export const ScreeningAnswerSingleSelect = ({ name, options, value, onChange }: ScreeningAnswerSingleSelectProps) => {
	return (
		<Form.Group>
			{options.map((option) => {
				const currentValue = value.find(
					({ screeningAnswerOptionId }) => screeningAnswerOptionId === option.screeningAnswerOptionId
				);
				const supplementText = currentValue?.text ?? '';
				const isChecked = !!currentValue;

				return (
					<React.Fragment key={option.screeningAnswerOptionId}>
						<Form.Check
							type="radio"
							name={name}
							label={option.answerOptionText}
							value={option.screeningAnswerOptionId}
							checked={isChecked}
							onChange={({ currentTarget }) => {
								onChange([{ screeningAnswerOptionId: currentTarget.value }]);
							}}
						/>
						{option.freeformSupplement && (
							<Collapse in={isChecked}>
								<div>
									<Form.Control
										type="text"
										placeholder={option.freeformSupplementText}
										value={supplementText}
										onChange={({ currentTarget }) => {
											onChange(
												value.map((v) =>
													v.screeningAnswerOptionId === option.screeningAnswerOptionId
														? { ...v, text: currentTarget.value }
														: v
												)
											);
										}}
									/>
								</div>
							</Collapse>
						)}
					</React.Fragment>
				);
			})}
		</Form.Group>
	);
};
