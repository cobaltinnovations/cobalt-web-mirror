export enum PAGE_STATUS_ID {
	LIVE = 'LIVE',
	DRAFT = 'DRAFT',
}

export interface PageModel {
	pageId: string;
	name: string;
	urlName: string;
	pageTypeId: string;
	pageStatusId: PAGE_STATUS_ID;
	headline: string;
	description: string;
	imageFileUploadId: string;
	imageAltText: string;
	publishedDate: string;
	publishedDateDescription: string;
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
