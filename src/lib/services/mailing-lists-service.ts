import { httpSingleton } from '@/lib/singletons/http-singleton';
import { MailingListEntryTypeId } from '@/lib/models';

export const mailingListsService = {
	addEntry(
		mailingListId: string,
		data: {
			mailingListEntryTypeId: MailingListEntryTypeId;
			value: string;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			mailingLists: void;
		}>({
			method: 'POST',
			url: `/mailing-lists/${mailingListId}/entry`,
			data,
		});
	},
};
