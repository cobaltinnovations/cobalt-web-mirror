import { ContentTypeId } from '@/lib/models';

export interface ResourceLibraryContentModel {
	author: string;
	contentId: string;
	contentTypeId: ContentTypeId;
	created: string;
	createdDescription: string;
	description: string;
	imageUrl: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	tagIds: string[];
	title: string;
	url: string;
}

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
