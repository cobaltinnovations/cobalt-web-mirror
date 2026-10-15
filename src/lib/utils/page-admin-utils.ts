import { PAGE_STATUS_ID } from '@/lib/models/pages-models';
import { MailingListEntryTypeId, PageRowMailingListModel } from '@/lib/models/mailing-lists-models';

export type PageActionId = 'EDIT' | 'DUPLICATE' | 'SETTINGS' | 'DELETE' | 'VIEW' | 'UNPUBLISH';

export const getPageActionIds = (pageStatusId: PAGE_STATUS_ID): PageActionId[] => [
	'EDIT',
	'DUPLICATE',
	'SETTINGS',
	...(pageStatusId === PAGE_STATUS_ID.LIVE ? (['VIEW', 'UNPUBLISH'] as PageActionId[]) : []),
	...(pageStatusId === PAGE_STATUS_ID.DRAFT ? (['DELETE'] as PageActionId[]) : []),
];

export const shouldWarnForPageUrlChange = (
	page:
		| {
				urlName: string;
				pageStatusId: PAGE_STATUS_ID;
				hasBeenPublished?: boolean;
				publishedDate?: string;
		  }
		| undefined,
	urlName: string
) => {
	if (!page) return false;
	const hasBeenPublished =
		page.hasBeenPublished ??
		(page.pageStatusId === PAGE_STATUS_ID.LIVE ||
			page.pageStatusId === PAGE_STATUS_ID.COPY_FOR_EDITING ||
			!!page.publishedDate);
	return hasBeenPublished && page.urlName !== urlName.trim();
};

export const getSubscriberEmailAddresses = (pageRowMailingLists: PageRowMailingListModel[]) =>
	Array.from(
		new Set(
			pageRowMailingLists.flatMap((list) =>
				(list.mailingListEntries ?? [])
					.filter((entry) => entry.mailingListEntryTypeId === MailingListEntryTypeId.EMAIL_ADDRESS)
					.map((entry) => entry.value)
			)
		)
	);
