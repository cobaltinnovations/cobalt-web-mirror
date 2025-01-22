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
	backgroundColorId: string;
	displayOrder: number;
}

export interface PageRowModel {
	pageRowId: string;
	pageSectionId: string;
	rowTypeId: string;
	displayOrder: number;
}

export interface PageFriendlyUrlValidationResult {
	available: boolean;
	recommendation: string;
}

export interface PageDetailModel {}
