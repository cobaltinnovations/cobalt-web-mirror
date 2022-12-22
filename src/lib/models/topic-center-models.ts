import { GroupSessionModel, GroupSessionRequestModel, ResourceLibraryContentModel, TagModel } from '@/lib/models';

export interface TopicCenterModel {
	name: string;
	topicCenterId: string;
	topicCenterRows: TopicCenterRowModel[];
	urlName: string;
	tagsByTagId: Record<string, TagModel>;
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
