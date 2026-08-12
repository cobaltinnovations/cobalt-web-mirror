import { FirstAvailableAppointmentModel } from '@/lib/models';
import moment from 'moment';

export const PROVIDER_ID_TO_SCHEDULE_SEARCH_PARAM = 'providerIdToSchedule';

export const parseProviderAppointmentDateTime = (date?: string | null, time?: string | null) => {
	if (!date || !time) {
		return;
	}

	// Provider availability is expressed as a wall-clock date/time. Parsing in UTC preserves those
	// components even when the browser's local timezone has a DST gap at the selected time.
	const dateTime = moment.utc(
		`${date} ${time}`,
		['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD h:mmA'],
		true
	);

	return dateTime.isValid() ? dateTime : undefined;
};

const setOptionalSearchParam = (searchParams: URLSearchParams, name: string, value?: string) => {
	if (value) {
		searchParams.set(name, value);
	} else {
		searchParams.delete(name);
	}
};

export const setProviderIdToScheduleSearchParam = (searchParams: URLSearchParams, providerId?: string) => {
	setOptionalSearchParam(searchParams, PROVIDER_ID_TO_SCHEDULE_SEARCH_PARAM, providerId);
	return searchParams;
};

export const setFirstAvailableAppointmentSearchParams = (
	searchParams: URLSearchParams,
	appointment: FirstAvailableAppointmentModel
) => {
	searchParams.set('date', appointment.date);
	searchParams.set('time', appointment.time);
	setOptionalSearchParam(searchParams, 'appointmentTypeId', appointment.appointmentTypeId);
	setProviderIdToScheduleSearchParam(searchParams, appointment.providerId);
	setOptionalSearchParam(searchParams, 'epicDepartmentId', appointment.epicDepartmentId);
	setOptionalSearchParam(searchParams, 'epicAppointmentFhirId', appointment.epicAppointmentFhirId);
	return searchParams;
};
