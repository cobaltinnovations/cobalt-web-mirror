import React, { useCallback, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import FilterDropdown from '@/components/filter-dropdown';
import { CONTENT_VISIBILITY_TYPE_ID } from '@/lib/models';

interface Props {
	className?: string;
}

const options = [
	{
		visibleFlag: CONTENT_VISIBILITY_TYPE_ID.PUBLIC,
		title: 'Public',
	},
	{
		visibleFlag: CONTENT_VISIBILITY_TYPE_ID.UNLISTED,
		title: 'Unlisted',
	},
];

export const AdminGroupSessionFilterVisibility = ({ className }: Props) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const currentVisibleFlag = searchParams.get('contentVisibilityTypeId');
	const [selectedValue, setSelectedValue] = useState(currentVisibleFlag ?? '');
	const isActive = !!currentVisibleFlag;

	const handleDismiss = useCallback(() => {
		searchParams.delete('contentVisibilityTypeId');
		searchParams.set('pageNumber', '0');
		setSelectedValue('');
		setSearchParams(searchParams);
	}, [searchParams, setSearchParams]);

	const handleConfirm = useCallback(() => {
		searchParams.set('contentVisibilityTypeId', selectedValue);
		searchParams.set('pageNumber', '0');
		setSearchParams(searchParams);
	}, [searchParams, selectedValue, setSearchParams]);

	return (
		<FilterDropdown
			className={className}
			active={isActive}
			id="admin-group-session-filter-visibility"
			title="Visibility"
			dismissText="Clear"
			onDismiss={handleDismiss}
			confirmText="Apply"
			onConfirm={handleConfirm}
			width={240}
		>
			{options.map((option) => (
				<Form.Check
					key={option.title}
					type="radio"
					name="admin-group-session-filter-visibility"
					id={`admin-group-session-filter-visibility-${option.visibleFlag}`}
					label={option.title}
					value={option.visibleFlag}
					checked={selectedValue === option.visibleFlag}
					onChange={({ currentTarget }) => {
						setSelectedValue(currentTarget.value);
					}}
				/>
			))}
		</FilterDropdown>
	);
};
