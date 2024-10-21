import { cloneDeep } from 'lodash';
import moment from 'moment';
import { LogicalAvailability } from '@/lib/models';

export const AvailabilityFormDataFromLogicalAvailability = (logicalAvailability: LogicalAvailability) => {
	const startMoment = moment(logicalAvailability.startDateTime, 'YYYY-MM-DDTHH:mm');
	const endDayMoment = moment(logicalAvailability.endDate, 'YYYY-MM-DD');
	const endTimeMoment = moment(logicalAvailability.endTime, 'HH:mm');

	return {
		appointmentTypes: logicalAvailability.appointmentTypes.map((at) => at.appointmentTypeId),
		startDate: startMoment.format('MMM DD, yyyy'),
		startTime: startMoment.format('hh:mm'),
		startTimeMeridian: startMoment.format('a'),
		endDate: endDayMoment.isValid() ? endDayMoment.format('MMM DD, yyyy') : '',
		endTime: endTimeMoment.format('hh:mm'),
		endTimeMeridian: endTimeMoment.format('a'),
		typesAccepted: logicalAvailability.appointmentTypes.length > 0 ? ('limited' as const) : ('all' as const),
		recurring: logicalAvailability.recurrenceTypeId === 'DAILY' ? true : false,
		occurance: {
			S: logicalAvailability.recurSunday,
			M: logicalAvailability.recurMonday,
			T: logicalAvailability.recurTuesday,
			W: logicalAvailability.recurWednesday,
			Th: logicalAvailability.recurThursday,
			F: logicalAvailability.recurFriday,
			Sa: logicalAvailability.recurSaturday,
		},
	};
};

export const AddOrRemoveValueFromArray = (value: string, array: string[]) => {
	const arrayClone = cloneDeep(array);
	const indexToRemove = arrayClone.findIndex((v) => v === value);

	if (indexToRemove > -1) {
		arrayClone.splice(indexToRemove, 1);
	} else {
		arrayClone.push(value);
	}

	return arrayClone;
};

export const SafeIntegerValue = (input: string): Number | undefined => {
	try {
		const numberValue = parseInt(input, 10);
		return Number.isInteger(numberValue) ? numberValue : undefined;
	} catch (ignored) {
		return undefined;
	}
};
