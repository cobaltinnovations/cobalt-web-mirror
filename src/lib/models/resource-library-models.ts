import { Content } from '@/lib/models';

export type ResourceLibraryContentModel = {
	tagIds: string[];
} & Content;

export interface TagGroupModel {
	description: string;
	name: string;
	tagGroupId: string;
	urlName: string;
}

export interface TagModel {
	description: string;
	name: string;
	tagGroupId: string;
	tagId: string;
	urlName: string;
}
