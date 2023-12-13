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
	AVAILABLE = 'AVAILABLE',
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
	actions: AdminContentAction[];
	author: string;
	callToAction: string;
	contentId: string;
	contentStatusId: ContentStatusId;
	contentTypeDescription: string;
	contentTypeId: ContentTypeId;
	dateCreated: string;
	dateCreatedDescription: string;
	description: string;
	duration?: string;
	durationInMinutes?: number;
	durationInMinutesDescription?: string;
	imageUrl: string;
	inUseCount: number;
	inUseInstitutionDescription: string;
	isEditable: boolean;
	newFlag: boolean;
	ownerInstitution: string;
	publishEndDate: string;
	publishEndDateDescription: string;
	publishStartDate: string;
	publishStartDateDescription: string;
	sharedFlag: boolean;
	tagIds: string[];
	tags: Tag[];
	title: string;
	url: string;
	fileUploadId: string;
	views: number;

	// Not seeing in response, but don't remove yet
	publishRecurring: boolean;
	searchTerms: string;
	contentStatusDescription: string;
};
