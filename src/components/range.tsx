import React, { FC, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useRangeStyles = createUseStyles({
	range: {
		'& .form-control': {
			border: 0,
			borderRadius: 0,
			transition: 'all',
		},
	},
});

interface RangeProps {
	value: string;
	options: string[];
	onChange(value: string): void;
}

const Range: FC<RangeProps> = ({ value, options, onChange }) => {
	const classes = useRangeStyles();
	const [rangeValue, setRangeValue] = useState<string>();

	useEffect(() => {
		const valueIndex = options.findIndex((option) => option === value);

		setRangeValue(String(valueIndex));
	}, [options, value]);

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const selectedIndex = parseInt(event.currentTarget.value, 10);
		const selectedValue = options[selectedIndex];

		onChange(selectedValue);
	}

	return (
		<div className={classes.range}>
			<Form.Control
				type="range"
				min="0"
				max={options.length - 1}
				className="custom-range mb-1"
				value={rangeValue}
				onChange={handleChange}
			/>
			<h6 className="text-center">{value}</h6>
		</div>
	);
};

export default Range;
