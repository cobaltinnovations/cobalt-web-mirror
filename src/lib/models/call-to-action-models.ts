export enum CALL_TO_ACTION_DISPLAY_AREA_ID {
	HOME = 'HOME',
	CONTENT_LIST = 'CONTENT_LIST',
}

export enum ACTION_LINK_TYPE_ID {
	EXTERNAL = 'EXTERNAL',
	INTERNAL = 'INTERNAL',
	CRISIS = 'CRISIS',
}

export interface ActionLinkModel {
	actionLinkTypeId: ACTION_LINK_TYPE_ID;
	link: string;
	description: string;
	analyticsEventCategory?: string;
	analyticsEventAction?: string;
	analyticsEventLabel?: string;
}

export interface CallToActionModel {
	message: string;
	messageAsHtml: string;
	actionLinks: ActionLinkModel[];
	modalButtonText?: string;
	modalMessage?: string;
	modalMessageHtml?: string;
}
