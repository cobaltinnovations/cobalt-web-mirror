import React, { FC, createContext, useState, useEffect, useCallback, useMemo, PropsWithChildren } from 'react';
import { useNavigate, useLocation, useMatch, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

import { AccountInstitutionCapabilities, AccountModel, AccountSourceId } from '@/lib/models';
import { accountService, institutionService } from '@/lib/services';

import { AccountSource, Institution } from '@/lib/models/institution';
import useHandleError from '@/hooks/use-handle-error';
import useSubdomain from '@/hooks/use-subdomain';

type AccountContextConfig = {
	account: AccountModel | undefined;
	setAccount: React.Dispatch<React.SetStateAction<AccountModel | undefined>>;
	initialized: boolean;
	isAnonymous: boolean;
	institution: Institution | undefined;
	setInstitution: React.Dispatch<React.SetStateAction<Institution | undefined>>;
	accountSources: AccountSource[] | undefined;
	subdomainInstitution: Institution | undefined;
	institutionCapabilities: AccountInstitutionCapabilities | undefined;
	signOutAndClearContext: () => void;
	isTrackedSession: boolean;
};

const AccountContext = createContext({} as AccountContextConfig);

const AccountProvider: FC<PropsWithChildren> = (props) => {
	const handleError = useHandleError();
	const [initialized, setInitialized] = useState(false);
	const [account, setAccount] = useState<AccountModel | undefined>(undefined);
	const [institution, setInstitution] = useState<Institution | undefined>(undefined);
	const [accountSources, setAccountSources] = useState<AccountSource[] | undefined>(undefined);
	const [subdomainInstitution, setSubdomainInstitution] = useState<Institution | undefined>(undefined);
	const isAnonymous = account?.accountSourceId === AccountSourceId.ANONYMOUS;

	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const location = useLocation();
	const immediateSupportRouteMatch = useMatch<'supportRoleId', '/immediate-support/:supportRoleId'>({
		path: '/immediate-support/:supportRoleId',
	});
	const subdomain = useSubdomain();
	const [isTrackedSession, setIsTrackedSession] = useState(
		!!searchParams.get('track') || !!Cookies.get('trackActivity')
	);
	const [sessionAccountSourceId] = useState(searchParams.get('accountSourceId'));

	const immediateAccess = searchParams.get('immediateAccess');

	const signOutAndClearContext = useCallback(async () => {
		Cookies.remove('accessToken');
		Cookies.remove('authRedirectUrl');
		Cookies.remove('immediateAccess');
		Cookies.remove('seenWaivedCopay');
		Cookies.remove('x-mhic-cobalt-token');
		Cookies.remove('piccobalt_patientcontext');
		Cookies.remove('trackActivity');
		setIsTrackedSession(false);

		try {
			if (!account) {
				throw new Error('account is required.');
			}

			const { federatedLogoutUrl } = await accountService.getFederatedLogoutUrl(account.accountId).fetch();

			if (federatedLogoutUrl) {
				window.location.href = federatedLogoutUrl;
				return;
			}

			navigate('/sign-in');
			setAccount(undefined);
			setInstitution(undefined);
		} catch (error) {
			// Fail silently and just log the user normally

			navigate('/sign-in');
			setAccount(undefined);
			setInstitution(undefined);
		}
	}, [account, navigate]);

	// Fetch account if we have accessToken cookie
	useEffect(() => {
		if (initialized) {
			return;
		}

		const accessTokenFromCookie = Cookies.get('accessToken');

		if (!accessTokenFromCookie && !immediateAccess && !immediateSupportRouteMatch) {
			setInitialized(true);
			return;
		} else if (!accessTokenFromCookie && (immediateAccess || immediateSupportRouteMatch)) {
			let authRedirectUrl = location.pathname + (location.search || '');

			if (immediateSupportRouteMatch) {
				let supportRoleId = immediateSupportRouteMatch.params.supportRoleId ?? '';

				if (supportRoleId === 'therapist') {
					supportRoleId = 'clinician';
				}

				const params = new URLSearchParams({
					supportRoleId: supportRoleId.toUpperCase(),
					immediateAccess: 'true',
				});

				authRedirectUrl = `/connect-with-support?${params.toString()}`;
			}

			Cookies.set('authRedirectUrl', authRedirectUrl);
			Cookies.set('immediateAccess', '1');

			if (isTrackedSession) {
				// force sign-in flow for tracked sessions
				Cookies.set('trackActivity', '1');
				setInitialized(true);

				return;
			}

			accountService
				.createAnonymousAccount()
				.fetch()
				.then((response) => {
					setInitialized(true);

					navigate(
						`/auth?${new URLSearchParams({
							accessToken: response.accessToken,
						}).toString()}`,
						{
							replace: true,
						}
					);
				})
				.catch((e) => {
					handleError(e);
				});
		} else if (accessTokenFromCookie) {
			if (immediateAccess || immediateSupportRouteMatch) {
				Cookies.set('immediateAccess', '1');
			}

			const accountId = (jwtDecode(accessTokenFromCookie) as any).sub;
			accountService
				.account(accountId)
				.fetch()
				.then((response) => {
					setAccount(response.account);
					setInstitution(response.institution);

					setInitialized(true);
				})
				.catch((e) => {
					// Unable to initialize/fetch account
					// from stored cookie
					setInitialized(true);
					signOutAndClearContext();
				});
		}
	}, [
		handleError,
		navigate,
		immediateAccess,
		immediateSupportRouteMatch,
		initialized,
		location.pathname,
		location.search,
		signOutAndClearContext,
		isTrackedSession,
	]);

	// Fetch subdomain instituion on mount
	useEffect(() => {
		institutionService
			.getInstitution({
				subdomain,
				...(sessionAccountSourceId ? { accountSourceId: sessionAccountSourceId } : {}),
			})
			.fetch()
			.then((response) => {
				setAccountSources(response.accountSources);
				setSubdomainInstitution(response.institution);
			});
	}, [sessionAccountSourceId, subdomain]);

	const institutionCapabilities = useMemo(() => {
		if (!account || !subdomainInstitution || !account.capabilities) {
			return;
		}

		return account.capabilities[subdomainInstitution.institutionId];
	}, [account, subdomainInstitution]);

	const value = {
		account,
		setAccount,
		initialized,
		isAnonymous,
		institution,
		setInstitution,
		accountSources,
		subdomainInstitution,
		institutionCapabilities,
		signOutAndClearContext,
		isTrackedSession,
	};

	return <AccountContext.Provider value={value}>{props.children}</AccountContext.Provider>;
};

const AccountConsumer = AccountContext.Consumer;

export { AccountContext, AccountProvider, AccountConsumer };
