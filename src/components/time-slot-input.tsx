import React from 'react';
import moment from 'moment';
import InputHelper, { InputHelperProps } from './input-helper';

const timeSlots: string[] = [];
const totalSlotsInDay = moment.duration(1, 'day').as('minutes');
const timeSlot = moment('00:00', 'hh:mm');

for (let i = 0; i < totalSlotsInDay; i += 15) {
	timeSlot.add(i === 0 ? 0 : 15, 'minutes');
	timeSlots.push(timeSlot.format('hh:mm A'));
}

const TimeSlotInput = (props: InputHelperProps) => {
	return (
		<InputHelper as="select" {...props}>
			<option value="" disabled>
				{props.placeholder || 'Select ...'}
			</option>
			{timeSlots.map((time) => (
				<option key={time} value={time}>
					{time}
				</option>
			))}
		</InputHelper>
	);
};

export default TimeSlotInput;
