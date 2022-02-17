import moment from 'moment';
import { httpSingleton } from '@/lib/singletons/http-singleton';
import { SchedulingAppointmentType, PatientIntakeQuestion, ScreeningQuestion, LogicalAvailability } from '@/lib/models';
import { buildQueryParamUrl } from '@/lib/utils';

interface PostApointmentTypeRequest {
	name: string;
	description: string;
	schedulingSystemId: string;
	visitTypeId: string;
	durationInMinutes: number;
	hexColor: string;
	patientIntakeQuestions: PatientIntakeQuestion[];
	screeningQuestions: ScreeningQuestion[];
}

interface PostLogicalAvailabilitiesRequest {
	providerId: string;
	startDateTime: string;
	endDateTime: string;
	appointmentTypeIds: string[];
	logicalAvailabilityTypeId: 'OPEN' | 'BLOCK';
	recurrenceTypeId: 'NONE' | 'DAILY';
	recurSunday: boolean;
	recurMonday: boolean;
	recurTuesday: boolean;
	recurWednesday: boolean;
	recurThursday: boolean;
	recurFriday: boolean;
	recurSaturday: boolean;
}

export const schedulingService = {
	getAppointmentTypes(providerId: string) {
		return httpSingleton.orchestrateRequest<{ appointmentTypes: SchedulingAppointmentType[] }>({
			method: 'GET',
			url: buildQueryParamUrl('/appointment-types', { providerId }),
		});
	},
	getRegularHours(providerId: string) {
		return httpSingleton.orchestrateRequest<{ logicalAvailabilities: LogicalAvailability[] }>({
			method: 'GET',
			url: buildQueryParamUrl('/logical-availabilities', {
				providerId,
				recurrenceTypeId: 'DAILY',
				logicalAvailabilityTypeId: 'OPEN',
				startDateTime: moment().subtract(1, 'year').toDate(),
				endDateTime: moment().add(1, 'year').toDate(),
			}),
		});
	},
	getUnavailableTime(providerId: string) {
		return httpSingleton.orchestrateRequest<{ logicalAvailabilities: LogicalAvailability[] }>({
			method: 'GET',
			url: buildQueryParamUrl('/logical-availabilities', {
				providerId,
				logicalAvailabilityTypeId: 'BLOCK',
				startDateTime: moment().subtract(1, 'year').toDate(),
				endDateTime: moment().add(1, 'year').toDate(),
			}),
		});
	},
	postAppointmentType(data: PostApointmentTypeRequest) {
		return httpSingleton.orchestrateRequest<{ appointmentType: SchedulingAppointmentType }>({
			method: 'POST',
			url: '/appointment-types',
			data,
		});
	},
	postLogicalAvailability(data: PostLogicalAvailabilitiesRequest) {
		return httpSingleton.orchestrateRequest<{ logicalAvailability: LogicalAvailability }>({
			method: 'POST',
			url: '/logical-availabilities',
			data,
		});
	},
};
