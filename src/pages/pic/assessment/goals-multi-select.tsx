import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePICCobaltStyles from '@/pages/pic/picCobaltStyles';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

interface GoalsMultiSelectProps {
	options: string[];
	updateSelected(selectedOptions: string[]): void;
	updateOther?(otherText: string): void;
}

export const GoalsMultiSelect: FC<GoalsMultiSelectProps> = (props) => {
	const classes = usePICCobaltStyles();
	const { t } = useTranslation();
	const { options, updateSelected, updateOther } = props;
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
	const [otherText, setOtherText] = useState('');

	const handleChange = (selectedValue: string[]) => {
		setSelectedOptions(selectedValue);
		updateSelected(selectedValue);
	};

	const inputHandler = (value: string) => {
		updateOther && updateOther(value);
		setOtherText(value);
	};

	return (
		<>
			<ToggleButtonGroup
				type="checkbox"
				name="options"
				value={selectedOptions}
				onChange={handleChange}
				className={'mx-auto mb-1 w-80 d-flex flex-column justify-content-center'}
			>
				{options.map((option) => (
					<ToggleButton key={option} id={option} type="checkbox" className={classes.radioButton} variant="light" value={option}>
						<label htmlFor={option} />
						<span className={classes.radioButtonText}>{t(`goalSetting.optionLabels.${option}`)}</span>
					</ToggleButton>
				))}
			</ToggleButtonGroup>
			{selectedOptions.includes('other') && (
				<div className={'mx-auto mt-2 p-2 w-80 border font-karla-bold bg-light text-gray'}>
					<label>{t('listOfSymptoms.specifyOtherText')}</label>
					<input value={otherText} type="text" className={'w-100 mt-2 p-1 no-border text-dark'} onChange={(e) => inputHandler(e.target.value)} />
				</div>
			)}
		</>
	);
};
