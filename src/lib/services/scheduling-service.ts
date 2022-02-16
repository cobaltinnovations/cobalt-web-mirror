import moment from 'moment';
import { httpSingleton } from '@/lib/singletons/http-singleton';
import { SchedulingAppointmentType, PatientIntakeQuestion, ScreeningQuestion, LogicalAvailability } from '@/lib/models';
import { buildQueryParamUrl } from '@/lib/utils';

interface GetAppointmentTypesResponse {
	appointmentTypes: SchedulingAppointmentType[];
}

interface GetRegularHoursResponse {
	logicalAvailabilities: LogicalAvailability[];
}

interface GetUnavailableTimeResponse {
	logicalAvailabilities: LogicalAvailability[];
}

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

interface PostApointmentTypeResponse {
	appointmentType: SchedulingAppointmentType;
}

export const schedulingService = {
	getAppointmentTypes(providerId: string) {
		return httpSingleton.orchestrateRequest<GetAppointmentTypesResponse>({
			method: 'GET',
			url: buildQueryParamUrl('/appointment-types', { providerId }),
		});
	},
	getRegularHours(providerId: string) {
		return httpSingleton.orchestrateRequest<GetRegularHoursResponse>({
			method: 'GET',
			url: buildQueryParamUrl('/logical-availabilities', {
				providerId,
				recurrenceTypeId: 'DAILY',
				startDateTime: moment().subtract(1, 'year').toDate(),
				endDateTime: moment().add(1, 'year').toDate(),
			}),
		});
	},
	getUnavailableTime(providerId: string) {
		return httpSingleton.orchestrateRequest<GetUnavailableTimeResponse>({
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
		return httpSingleton.orchestrateRequest<PostApointmentTypeResponse>({
			method: 'POST',
			url: '/appointment-types',
			data,
		});
	},
};
