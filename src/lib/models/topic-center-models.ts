import { GroupSessionModel, GroupSessionRequestModel, ResourceLibraryContentModel, TagModel } from '@/lib/models';

export enum TopicCenterDisplayStyleId {
	DEFAULT = 'DEFAULT',
	FEATURED = 'FEATURED',
}

export interface TopicCenterModel {
	name: string;
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
	groupSessions: GroupSessionModel[];
	pinboardNotes: PinboardNoteModel[];
	title: string;
	topicCenterRowId: string;
}

export interface PinboardNoteModel {
	description: string;
	pinboardNoteId: string;
	title: string;
	url: string;
	imageUrl?: string;
}
