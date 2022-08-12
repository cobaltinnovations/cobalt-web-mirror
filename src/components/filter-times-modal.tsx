import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import TimeInput from '@/components/time-input';
import useAnalytics from '@/hooks/use-analytics';
import { ProviderSearchAnalyticsEvent } from '@/contexts/analytics-context';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useFilterTimesModalStyles = createUseStyles({
	filterTimesModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface FilterTimesModalProps extends ModalProps {
	onSave(range: { min: number; max: number }): void;
	range: { min: number; max: number };
}

const FilterTimesModal: FC<FilterTimesModalProps> = ({ onSave, range, ...props }) => {
	useTrackModalView('FilterTimesModal', props.show);
	const classes = useFilterTimesModalStyles();

	const { trackEvent } = useAnalytics();
	const [fromTime, setFromTime] = useState('06:00');
	const [fromMeridian, setFromMeridian] = useState('am');
	const [toTime, setToTime] = useState('08:00');
	const [toMeridian, setToMeridian] = useState('pm');

	useEffect(() => {
		if (!props.show) {
			return;
		}

		const parsedFromHour = range.min > 12 ? range.min - 12 : range.min;
		const parsedFromMeridian = range.min > 12 ? 'pm' : 'am';
		const formattedFromHour = parsedFromHour < 10 ? `0${parsedFromHour}:00` : `${parsedFromHour}:00`;

		const parsedToHour = range.max > 12 ? range.max - 12 : range.max;
		const parsedToMeridian = range.max > 12 ? 'pm' : 'am';
		const formattedToHour = parsedToHour < 10 ? `0${parsedToHour}:00` : `${parsedToHour}:00`;

		setFromTime(formattedFromHour);
		setFromMeridian(parsedFromMeridian);

		setToTime(formattedToHour);
		setToMeridian(parsedToMeridian);
	}, [props.show, range.max, range.min]);

	const handleSaveClick = useCallback(() => {
		trackEvent(ProviderSearchAnalyticsEvent.applyFilter('Times'));

		const fromHour = parseInt(fromTime.split(':')[0]);
		const min = fromMeridian === 'am' ? fromHour : fromHour + 12;

		const toHour = parseInt(toTime.split(':')[0]);
		const max = toMeridian === 'am' ? toHour : toHour + 12;

		onSave({ min, max });
	}, [fromMeridian, fromTime, onSave, toMeridian, toTime, trackEvent]);

	return (
		<Modal {...props} dialogClassName={classes.filterTimesModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>available times</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="mb-2">
					<TimeInput
						label="From"
						time={fromTime}
						onTimeChange={(event) => {
							setFromTime(event.currentTarget.value);
						}}
						meridian={fromMeridian}
						onMeridianChange={setFromMeridian}
					/>
				</div>
				<TimeInput
					label="To"
					time={toTime}
					onTimeChange={(event) => {
						setToTime(event.currentTarget.value);
					}}
					meridian={toMeridian}
					onMeridianChange={setToMeridian}
				/>
				<p className="mb-0 mt-4 text-center">Selected times are EST</p>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button variant="outline-primary" onClick={props.onHide}>
						cancel
					</Button>
					<Button className="ms-2" variant="primary" onClick={handleSaveClick}>
						save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterTimesModal;
