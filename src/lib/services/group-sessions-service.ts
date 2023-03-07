import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	PresignedUploadModel,
	GroupSessionModel,
	GroupSessionRequestModel,
	GroupSessionReservationModel,
	GROUP_SESSION_STATUS_ID,
	GROUP_SESSION_SORT_ORDER,
	GroupSessionCountModel,
	GroupSessionResponseModel,
	AccountModel,
	GroupTopic,
} from '@/lib/models';

// Scheduled
interface GetPresignedUploadUrlRequestBody {
	contentType: string;
	filename: string;
}

interface GetPresignedUploadUrlResponseBody {
	presignedUpload: PresignedUploadModel;
}

export enum GroupSessionSchedulingSystemId {
	COBALT = 'COBALT',
	EXTERNAL = 'EXTERNAL',
}

export interface CreateGroupSessionRequestBody {
	submitterName: string;
	submitterEmailAddress: string;
	facilitatorAccountId: string | null;
	facilitatorName: string;
	facilitatorEmailAddress: string;
	title: string;
	description: string;
	urlName: string;
	startDateTime: string;
	endDateTime: string;
	seats?: number | null;
	imageUrl?: string;
	videoconferenceUrl?: string | null;
	screeningQuestions?: string[];
	screeningQuestionsV2?: {
		fontSizeId: string;
		question: string;
	}[];
	confirmationEmailContent?: string;
	groupSessionSchedulingSystemId?: GroupSessionSchedulingSystemId;
	scheduleUrl?: string | null;
	sendFollowupEmail: boolean;
	followupEmailContent?: string;
	followupEmailSurveyUrl?: string;
}

interface CreateGroupSessionResponseBody {
	groupSession: GroupSessionModel;
}

interface GetGroupSessionsQueryParameters {
	pageNumber?: number;
	pageSize?: number;
	viewType?: 'ADMINISTRATOR' | 'PATIENT';
	groupSessionStatusId?: GROUP_SESSION_STATUS_ID;
	orderBy?: GROUP_SESSION_SORT_ORDER;
	urlName?: string;
	searchQuery?: string;
}

interface GetGroupSessionsResponseBody {
	totalCountDescription: string;
	totalCount: number;
	groupSessions: GroupSessionModel[];
}

interface GetGroupSessionByIdResponseBody {
	groupSession: GroupSessionModel;
	groupSessionReservation?: GroupSessionReservationModel;
}

interface GetGroupSessionReservationsByIdResponseBody {
	groupSessionReservations: GroupSessionReservationModel[];
}

interface UpdateGroupSessionStatusByIdResponseBody {
	groupSession: GroupSessionModel;
}

interface ReserveGroupSessionResponseBody {
	groupSessionReservation: GroupSessionReservationModel;
	account: AccountModel;
}

interface GetGroupSessionCountsResponseBody {
	groupSessionCounts: GroupSessionCountModel[];
}

// By-request
export interface CreateGroupSessionRequestRequestBody {
	facilitatorAccountId: string | null;
	facilitatorName: string;
	facilitatorEmailAddress: string;
	title: string;
	description: string;
	urlName: string;
	imageUrl?: string;
	customQuestion1?: string;
	customQuestion2?: string;
}

interface GetGroupSessionRequestsResponseBody {
	totalCountDescription: string;
	totalCount: number;
	groupSessionRequests: GroupSessionRequestModel[];
}
interface GetGroupSessionRequestsQueryParameters {
	pageNumber?: number;
	pageSize?: number;
	viewType?: 'ADMINISTRATOR' | 'PATIENT';
	groupSessionRequestStatusId?: GROUP_SESSION_STATUS_ID;
	urlName?: string;
	searchQuery?: string;
}

interface GetGroupSessionRequestByIdResponseBody {
	groupSessionRequest: GroupSessionRequestModel;
}

interface UpdateGroupSessionRequestStatusByIdResponseBody {
	groupSessionRequest: GroupSessionRequestModel;
}
interface SignUpForGroupSessionRequestRequestBody {
	groupSessionRequestId: string;
	respondentName: string;
	respondentEmailAddress: string;
	respondentPhoneNumber?: string;
	suggestedDate?: string;
	suggestedTime?: string;
	expectedParticipants: string;
	notes?: string;
	customAnswer1?: string;
	customAnswer2?: string;
}
interface SignUpForGroupSessionRequestResponseBody {
	groupSessionResponse: GroupSessionResponseModel;
}

export const groupSessionsService = {
	// Scheduled
	getPresignedUploadUrl(data: GetPresignedUploadUrlRequestBody) {
		return httpSingleton.orchestrateRequest<GetPresignedUploadUrlResponseBody>({
			method: 'post',
			url: '/group-sessions/image-presigned-upload',
			data,
		});
	},
	createGroupSession(data: CreateGroupSessionRequestBody) {
		return httpSingleton.orchestrateRequest<CreateGroupSessionResponseBody>({
			method: 'post',
			url: '/group-sessions',
			data,
		});
	},
	updateGroupsession(groupSessionId: string, data: CreateGroupSessionRequestBody) {
		return httpSingleton.orchestrateRequest<CreateGroupSessionResponseBody>({
			method: 'put',
			url: `/group-sessions/${groupSessionId}`,
			data,
		});
	},
	getGroupSessions(queryParameters?: GetGroupSessionsQueryParameters) {
		let queryString;
		let url = '/group-sessions';

		if (queryParameters) {
			queryString = new URLSearchParams(queryParameters as Record<string, string>);
		}

		if (queryString) {
			url = url.concat(`?${queryString}`);
		}

		return httpSingleton.orchestrateRequest<GetGroupSessionsResponseBody>({
			method: 'get',
			url,
		});
	},
	getGroupSessionById(groupSessionId: string) {
		return httpSingleton.orchestrateRequest<GetGroupSessionByIdResponseBody>({
			method: 'get',
			url: `/group-sessions/${groupSessionId}`,
		});
	},
	getGroupSessionReservationsById(groupSessionId: string) {
		return httpSingleton.orchestrateRequest<GetGroupSessionReservationsByIdResponseBody>({
			method: 'get',
			url: `/group-session-reservations?groupSessionId=${groupSessionId}`,
		});
	},
	updateGroupSessionStatusById(groupSessionId: string, groupSessionStatusId: 'ADDED' | 'CANCELED' | 'DELETED') {
		return httpSingleton.orchestrateRequest<UpdateGroupSessionStatusByIdResponseBody>({
			method: 'put',
			url: `/group-sessions/${groupSessionId}/status`,
			data: { groupSessionStatusId },
		});
	},
	isGroupSession(event: GroupSessionModel | GroupSessionRequestModel): event is GroupSessionModel {
		return typeof (event as GroupSessionModel).groupSessionId !== 'undefined';
	},
	reserveGroupSession(groupSessionId: string, emailAddress: string) {
		return httpSingleton.orchestrateRequest<ReserveGroupSessionResponseBody>({
			method: 'post',
			url: `/group-session-reservations`,
			data: {
				groupSessionId,
				emailAddress,
			},
		});
	},
	cancelGroupSessionReservation(groupSessionReservationId: string) {
		return httpSingleton.orchestrateRequest<any>({
			method: 'put',
			url: `/group-session-reservations/${groupSessionReservationId}/cancel`,
		});
	},
	getGroupSessionCounts() {
		return httpSingleton.orchestrateRequest<GetGroupSessionCountsResponseBody>({
			method: 'get',
			url: '/group-sessions/counts',
		});
	},
	getGroupSessionCountByStatusId(
		groupSessionCounts: GroupSessionCountModel[],
		groupSessionStatusId: GROUP_SESSION_STATUS_ID
	) {
		if (!groupSessionCounts) {
			return 0;
		}

		const desiredGroupSessionCount = groupSessionCounts.find((groupSessionCount) => {
			return groupSessionCount.groupSessionStatusId === groupSessionStatusId;
		});

		return desiredGroupSessionCount?.totalCount;
	},

	// By-request
	getPresignedUploadUrlForRequest(data: GetPresignedUploadUrlRequestBody) {
		return httpSingleton.orchestrateRequest<GetPresignedUploadUrlResponseBody>({
			method: 'post',
			url: '/group-session-requests/image-presigned-upload',
			data,
		});
	},
	createGroupSessionRequest(data: CreateGroupSessionRequestRequestBody) {
		return httpSingleton.orchestrateRequest<CreateGroupSessionResponseBody>({
			method: 'post',
			url: '/group-session-requests',
			data,
		});
	},
	updateGroupSessionRequest(groupSessionRequestId: string, data: CreateGroupSessionRequestRequestBody) {
		return httpSingleton.orchestrateRequest<CreateGroupSessionResponseBody>({
			method: 'put',
			url: `/group-session-requests/${groupSessionRequestId}`,
			data,
		});
	},
	getGroupSessionRequests(queryParameters?: GetGroupSessionRequestsQueryParameters) {
		let queryString;
		let url = '/group-session-requests';

		if (queryParameters) {
			queryString = new URLSearchParams(queryParameters as Record<string, string>);
		}

		if (queryString) {
			url = url.concat(`?${queryString}`);
		}

		return httpSingleton.orchestrateRequest<GetGroupSessionRequestsResponseBody>({
			method: 'get',
			url,
		});
	},
	getGroupSessionRequestById(groupSessionRequestId: string) {
		return httpSingleton.orchestrateRequest<GetGroupSessionRequestByIdResponseBody>({
			method: 'get',
			url: `/group-session-requests/${groupSessionRequestId}`,
		});
	},
	updateGroupSessionRequestStatusById(
		groupSessionRequestId: string,
		groupSessionRequestStatusId: 'ADDED' | 'ARCHIVED' | 'DELETED'
	) {
		return httpSingleton.orchestrateRequest<UpdateGroupSessionRequestStatusByIdResponseBody>({
			method: 'put',
			url: `/group-session-requests/${groupSessionRequestId}/status`,
			data: { groupSessionRequestStatusId },
		});
	},
	isGroupSessionByRequest(event: GroupSessionModel | GroupSessionRequestModel): event is GroupSessionRequestModel {
		return typeof (event as GroupSessionRequestModel).groupSessionRequestId !== 'undefined';
	},
	signUpForGroupSessionRequest(data: SignUpForGroupSessionRequestRequestBody) {
		return httpSingleton.orchestrateRequest<SignUpForGroupSessionRequestResponseBody>({
			method: 'post',
			url: `/group-session-responses`,
			data,
		});
	},
	getGroupTopics() {
		return httpSingleton.orchestrateRequest<{ groupTopics: GroupTopic[] }>({
			method: 'GET',
			url: '/group-topics',
		});
	},
	postGroupRequest(data: {
		requestorName: string;
		requestorEmailAddress: string;
		preferredDateDescription?: string;
		preferredTimeDescription?: string;
		minimumAttendeeCount: number;
		maximumAttendeeCount?: number;
		additionalDescription?: string;
		otherGroupTopicsDescription?: string;
		groupTopicIds: string[];
	}) {
		return httpSingleton.orchestrateRequest<any>({
			method: 'POST',
			url: '/group-requests',
			data,
		});
	},
};
