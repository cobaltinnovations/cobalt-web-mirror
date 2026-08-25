import {
	ATTENDANCE_STATUS_ID,
	CareEncounterAttendanceStatusModel,
	CareEncounterCancellationReasonId,
	CareEncounterCancellationReasonModel,
	CareEncounterAssignmentScopeId,
	CareEncounterListModel,
	CareEncounterModel,
	CareEncounterNoteModel,
	CareEncounterScheduledMessageModel,
	CareEncounterScheduledMessageTypeId,
	CareEncounterScheduledMessageTypeModel,
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
	careEncounterHistory: CareEncounterListModel[];
	careEncounterHistoryTotalCount: number;
	careEncounterHistoryTotalCountDescription: string;
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
	notesEditable: boolean;
}

export interface CareEncounterNoteRequestBody {
	note: string;
}

export interface CareEncounterNoteResponseBody {
	careEncounterNote: CareEncounterNoteModel;
}

export interface GetCareEncounterScheduledMessageTypesResponseBody {
	careEncounterScheduledMessageTypes: CareEncounterScheduledMessageTypeModel[];
}

export interface CareEncounterScheduledMessageRequestBody {
	careEncounterScheduledMessageTypeId: CareEncounterScheduledMessageTypeId;
	scheduledAtDate: string;
	scheduledAtTime: string;
	customEmailText: string;
}

export type PreviewCareEncounterScheduledMessageRequestBody = Pick<
	CareEncounterScheduledMessageRequestBody,
	'careEncounterScheduledMessageTypeId' | 'customEmailText'
>;

export interface CareEncounterScheduledMessagePreviewModel {
	emailSubject: string;
	emailContentHtml: string;
	emailBody: string;
}

export interface PreviewCareEncounterScheduledMessageResponseBody {
	careEncounterScheduledMessagePreview: CareEncounterScheduledMessagePreviewModel;
}

export interface CareEncounterScheduledMessageResponseBody {
	careEncounterScheduledMessage: CareEncounterScheduledMessageModel;
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
	getCareEncounterScheduledMessageTypes() {
		return httpSingleton.orchestrateRequest<GetCareEncounterScheduledMessageTypesResponseBody>({
			method: 'get',
			url: '/admin/care-encounter-scheduled-message-types',
		});
	},
	previewCareEncounterScheduledMessage(
		careEncounterId: string,
		data: PreviewCareEncounterScheduledMessageRequestBody
	) {
		return httpSingleton.orchestrateRequest<PreviewCareEncounterScheduledMessageResponseBody>({
			method: 'post',
			url: `/admin/care-encounters/${careEncounterId}/scheduled-messages/preview`,
			data,
		});
	},
	createCareEncounterScheduledMessage(careEncounterId: string, data: CareEncounterScheduledMessageRequestBody) {
		return httpSingleton.orchestrateRequest<CareEncounterScheduledMessageResponseBody>({
			method: 'post',
			url: `/admin/care-encounters/${careEncounterId}/scheduled-messages`,
			data,
		});
	},
	updateCareEncounterScheduledMessage(
		careEncounterId: string,
		careEncounterScheduledMessageId: string,
		data: CareEncounterScheduledMessageRequestBody
	) {
		return httpSingleton.orchestrateRequest<CareEncounterScheduledMessageResponseBody>({
			method: 'put',
			url: `/admin/care-encounters/${careEncounterId}/scheduled-messages/${careEncounterScheduledMessageId}`,
			data,
		});
	},
	deleteCareEncounterScheduledMessage(careEncounterId: string, careEncounterScheduledMessageId: string) {
		return httpSingleton.orchestrateRequest<CareEncounterScheduledMessageResponseBody>({
			method: 'delete',
			url: `/admin/care-encounters/${careEncounterId}/scheduled-messages/${careEncounterScheduledMessageId}`,
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
	deleteCareEncounterNote(careEncounterId: string, careEncounterNoteId: string) {
		return httpSingleton.orchestrateRequest<void>({
			method: 'delete',
			url: `/admin/care-encounters/${careEncounterId}/notes/${careEncounterNoteId}`,
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
