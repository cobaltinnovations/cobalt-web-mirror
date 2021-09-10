import React, { FC, useState, useEffect } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import InputRange, { Range } from 'react-input-range';

import 'react-input-range/lib/css/index.css';

const useFilterTimesModalStyles = createUseStyles({
	filterTimesModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface FilterTimesModalProps extends ModalProps {
	onSave(range: Range): void;
	range: { min: number; max: number };
}

const FilterTimesModal: FC<FilterTimesModalProps> = ({ onSave, range, ...props }) => {
	const classes = useFilterTimesModalStyles();

	const [timeRange, setTimeRange] = useState({ min: 8, max: 20 });

	useEffect(() => {
		if (props.show) {
			setTimeRange(range);
		}
	}, [props.show, range]);

	useEffect(() => {
		setTimeRange(range);
	}, [range]);

	return (
		<Modal {...props} dialogClassName={classes.filterTimesModal} centered>
			<Modal.Header>
				<h3 className="mb-0">available times</h3>
			</Modal.Header>
			<Modal.Body>
				<InputRange
					minValue={1}
					maxValue={24}
					value={timeRange}
					formatLabel={(value) => {
						const meridiem = value >= 12 && value !== 24 ? 'PM' : 'AM';
						const formattedValue = value > 12 ? value - 12 : value;

						return formattedValue + meridiem;
					}}
					onChange={(change) => {
						if (typeof change !== 'number' && change.max <= 24 && change.min >= 1) {
							if (change.max - change.min < 2) {
								return;
							}
							setTimeRange(change);
						}
					}}
				/>

				<p className="mb-0 mt-4 text-center">Selected times are EST</p>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					cancel
				</Button>
				<Button
					variant="primary"
					size="sm"
					onClick={() => {
						onSave(timeRange);
					}}
				>
					save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterTimesModal;
