import { GroupSessionModel, GroupSessionRequestModel, ResourceLibraryContentModel, TagModel } from '@/lib/models';

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
	tagsByTagId: Record<string, TagModel>;
	topicCenterDisplayStyleId: TopicCenterDisplayStyleId;
	featuredTitle?: string;
	featuredDescription?: string;
	featuredCallToAction?: string;
	imageUrl?: string;
}

export interface TopicCenterRowModel {
	contents: ResourceLibraryContentModel[];
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
	contents: ResourceLibraryContentModel[];
	cta: string;
	ctaUrl: string;
	description: string;
	tagId: string;
	title: string;
	topicCenterRowTagTypeId: string;
}
