import { PAGE_STATUS_ID, ROW_TYPE_ID } from '@/lib/models/pages-models';
import {
	MailingListEntryModel,
	MailingListEntryTypeId,
	PageRowMailingListModel,
} from '@/lib/models/mailing-lists-models';
import { getPageActionIds, getSubscriberEmailAddresses, shouldWarnForPageUrlChange } from './page-admin-utils';

it('offers deletion only for unpublished pages', () => {
	expect(getPageActionIds(PAGE_STATUS_ID.DRAFT)).toEqual(['EDIT', 'DUPLICATE', 'SETTINGS', 'DELETE']);
});

it('offers public viewing and unpublication for published pages', () => {
	expect(getPageActionIds(PAGE_STATUS_ID.LIVE)).toEqual(['EDIT', 'DUPLICATE', 'SETTINGS', 'VIEW', 'UNPUBLISH']);
});

it('does not offer destructive lifecycle actions on a temporary editing copy', () => {
	expect(getPageActionIds(PAGE_STATUS_ID.COPY_FOR_EDITING)).toEqual(['EDIT', 'DUPLICATE', 'SETTINGS']);
});

it('warns when a previously published page changes its URL even after it is unpublished', () => {
	expect(
		shouldWarnForPageUrlChange(
			{ urlName: 'old-url', pageStatusId: PAGE_STATUS_ID.DRAFT, hasBeenPublished: true },
			'new-url'
		)
	).toBe(true);
});

it('does not warn for an unchanged URL or a page that has never been published', () => {
	const page = { urlName: 'old-url', pageStatusId: PAGE_STATUS_ID.DRAFT, hasBeenPublished: true };
	expect(shouldWarnForPageUrlChange(page, 'old-url')).toBe(false);
	expect(shouldWarnForPageUrlChange(page, ' old-url ')).toBe(false);
	expect(shouldWarnForPageUrlChange({ ...page, hasBeenPublished: false }, 'new-url')).toBe(false);
	expect(shouldWarnForPageUrlChange(undefined, 'new-url')).toBe(false);
});

it.each([PAGE_STATUS_ID.LIVE, PAGE_STATUS_ID.COPY_FOR_EDITING])(
	'retains publication evidence from legacy %s responses',
	(pageStatusId) => {
		expect(shouldWarnForPageUrlChange({ urlName: 'old-url', pageStatusId }, 'new-url')).toBe(true);
	}
);

it('uses retained publication dates as a fallback without warning for a fresh unpublished page', () => {
	const page = { urlName: 'old-url', pageStatusId: PAGE_STATUS_ID.DRAFT };
	expect(shouldWarnForPageUrlChange({ ...page, publishedDate: '2026-10-01' }, 'new-url')).toBe(true);
	expect(shouldWarnForPageUrlChange(page, 'new-url')).toBe(false);
});

const entry = (value: string, mailingListEntryTypeId = MailingListEntryTypeId.EMAIL_ADDRESS) =>
	({ value, mailingListEntryTypeId } as MailingListEntryModel);
const row = (mailingListEntries?: MailingListEntryModel[]): PageRowMailingListModel => ({
	pageRowId: 'row-1',
	mailingListId: 'list-1',
	rowTypeId: ROW_TYPE_ID.MAILING_LIST,
	displayOrder: 0,
	mailingListEntries,
});

it('copies only unique subscriber email addresses across rows while excluding SMS entries', () => {
	expect(
		getSubscriberEmailAddresses([
			row([entry('one@example.com'), entry('+12155550000', MailingListEntryTypeId.SMS)]),
			row([entry('one@example.com'), entry('two@example.com')]),
			row(),
		])
	).toEqual(['one@example.com', 'two@example.com']);
	expect(getSubscriberEmailAddresses([])).toEqual([]);
});
