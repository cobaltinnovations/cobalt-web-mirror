import { COLOR_IDS, Content, ContentTypeId } from '@/lib/models';

export type ResourceLibraryContentModel = {
	tagIds: string[];
	duration: string;
	durationInMinutes: number;
	durationInMinutesDescription: string;
} & Content;

export interface TagGroupModel {
	description: string;
	name: string;
	tagGroupId: string;
	urlName: string;
	colorId: COLOR_IDS;
}

export interface TagModel {
	description: string;
	name: string;
	tagGroupId: string;
	tagId: string;
	urlName: string;
}

export interface ContentTypeFilterModel {
	contentTypeId: ContentTypeId;
	description: string;
}

export interface ContentDurationFilterModel {
	contentDurationId: string;
	description: string;
}
