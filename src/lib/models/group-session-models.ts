import { Method } from 'axios';
import { GroupSessionSchedulingSystemId } from '../services';
import { Tag } from './tag-groups';

export enum GROUP_SESSION_STATUS_ID {
	NEW = 'NEW',
	ADDED = 'ADDED',
	ARCHIVED = 'ARCHIVED',
	CANCELED = 'CANCELED',
	DELETED = 'DELETED',
}

export enum GroupSessionLearnMoreMethodId {
	URL = 'URL',
	EMAIL = 'EMAIL',
	PHONE = 'PHONE',
}

export enum GroupSessionLocationTypeId {
	VIRTUAL = 'VIRTUAL',
	IN_PERSON = 'IN_PERSON',
}

export enum GROUP_SESSION_SORT_ORDER {
	START_TIME_DESCENDING = 'START_TIME_DESCENDING',
	START_TIME_ASCENDING = 'START_TIME_ASCENDING',
	DATE_ADDED_DESCENDING = 'DATE_ADDED_DESCENDING',
	DATE_ADDED_ASCENDING = 'DATE_ADDED_ASCENDING',
	REGISTERED_DESCENDING = 'REGISTERED_DESCENDING',
	REGISTERED_ASCENDING = 'REGISTERED_ASCENDING',
	CAPACITY_DESCENDING = 'CAPACITY_DESCENDING',
	CAPACITY_ASCENDING = 'CAPACITY_ASCENDING',
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

export interface GroupSessionCollectionModel {
	groupSessionCollectionId: string;
	title: string;
	description: string;
	displayOrder: number;
	institutionId: string;
}

export interface GroupSessionCollectionWithSessionsIncludedModel extends GroupSessionCollectionModel {
	groupSessions: GroupSessionModel[];
}

export interface GroupSessionModel {
	appointmentTimeDescription: string;
	created: string;
	createdDateDescription: string;
	createdDescription: string;
	description: string;
	durationInMinutes: number;
	durationInMinutesDescription: string;
	facilitatorEmailAddress: string;
	facilitatorName: string;
	groupSessionId: string;
	groupSessionSchedulingSystemId: GroupSessionSchedulingSystemId;
	groupSessionStatusId: string;
	groupSessionStatusIdDescription: string;
	institutionDescription: string;
	institutionId: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	screeningQuestions: string[];
	screeningQuestionsV2: ScreeningQuestionV2[];
	seats: number;
	seatsAvailable: number;
	seatsAvailableDescription: string;
	seatsDescription: string;
	seatsReserved: number;
	seatsReservedDescription: string;
	sendFollowupEmail: boolean;
	sendReminderEmail: boolean;
	singleSessionFlag: boolean;
	dateTimeDescription?: string;
	startTime: string;
	startTimeDescription: string;
	endTime: string;
	endTimeDescription: string;
	startDateTime: string;
	startDateTimeDescription: string;
	endDateTime: string;
	endDateTimeDescription: string;
	submitterAccountId: string;
	submitterEmailAddress: string;
	submitterName: string;
	tags: Tag[];
	differentEmailAddressForNotifications: boolean;
	targetEmailAddress: string;
	timeZone: string;
	title: string;
	urlName: string;
	visibleFlag: boolean;

	followupEmailContent?: string;
	followupEmailSurveyUrl?: string;
	assessmentId?: string;
	facilitatorAccountId?: string;
	scheduleUrl: string;
	imageUrl: string;
	groupSessionLocationTypeId: GroupSessionLocationTypeId;
	videoconferenceUrl: string;
	inPersonLocation: string;
	confirmationEmailContent: string;

	followupDayOffset?: string;
	followupTimeOfDay?: string;
	groupSessionCollectionId?: string;
	groupSessionLearnMoreMethodId?: GroupSessionLearnMoreMethodId;
	learnMoreDescription?: string;
	reminderEmailContent?: string;
	screeningFlowId: string;
}

export interface GroupSessionUrlNameValidationResult {
	available: boolean;
	recommendation: string;
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
