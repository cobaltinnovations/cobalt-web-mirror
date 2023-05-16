import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';

import { PatientOrderCareTypeId, PatientOrderFilterFlagTypeId } from '@/lib/models';
import FilterDropdown from '@/components/filter-dropdown';
import { cloneDeep, uniq } from 'lodash';

interface MhicFilterOption {
	optionId: string;
	title: string;
	queryParameters: Record<string, string | string[]>;
}

const options: MhicFilterOption[] = [
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

const availableQueryParams = uniq(options.map((option) => Object.keys(option.queryParameters)).flat());

export function MhicFilterFlagGetParsedQueryParams(url: URL) {
	const parsed: Record<string, string[]> = {};

	for (const param of availableQueryParams) {
		parsed[param] = url.searchParams.getAll(param);
	}

	return parsed;
}

interface MhicFilterFlagProps {
	className?: string;
}

export const MhicFilterFlag = ({ className }: MhicFilterFlagProps) => {
	const { pathname, search } = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const [selectedValues, setSelectedValues] = useState<string[]>([]);

	const isActive = useMemo(() => {
		const url = new URL(`${window.location.origin}${pathname}${search}`);
		const parseQueryParams = MhicFilterFlagGetParsedQueryParams(url);

		return Object.values(parseQueryParams).flat().length > 0;
	}, [pathname, search]);

	const handleDismiss = useCallback(() => {
		availableQueryParams.forEach((param) => {
			searchParams.delete(param);
			setSearchParams(searchParams);
		});
	}, [searchParams, setSearchParams]);

	const handleConfirm = useCallback(() => {
		availableQueryParams.forEach((param) => {
			searchParams.delete(param);
		});

		const selectedOptions = options.filter((option) => selectedValues.includes(option.optionId));

		selectedOptions.forEach((option) => {
			Object.entries(option.queryParameters).forEach(([key, value]) => {
				if (Array.isArray(value)) {
					value.forEach((v) => {
						searchParams.append(key, v);
					});
				} else {
					searchParams.append(key, value);
				}
			});
		});

		setSearchParams(searchParams);
	}, [searchParams, selectedValues, setSearchParams]);

	return (
		<FilterDropdown
			className={className}
			active={isActive}
			id="pic-mhic__flag-filter"
			title="Flag"
			dismissText="Clear"
			onDismiss={handleDismiss}
			confirmText="Apply"
			onConfirm={handleConfirm}
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
