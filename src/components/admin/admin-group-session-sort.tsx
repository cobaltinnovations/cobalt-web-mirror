import React, { useCallback, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import FilterDropdown from '@/components/filter-dropdown';
import { GROUP_SESSION_SORT_ORDER } from '@/lib/models';

interface Props {
	className?: string;
}

const options = [
	{
		orderBy: GROUP_SESSION_SORT_ORDER.DATE_ADDED_DESCENDING,
		title: 'Date Added Descending',
	},
	{
		orderBy: GROUP_SESSION_SORT_ORDER.DATE_ADDED_ASCENDING,
		title: 'Date Added Ascending',
	},
	{
		orderBy: GROUP_SESSION_SORT_ORDER.REGISTERED_DESCENDING,
		title: 'Registered Descending',
	},
	{
		orderBy: GROUP_SESSION_SORT_ORDER.REGISTERED_ASCENDING,
		title: 'Registered Ascending',
	},
	{
		orderBy: GROUP_SESSION_SORT_ORDER.CAPACITY_DESCENDING,
		title: 'Capacity Descending',
	},
	{
		orderBy: GROUP_SESSION_SORT_ORDER.CAPACITY_ASCENDING,
		title: 'Capacity Ascending',
	},
	{
		orderBy: GROUP_SESSION_SORT_ORDER.START_TIME_DESCENDING,
		title: 'Start Date Descending',
	},
	{
		orderBy: GROUP_SESSION_SORT_ORDER.START_TIME_ASCENDING,
		title: 'Start Date Ascending',
	},
];

export const AdminGroupSessionSort = ({ className }: Props) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const currentSort = searchParams.get('orderBy') ?? '';
	const selectedOption = options.find((o) => o.orderBy === currentSort) ?? options[0];
	const [selectedValue, setSelectedValue] = useState(selectedOption.orderBy as string);

	const isActive = !!currentSort;

	const handleDismiss = useCallback(() => {
		searchParams.delete('orderBy');
		searchParams.set('pageNumber', '0');
		setSearchParams(searchParams);
	}, [searchParams, setSearchParams]);

	const handleConfirm = useCallback(() => {
		searchParams.set('orderBy', selectedValue);
		searchParams.set('pageNumber', '0');
		setSearchParams(searchParams);
	}, [searchParams, selectedValue, setSearchParams]);

	return (
		<FilterDropdown
			showSortIcon
			iconLeft
			className={className}
			active={isActive}
			id="admin-group-session-sort"
			title={'Sort by: ' + selectedOption?.title}
			dismissText="Clear"
			onDismiss={handleDismiss}
			confirmText="Apply"
			onConfirm={handleConfirm}
			width={240}
		>
			{options.map((option) => (
				<Form.Check
					key={option.orderBy}
					type="radio"
					name="admin-group-session-sort"
					id={`admin-group-session-sort--${option.orderBy}`}
					label={option.title}
					value={option.orderBy}
					checked={selectedValue === option.orderBy}
					onChange={({ currentTarget }) => {
						setSelectedValue(currentTarget.value);
					}}
				/>
			))}
		</FilterDropdown>
	);
};
