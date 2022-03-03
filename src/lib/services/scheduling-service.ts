import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	SchedulingAppointmentType,
	PatientIntakeQuestion,
	ScreeningQuestion,
	LogicalAvailability,
	ProviderCalendar,
} from '@/lib/models';
import { buildQueryParamUrl } from '@/lib/utils';

interface PostApointmentTypeRequest {
	providerId: string;
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
	endDate?: string;
	endTime: string;
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
			}),
		});
	},
	getUnavailableTime(providerId: string) {
		return httpSingleton.orchestrateRequest<{ logicalAvailabilities: LogicalAvailability[] }>({
			method: 'GET',
			url: buildQueryParamUrl('/logical-availabilities', {
				providerId,
				logicalAvailabilityTypeId: 'BLOCK',
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
	getAppointmentType(appointmentTypeId: string) {
		return httpSingleton.orchestrateRequest<{ appointmentType: SchedulingAppointmentType }>({
			method: 'GET',
			url: `/appointment-types/${appointmentTypeId}`,
		});
	},
	updateAppointmentType(appointmentTypeId: string, data: PostApointmentTypeRequest) {
		return httpSingleton.orchestrateRequest<{ appointmentType: SchedulingAppointmentType }>({
			method: 'PUT',
			url: `/appointment-types/${appointmentTypeId}`,
			data,
		});
	},
	deleteAppointmentType(appointmentTypeId: string) {
		return httpSingleton.orchestrateRequest<{ appointmentType: SchedulingAppointmentType }>({
			method: 'DELETE',
			url: `/appointment-types/${appointmentTypeId}`,
		});
	},
	postLogicalAvailability(data: PostLogicalAvailabilitiesRequest) {
		return httpSingleton.orchestrateRequest<{ logicalAvailability: LogicalAvailability }>({
			method: 'POST',
			url: '/logical-availabilities',
			data,
		});
	},
	getLogicalAvailability(logicalAvailabilityId: string) {
		return httpSingleton.orchestrateRequest<{ logicalAvailability: LogicalAvailability }>({
			method: 'GET',
			url: `/logical-availabilities/${logicalAvailabilityId}`,
		});
	},
	updateLogicalAvailability(logicalAvailabilityId: string, data: PostLogicalAvailabilitiesRequest) {
		return httpSingleton.orchestrateRequest<{ logicalAvailability: LogicalAvailability }>({
			method: 'PUT',
			url: `/logical-availabilities/${logicalAvailabilityId}`,
			data,
		});
	},
	deleteLogicalAvailabilitiy(logicalAvailabilityId: string) {
		return httpSingleton.orchestrateRequest<{ logicalAvailability: LogicalAvailability }>({
			method: 'DELETE',
			url: `/logical-availabilities/${logicalAvailabilityId}`,
		});
	},
	getCalendar(providerId: string, queryParameters: { startDate: string; endDate: string }) {
		return httpSingleton.orchestrateRequest<{ providerCalendar: ProviderCalendar }>({
			method: 'GET',
			url: buildQueryParamUrl(`/providers/${providerId}/calendar`, queryParameters),
		});
	},
};
