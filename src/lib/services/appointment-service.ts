import { httpSingleton } from '@/lib/singletons/http-singleton';
import { AppointmentModel, FollowupModel, AccountModel, ATTENDANCE_STATUS_ID } from '@/lib/models';

export interface CreateAppointmentData {
	accountId?: string;
	providerId?: string;
	date: string;
	time: string;
	emailAddress?: string;
	phoneNumber?: string;
	appointmentTypeId?: string;
	appointmentReasonId?: string;
	intakeAssessmentId?: string;
	comment?: string;
}

export interface CreateFollowupDate {
	providerId: string;
	accountId: string;
	followupDate: string;
	appointmentReasonId: string;
}

interface AppointmentResponse {
	appointment: AppointmentModel;
	account: AccountModel;
}

interface GetAppointmentsResponse {
	appointments: AppointmentModel[];
}

interface FollowupResponse {
	followup: FollowupModel;
}

interface GetFollowupsResponse {
	followups: FollowupModel[];
}

interface AppointmentQueryFilters {
	type?: 'UPCOMING' | 'RECENT';
	responseFormat?: 'DEFAULT' | 'GROUPED_BY_DATE';
	accountId?: string;
}

interface FollowupQueryFilters {
	accountId: string;
	filterBy?: 'ALL' | 'UPCOMING';
}

export const appointmentService = {
	createAppointment(data: CreateAppointmentData) {
		return httpSingleton.orchestrateRequest<AppointmentResponse>({
			method: 'post',
			url: '/appointments',
			data,
		});
	},
	getAppointments(filters: AppointmentQueryFilters) {
		const params = new URLSearchParams();

		for (const [key, value] of Object.entries(filters)) {
			if (value) {
				params.set(key, value);
			}
		}

		return httpSingleton.orchestrateRequest<GetAppointmentsResponse>({
			method: 'get',
			url: `/appointments?${params.toString()}`,
		});
	},
	cancelAppointment(appointmentId: string) {
		return httpSingleton.orchestrateRequest<void>({
			method: 'put',
			url: `/appointments/${appointmentId}/cancel`,
			data: {},
		});
	},
	getAppointment(appointmentId?: string) {
		if (!appointmentId) throw new Error('appointmentId is required');

		return httpSingleton.orchestrateRequest<AppointmentResponse>({
			method: 'get',
			url: `/appointments/${appointmentId}`,
		});
	},

	rescheduleAppointment(appointmentId: string, data: Partial<CreateAppointmentData>) {
		return httpSingleton.orchestrateRequest<AppointmentResponse>({
			method: 'put',
			url: `/appointments/${appointmentId}/reschedule`,
			data,
		});
	},

	createFollowup(data: CreateFollowupDate) {
		return httpSingleton.orchestrateRequest<FollowupResponse>({
			method: 'post',
			url: '/followups',
			data,
		});
	},

	getFollowups(filters: FollowupQueryFilters) {
		const params = new URLSearchParams();

		for (const [key, value] of Object.entries(filters)) {
			if (value) {
				params.set(key, value);
			}
		}

		return httpSingleton.orchestrateRequest<GetFollowupsResponse>({
			method: 'get',
			url: `/followups?${params.toString()}`,
		});
	},

	cancelFollowup(followUpId: string) {
		return httpSingleton.orchestrateRequest<undefined>({
			method: 'post',
			url: `/followups/${followUpId}/cancel`,
			data: {},
		});
	},
	updateAppointmentAttendanceStatus(appointmentId: string, attendanceStatusId: ATTENDANCE_STATUS_ID) {
		return httpSingleton.orchestrateRequest<{ appointment: AppointmentModel }>({
			method: 'PUT',
			url: `/appointments/${appointmentId}/attendance-status`,
			data: { attendanceStatusId },
		});
	},
};
