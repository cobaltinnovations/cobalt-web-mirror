import moment from 'moment';
import { LogicalAvailability } from '@/lib/models';

export const AvailabilityFormDataFromLogicalAvailability = (logicalAvailability: LogicalAvailability) => {
	const startMoment = moment(logicalAvailability.startDateTime, 'YYYY-MM-DDTHH:mm');
	const endMoment = moment(logicalAvailability.endDateTime, 'YYYY-MM-DDTHH:mm');

	return {
		appointmentTypes: logicalAvailability.appointmentTypes.map((at) => at.appointmentTypeId),
		startDate: startMoment.format('MMM DD, yyyy'),
		startTime: startMoment.format('hh:mm'),
		startTimeMeridian: startMoment.format('a'),
		endDate: endMoment.format('MMM DD, yyyy'),
		endTime: endMoment.format('hh:mm'),
		endTimeMeridian: endMoment.format('a'),
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
