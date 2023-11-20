import { Tag } from './tag-groups';

export enum ContentTypeId {
	INT_BLOG = 'INT_BLOG',
	EXT_BLOG = 'EXT_BLOG',
	VIDEO = 'VIDEO',
	AUDIO = 'AUDIO',
	ARTICLE = 'ARTICLE',
	WORKSHEET = 'WORKSHEET',
	PODCAST = 'PODCAST',
	APP = 'APP',
}

export enum ContentStatusId {
	DRAFT = 'DRAFT',
	SCHEDULED = 'SCHEDULED',
	LIVE = 'LIVE',
	EXPIRED = 'EXPIRED',
}

export interface ContentStatus {
	contentStatusId: ContentStatusId;
	description: string;
}

export interface ContentType {
	callToAction: string;
	contentTypeId: ContentTypeId;
	description: string;
}

export interface ContentDuration {
	contentDurationId: string;
	description: string;
}

export enum AdminContentAction {
	EDIT = 'EDIT',
	DELETE = 'DELETE',
	ARCHIVE = 'ARCHIVE',
	UNARCHIVE = 'UNARCHIVE',
	REMOVE = 'REMOVE',
	ADD = 'ADD',
	VIEW_ON_COBALT = 'VIEW_ON_COBALT',
	EXPIRE = 'EXPIRE',
	UNEXPIRE = 'UNEXPIRE',
}

export type Content = {
	contentId: string;
	contentTypeId: ContentTypeId;
	title: string;
	url: string;
	imageUrl: string;
	description: string;
	author: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	contentTypeDescription: string;
	callToAction: string;
	newFlag: boolean;
	duration: string;
	durationInMinutes: number;
	durationInMinutesDescription: string;
	tagIds: string[];
	tags?: Tag[];
};

export type AdminContent = {
	contentId: string;
	contentTypeId: ContentTypeId;
	title: string;
	author: string;
	description: string;
	url: string;
	imageUrl: string;
	ownerInstitution: string;
	views: number;
	duration?: string;
	durationInMinutes?: number;
	durationInMinutesDescription?: string;
	publishStartDate: string;
	publishStartDateDescription: string;
	publishEndDate: string;
	publishEndDateDescription: string;
	dateCreated: string;
	dateCreatedDescription: string;
	publishRecurring: boolean;
	searchTerms: string;
	sharedFlag: boolean;
	contentStatusId: ContentStatusId;
	contentStatusDescription: string;
	actions: AdminContentAction[];
	tagIds: string[];
	contentTypeDescription: string;
	inUseCount: number;
	inUseInstitutionDescription: string;
	newFlag: boolean;
};
