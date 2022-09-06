import React, { FC, useState, useEffect } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import TimeInput from '@/components/time-input';
import { useLocation, useSearchParams } from 'react-router-dom';
import { padStart } from 'lodash';
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
	defaultStartTime?: string;
	defaultEndTime?: string;
}

const FilterTimesModal: FC<FilterTimesModalProps> = ({ defaultStartTime, defaultEndTime, ...props }) => {
	useTrackModalView('FilterTimesModal', props.show);
	const classes = useFilterTimesModalStyles();

	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const { trackEvent } = useAnalytics();
	const [fromTime, setFromTime] = useState('06:00');
	const [fromMeridian, setFromMeridian] = useState('am');
	const [toTime, setToTime] = useState('08:00');
	const [toMeridian, setToMeridian] = useState('pm');

	useEffect(() => {
		if (!props.show) {
			return;
		}

		function getTimeComponents(timeString = '') {
			const [hrs, mins] = timeString.split(':');
			const parsedHrs = parseInt(hrs);
			const meridian = parsedHrs >= 12 ? 'pm' : 'am';
			const formattedHrs = parsedHrs >= 12 ? parsedHrs - 12 : parsedHrs;
			const formattedTime = `${padStart(formattedHrs.toString(), 2, '0')}:${mins}`;

			return [formattedTime, meridian];
		}

		const [start, startMeridian] = getTimeComponents(searchParams.get('startTime') || defaultStartTime);
		const [end, endMeridian] = getTimeComponents(searchParams.get('endTime') || defaultEndTime);

		setFromTime(start);
		setFromMeridian(startMeridian);

		setToTime(end);
		setToMeridian(endMeridian);
	}, [defaultEndTime, defaultStartTime, props.show, searchParams]);

	return (
		<Modal {...props} dialogClassName={classes.filterTimesModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Available Times</Modal.Title>
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
						Cancel
					</Button>
					<Button
						className="ms-2"
						variant="primary"
						onClick={() => {
							trackEvent(ProviderSearchAnalyticsEvent.applyFilter('Times'));

							const [fromHrs, fromMins] = fromTime.split(':');
							const [toHrs, toMins] = toTime.split(':');

							const parsedFromHrs = parseInt(fromHrs);
							const adjustedFromHrs = fromMeridian === 'am' ? parsedFromHrs : parsedFromHrs + 12;

							const parsedToHrs = parseInt(toHrs);
							const adjustedToHrs = toMeridian === 'am' ? parsedToHrs : parsedToHrs + 12;

							const startTime = padStart(adjustedFromHrs.toString(), 2, '0') + ':' + fromMins;
							const endTime =
								adjustedToHrs === 24
									? '23:59'
									: padStart(adjustedToHrs.toString(), 2, '0') + ':' + toMins;

							searchParams.set('startTime', startTime);
							searchParams.set('endTime', endTime);

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

export default FilterTimesModal;
