import Cookies from 'js-cookie';
import React, { FC, PropsWithChildren, createContext, useCallback, useMemo } from 'react';

import { AccountModel, LoginDestinationId, ROLE_ID } from '@/lib/models';
import { accountService } from '@/lib/services';

import { AccountSource, Institution, UserExperienceTypeId } from '@/lib/models/institution';
import { useAppRootLoaderData } from '@/routes/root';

type AccountContextConfig = {
	account: AccountModel | undefined;
	institution: Institution;
	accountSources: AccountSource[];
	isAdmin: boolean;
	isProvider: boolean;
	isIntegratedCarePatient: boolean;
	isIntegratedCareStaff: boolean;
	signOutAndClearContext: () => void;
};

const AccountContext = createContext({} as AccountContextConfig);

export const LoginDestinationIdRouteMap = {
	[LoginDestinationId.COBALT_PATIENT]: '/',
	[LoginDestinationId.IC_PANEL]: '/ic/mhic',
	[LoginDestinationId.IC_PATIENT]: '/ic/patient',
} as const;

const AccountProvider: FC<PropsWithChildren> = (props) => {
	const { accountId, institutionResponse, accountResponse } = useAppRootLoaderData();

	const signOutAndClearContext = useCallback(async () => {
		Cookies.remove('accessToken');
		Cookies.remove('accountId');
		Cookies.remove('roleId');
		Cookies.remove('authRedirectUrl');
		Cookies.remove('immediateAccess');
		Cookies.remove('seenWaivedCopay');
		Cookies.remove('track');
		Cookies.remove('bookingSource');
		Cookies.remove('bookingExitUrl');
		Cookies.remove('groupSessionDetailNavigationSource');
		Cookies.remove('groupSessionCollectionId');
		Cookies.remove('groupSessionCollectionUrlName');
		Cookies.remove('groupSessionDetailFromTopicCenterPath');
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

	const institution = useMemo(
		() => accountResponse?.institution || institutionResponse.institution,
		[accountResponse?.institution, institutionResponse.institution]
	);

	const isIntegratedCarePatient = useMemo(
		() => institution.integratedCareEnabled && institution.userExperienceTypeId === UserExperienceTypeId.PATIENT,
		[institution.integratedCareEnabled, institution.userExperienceTypeId]
	);

	const isIntegratedCareStaff = useMemo(
		() => institution.integratedCareEnabled && institution.userExperienceTypeId === UserExperienceTypeId.STAFF,
		[institution.integratedCareEnabled, institution.userExperienceTypeId]
	);

	const isAdmin = useMemo(() => {
		return accountResponse?.account.roleId === ROLE_ID.ADMINISTRATOR;
	}, [accountResponse?.account.roleId]);

	const isProvider = useMemo(() => {
		return accountResponse?.account.roleId === ROLE_ID.PROVIDER;
	}, [accountResponse?.account.roleId]);

	const value = {
		account: accountResponse?.account,
		institution,
		accountSources: institutionResponse.accountSources,
		isAdmin,
		isProvider,
		isIntegratedCarePatient,
		isIntegratedCareStaff,
		signOutAndClearContext,
	};

	return <AccountContext.Provider value={value}>{props.children}</AccountContext.Provider>;
};

export { AccountContext, AccountProvider };
