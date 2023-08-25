// https://github.com/Penn-Medicine-CHCI/cobalt-api/blob/master/src/main/java/com/cobaltplatform/api/model/db/ContentType.java
import { InstitutionFilters } from '@/lib/services';

export enum ContentTypeId {
	InternalBlog = 'INT_BLOG',
	ExternalBlog = 'EXT_BLOG',
	Video = 'VIDEO',
	Audio = 'AUDIO',
	Article = 'ARTICLE',
	Worksheet = 'WORKSHEET',
	Podcast = 'PODCAST',
	App = 'APP',
}

export enum ContentTypeIdLabel {
	INT_BLOG = 'Internal Blog',
	EXT_BLOG = 'External Blog',
	VIDEO = 'Video',
	AUDIO = 'Audio',
	ARTICLE = 'Article',
	WORKSHEET = 'Worksheet',
	PODCAST = 'Podcast',
	APP = 'App',
}

export enum ContentApprovalStatusId {
	Pending = 'PENDING',
	Approved = 'APPROVED',
	Rejected = 'REJECTED',
	Archived = 'ARCHIVED',
}

export enum ContentAvailableStatusId {
	Available = 'AVAILABLE',
	Added = 'ADDED',
}

export enum ContentVisibilityTypeId {
	Private = 'PRIVATE',
	Network = 'NETWORK',
	Public = 'PUBLIC',
}

interface InternalBlog {
	contentTypeId: ContentTypeId.InternalBlog;
	url?: never;
	dateCreated?: never;
	duration?: never;
}

interface Article {
	contentTypeId: ContentTypeId.Article;
	url: string;
	dateCreated: string;
	dateCreatedDescription: string;
	duration: string;
}

interface Video {
	contentTypeId: ContentTypeId.Video;
	url: string;
	dateCreated: string;
	dateCreatedDescription: string;
	duration: string;
}

interface Podcast {
	contentTypeId: ContentTypeId.Podcast;
	url: string;
	dateCreated?: never;
	dateCreatedDescription?: never;
	duration: string;
}

export interface ContentVisibility {
	contentVisibilityId: string;
	contentId: string;
	visibilityId: ContentVisibilityTypeId;
	approvalStatusId: ContentApprovalStatusId;
	description: string;
}

export enum AdminContentActions {
	VIEW = 'VIEW',
	EDIT = 'EDIT',
	APPROVE = 'APPROVE',
	REJECT = 'REJECT',
	DELETE = 'DELETE',
	ADD = 'ADD',
	REMOVE = 'REMOVE',
	ARCHIVE = 'ARCHIVE',
	UNARCHIVE = 'UNARCHIVE',
}

export type Content = {
	contentId: string;
	contentTypeId: ContentTypeId;
	contentTypeDescription: string;
	contentTypeLabelId: string;
	contentTypeLabel: string;
	title: string;
	imageUrl: string;
	description: string;
	author: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	callToAction: string;
	newFlag: boolean;
	contentApprovalStatusId?: ContentApprovalStatusId;
	url: string;
	selectedNetworkInstitutions?: InstitutionFilters[];
	contentTagIds?: string[];
	tagIds: string[];
	visibilityId: ContentVisibilityTypeId;
	visibleToOtherInstitutions?: boolean;
} & (InternalBlog | Article | Video | Podcast);

export type AdminContentRow = {
	actions: AdminContentActions[];
	author: string;
	contentId: string;
	contentTypeId: ContentTypeId;
	dateCreated: string;
	dateCreatedDescription: string;
	description: string;
	imageUrl: string;
	otherInstitutionApprovalStatus: {
		approvalStatusId: ContentApprovalStatusId;
		description: string;
	};
	ownerInstitution: string;
	ownerInstitutionApprovalStatus: {
		approvalStatusId: ContentApprovalStatusId;
		description: string;
	};
	title: string;
	url: string;
	views?: number;
	visibilityId?: ContentVisibility[];
	visibleToOtherInstitutions: false;
	availableStatusId?: ContentAvailableStatusId;
	approvalStatusId?: ContentApprovalStatusId;
	durationMinutes?: '';
} & Content;
