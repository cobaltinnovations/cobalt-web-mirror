import React, { useEffect, useRef } from 'react';
import { Collapse, Form } from 'react-bootstrap';
import classNames from 'classnames';
import { ScreeningAnswerOption, ScreeningAnswerSelection, ScreeningAnswersQuestionResult } from '@/lib/models';
import InputHelper from '@/components/input-helper';

interface ScreeningAnswerMultiSelectProps {
	name: string;
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
	questionResultsByScreeningAnswerOptionId?: Record<string, ScreeningAnswersQuestionResult>;
}

export const ScreeningAnswerMultiSelect = ({
	name,
	options,
	value,
	onChange,
	questionResultsByScreeningAnswerOptionId,
}: ScreeningAnswerMultiSelectProps) => {
	const firstOptionRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		firstOptionRef.current?.focus();
	}, []);

	return (
		<Form.Group>
			{options.map((option, optionIndex) => {
				const currentValue = value.find(
					({ screeningAnswerOptionId }) => screeningAnswerOptionId === option.screeningAnswerOptionId
				);
				const supplementText = currentValue?.text ?? '';
				const isChecked = !!currentValue;
				const questionResult = questionResultsByScreeningAnswerOptionId?.[option.screeningAnswerOptionId];

				return (
					<React.Fragment key={option.screeningAnswerOptionId}>
						<Form.Check
							bsPrefix="screening-v2__answer"
							className={classNames({
								[`screening-v2__answer--${questionResult?.displayTypeId.toLocaleLowerCase()}`]:
									questionResult?.displayTypeId,
							})}
							type="checkbox"
							ref={optionIndex === 0 ? firstOptionRef : undefined}
							id={option.screeningAnswerOptionId}
							name={name}
							label={option.answerOptionText}
							value={option.screeningAnswerOptionId}
							checked={isChecked}
							onChange={({ currentTarget }) => {
								if (questionResult) {
									return;
								}

								onChange(
									isChecked
										? value.filter((v) => v.screeningAnswerOptionId !== currentTarget.value)
										: [...value, { screeningAnswerOptionId: currentTarget.value }]
								);
							}}
						/>
						{option.freeformSupplement && (
							<Collapse in={isChecked}>
								<div>
									<InputHelper
										as="textarea"
										label={option.freeformSupplementText ?? ''}
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
