import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';

import { ReferenceDataResponse } from '@/lib/models';
import FilterDropdown from '@/components/filter-dropdown';

const queryParamName = 'referringPracticeNames';

export const mhicFilterPracticeGetParsedQueryParams = (url: URL) => {
	return {
		[queryParamName]: url.searchParams.getAll(queryParamName),
	};
};

interface MhicFilterPracticeProps {
	referenceData: ReferenceDataResponse;
	className?: string;
}

export const MhicFilterPractice = ({ referenceData, className }: MhicFilterPracticeProps) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeOptionIds = useMemo(() => searchParams.getAll(queryParamName), [searchParams]);

	const [selectedValues, setSelectedValues] = useState<string[]>([]);

	const handleDismiss = useCallback(() => {
		searchParams.delete(queryParamName);
		setSearchParams(searchParams);
	}, [searchParams, setSearchParams]);

	const handleConfirm = useCallback(() => {
		searchParams.delete(queryParamName);

		selectedValues.forEach((value) => {
			searchParams.append(queryParamName, value);
		});

		setSearchParams(searchParams);
	}, [searchParams, selectedValues, setSearchParams]);

	useEffect(() => {
		setSelectedValues(activeOptionIds);
	}, [activeOptionIds]);

	return (
		<FilterDropdown
			className={className}
			active={activeOptionIds.length > 0}
			id="mhic-filter-practice"
			title="Practice"
			dismissText="Clear"
			onDismiss={handleDismiss}
			confirmText="Apply"
			onConfirm={handleConfirm}
			width={320}
		>
			{referenceData.referringPracticeNames.map((practiceName) => (
				<Form.Check
					key={practiceName.replaceAll(' ', '-').toLowerCase()}
					type="checkbox"
					name={queryParamName}
					id={`${queryParamName}--${practiceName.replaceAll(' ', '-').toLowerCase()}`}
					label={practiceName}
					value={practiceName}
					checked={selectedValues.includes(practiceName)}
					onChange={({ currentTarget }) => {
						const selectedValuesClone = cloneDeep(selectedValues);
						const indexToUpdate = selectedValuesClone.findIndex(
							(selectedValue) => selectedValue === currentTarget.value
						);

						if (indexToUpdate > -1) {
							selectedValuesClone.splice(indexToUpdate, 1);
						} else {
							selectedValuesClone.push(currentTarget.value);
						}

						setSelectedValues(selectedValuesClone);
					}}
				/>
			))}
		</FilterDropdown>
	);
};
