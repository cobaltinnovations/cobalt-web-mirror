import React, { useEffect, useRef } from 'react';
import { Button, Collapse, Form } from 'react-bootstrap';
import classNames from 'classnames';
import {
	screeningAnswerContentHintIdToInputType,
	ScreeningAnswerOption,
	ScreeningAnswerSelection,
	ScreeningAnswersQuestionResult,
} from '@/lib/models';
import InputHelper from '@/components/input-helper';

interface ScreeningAnswerSingleSelectProps {
	name: string;
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
	preferAutosubmit?: boolean;
	questionResultsByScreeningAnswerOptionId?: Record<string, ScreeningAnswersQuestionResult>;
}

export const ScreeningAnswerSingleSelect = ({
	name,
	options,
	value,
	onChange,
	preferAutosubmit,
	questionResultsByScreeningAnswerOptionId,
}: ScreeningAnswerSingleSelectProps) => {
	const firstOptionInputRef = useRef<HTMLInputElement>(null);
	const firstOptionButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		firstOptionInputRef.current?.focus();
		firstOptionButtonRef.current?.focus();
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
				const type = option.freeformSupplementContentHintId
					? screeningAnswerContentHintIdToInputType[option.freeformSupplementContentHintId]
					: undefined;
				const supplementProps = {
					...(type ? { type } : { as: 'textarea' as React.ElementType }),
				};

				return (
					<React.Fragment key={option.screeningAnswerOptionId}>
						{preferAutosubmit ? (
							<Button
								bsPrefix="screening-v2__answer"
								className={classNames({
									'screening-v2__answer--checked': isChecked,
									[`screening-v2__answer--${questionResult?.displayTypeId.toLocaleLowerCase()}`]:
										questionResult?.displayTypeId,
									[`screening-v2__answer--${questionResult?.correctnessIndicatorId.toLocaleLowerCase()}`]:
										questionResult?.correctnessIndicatorId,
								})}
								type="button"
								ref={optionIndex === 0 ? firstOptionButtonRef : undefined}
								id={option.screeningAnswerOptionId}
								onClick={() => {
									onChange([{ screeningAnswerOptionId: option.screeningAnswerOptionId }]);
								}}
							>
								{option.answerOptionText}
							</Button>
						) : (
							<Form.Check
								bsPrefix="screening-v2__answer"
								className={classNames({
									[`screening-v2__answer--${questionResult?.displayTypeId.toLocaleLowerCase()}`]:
										questionResult?.displayTypeId,
									[`screening-v2__answer--${questionResult?.correctnessIndicatorId.toLocaleLowerCase()}`]:
										questionResult?.correctnessIndicatorId,
								})}
								type="radio"
								ref={optionIndex === 0 ? firstOptionInputRef : undefined}
								id={option.screeningAnswerOptionId}
								name={name}
								label={option.answerOptionText}
								value={option.screeningAnswerOptionId}
								checked={isChecked}
								onChange={({ currentTarget }) => {
									if (questionResult) {
										return;
									}

									onChange([{ screeningAnswerOptionId: currentTarget.value }]);
								}}
							/>
						)}
						{option.freeformSupplement && (
							<Collapse in={isChecked || option.freeformSupplementTextAutoShow}>
								<div>
									<InputHelper
										{...supplementProps}
										className="mb-2"
										label={option.freeformSupplementText ?? ''}
										value={supplementText}
										onFocus={() => {
											onChange(
												value.find(
													(v) => v.screeningAnswerOptionId === option.screeningAnswerOptionId
												)
													? value
													: [{ screeningAnswerOptionId: option.screeningAnswerOptionId }]
											);
										}}
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
