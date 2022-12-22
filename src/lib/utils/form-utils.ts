import { LogicalAvailability } from '@/lib/models';
import { format, parse, parseISO } from 'date-fns';

export const AvailabilityFormDataFromLogicalAvailability = (logicalAvailability: LogicalAvailability) => {
	const startDate = parseISO(logicalAvailability.startDateTime);
	const endDate = logicalAvailability.endDate ? parseISO(logicalAvailability.endDate) : undefined;
	const endTime = logicalAvailability.endTime && parse(logicalAvailability.endTime, 'HH:mm', new Date());

	return {
		appointmentTypes: logicalAvailability.appointmentTypes.map((at) => at.appointmentTypeId),
		startDate,
		startTime: format(startDate, 'hh:mm'),
		startTimeMeridian: format(startDate, 'aaa'),
		endDate,
		endTime: endTime && format(endTime, 'hh:mm'),
		endTimeMeridian: endTime && format(endTime, 'aaa'),
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
