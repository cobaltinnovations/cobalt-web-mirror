import React, { FC, createContext, useState, useCallback, useMemo, PropsWithChildren, useEffect } from 'react';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';
import Cookies from 'js-cookie';

import { AccountInstitutionCapabilities, AccountModel, AccountSourceId, LoginDestinationId } from '@/lib/models';
import { accountService, institutionService } from '@/lib/services';

import { AccountSource, Institution } from '@/lib/models/institution';

import { AppRootLoaderData } from '@/app-root';
import { getSubdomain } from '@/hooks/use-subdomain';

type AccountContextConfig = {
	account: AccountModel | undefined;
	setAccount: React.Dispatch<React.SetStateAction<AccountModel | undefined>>;
	isAnonymous: boolean;
	institution: Institution;
	refetchInstitution: () => void;
	accountSources: AccountSource[];
	institutionCapabilities: AccountInstitutionCapabilities | undefined;
	signOutAndClearContext: () => void;
	isImmediateSession: boolean;
};

const AccountContext = createContext({} as AccountContextConfig);

export const LoginDestinationIdRouteMap = {
	[LoginDestinationId.COBALT_PATIENT]: '/',
	[LoginDestinationId.IC_PANEL]: '/ic/mhic',
	[LoginDestinationId.IC_PATIENT]: '/ic/patient',
} as const;

const AccountProvider: FC<PropsWithChildren> = (props) => {
	const rootData = useRouteLoaderData('root') as AppRootLoaderData;

	const [account, setAccount] = useState<AccountModel | undefined>(rootData.account);
	const [institution, setInstitution] = useState<Institution>(rootData.institution);

	const isAnonymous = account?.accountSourceId === AccountSourceId.ANONYMOUS;

	const navigate = useNavigate();

	useEffect(() => {
		setInstitution(rootData.institution);
	}, [rootData.institution]);

	const institutionCapabilities = useMemo(() => {
		if (!account || !account.capabilities) {
			return;
		}

		return account.capabilities[rootData.institution.institutionId];
	}, [account, rootData.institution.institutionId]);

	const refetchInstitution = useCallback(async () => {
		const response = await institutionService
			.getInstitution({
				subdomain: getSubdomain(),
			})
			.fetch();

		setInstitution(response.institution);
	}, []);

	const signOutAndClearContext = useCallback(async () => {
		Cookies.remove('accessToken');
		Cookies.remove('authRedirectUrl');
		Cookies.remove('ssoRedirectUrl');
		Cookies.remove('immediateAccess');
		Cookies.remove('seenWaivedCopay');
		Cookies.remove('trackActivity');
		window.localStorage.clear();

		try {
			if (!account) {
				throw new Error('account is required.');
			}

			const { federatedLogoutUrl } = await accountService.getFederatedLogoutUrl(account.accountId).fetch();

			setAccount(undefined);

			if (federatedLogoutUrl) {
				window.location.href = federatedLogoutUrl;
				return;
			}

			navigate('/sign-in');
		} catch (error) {
			// Fail silently and just log the user normally

			navigate('/sign-in');
			setAccount(undefined);
		}
	}, [account, navigate]);

	const value = {
		account,
		setAccount,
		isAnonymous,
		institution: institution,
		refetchInstitution,
		accountSources: rootData.accountSources,
		institutionCapabilities,
		signOutAndClearContext,
		isImmediateSession: rootData.isImmediateSession,
	};

	return <AccountContext.Provider value={value}>{props.children}</AccountContext.Provider>;
};

const AccountConsumer = AccountContext.Consumer;

export { AccountContext, AccountProvider, AccountConsumer };
