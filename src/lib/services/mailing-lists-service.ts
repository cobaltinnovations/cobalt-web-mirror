import { httpSingleton } from '@/lib/singletons/http-singleton';
import { MailingListEntryModel, MailingListEntryTypeId, MailingListModel, PageDetailModel } from '@/lib/models';

export const mailingListsService = {
	addEntry(data: { mailingListId: string; mailingListEntryTypeId: MailingListEntryTypeId; value: string }) {
		return httpSingleton.orchestrateRequest<{
			mailingLists: MailingListModel[];
		}>({
			method: 'POST',
			url: `/mailing-list-entries`,
			data,
		});
	},
	getEntries(mailingListEntryId: string) {
		return httpSingleton.orchestrateRequest<{
			pages: PageDetailModel[];
			mailinglistEntry: MailingListEntryModel;
		}>({
			method: 'GET',
			url: `/mailing-list-entries/${mailingListEntryId}`,
		});
	},
};
