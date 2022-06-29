import React, { FC } from 'react';
import Form from 'react-bootstrap/Form';

import Select from '@/components/select';

interface TableSizeSelectProps {
	size: string;
	onChange(pageSize: string): void;
}

export const TableSizeSelect: FC<TableSizeSelectProps> = React.memo(({ size, onChange }) => {
	function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
		onChange(event.currentTarget.value);
	}

	return (
		<Form.Group className="d-flex align-items-center flex-shrink-0 mb-5">
			<Form.Label className="mb-0 me-2">show:</Form.Label>
			<Select value={size} onChange={handleSelectChange}>
				<option value="15">15</option>
				<option value="30">30</option>
				<option value="60">60</option>
			</Select>
		</Form.Group>
	);
});
