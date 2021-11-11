import React, { FC } from 'react';
import QuickFilterDropdown from '@/components/quick-filter-dropdown';

interface Props {
	preFilteredRows: any[];
	setFilter(id: string, value: string): void;
	filters: any[];
	id: string;
}
export const SelectFilter: FC<Props> = (props) => {
	const { preFilteredRows, setFilter, filters, id } = props;
	const statusFilter = filters.find((filter) => filter.id === id);
	const selectedValue = statusFilter?.value || '';

	const idToTitleMapping = { 'flag.label': 'Status', displayTriage: 'Triage' };
	// @ts-ignore
	const title = idToTitleMapping[id] || '';
	const selectOptions = React.useMemo(() => {
		const options = new Set();
		preFilteredRows.forEach((row) => {
			options.add(row.values[id]);
		});
		// @ts-ignore
		return [...options.values()];
	}, [preFilteredRows]);

	return (
		<QuickFilterDropdown
			active={!!statusFilter}
			value={selectedValue}
			id={id}
			title={title}
			items={[
				{
					value: undefined,
					label: 'No Filter',
				},
				// @ts-ignore
				...selectOptions?.map((option) => {
					return {
						value: option,
						label: option,
					};
				}),
			]}
			onChange={(e) => setFilter(id, e || '')}
		/>
	);
};
