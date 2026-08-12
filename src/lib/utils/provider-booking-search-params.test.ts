import {
	PROVIDER_ID_TO_SCHEDULE_SEARCH_PARAM,
	parseProviderAppointmentDateTime,
	setFirstAvailableAppointmentSearchParams,
	setProviderIdToScheduleSearchParam,
} from './provider-booking-search-params';

describe('provider booking search params', () => {
	it('preserves the provider that owns a first-available clinic slot', () => {
		const searchParams = setFirstAvailableAppointmentSearchParams(new URLSearchParams({ clinicId: 'clinic-id' }), {
			providerId: 'selected-provider-id',
			date: '2026-08-10',
			time: '09:00:00',
			dateTime: '2026-08-10T09:00:00',
			timeDescription: '9:00am',
			appointmentTypeId: 'appointment-type-id',
			epicDepartmentId: 'department-id',
			epicAppointmentFhirId: 'fhir-slot-id',
		});

		expect(searchParams.get(PROVIDER_ID_TO_SCHEDULE_SEARCH_PARAM)).toBe('selected-provider-id');
		expect(searchParams.get('clinicId')).toBe('clinic-id');
		expect(searchParams.get('date')).toBe('2026-08-10');
		expect(searchParams.get('time')).toBe('09:00:00');
		expect(searchParams.get('appointmentTypeId')).toBe('appointment-type-id');
		expect(searchParams.get('epicDepartmentId')).toBe('department-id');
		expect(searchParams.get('epicAppointmentFhirId')).toBe('fhir-slot-id');
	});

	it('replaces or clears a previously selected slot provider', () => {
		const searchParams = new URLSearchParams({
			[PROVIDER_ID_TO_SCHEDULE_SEARCH_PARAM]: 'old-provider-id',
		});

		setProviderIdToScheduleSearchParam(searchParams, 'new-provider-id');
		expect(searchParams.get(PROVIDER_ID_TO_SCHEDULE_SEARCH_PARAM)).toBe('new-provider-id');

		setProviderIdToScheduleSearchParam(searchParams);
		expect(searchParams.has(PROVIDER_ID_TO_SCHEDULE_SEARCH_PARAM)).toBe(false);
	});

	it('preserves provider wall-clock time across browser DST gaps', () => {
		const dateTime = parseProviderAppointmentDateTime('2027-03-14', '02:30:00');

		expect(dateTime?.format('YYYY-MM-DD HH:mm')).toBe('2027-03-14 02:30');
	});
});
