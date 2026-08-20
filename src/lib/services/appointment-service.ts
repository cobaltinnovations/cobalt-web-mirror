import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	AccountModel,
	AppointmentBookingRequirementsDestinationId,
	BookingExperienceId,
	AppointmentModel,
	ATTENDANCE_STATUS_ID,
	FollowupModel,
	ProviderAppointmentSelectionTypeId,
	ScreeningSession,
} from '@/lib/models';

export interface CreateAppointmentData {
	bookingExperienceId: BookingExperienceId;
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
	patientOrderId?: string;
	firstName?: string;
	lastName?: string;
	appointmentModalityId?: string;
	epicAppointmentFhirId?: string;
}

export type RescheduleAppointmentData = Partial<CreateAppointmentData> &
	Pick<CreateAppointmentData, 'bookingExperienceId'>;

export interface CancelAppointmentData {
	cancellationReason?: string;
}

export interface AppointmentBookingRequirementsData {
	accountId?: string;
	providerId: string;
	appointmentTypeId: string;
	appointmentSelectionTypeId?: ProviderAppointmentSelectionTypeId;
	appointmentModalityId?: string;
	date: string;
	time: string;
	epicDepartmentId?: string;
	epicAppointmentFhirId?: string;
}

export interface AppointmentBookingRequirements {
	appointmentBookingRequirementsDestinationId: AppointmentBookingRequirementsDestinationId;
	accountId: string;
	providerId: string;
	appointmentTypeId: string;
	appointmentSelectionTypeId?: ProviderAppointmentSelectionTypeId;
	screeningFlowId?: string;
	screeningRequired: boolean;
	screeningSatisfied: boolean;
	screeningSession?: ScreeningSession;
	context: Record<string, unknown>;
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
	getAppointmentBookingRequirements(data: AppointmentBookingRequirementsData) {
		return httpSingleton.orchestrateRequest<{
			appointmentBookingRequirements: AppointmentBookingRequirements;
		}>({
			method: 'post',
			url: '/appointments/booking-requirements',
			data,
		});
	},
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
	cancelAppointment(appointmentId: string, data: CancelAppointmentData = {}) {
		return httpSingleton.orchestrateRequest<void>({
			method: 'put',
			url: `/appointments/${appointmentId}/cancel`,
			data,
		});
	},
	getAppointment(appointmentId?: string) {
		if (!appointmentId) throw new Error('appointmentId is required');

		return httpSingleton.orchestrateRequest<AppointmentResponse>({
			method: 'get',
			url: `/appointments/${appointmentId}`,
		});
	},

	rescheduleAppointment(appointmentId: string, data: RescheduleAppointmentData) {
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
