import { COLOR_IDS } from './color-ids';

export interface Tag {
	created: string;
	description: string;
	lastUpdated: string;
	name: string;
	tagGroupId: string;
	tagId: string;
	urlName: string;
	deprecated: boolean;
}

export interface TagGroup {
	colorId: COLOR_IDS;
	description: string;
	name: string;
	tagGroupId: string;
	urlName: string;
	tags?: Tag[];
	deprecated: boolean;
}
