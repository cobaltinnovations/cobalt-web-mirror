import { AccountModel } from '@/lib/models/account';

export const shouldPromptForInstitutionLocation = (
	account: Pick<AccountModel, 'institutionLocationId' | 'promptedForInstitutionLocation'>
) => !account.institutionLocationId && !account.promptedForInstitutionLocation;
