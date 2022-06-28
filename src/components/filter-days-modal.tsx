import React, { FC, useState, useEffect } from 'react';
import { Modal, Button, ModalProps, Form, Row, Col } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import moment, { Moment } from 'moment';

import DatePicker from '@/components/date-picker';

const useFilterDaysModalStyles = createUseStyles({
	filterDaysModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

const DAYS = [
	{
		label: 'Monday',
		key: 'MONDAY',
	},
	{
		label: 'Tuesday',
		key: 'TUESDAY',
	},
	{
		label: 'Wednesday',
		key: 'WEDNESDAY',
	},
	{
		label: 'Thursday',
		key: 'THURSDAY',
	},
	{
		label: 'Friday',
		key: 'FRIDAY',
	},
	{
		label: 'Saturday',
		key: 'SATURDAY',
	},
	{
		label: 'Sunday',
		key: 'SUNDAY',
	},
] as const;

export interface FilterDays {
	SUNDAY: boolean;
	MONDAY: boolean;
	TUESDAY: boolean;
	WEDNESDAY: boolean;
	THURSDAY: boolean;
	FRIDAY: boolean;
	SATURDAY: boolean;
}

interface FilterDaysModalProps extends ModalProps {
	onSave(params: { from: Moment; to: Moment; days: FilterDays }): void;
	from: Moment;
	to: Moment;
	days: Partial<FilterDays>;
}

const FilterDaysModal: FC<FilterDaysModalProps> = ({ onSave, from, to, days, ...props }) => {
	const classes = useFilterDaysModalStyles();

	const [fromDate, setFromDate] = useState<Moment>(moment());
	const [toDate, setToDate] = useState<Moment>(moment());
	const [filterDays, setFilterDays] = useState<FilterDays>({} as FilterDays);

	useEffect(() => {
		if (props.show) {
			setFromDate(from);
			setToDate(to);
			setFilterDays(
				DAYS.reduce((acc, { key }) => {
					acc[key] = !!days[key];
					return acc;
				}, {} as FilterDays)
			);
		}
	}, [props.show, from, to, days]);

	useEffect(() => {
		setFromDate(from);
	}, [from]);

	useEffect(() => {
		setToDate(to);
	}, [to]);

	useEffect(() => {
		setFilterDays(
			DAYS.reduce((acc, { key }) => {
				acc[key] = !!days[key];
				return acc;
			}, {} as FilterDays)
		);
	}, [days]);

	return (
		<Modal {...props} dialogClassName={classes.filterDaysModal} centered>
			<Modal.Header>
				<h3 className="mb-0">available days</h3>
			</Modal.Header>
			<Modal.Body>
				<p className="my-1 font-secondary-bold">Date Range</p>
				<DatePicker
					minDate={moment().toDate()}
					selected={fromDate.toDate()}
					onChange={(date) => {
						if (date !== null) {
							const dateMoment = moment(date);
							setFromDate(dateMoment);

							if (dateMoment.isAfter(toDate)) {
								setToDate(dateMoment);
							}
						}
					}}
				/>

				<p className="my-1 font-secondary-bold">to</p>
				<DatePicker
					minDate={fromDate.toDate()}
					selected={toDate.toDate()}
					onChange={(date) => {
						if (date !== null) {
							setToDate(moment(date));
						}
					}}
				/>

				<Row className="mt-2">
					{DAYS.map(({ label, key }) => {
						return (
							<Col key={key} xs={6}>
								<Form.Check
									type="checkbox"
									bsPrefix="cobalt-modal-form__check"
									id={key}
									name={key}
									label={label}
									checked={filterDays[key]}
									onChange={() => {
										setFilterDays({
											...filterDays,
											[key]: !filterDays[key],
										});
									}}
								/>
							</Col>
						);
					})}
				</Row>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					cancel
				</Button>
				<Button
					variant="primary"
					size="sm"
					onClick={() =>
						onSave({
							from: fromDate,
							to: toDate,
							days: filterDays,
						})
					}
				>
					save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterDaysModal;
