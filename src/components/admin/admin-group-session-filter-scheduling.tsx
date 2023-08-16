import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';

import FilterDropdown from '@/components/filter-dropdown';
import { GroupSessionSchedulingSystemId } from '@/lib/services';

interface Props {
	className?: string;
}

const options = [
	{
		groupSessionSchedulingSystemId: GroupSessionSchedulingSystemId.COBALT,
		title: 'Cobalt',
	},
	{
		groupSessionSchedulingSystemId: GroupSessionSchedulingSystemId.EXTERNAL,
		title: 'External',
	},
];

export const AdminGroupSessionFilterScheduling = ({ className }: Props) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const currentScheduling = searchParams.get('groupSessionSchedulingSystemId');
	const [selectedValue, setSelectedValue] = useState(currentScheduling ?? '');
	const isActive = !!currentScheduling;

	const handleDismiss = useCallback(() => {
		searchParams.delete('groupSessionSchedulingSystemId');
		searchParams.set('pageNumber', '0');
		setSelectedValue('');
		setSearchParams(searchParams);
	}, [searchParams, setSearchParams]);

	const handleConfirm = useCallback(() => {
		searchParams.set('groupSessionSchedulingSystemId', selectedValue);
		searchParams.set('pageNumber', '0');
		setSearchParams(searchParams);
	}, [searchParams, selectedValue, setSearchParams]);

	return (
		<FilterDropdown
			className={className}
			active={isActive}
			id="admin-group-session-filter-scheduling"
			title="Scheduling"
			dismissText="Clear"
			onDismiss={handleDismiss}
			confirmText="Apply"
			onConfirm={handleConfirm}
			width={240}
		>
			{options.map((option) => (
				<Form.Check
					key={option.groupSessionSchedulingSystemId}
					type="radio"
					name="admin-group-session-filter-scheduling"
					id={`admin-group-session-filter-scheduling--${option.groupSessionSchedulingSystemId}`}
					label={option.title}
					value={option.groupSessionSchedulingSystemId}
					checked={selectedValue === option.groupSessionSchedulingSystemId}
					onChange={({ currentTarget }) => {
						setSelectedValue(currentTarget.value);
					}}
				/>
			))}
		</FilterDropdown>
	);
};
