import React, { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';

import { GROUP_SESSION_STATUS_ID } from '@/lib/models';
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

export const adminGroupSessionFilterSchedulingGetParsedQueryParams = (searchParams: URLSearchParams) => {
	return {
		...(searchParams.get('groupSessionSchedulingSystemId') && {
			groupSessionSchedulingSystemId: searchParams.get(
				'groupSessionSchedulingSystemId'
			) as GROUP_SESSION_STATUS_ID,
		}),
	};
};

export const AdminGroupSessionFilterScheduling = ({ className }: Props) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [selectedValue, setSelectedValue] = useState('');

	const isActive = useMemo(() => {
		const parseQueryParams = adminGroupSessionFilterSchedulingGetParsedQueryParams(searchParams);
		return !!parseQueryParams.groupSessionSchedulingSystemId;
	}, [searchParams]);

	const handleDismiss = useCallback(() => {
		searchParams.delete('groupSessionSchedulingSystemId');
		searchParams.set('pageNumber', '0');
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
