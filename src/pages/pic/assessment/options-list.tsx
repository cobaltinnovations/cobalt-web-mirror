import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePICCobaltStyles from '@/pages/pic/picCobaltStyles';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

export interface Option {
	name: string;
	key: string;
}

interface OptionsProps {
	options: Option[];
	updateSelected(selectedOptions: string[]): void;
	updateOther(otherText: string): void;
	selectedOptions: string[];
	otherValue: string;
}

export const OptionsList: FC<OptionsProps> = ({ options, updateSelected, updateOther, selectedOptions, otherValue}) => {
	const classes = usePICCobaltStyles();
	const { t } = useTranslation();

	const handleChange = (selectedValue: string[]) => {
		updateSelected(selectedValue);
	};

	const labelClickHandler = (value: string) => {
		const newOptions = [...selectedOptions];
		const index = newOptions.indexOf(value);
		index > -1 ? newOptions.splice(index, 1) : newOptions.push(value);
		handleChange(newOptions);
	};

	return (
		<>
			<ToggleButtonGroup
				type="checkbox"
				name="options"
				value={selectedOptions}
				onChange={handleChange}
				className={'mx-auto mb-1 d-flex flex-column justify-content-center'}
			>
				{options.map((option: Option) => (
					<ToggleButton key={option.key} id={option.key} type="checkbox" className={classes.radioButton} variant="light" value={option.key}>
						<label htmlFor={option.key} onClick={() => labelClickHandler(option.key)} />
						<span className={classes.radioButtonText}>{option.name}</span>
					</ToggleButton>
				))}
			</ToggleButtonGroup>
			{selectedOptions.some(e => e.split("/").includes('other')) && (
				<div className={'mx-auto p-1 border font-karla-bold bg-light text-gray'}>
					<label htmlFor="describe-other-input">{t('listOfDiagnoses.specifyOtherText')}</label>
					<input type="text" id="describe-other-input" className={'w-100 p-1 no-border text-dark'}
					value={otherValue}
					onChange={(e) => updateOther(e.target.value)} />
				</div>
			)}
		</>
	);
};
