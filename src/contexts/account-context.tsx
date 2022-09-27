import React, { FC, createContext, useState, useEffect, useCallback, useMemo, PropsWithChildren } from 'react';
import { useNavigate, useLocation, useSearchParams, useMatch } from 'react-router-dom';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

import { AccountInstitutionCapabilities, AccountModel, AccountSourceId } from '@/lib/models';
import { accountService, institutionService } from '@/lib/services';

import { AccountSource, Institution } from '@/lib/models/institution';
import useHandleError from '@/hooks/use-handle-error';
import useSubdomain from '@/hooks/use-subdomain';
import { routeRedirects } from '@/route-redirects';

type DecodedAccessToken = {
	sub: string;
	exp: number;
};

type AccountContextConfig = {
	account: AccountModel | undefined;
	setAccount: React.Dispatch<React.SetStateAction<AccountModel | undefined>>;
	processAccessToken: (token: string, shouldFetchAccount?: boolean) => void;
	initialized: boolean;
	didCheckImmediateFlag: boolean;
	isAnonymous: boolean;
	institution: Institution | undefined;
	setInstitution: React.Dispatch<React.SetStateAction<Institution | undefined>>;
	accountSources: AccountSource[] | undefined;
	institutionCapabilities: AccountInstitutionCapabilities | undefined;
	signOutAndClearContext: () => void;
	isTrackedSession: boolean;
	isImmediateSession: boolean;
};

const AccountContext = createContext({} as AccountContextConfig);

const AccountProvider: FC<PropsWithChildren> = (props) => {
	const match = useMatch('*');
	const [initialized, setInitialized] = useState(false);
	const [didCheckAccessToken, setDidCheckAccessToken] = useState(false);
	const [didCheckTrackFlag, setDidCheckTrackFlag] = useState(false);
	const [didProcessRedirects, setDidProcessRedirects] = useState(false);
	const [didCheckImmediateFlag, setDidCheckImmediateFlag] = useState(false);
	const [account, setAccount] = useState<AccountModel | undefined>(undefined);
	const [institution, setInstitution] = useState<Institution | undefined>(undefined);
	const [accountSources, setAccountSources] = useState<AccountSource[] | undefined>(undefined);

	const isAnonymous = account?.accountSourceId === AccountSourceId.ANONYMOUS;

	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const immediateSupportRouteMatch = useMatch<'supportRoleId', '/immediate-support/:supportRoleId'>({
		path: '/immediate-support/:supportRoleId',
	});
	const subdomain = useSubdomain();
	const [accessToken, setAccessToken] = useState(searchParams.get('accessToken') || Cookies.get('accessToken'));
	const [isTrackedSession, setIsTrackedSession] = useState(!!searchParams.get('track'));
	const [isImmediateSession, setIsImmediateSession] = useState(false);
	const [sessionAccountSourceId] = useState(searchParams.get('accountSourceId'));

	const institutionCapabilities = useMemo(() => {
		if (!account || !institution || !account.capabilities) {
			return;
		}

		return account.capabilities[institution.institutionId];
	}, [account, institution]);

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

	const processAccessToken = useCallback(
		async (token: string, shouldFetchAccount = true) => {
			const decodedAccessToken = jwtDecode(token) as DecodedAccessToken;
			const expirationDate = new Date(decodedAccessToken.exp * 1000);
			Cookies.set('accessToken', token, { expires: expirationDate });
			setAccessToken(token);

			if (shouldFetchAccount) {
				const accountId = decodedAccessToken.sub;
				try {
					const response = await accountService.account(accountId).fetch();
					setAccount(response.account);
					setInstitution(response.institution);

					setDidCheckAccessToken(true);
				} catch (error) {
					return navigate('/sign-in', { replace: true });
				}
			}

			const authRedirectUrl = Cookies.get('authRedirectUrl');
			Cookies.remove('authRedirectUrl');

			setDidCheckImmediateFlag(true);
			if (authRedirectUrl) {
				navigate(authRedirectUrl, { replace: true });
			}
		},
		[navigate]
	);

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
				setInstitution(response.institution);
			});
	}, [sessionAccountSourceId, subdomain]);

	// Route rendering is gated behind `initialized`
	// Enabled after app gets institution & determines session state
	useEffect(() => {
		if (initialized) {
			return;
		}

		setInitialized(!!institution && didCheckAccessToken && didCheckTrackFlag);
	}, [didCheckAccessToken, didCheckTrackFlag, initialized, institution]);

	// Determine trackedSession state
	useEffect(() => {
		if (isTrackedSession) {
			Cookies.set('trackActivity', '1');
		} else {
			setIsTrackedSession(!!Cookies.get('trackActivity'));
		}

		setDidCheckTrackFlag(true);
	}, [isTrackedSession]);

	// Determine immediateSession state
	const immediateAccess = searchParams.get('immediateAccess');
	const isImmediateRouteMatch = !!immediateSupportRouteMatch;
	useEffect(() => {
		if (!institution) {
			return;
		} else if (isImmediateSession) {
			Cookies.set('immediateAccess', '1');
		} else {
			setIsImmediateSession(
				!!institution?.immediateAccessEnabled && (!!immediateAccess || isImmediateRouteMatch)
			);
		}
	}, [immediateAccess, institution, isImmediateRouteMatch, isImmediateSession]);

	// Process configured route redirects
	useEffect(() => {
		if (!didCheckTrackFlag) {
			return;
		}

		const redirectConfig = routeRedirects.find((c) => {
			if (c.caseSensitive) {
				return c.fromPath === match?.pathname;
			}

			return c.fromPath.toLowerCase() === match?.pathname.toLowerCase();
		});

		if (redirectConfig) {
			navigate(
				{
					pathname: redirectConfig.toPath,
					search: new URLSearchParams({
						...redirectConfig.searchParams,
						track: '' + isTrackedSession,
					}).toString(),
				},
				{
					replace: false,
				}
			);
		}

		setDidProcessRedirects(true);
	}, [didCheckTrackFlag, isTrackedSession, match?.pathname, navigate]);

	// Process accessToken (cookie/queryParam)
	// after determinining enabled routes/redirects
	searchParams.delete('accessToken');
	const accessTokenFromCookie = Cookies.get('accessToken');
	useEffect(() => {
		if (!institution || !didProcessRedirects || didCheckAccessToken) {
			return;
		}

		if (accessTokenFromCookie && accessToken === accessTokenFromCookie) {
			processAccessToken(accessTokenFromCookie);
			return;
		}

		if (!accessToken) {
			setDidCheckAccessToken(true);
			setDidCheckImmediateFlag(true);
			return;
		}

		processAccessToken(accessToken);
	}, [accessToken, accessTokenFromCookie, didCheckAccessToken, didProcessRedirects, institution, processAccessToken]);

	const value = {
		account,
		setAccount,
		processAccessToken,
		initialized,
		didCheckImmediateFlag,
		isAnonymous,
		institution,
		setInstitution,
		accountSources,
		institutionCapabilities,
		signOutAndClearContext,
		isTrackedSession,
		isImmediateSession,
	};

	return <AccountContext.Provider value={value}>{props.children}</AccountContext.Provider>;
};

const AccountConsumer = AccountContext.Consumer;

export { AccountContext, AccountProvider, AccountConsumer };
