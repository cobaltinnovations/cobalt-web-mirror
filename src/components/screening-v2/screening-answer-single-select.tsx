import React, { useEffect, useRef } from 'react';
import { Collapse, Form } from 'react-bootstrap';
import { ScreeningAnswerOption, ScreeningAnswerSelection } from '@/lib/models';
import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';
import checkIcon from '@/assets/icons/check.svg';

const useStyles = createUseThemedStyles((theme) => ({
	'@global': {
		'.screening-v2__answer': {
			'& input[type=radio], & input[type=checkbox] ': {
				width: 0,
				height: 0,
				display: 'none',
				appearance: 'none',
				'& + label': {
					width: '100%',
					display: 'flex',
					borderRadius: 26,
					cursor: 'pointer',
					padding: '16px 20px',
					position: 'relative',
					...theme.fonts.default,
					backgroundColor: theme.colors.n0,
					'&:before': {
						width: 20,
						height: 20,
						content: '""',
						flexShrink: 0,
						marginRight: 16,
						borderRadius: '50%',
						display: 'inline-block',
						border: `2px solid ${theme.colors.n100}`,
					},
					'&:after': {
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						content: '""',
						borderRadius: 26,
						position: 'absolute',
						pointerEvents: 'none',
						border: `1px solid ${theme.colors.n100}`,
					},
					'&:hover': {
						backgroundColor: theme.colors.n50,
						'&:before, &:after': {
							borderColor: theme.colors.n300,
						},
					},
				},
				'&:checked': {
					'& + label:before': {
						maskSize: 20,
						maskPosition: 'center',
						maskRepeat: 'no-repeat',
						maskImage: `url(${checkIcon})`,
						borderColor: theme.colors.p500,
						backgroundColor: theme.colors.p500,
					},
					'&:hover + label:before': { borderColor: theme.colors.p700 },
				},
			},
		},
	},
}));

interface ScreeningAnswerSingleSelectProps {
	name: string;
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
}

export const ScreeningAnswerSingleSelect = ({ name, options, value, onChange }: ScreeningAnswerSingleSelectProps) => {
	useStyles();
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

				return (
					<React.Fragment key={option.screeningAnswerOptionId}>
						<Form.Check
							bsPrefix="screening-v2__answer"
							ref={optionIndex === 0 ? firstOptionRef : undefined}
							id={option.screeningAnswerOptionId}
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
