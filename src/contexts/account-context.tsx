import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import React, { FC, PropsWithChildren, createContext, useCallback, useState } from 'react';

import { AccountInstitutionCapabilities, AccountModel, LoginDestinationId } from '@/lib/models';
import { accountService, institutionService } from '@/lib/services';

import { AccountSource, Institution } from '@/lib/models/institution';
import { useAppRootLoaderData } from '@/routes/root';
import { createQueryFn } from '@/lib/http-client';

type AccountContextConfig = {
	account: AccountModel | undefined;
	setAccountId: (accountId: string) => void;
	institution: Institution;
	accountSources: AccountSource[];
	institutionCapabilities: AccountInstitutionCapabilities | undefined;
	signOutAndClearContext: () => void;
};

const AccountContext = createContext({} as AccountContextConfig);

export const LoginDestinationIdRouteMap = {
	[LoginDestinationId.COBALT_PATIENT]: '/',
	[LoginDestinationId.IC_PANEL]: '/ic/mhic',
	[LoginDestinationId.IC_PATIENT]: '/ic/patient',
} as const;

const AccountProvider: FC<PropsWithChildren> = (props) => {
	const { subdomain, accountSourceId, initialData } = useAppRootLoaderData();

	const [accountId, setAccountId] = useState(initialData.accountId);

	const { data: institutionResponse } = useQuery({
		...institutionService.getInstitution({
			subdomain,
			accountSourceId,
		}),
		initialData: initialData.institutionResponse,
	});

	const { data: accountResponse } = useQuery({
		queryKey: ['account', accountId],
		queryFn: createQueryFn(() => accountService.account(accountId)),
		enabled: !!accountId,
	});

	const signOutAndClearContext = useCallback(async () => {
		Cookies.remove('accessToken');
		Cookies.remove('accountId');
		Cookies.remove('authRedirectUrl');
		Cookies.remove('ssoRedirectUrl');
		Cookies.remove('immediateAccess');
		Cookies.remove('seenWaivedCopay');
		Cookies.remove('track');
		window.localStorage.clear();

		try {
			if (!accountId) {
				throw new Error('account is required.');
			}

			const { federatedLogoutUrl } = await accountService.getFederatedLogoutUrl(accountId).fetch();

			if (federatedLogoutUrl) {
				window.location.href = federatedLogoutUrl;
				return;
			}
		} catch (error) {
			// Fail silently and just log the user out normally
		} finally {
			const url = new URL(window.location.href);
			url.pathname = '/sign-in';
			window.location.href = url.toString();
		}
	}, [accountId]);

	const value = {
		account: accountResponse?.account,
		setAccountId,
		institution: accountResponse?.institution || institutionResponse.institution,
		accountSources: institutionResponse.accountSources,
		institutionCapabilities: accountResponse?.account.capabilities?.[institutionResponse.institution.institutionId],
		signOutAndClearContext,
	};

	return <AccountContext.Provider value={value}>{props.children}</AccountContext.Provider>;
};

export { AccountContext, AccountProvider };
