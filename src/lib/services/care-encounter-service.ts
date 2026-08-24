import {
	ATTENDANCE_STATUS_ID,
	CareEncounterAttendanceStatusModel,
	CareEncounterCancellationReasonId,
	CareEncounterCancellationReasonModel,
	CareEncounterAssignmentScopeId,
	CareEncounterListModel,
	CareEncounterModel,
	CareEncounterNoteModel,
	CareEncounterSortColumnId,
	CareEncounterStatusId,
	SortDirectionId,
} from '@/lib/models';
import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';

export interface GetCareEncountersQueryParameters {
	pageNumber?: number;
	pageSize?: number;
	startDate?: string;
	endDate?: string;
	searchQuery?: string;
	careEncounterStatusId?: CareEncounterStatusId;
	careEncounterAssignmentScopeId?: CareEncounterAssignmentScopeId;
	careEncounterSortColumnId?: CareEncounterSortColumnId;
	sortDirectionId?: SortDirectionId;
}

export interface GetCareEncountersResponseBody {
	totalCount: number;
	totalCountDescription: string;
	careEncounters: CareEncounterListModel[];
}

export interface GetCareEncounterResponseBody {
	careEncounter: CareEncounterModel;
	otherCareEncounters: CareEncounterListModel[];
	otherCareEncountersTotalCount: number;
	otherCareEncountersTotalCountDescription: string;
}

export interface CareEncounterResponseBody {
	careEncounter: CareEncounterModel;
}

export interface CreateCareEncounterRequestBody {
	appointmentId: string;
}

export interface UpdateCareEncounterRequestBody {
	emailAddress?: string;
}

export interface GetCareEncounterNotesResponseBody {
	careEncounterNotes: CareEncounterNoteModel[];
}

export interface CareEncounterNoteRequestBody {
	note: string;
}

export interface CareEncounterNoteResponseBody {
	careEncounterNote: CareEncounterNoteModel;
}

export interface AssignCareEncounterRequestBody {
	careNavigatorAccountId?: string | null;
}

export interface GetCareEncounterCancellationReasonsResponseBody {
	careEncounterCancellationReasons: CareEncounterCancellationReasonModel[];
}

export interface GetCareEncounterAttendanceStatusesResponseBody {
	attendanceStatuses: CareEncounterAttendanceStatusModel[];
}

export interface CancelCareEncounterRequestBody {
	careEncounterCancellationReasonId: CareEncounterCancellationReasonId;
	careEncounterCancellationReasonOtherText?: string;
}

export interface CancelCareEncounterAppointmentRequestBody {
	cancellationReason: string;
}

export interface ChangeCareEncounterAppointmentAttendanceStatusRequestBody {
	attendanceStatusId: ATTENDANCE_STATUS_ID;
}

export const careEncounterService = {
	getCareEncounters(queryParameters?: GetCareEncountersQueryParameters) {
		return httpSingleton.orchestrateRequest<GetCareEncountersResponseBody>({
			method: 'get',
			url: buildQueryParamUrl('/admin/care-encounters', queryParameters),
		});
	},
	getCareEncounter(careEncounterId: string) {
		return httpSingleton.orchestrateRequest<GetCareEncounterResponseBody>({
			method: 'get',
			url: `/admin/care-encounters/${careEncounterId}`,
		});
	},
	getCareEncounterNotes(careEncounterId: string) {
		return httpSingleton.orchestrateRequest<GetCareEncounterNotesResponseBody>({
			method: 'get',
			url: `/admin/care-encounters/${careEncounterId}/notes`,
		});
	},
	createCareEncounterNote(careEncounterId: string, data: CareEncounterNoteRequestBody) {
		return httpSingleton.orchestrateRequest<CareEncounterNoteResponseBody>({
			method: 'post',
			url: `/admin/care-encounters/${careEncounterId}/notes`,
			data,
		});
	},
	updateCareEncounterNote(careEncounterId: string, careEncounterNoteId: string, data: CareEncounterNoteRequestBody) {
		return httpSingleton.orchestrateRequest<CareEncounterNoteResponseBody>({
			method: 'put',
			url: `/admin/care-encounters/${careEncounterId}/notes/${careEncounterNoteId}`,
			data,
		});
	},
	createCareEncounter(data: CreateCareEncounterRequestBody) {
		return httpSingleton.orchestrateRequest<CareEncounterResponseBody>({
			method: 'post',
			url: '/admin/care-encounters',
			data,
		});
	},
	updateCareEncounter(careEncounterId: string, data: UpdateCareEncounterRequestBody) {
		return httpSingleton.orchestrateRequest<CareEncounterResponseBody>({
			method: 'put',
			url: `/admin/care-encounters/${careEncounterId}`,
			data,
		});
	},
	closeCareEncounter(careEncounterId: string) {
		return httpSingleton.orchestrateRequest<CareEncounterResponseBody>({
			method: 'put',
			url: `/admin/care-encounters/${careEncounterId}/close`,
		});
	},
	assignCareEncounter(careEncounterId: string, data: AssignCareEncounterRequestBody) {
		return httpSingleton.orchestrateRequest<CareEncounterResponseBody>({
			method: 'put',
			url: `/admin/care-encounters/${careEncounterId}/assignment`,
			data,
		});
	},
	getCareEncounterCancellationReasons() {
		return httpSingleton.orchestrateRequest<GetCareEncounterCancellationReasonsResponseBody>({
			method: 'get',
			url: '/admin/care-encounter-cancellation-reasons',
		});
	},
	getCareEncounterAttendanceStatuses() {
		return httpSingleton.orchestrateRequest<GetCareEncounterAttendanceStatusesResponseBody>({
			method: 'get',
			url: '/admin/care-encounter-attendance-statuses',
		});
	},
	changeCareEncounterAppointmentAttendanceStatus(
		careEncounterId: string,
		appointmentId: string,
		data: ChangeCareEncounterAppointmentAttendanceStatusRequestBody
	) {
		return httpSingleton.orchestrateRequest<CareEncounterResponseBody>({
			method: 'put',
			url: `/admin/care-encounters/${careEncounterId}/appointments/${appointmentId}/attendance-status`,
			data,
		});
	},
	cancelCareEncounter(careEncounterId: string, data: CancelCareEncounterRequestBody) {
		return httpSingleton.orchestrateRequest<CareEncounterResponseBody>({
			method: 'put',
			url: `/admin/care-encounters/${careEncounterId}/cancel`,
			data,
		});
	},
	cancelCareEncounterAppointment(
		careEncounterId: string,
		appointmentId: string,
		data: CancelCareEncounterAppointmentRequestBody
	) {
		return httpSingleton.orchestrateRequest<CareEncounterResponseBody>({
			method: 'put',
			url: `/admin/care-encounters/${careEncounterId}/appointments/${appointmentId}/cancel`,
			data,
		});
	},
	deleteCareEncounter(careEncounterId: string) {
		return httpSingleton.orchestrateRequest<void>({
			method: 'delete',
			url: `/admin/care-encounters/${careEncounterId}`,
		});
	},
};
