import { Method } from 'axios';
import { GroupSessionSchedulingSystemId } from '../services';

export enum GROUP_SESSION_STATUS_ID {
	NEW = 'NEW',
	ADDED = 'ADDED',
	ARCHIVED = 'ARCHIVED',
	CANCELED = 'CANCELED',
	DELETED = 'DELETED',
}

export enum GROUP_SESSION_SORT_ORDER {
	START_TIME_ASCENDING = 'START_TIME_ASCENDING',
}

export interface PresignedUploadModel {
	httpMethod: Method;
	url: string;
	accessUrl: string;
	contentType: string;
	expirationTimestamp: string;
	expirationTimestampDescription: string;
	httpHeaders: Record<string, string>;
}

export interface ScreeningQuestionV2 {
	questionId: string;
	fontSizeId: string;
	question: string;
}

export interface GroupSessionModel {
	assessmentId?: string;
	groupSessionId: string;
	groupSessionSchedulingSystemId: GroupSessionSchedulingSystemId;
	institutionId: string;
	groupSessionStatusId: string;
	groupSessionStatusIdDescription: string;
	title: string;
	description: string;
	urlName: string;
	facilitatorAccountId?: string;
	facilitatorName: string;
	facilitatorEmailAddress: string;
	startDateTime: string;
	startDateTimeDescription: string;
	endDateTime: string;
	endDateTimeDescription: string;
	appointmentTimeDescription: string;
	durationInMinutes: number;
	durationInMinutesDescription: string;
	scheduleUrl: string;
	seats?: number;
	seatsDescription?: string;
	seatsAvailable?: number;
	seatsAvailableDescription?: string;
	seatsReserved?: number;
	seatsReservedDescription?: string;
	timeZone: string;
	imageUrl: string;
	videoconferenceUrl: string;
	screeningQuestions: string[];
	screeningQuestionsV2: ScreeningQuestionV2[];
	confirmationEmailContent: string;
	created: string;
	createdDescription: string;
	createdDateDescription: string;
	sendFollowupEmail: boolean;
	followupEmailContent?: string;
	followupEmailSurveyUrl?: string;
}

export interface GroupSessionRequestModel {
	groupSessionRequestId: string;
	institutionId: string;
	groupSessionRequestStatusId: string;
	groupSessionRequestStatusIdDescription: string;
	title: string;
	description: string;
	urlName: string;
	facilitatorName: string;
	facilitatorEmailAddress: string;
	imageUrl?: string;
	customQuestion1?: string;
	customQuestion2?: string;
	created: string;
	createdDescription: string;
	createdDateDescription: string;
}

export interface GroupSessionReservationModel {
	groupSessionReservationId: string;
	groupSessionId: string;
	accountId: string;
	name?: string;
	emailAddress: string;
	canceled: boolean;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
}

export interface GroupSessionCountModel {
	groupSessionStatusId: GROUP_SESSION_STATUS_ID;
	groupSessionStatusIdDescription: string;
	totalCount: number;
	totalCountDescription: string;
}

export interface GroupSessionResponseModel {
	groupSessionResponseId: string;
	groupSessionRequestId: string;
	respondentAccountId: string;
	respondentName: string;
	respondentEmailAddress: string;
	respondentPhoneNumber: string;
	respondentPhoneNumberDescription: string;
	suggestedDate: string;
	suggestedDateDescription: string;
	suggestedTime: string;
	expectedParticipants: string;
	notes: string;
	customAnswer1?: string;
	customAnswer2?: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
}

export interface GroupTopic {
	groupTopicId: string;
	name: string;
	description: string;
}
