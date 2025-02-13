import { Content } from '@/lib/models/content';
import { GroupSessionModel } from '@/lib/models/group-session-models';
import { TagGroup } from './tag-groups';

export enum PAGE_STATUS_ID {
	LIVE = 'LIVE',
	DRAFT = 'DRAFT',
}

export enum PAGE_TYPE_ID {
	TOPIC_CENTER = 'TOPIC_CENTER',
	COMMUNITY = 'COMMUNITY',
}

export enum BACKGROUND_COLOR_ID {
	WHITE = 'WHITE',
	NEUTRAL = 'NEUTRAL',
}

export enum ROW_TYPE_ID {
	RESOURCES = 'RESOURCES',
	GROUP_SESSIONS = 'GROUP_SESSIONS',
	TAG_GROUP = 'TAG_GROUP',
	ONE_COLUMN_IMAGE = 'ONE_COLUMN_IMAGE',
	TWO_COLUMN_IMAGE = 'TWO_COLUMN_IMAGE',
	THREE_COLUMN_IMAGE = 'THREE_COLUMN_IMAGE',
}

export interface PageModel {
	pageId: string;
	name: string;
	urlName: string;
	pageTypeId: PAGE_TYPE_ID;
	pageStatusId: PAGE_STATUS_ID;
	headline: string;
	description: string;
	imageFileUploadId: string;
	imageAltText: string;
	imageUrl: string;
	publishedDate: string;
	publishedDateDescription: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
}

export interface PageSectionModel {
	pageSectionId: string;
	pageId: string;
	name: string;
	headline: string;
	description: string;
	backgroundColorId: BACKGROUND_COLOR_ID;
	displayOrder: number;
}

export interface PageFriendlyUrlValidationResult {
	available: boolean;
	recommendation: string;
}

export interface PageDetailModel {
	pageId: string;
	name: string;
	urlName: string;
	pageTypeId: PAGE_TYPE_ID;
	pageStatusId: PAGE_STATUS_ID;
	headline: string;
	description: string;
	imageFileUploadId: string;
	imageAltText: string;
	imageUrl: string;
	publishedDate: string;
	publishedDateDescription: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	pageSections: PageSectionDetailModel[];
}

export interface PageSectionDetailModel {
	pageSectionId: string;
	pageId: string;
	name: string;
	headline: string;
	description: string;
	backgroundColorId: BACKGROUND_COLOR_ID;
	displayOrder: number;
	pageRows: PageRowUnionModel[];
}

export type PageRowUnionModel =
	| ResourcesRowModel
	| GroupSessionsRowModel
	| TagGroupRowModel
	| OneColumnImageRowModel
	| TwoColumnImageRowModel
	| ThreeColumnImageRowModel;

export interface ResourcesRowModel {
	pageRowId: string;
	pageSectionId: string;
	rowTypeId: ROW_TYPE_ID;
	displayOrder: number;
	contents: Content[];
}

export interface GroupSessionsRowModel {
	pageRowId: string;
	pageSectionId: string;
	rowTypeId: ROW_TYPE_ID;
	displayOrder: number;
	groupSessions: GroupSessionModel[];
}

export interface TagGroupRowModel {
	pageRowId: string;
	pageSectionId: string;
	rowTypeId: ROW_TYPE_ID;
	displayOrder: number;
	tagGroup: TagGroup;
}

export interface OneColumnImageRowModel {
	pageRowId: string;
	pageSectionId: string;
	rowTypeId: ROW_TYPE_ID;
	displayOrder: number;
	columnOne: ColumnImageModel;
}

export interface TwoColumnImageRowModel {
	pageRowId: string;
	pageSectionId: string;
	rowTypeId: ROW_TYPE_ID;
	displayOrder: number;
	columnOne: ColumnImageModel;
	columnTwo: ColumnImageModel;
}

export interface ThreeColumnImageRowModel {
	pageRowId: string;
	pageSectionId: string;
	rowTypeId: ROW_TYPE_ID;
	displayOrder: number;
	columnOne: ColumnImageModel;
	columnTwo: ColumnImageModel;
	columnThree: ColumnImageModel;
}

interface ColumnImageModel {
	pageRowColumnId: string;
	pageRowId: string;
	headline: string;
	description: string;
	imageFileUploadId: string;
	imageAltText: string;
	imageUrl: string;
	columnDisplayOrder: number;
}

export const isResourcesRow = (x: PageRowUnionModel): x is ResourcesRowModel => {
	return x.hasOwnProperty('contents');
};

export const isGroupSessionsRow = (x: PageRowUnionModel): x is GroupSessionsRowModel => {
	return x.hasOwnProperty('groupSessions');
};

export const isTagGroupRow = (x: PageRowUnionModel): x is TagGroupRowModel => {
	return x.hasOwnProperty('tagGroup');
};

export const isOneColumnImageRow = (x: PageRowUnionModel): x is OneColumnImageRowModel => {
	return x.hasOwnProperty('columnOne') && !x.hasOwnProperty('columnTwo') && !x.hasOwnProperty('columnThree');
};

export const isTwoColumnImageRow = (x: PageRowUnionModel): x is TwoColumnImageRowModel => {
	return x.hasOwnProperty('columnOne') && x.hasOwnProperty('columnTwo') && !x.hasOwnProperty('columnThree');
};

export const isThreeColumnImageRow = (x: PageRowUnionModel): x is ThreeColumnImageRowModel => {
	return x.hasOwnProperty('columnOne') && x.hasOwnProperty('columnTwo') && x.hasOwnProperty('columnThree');
};
