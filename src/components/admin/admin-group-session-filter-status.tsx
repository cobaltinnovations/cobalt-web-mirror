import React, { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';

import { GROUP_SESSION_STATUS_ID } from '@/lib/models';
import FilterDropdown from '@/components/filter-dropdown';

interface Props {
	className?: string;
}

const options = [
	{
		groupSessionStatusId: GROUP_SESSION_STATUS_ID.ADDED,
		title: 'Added',
	},
	{
		groupSessionStatusId: GROUP_SESSION_STATUS_ID.ARCHIVED,
		title: 'Archived',
	},
	{
		groupSessionStatusId: GROUP_SESSION_STATUS_ID.CANCELED,
		title: 'Canceled',
	},
	{
		groupSessionStatusId: GROUP_SESSION_STATUS_ID.DELETED,
		title: 'Deleted',
	},
	{
		groupSessionStatusId: GROUP_SESSION_STATUS_ID.NEW,
		title: 'New',
	},
];

export const adminGroupSessionFilterStatusGetParsedQueryParams = (searchParams: URLSearchParams) => {
	return {
		groupSessionStatusId: searchParams.get('groupSessionStatusId')
			? (searchParams.get('groupSessionStatusId') as GROUP_SESSION_STATUS_ID)
			: undefined,
	};
};

export const AdminGroupSessionFilterStatus = ({ className }: Props) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [selectedValue, setSelectedValue] = useState('');

	const isActive = useMemo(() => {
		const parseQueryParams = adminGroupSessionFilterStatusGetParsedQueryParams(searchParams);
		const selectedQueryParamValues = Object.values(parseQueryParams).flat();

		return selectedQueryParamValues.length > 0;
	}, [searchParams]);

	const handleDismiss = useCallback(() => {
		searchParams.delete('groupSessionStatusId');
		searchParams.set('pageNumber', '0');
		setSearchParams(searchParams);
	}, [searchParams, setSearchParams]);

	const handleConfirm = useCallback(() => {
		searchParams.set('groupSessionStatusId', selectedValue);
		searchParams.set('pageNumber', '0');
		setSearchParams(searchParams);
	}, [searchParams, selectedValue, setSearchParams]);

	return (
		<FilterDropdown
			className={className}
			active={isActive}
			id="admin-group-session-filter-status"
			title="Status"
			dismissText="Clear"
			onDismiss={handleDismiss}
			confirmText="Apply"
			onConfirm={handleConfirm}
			width={240}
		>
			{options.map((option) => (
				<Form.Check
					key={option.groupSessionStatusId}
					type="radio"
					name="admin-group-session-filter-status"
					id={`admin-group-session-filter-status--${option.groupSessionStatusId}`}
					label={option.title}
					value={option.groupSessionStatusId}
					checked={selectedValue === option.groupSessionStatusId}
					onChange={({ currentTarget }) => {
						setSelectedValue(currentTarget.value);
					}}
				/>
			))}
		</FilterDropdown>
	);
};
