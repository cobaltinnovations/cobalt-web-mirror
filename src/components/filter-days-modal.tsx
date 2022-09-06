import React, { FC, useState, useEffect } from 'react';
import { Modal, Button, ModalProps, Form, Row, Col } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import moment, { Moment } from 'moment';

import DatePicker from '@/components/date-picker';
import { useLocation, useSearchParams } from 'react-router-dom';
import { FILTER_DAYS } from '@/contexts/booking-context';
import useAnalytics from '@/hooks/use-analytics';
import { ProviderSearchAnalyticsEvent } from '@/contexts/analytics-context';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useFilterDaysModalStyles = createUseStyles({
	filterDaysModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

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
	defaultFrom?: string;
	defaultTo?: string;
}

const FilterDaysModal: FC<FilterDaysModalProps> = ({ defaultFrom, defaultTo, ...props }) => {
	useTrackModalView('FilterDaysModal', props.show);
	const classes = useFilterDaysModalStyles();
	const { trackEvent } = useAnalytics();

	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const [fromDate, setFromDate] = useState<Moment>(moment());
	const [toDate, setToDate] = useState<Moment>(moment());
	const [filterDays, setFilterDays] = useState<FilterDays>(
		FILTER_DAYS.reduce((acc, day) => {
			acc[day.key] = true;
			return acc;
		}, {} as FilterDays)
	);

	useEffect(() => {
		if (!props.show) {
			return;
		}

		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const daysOfWeek = searchParams.getAll('dayOfWeek');

		setFromDate(startDate ? moment(startDate) : defaultFrom ? moment(defaultFrom) : moment());
		setToDate(endDate ? moment(endDate) : defaultTo ? moment(defaultTo) : moment());
		setFilterDays(
			FILTER_DAYS.reduce((acc, day) => {
				acc[day.key] = daysOfWeek.length === 0 || daysOfWeek.includes(day.key);

				return acc;
			}, {} as FilterDays)
		);
	}, [defaultFrom, defaultTo, props.show, searchParams]);

	return (
		<Modal {...props} dialogClassName={classes.filterDaysModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Available Days</Modal.Title>
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
					{FILTER_DAYS.map(({ label, key }) => {
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
						Cancel
					</Button>
					<Button
						className="ms-2"
						variant="primary"
						onClick={() => {
							trackEvent(ProviderSearchAnalyticsEvent.applyFilter('Days'));

							searchParams.set('startDate', fromDate.format('YYYY-MM-DD'));
							searchParams.set('endDate', toDate.format('YYYY-MM-DD'));

							searchParams.delete('dayOfWeek');

							for (const dayOfWeek of Object.entries(filterDays)
								.filter(([_, isSelected]) => isSelected)
								.map(([day]) => day)) {
								searchParams.append('dayOfWeek', dayOfWeek);
							}

							setSearchParams(searchParams, { state: location.state });

							props.onHide?.();
						}}
					>
						Save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterDaysModal;
