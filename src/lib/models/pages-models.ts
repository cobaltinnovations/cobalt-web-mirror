import { AdminContent, COLOR_IDS, GroupSessionModel, Tag, TagGroup } from '@/lib/models';

export enum SITE_LOCATION_ID {
	COMMUNITY = 'COMMUNITY',
	FEATURED_TOPIC = 'FEATURED_TOPIC',
}

export interface PageSiteLocationModel {
	pageId: string;
	siteLocationId: SITE_LOCATION_ID;
	relativeUrl: string;
	headline: string;
	description: string;
	shortDescription?: string;
	imageAltText?: string;
	imageUrl: string;
	callToAction: string;
}

export enum PAGE_STATUS_ID {
	LIVE = 'LIVE',
	DRAFT = 'DRAFT',
}

export enum BACKGROUND_COLOR_ID {
	WHITE = 'WHITE',
	NEUTRAL = 'NEUTRAL',
}

export enum ROW_PADDING_ID {
	NONE = 'NONE',
	SMALL = 'SMALL',
	MEDIUM = 'MEDIUM',
	LARGE = 'LARGE',
}

export enum ROW_TYPE_ID {
	RESOURCES = 'RESOURCES',
	GROUP_SESSIONS = 'GROUP_SESSIONS',
	TAG_GROUP = 'TAG_GROUP',
	TAG = 'TAG',
	CUSTOM_ROW = 'CUSTOM_ROW',
	ONE_COLUMN_TEXT = 'ONE_COLUMN_TEXT',
	TWO_COLUMN_TEXT = 'TWO_COLUMN_TEXT',
	ONE_COLUMN_IMAGE = 'ONE_COLUMN_IMAGE',
	ONE_COLUMN_IMAGE_RIGHT = 'ONE_COLUMN_IMAGE_RIGHT',
	TWO_COLUMN_IMAGE = 'TWO_COLUMN_IMAGE',
	THREE_COLUMN_IMAGE = 'THREE_COLUMN_IMAGE',
	MAILING_LIST = 'MAILING_LIST',
	CALL_TO_ACTION_BLOCK = 'CALL_TO_ACTION_BLOCK',
	CALL_TO_ACTION_FULL_WIDTH = 'CALL_TO_ACTION_FULL_WIDTH',
}

export enum CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID {
	IMAGE_THEN_TEXT = 'IMAGE_THEN_TEXT',
	TEXT_THEN_IMAGE = 'TEXT_THEN_IMAGE',
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
	relativeUrl: string;
	editingLivePage: boolean;
	livePageSiteLocations: PageSiteLocationModel[];
	mailingListEntryCount?: number;
	mailingListEntryCountDescription?: string;
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
	| TagRowModel
	| CustomRowModel
	| OneColumnRowModel
	| TwoColumnRowModel
	| ThreeColumnRowModel
	| MailingListRowModel
	| CallToActionBlockRowModel
	| CallToActionFullWidthRowModel;

export interface PageRowBaseModel {
	pageRowId: string;
	pageSectionId: string;
	rowTypeId: ROW_TYPE_ID;
	name: string;
	backgroundColorId: BACKGROUND_COLOR_ID;
	paddingId: ROW_PADDING_ID;
	displayOrder: number;
}

export interface ResourcesRowModel extends PageRowBaseModel {
	contents: AdminContent[];
}

export interface GroupSessionsRowModel extends PageRowBaseModel {
	groupSessions: GroupSessionModel[];
}

export interface TagGroupRowModel extends PageRowBaseModel {
	tagGroup: TagGroup;
}

export interface TagRowModel extends PageRowBaseModel {
	tagGroupColorId: COLOR_IDS;
	tag: Tag;
}

export interface CustomRowModel extends PageRowBaseModel {
	rowTypeId: ROW_TYPE_ID.CUSTOM_ROW;
	columns: PageRowColumnModel[];
}

export interface OneColumnRowModel extends PageRowBaseModel {
	rowTypeId: ROW_TYPE_ID.ONE_COLUMN_IMAGE | ROW_TYPE_ID.ONE_COLUMN_IMAGE_RIGHT | ROW_TYPE_ID.ONE_COLUMN_TEXT;
	columnOne: PageRowColumnModel;
}

export interface TwoColumnRowModel extends PageRowBaseModel {
	rowTypeId: ROW_TYPE_ID.TWO_COLUMN_IMAGE | ROW_TYPE_ID.TWO_COLUMN_TEXT;
	columnOne: PageRowColumnModel;
	columnTwo: PageRowColumnModel;
}

export interface ThreeColumnRowModel extends PageRowBaseModel {
	rowTypeId: ROW_TYPE_ID.THREE_COLUMN_IMAGE;
	columnOne: PageRowColumnModel;
	columnTwo: PageRowColumnModel;
	columnThree: PageRowColumnModel;
}

export type OneColumnImageRowModel = OneColumnRowModel;
export type OneColumnTextRowModel = OneColumnRowModel;
export type TwoColumnImageRowModel = TwoColumnRowModel;
export type TwoColumnTextRowModel = TwoColumnRowModel;
export type ThreeColumnImageRowModel = ThreeColumnRowModel;

export interface PageRowColumnModel {
	pageRowColumnId: string;
	pageRowId: string;
	headline: string;
	description: string;
	imageFileUploadId: string;
	imageAltText: string;
	imageUrl: string;
	columnDisplayOrder: number;
	contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID;
}

export interface MailingListRowModel extends PageRowBaseModel {
	description: string;
	mailingListId: string;
	title: string;
}

export interface CallToActionRowBaseModel extends PageRowBaseModel {
	headline: string;
	description: string;
	buttonText: string;
	buttonUrl: string;
	imageFileUploadId?: string;
	imageUrl?: string;
}

export interface CallToActionBlockRowModel extends CallToActionRowBaseModel {
	rowTypeId: ROW_TYPE_ID.CALL_TO_ACTION_BLOCK;
}

export interface CallToActionFullWidthRowModel extends CallToActionRowBaseModel {
	rowTypeId: ROW_TYPE_ID.CALL_TO_ACTION_FULL_WIDTH;
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

export const isTagRow = (x: PageRowUnionModel): x is TagRowModel => {
	return x.hasOwnProperty('tag');
};

export const isCustomRow = (x: PageRowUnionModel): x is CustomRowModel => {
	return x.rowTypeId === ROW_TYPE_ID.CUSTOM_ROW;
};

export const isOneColumnRow = (x: PageRowUnionModel): x is OneColumnRowModel => {
	return (
		x.rowTypeId === ROW_TYPE_ID.ONE_COLUMN_IMAGE ||
		x.rowTypeId === ROW_TYPE_ID.ONE_COLUMN_IMAGE_RIGHT ||
		x.rowTypeId === ROW_TYPE_ID.ONE_COLUMN_TEXT
	);
};

export const isOneColumnImageRow = (x: PageRowUnionModel): x is OneColumnImageRowModel => {
	return isOneColumnRow(x);
};

export const isOneColumnTextRow = (x: PageRowUnionModel): x is OneColumnTextRowModel => {
	return x.rowTypeId === ROW_TYPE_ID.ONE_COLUMN_TEXT;
};

export const isOneColumnImageRightRow = (x: PageRowUnionModel): x is OneColumnImageRowModel => {
	return x.rowTypeId === ROW_TYPE_ID.ONE_COLUMN_IMAGE_RIGHT;
};

export const isTwoColumnRow = (x: PageRowUnionModel): x is TwoColumnRowModel => {
	return x.rowTypeId === ROW_TYPE_ID.TWO_COLUMN_IMAGE || x.rowTypeId === ROW_TYPE_ID.TWO_COLUMN_TEXT;
};

export const isTwoColumnImageRow = (x: PageRowUnionModel): x is TwoColumnImageRowModel => {
	return isTwoColumnRow(x);
};

export const isTwoColumnTextRow = (x: PageRowUnionModel): x is TwoColumnTextRowModel => {
	return x.rowTypeId === ROW_TYPE_ID.TWO_COLUMN_TEXT;
};

export const isThreeColumnImageRow = (x: PageRowUnionModel): x is ThreeColumnImageRowModel => {
	return x.rowTypeId === ROW_TYPE_ID.THREE_COLUMN_IMAGE;
};

export const isMailingListRow = (x: PageRowUnionModel): x is MailingListRowModel => {
	return x.rowTypeId === ROW_TYPE_ID.MAILING_LIST;
};

export const isCallToActionBlockRow = (x: PageRowUnionModel): x is CallToActionBlockRowModel => {
	return x.rowTypeId === ROW_TYPE_ID.CALL_TO_ACTION_BLOCK;
};

export const isCallToActionFullWidthRow = (x: PageRowUnionModel): x is CallToActionFullWidthRowModel => {
	return x.rowTypeId === ROW_TYPE_ID.CALL_TO_ACTION_FULL_WIDTH;
};

export const isCallToActionRow = (
	x: PageRowUnionModel
): x is CallToActionBlockRowModel | CallToActionFullWidthRowModel => {
	return isCallToActionBlockRow(x) || isCallToActionFullWidthRow(x);
};
