import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';

import { AccountModel } from '@/lib/models';
import FilterDropdown from '@/components/filter-dropdown';

const queryParamName = 'panelAccountId';

export const mhicFilterAssignmentGetParsedQueryParams = (url: URL) => {
	return {
		[queryParamName]: url.searchParams.getAll(queryParamName),
	};
};

interface MhicFilterAssignmentProps {
	panelAccounts: AccountModel[];
	className?: string;
}

export const MhicFilterAssignment = ({ panelAccounts, className }: MhicFilterAssignmentProps) => {
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
			id="mhic-filter-assignment"
			title="Assignment"
			dismissText="Clear"
			onDismiss={handleDismiss}
			confirmText="Apply"
			onConfirm={handleConfirm}
		>
			{panelAccounts.map((panelAccount) => (
				<Form.Check
					key={panelAccount.accountId}
					type="checkbox"
					name={queryParamName}
					id={`${queryParamName}--${panelAccount.accountId}`}
					label={panelAccount.displayName}
					value={panelAccount.accountId}
					checked={selectedValues.includes(panelAccount.accountId)}
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
