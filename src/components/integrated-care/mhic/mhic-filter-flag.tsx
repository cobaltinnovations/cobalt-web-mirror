import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';

import { PatientOrderCareTypeId, PatientOrderFilterFlagTypeId } from '@/lib/models';
import FilterDropdown from '@/components/filter-dropdown';
import { cloneDeep } from 'lodash';

const queryParamName = 'flag';
const options = [
	{
		optionId: 'SAFETY_PLANNING',
		title: 'Safety Planning',
		queryParameters: {
			patientOrderCareTypeId: PatientOrderCareTypeId.SAFETY_PLANNING,
		},
	},
	{
		optionId: 'UNDER_18',
		title: 'Under 18',
		queryParameters: {
			patientOrderFilterFlagTypeId: PatientOrderFilterFlagTypeId.PATIENT_BELOW_AGE_THRESHOLD,
		},
	},
	{
		optionId: 'INVALID_STATE',
		title: 'Invalid State',
		queryParameters: {
			patientOrderFilterFlagTypeId: PatientOrderFilterFlagTypeId.ADDRESS_REGION_NOT_ACCEPTED,
		},
	},
	{
		optionId: 'INVALID_INSURANCE',
		title: 'Invalid Insurance',
		queryParameters: {
			patientOrderFilterFlagTypeId: PatientOrderFilterFlagTypeId.INSURANCE_NOT_ACCEPTED,
		},
	},
	{
		optionId: 'CLOSED_WITHIN_LAST_30_DAYS',
		title: 'Closed within last 30 days',
		queryParameters: {
			patientOrderFilterFlagTypeId: PatientOrderFilterFlagTypeId.MOST_RECENT_EPISODE_CLOSED_WITHIN_DATE_THRESHOLD,
		},
	},
];

export function MhicFilterFlagGetParsedQueryParams(url: URL) {
	const activeOptionsIds = url.searchParams.getAll(queryParamName);
	const activeOptions = options.filter((option) => activeOptionsIds.includes(option.optionId));
	const parsed: Record<string, string[]> = {};

	activeOptions.forEach(({ queryParameters }) => {
		Object.entries(queryParameters).forEach(([key, value]) => {
			parsed[key] = [...(parsed[key] ?? []), ...(Array.isArray(value) ? value : [value])];
		});
	});

	return parsed;
}

interface MhicFilterFlagProps {
	className?: string;
}

export const MhicFilterFlag = ({ className }: MhicFilterFlagProps) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeOptionIds = useMemo(() => searchParams.getAll(queryParamName), [searchParams]);

	const [selectedValues, setSelectedValues] = useState<string[]>([]);

	const handleDismiss = useCallback(() => {
		searchParams.delete(queryParamName);
		searchParams.set('pageNumber', '0');
		setSearchParams(searchParams);
	}, [searchParams, setSearchParams]);

	const handleConfirm = useCallback(() => {
		searchParams.delete(queryParamName);

		selectedValues.forEach((value) => {
			searchParams.append(queryParamName, value);
		});

		searchParams.set('pageNumber', '0');
		setSearchParams(searchParams);
	}, [searchParams, selectedValues, setSearchParams]);

	useEffect(() => {
		setSelectedValues(activeOptionIds);
	}, [activeOptionIds]);

	return (
		<FilterDropdown
			className={className}
			active={activeOptionIds.length > 0}
			id="pic-mhic__flag-filter"
			title="Flag"
			dismissText="Clear"
			onDismiss={handleDismiss}
			confirmText="Apply"
			onConfirm={handleConfirm}
			width={320}
		>
			{options.map((option) => (
				<Form.Check
					key={option.optionId}
					type="checkbox"
					name="mhic-filter-flag"
					id={`mhic-filter-flag--${option.optionId}`}
					label={option.title}
					value={option.optionId}
					checked={selectedValues.includes(option.optionId)}
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
