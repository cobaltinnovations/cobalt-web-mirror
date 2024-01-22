export enum CONTENT_FEEDBACK_TYPE_ID {
	THUMBS_UP = 'THUMBS_UP',
	THUMBS_DOWN = 'THUMBS_DOWN',
}

export interface ContentFeedback {
	contentFeedbackId: string;
	contentFeedbackTypeId: CONTENT_FEEDBACK_TYPE_ID;
	accountId: string;
	message?: string;
	created: string;
	createdDescription: string;
	updated: string;
	updatedDescription: string;
}
