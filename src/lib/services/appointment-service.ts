import { httpSingleton } from '@/lib/singletons/http-singleton';
import { AppointmentModel, FollowupModel, AccountModel } from '@/lib/models';

export interface CreateAppointmentData {
	accountId?: string;
	providerId?: string;
	date: string;
	time: string;
	emailAddress?: string;
	phoneNumber?: string;
	groupEventId?: string;
	groupEventTypeId?: string;
	appointmentTypeId?: string;
	appointmentReasonId?: string;
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
};
