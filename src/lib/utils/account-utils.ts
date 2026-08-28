import type { AccountModel } from '@/lib/models/account';

// This controls scheduling UI discovery. Calendar operations remain authorized
// by the API against the linked provider.
export const canAccessProviderScheduling = (account?: Pick<AccountModel, 'providerId'> | null): boolean =>
	Boolean(account?.providerId);
