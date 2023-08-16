import React, { useCallback, useState } from 'react';
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

export const AdminGroupSessionFilterStatus = ({ className }: Props) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const currentStatus = searchParams.get('groupSessionStatusId');
	const [selectedValue, setSelectedValue] = useState(currentStatus ?? '');
	const isActive = !!currentStatus;

	const handleDismiss = useCallback(() => {
		searchParams.delete('groupSessionStatusId');
		searchParams.set('pageNumber', '0');
		setSelectedValue('');
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
