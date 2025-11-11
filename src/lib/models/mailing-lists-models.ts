import { ROW_TYPE_ID } from './pages-models';

export enum MailingListEntryTypeId {
	EMAIL_ADDRESS = 'EMAIL_ADDRESS',
	SMS = 'SMS',
}

export enum MailingListEntryStatusId {
	SUBSCRIBED = 'SUBSCRIBED',
	UNSUBSCRIBED = 'UNSUBSCRIBED',
}

export interface MailingListModel {}

export interface PageRowMailingListModel {
	pageRowId: string;
	mailingListId: string;
	rowTypeId: ROW_TYPE_ID;
	title?: string;
	description?: string;
	displayOrder: number;
	mailingListEntries?: MailingListEntryModel[];
}

export interface MailingListEntryModel {
	mailingListEntryId: string;
	mailingListEntryTypeId: MailingListEntryTypeId;
	mailingListId: string;
	accountId: string;
	createdByAccountId: string;
	value: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
}
