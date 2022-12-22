import React, { FC, useState, useEffect } from 'react';
import { Modal, Button, ModalProps, Form, Row, Col } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import DatePicker from '@/components/date-picker';
import { useLocation, useSearchParams } from 'react-router-dom';
import { FILTER_DAYS } from '@/contexts/booking-context';
import useAnalytics from '@/hooks/use-analytics';
import { ProviderSearchAnalyticsEvent } from '@/contexts/analytics-context';
import useTrackModalView from '@/hooks/use-track-modal-view';
import { formatISO, isAfter, parseISO } from 'date-fns';

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
	const [fromDate, setFromDate] = useState<Date>(new Date());
	const [toDate, setToDate] = useState<Date>(new Date());
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

		setFromDate(startDate ? parseISO(startDate) : defaultFrom ? parseISO(defaultFrom) : new Date());
		setToDate(endDate ? parseISO(endDate) : defaultTo ? parseISO(defaultTo) : new Date());
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
					minDate={new Date()}
					selected={fromDate}
					onChange={(newFrom) => {
						if (newFrom !== null) {
							setFromDate(newFrom);

							if (isAfter(newFrom, toDate)) {
								setToDate(newFrom);
							}
						}
					}}
				/>

				<p className="my-1 fw-bold">to</p>
				<DatePicker
					minDate={fromDate}
					selected={toDate}
					onChange={(newTo) => {
						if (newTo !== null) {
							setToDate(newTo);
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

							searchParams.set('startDate', formatISO(fromDate, { representation: 'date' }));
							searchParams.set('endDate', formatISO(toDate, { representation: 'date' }));

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
