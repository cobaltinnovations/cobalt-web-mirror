import { Content, GroupSessionModel, GroupSessionRequestModel, Tag } from '@/lib/models';

export enum TopicCenterDisplayStyleId {
	DEFAULT = 'DEFAULT',
	FEATURED = 'FEATURED',
}

export interface TopicCenterModel {
	name: string;
	description: string;
	topicCenterId: string;
	topicCenterRows: TopicCenterRowModel[];
	urlName: string;
	tagsByTagId: Record<string, Tag>;
	topicCenterDisplayStyleId: TopicCenterDisplayStyleId;
	featuredTitle?: string;
	featuredDescription?: string;
	featuredCallToAction?: string;
	navDescription?: string;
	imageUrl?: string;
}

export interface TopicCenterRowModel {
	contents: Content[];
	description: string;
	groupSessionRequests: GroupSessionRequestModel[];
	groupSessionRequestsDescription?: string;
	groupSessionRequestsTitle?: string;
	groupSessions: GroupSessionModel[];
	groupSessionsDescription?: string;
	groupSessionsTitle?: string;
	pinboardNotes: PinboardNoteModel[];
	title: string;
	topicCenterRowId: string;
	topicCenterRowTags: TopicCenterRowTag[];
}

export interface PinboardNoteModel {
	description: string;
	pinboardNoteId: string;
	title: string;
	url: string;
	imageUrl?: string;
}

export interface TopicCenterRowTag {
	contents: Content[];
	cta: string;
	ctaUrl: string;
	description: string;
	tagId: string;
	title: string;
	topicCenterRowTagTypeId: string;
}
