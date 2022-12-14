import { COLOR_IDS, Content } from '@/lib/models';

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
