import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	GroupSessionModel,
	GroupSessionRequestModel,
	GroupSessionReservationModel,
	GROUP_SESSION_STATUS_ID,
	GroupSessionCountModel,
	GroupSessionResponseModel,
	AccountModel,
	GroupTopic,
	GroupSessionCollectionModel,
	GroupSessionLearnMoreMethodId,
	GroupSessionUrlNameValidationResult,
	GroupSessionCollectionWithSessionsIncludedModel,
	PresignedUploadResponse,
	CONTENT_VISIBILITY_TYPE_ID,
} from '@/lib/models';

// Scheduled
interface GetPresignedUploadUrlRequestBody {
	contentType: string;
	filename: string;
}

export enum GroupSessionSchedulingSystemId {
	COBALT = 'COBALT',
	EXTERNAL = 'EXTERNAL',
}

export interface CreateGroupSessionRequestBody {
	facilitatorName?: string;
	facilitatorEmailAddress?: string;
	differentEmailAddressForNotifications?: boolean;
	targetEmailAddress?: string;
	title?: string;
	description?: string;
	urlName?: string;
	startDateTime?: string;
	endDateTime?: string;
	seats?: number;
	imageUrl?: string;
	videoconferenceUrl?: string;
	confirmationEmailContent?: string;
	groupSessionSchedulingSystemId?: GroupSessionSchedulingSystemId;
	groupSessionStatusId?: GROUP_SESSION_STATUS_ID;
	sendFollowupEmail?: boolean;
	followupEmailContent?: string;
	followupEmailSurveyUrl?: string;
	groupSessionCollectionId?: string;
	contentVisibilityTypeId?: CONTENT_VISIBILITY_TYPE_ID;
	screeningFlowId?: string;
	sendReminderEmail?: boolean;
	reminderEmailContent?: string;
	followupDayOffset?: string;
	followupTimeOfDay?: string;
	singleSessionFlag?: boolean;
	dateTimeDescription?: string;
	groupSessionLearnMoreMethodId?: GroupSessionLearnMoreMethodId;
	learnMoreDescription?: string;
	tagIds?: string[];
	registrationEndDateTime?: string;
}

interface CreateGroupSessionResponseBody {
	groupSession: GroupSessionModel;
}

export interface GetGroupSessionsQueryParameters {
	pageNumber?: number;
	pageSize?: number;
	viewType?: 'ADMINISTRATOR' | 'PATIENT';
	groupSessionStatusId?: string;
	orderBy?: string;
	urlName?: string;
	searchQuery?: string;
	groupSessionCollectionId?: string;
	groupSessionCollectionUrlName?: string;
	groupSessionSchedulingSystemId?: string;
	contentVisibilityTypeId?: CONTENT_VISIBILITY_TYPE_ID;
}

export interface GetGroupSessionsResponseBody {
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

export interface GetGroupSessionCountsResponseBody {
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

interface GroupSessionCollectionsResponse {
	groupSessionCollections: GroupSessionCollectionModel[];
}

interface GroupSessionCollectionsWithSessionsIncludedResponse {
	groupSessionCollections: GroupSessionCollectionWithSessionsIncludedModel[];
}

export const groupSessionsService = {
	getGroupSessionCollections() {
		return httpSingleton.orchestrateRequest<GroupSessionCollectionsResponse>({
			method: 'get',
			url: '/group-session-collections',
		});
	},

	getGroupSessionCollectionsWithSessionsIncluded() {
		return httpSingleton.orchestrateRequest<GroupSessionCollectionsWithSessionsIncludedResponse>({
			method: 'get',
			url: '/group-sessions/collections',
		});
	},

	validateUrlName(searchQuery: string, groupSessionId?: string) {
		const params = new URLSearchParams({
			searchQuery,
		});

		if (groupSessionId) {
			params.set('groupSessionId', groupSessionId);
		}

		return httpSingleton.orchestrateRequest<{
			groupSessionUrlNameValidationResult: GroupSessionUrlNameValidationResult;
		}>({
			method: 'get',
			url: '/group-sessions/validate-url-name?' + params.toString(),
		});
	},

	// Scheduled
	getPresignedUploadUrl(data: GetPresignedUploadUrlRequestBody) {
		return httpSingleton.orchestrateRequest<PresignedUploadResponse>({
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
	getGroupSessionByIdOrUrlName(groupSessionIdOrUrlName: string) {
		return httpSingleton.orchestrateRequest<GetGroupSessionByIdResponseBody>({
			method: 'get',
			url: `/group-sessions/${groupSessionIdOrUrlName}`,
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
	reserveGroupSession(groupSessionId: string) {
		return httpSingleton.orchestrateRequest<ReserveGroupSessionResponseBody>({
			method: 'post',
			url: `/group-session-reservations`,
			data: {
				groupSessionId,
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
		return httpSingleton.orchestrateRequest<PresignedUploadResponse>({
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
	postGroupSuggestion(data: { emailAddress: string; title: string; description: string }) {
		return httpSingleton.orchestrateRequest<any>({
			method: 'POST',
			url: '/group-suggestions',
			data,
		});
	},
};
