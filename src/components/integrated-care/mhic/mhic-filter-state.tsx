import React, { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';

import { PatientOrderDispositionId } from '@/lib/models';
import FilterDropdown from '@/components/filter-dropdown';
import { uniq } from 'lodash';

interface MhicFilterStateProps {
	className?: string;
}

const options = [
	{
		optionId: PatientOrderDispositionId.OPEN,
		title: 'Open',
		queryParameters: {
			patientOrderDispositionId: PatientOrderDispositionId.OPEN,
		},
	},
	{
		optionId: PatientOrderDispositionId.CLOSED,
		title: 'Closed',
		queryParameters: {
			patientOrderDispositionId: PatientOrderDispositionId.CLOSED,
		},
	},
];

const availableQueryParams = uniq(options.map((option) => Object.keys(option.queryParameters)).flat());

export function MhicFilterStateGetParsedQueryParams(searchParams: URLSearchParams) {
	const parsed: Record<string, string[]> = {};

	for (const param of availableQueryParams) {
		parsed[param] = searchParams.getAll(param);
	}

	return parsed;
}

export const MhicFilterState = ({ className }: MhicFilterStateProps) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [selectedValue, setSelectedValue] = useState('');

	const isActive = useMemo(() => {
		const parseQueryParams = MhicFilterStateGetParsedQueryParams(searchParams);
		const selectedQueryParamValues = Object.values(parseQueryParams).flat();

		return selectedQueryParamValues.length > 0;
	}, [searchParams]);

	const handleDismiss = useCallback(() => {
		availableQueryParams.forEach((param) => {
			searchParams.delete(param);
			searchParams.set('pageNumber', '0');
			setSearchParams(searchParams);
		});
	}, [searchParams, setSearchParams]);

	const handleConfirm = useCallback(() => {
		searchParams.set('patientOrderDispositionId', selectedValue);
		searchParams.set('pageNumber', '0');
		setSearchParams(searchParams);
	}, [searchParams, selectedValue, setSearchParams]);

	return (
		<FilterDropdown
			className={className}
			active={isActive}
			id={`pic-mhic__state-filter`}
			title="Order State"
			dismissText="Clear"
			onDismiss={handleDismiss}
			confirmText="Apply"
			onConfirm={handleConfirm}
			width={240}
		>
			{options.map((option) => (
				<Form.Check
					key={option.optionId}
					type="radio"
					name="mhic-filter-state"
					id={`mhic-filter-state--${option.optionId}`}
					label={option.title}
					value={option.optionId}
					checked={selectedValue === option.optionId}
					onChange={({ currentTarget }) => {
						setSelectedValue(currentTarget.value);
					}}
				/>
			))}
		</FilterDropdown>
	);
};
