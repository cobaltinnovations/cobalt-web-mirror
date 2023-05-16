import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';

import { PatientOrderDispositionId } from '@/lib/models';
import FilterDropdown from '@/components/filter-dropdown';
import { uniq } from 'lodash';

interface MhicFilterStateProps {
	className?: string;
}

const options = [
	{
		optionId: 'OPEN',
		title: 'Open',
		queryParameters: {
			patientOrderDispositionId: PatientOrderDispositionId.OPEN,
		},
	},
	{
		optionId: 'CLOSED',
		title: 'Closed',
		queryParameters: {
			patientOrderDispositionId: PatientOrderDispositionId.CLOSED,
		},
	},
	{
		optionId: 'ARCHIVED',
		title: 'Archived',
		queryParameters: {
			patientOrderDispositionId: PatientOrderDispositionId.ARCHIVED,
		},
	},
];

const availableQueryParams = uniq(options.map((option) => Object.keys(option.queryParameters)).flat());

export function MhicFilterStateGetParsedQueryParams(url: URL) {
	const parsed: Record<string, string[]> = {};

	for (const param of availableQueryParams) {
		parsed[param] = url.searchParams.getAll(param);
	}

	return parsed;
}

export const MhicFilterState = ({ className }: MhicFilterStateProps) => {
	const { pathname, search } = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const [selectedValue, setSelectedValue] = useState('');

	const isActive = useMemo(() => {
		const url = new URL(`${window.location.origin}${pathname}${search}`);
		const parseQueryParams = MhicFilterStateGetParsedQueryParams(url);
		const selectedQueryParamValues = Object.values(parseQueryParams).flat();

		return selectedQueryParamValues.length > 0;
	}, [pathname, search]);

	const handleDismiss = useCallback(() => {
		availableQueryParams.forEach((param) => {
			searchParams.delete(param);
			setSearchParams(searchParams);
		});
	}, [searchParams, setSearchParams]);

	const handleConfirm = useCallback(() => {
		searchParams.set('patientOrderDispositionId', selectedValue);
		setSearchParams(searchParams);
	}, [searchParams, selectedValue, setSearchParams]);

	return (
		<FilterDropdown
			className={className}
			active={isActive}
			id={`pic-mhic__state-filter`}
			title="State"
			dismissText="Clear"
			onDismiss={handleDismiss}
			confirmText="Apply"
			onConfirm={handleConfirm}
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
