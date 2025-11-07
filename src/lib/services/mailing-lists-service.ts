import { httpSingleton } from '@/lib/singletons/http-singleton';
import { MailingListEntryTypeId } from '@/lib/models';

export const mailingListsService = {
	addEntry(data: { mailingListId: string; mailingListEntryTypeId: MailingListEntryTypeId; value: string }) {
		return httpSingleton.orchestrateRequest<{
			mailingLists: void;
		}>({
			method: 'POST',
			url: `/mailing-list-entries`,
			data,
		});
	},
};
