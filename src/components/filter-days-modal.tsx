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
		label: 'Mon.',
		key: 'MONDAY',
	},
	{
		label: 'Tue.',
		key: 'TUESDAY',
	},
	{
		label: 'Wed.',
		key: 'WEDNESDAY',
	},
	{
		label: 'Thu.',
		key: 'THURSDAY',
	},
	{
		label: 'Fri.',
		key: 'FRIDAY',
	},
	{
		label: 'Sat.',
		key: 'SATURDAY',
	},
	{
		label: 'Sun.',
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
			<Modal.Header closeButton>
				<Modal.Title>available days</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="my-1 fw-bold">Date Range</p>
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

				<p className="my-1 fw-bold">to</p>
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
				<div className="text-right">
					<Button variant="outline-primary" onClick={props.onHide}>
						cancel
					</Button>
					<Button
						className="ms-2"
						variant="primary"
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
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterDaysModal;
