import { httpSingleton } from '@/lib/singletons/http-singleton';
import { MailingListEntryTypeId, MailingListModel } from '@/lib/models';

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
};
