import React, { FC, createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

import { AccountInstitutionCapabilities, AccountModel, AccountSourceId } from '@/lib/models';
import { accountService, institutionService } from '@/lib/services';

import useQuery from '@/hooks/use-query';
import { AccountSource, Institution } from '@/lib/models/institution';
import useHandleError from '@/hooks/use-handle-error';
import { useGetPicPatient, useGetValidMhic } from '@/hooks/pic-hooks';
import { PatientObject } from '@/pages/pic/utils';
import useSubdomain from '@/hooks/use-subdomain';
import { isPicPatientAccount, isPicMhicAccount } from '@/pages/pic/utils';

const PicPatientAuthCtx = ({ onPatientChange, onUnauthorized }: { onPatientChange: (data: PatientObject) => void; onUnauthorized: () => void }) => {
	const location = useLocation();
	const history = useHistory();

	useGetPicPatient(onPatientChange, (error) => {
		if (error.response?.status === 401) {
			onUnauthorized();
			const authRedirectUrl = location.pathname + (location.search || '');
			Cookies.set('authRedirectUrl', authRedirectUrl);
		}
	});

	return null;
};

type AccountContextConfig = {
	account: AccountModel | undefined;
	setAccount: React.Dispatch<any>;
	initialized: boolean;
	isAnonymous: boolean;
	institution: Institution | undefined;
	setInstitution: React.Dispatch<React.SetStateAction<Institution | undefined>>;
	accountSources: AccountSource[] | undefined;
	subdomainInstitution: Institution | undefined;
	institutionCapabilities: AccountInstitutionCapabilities | undefined;
	isMhic: boolean;
	picPatient: PatientObject | undefined;
	signOutAndClearContext: () => void;
};

const AccountContext = createContext({} as AccountContextConfig);

const AccountProvider: FC = (props) => {
	const handleError = useHandleError();
	const [initialized, setInitialized] = useState(false);
	const [account, setAccount] = useState<AccountModel | undefined>(undefined);
	const [institution, setInstitution] = useState<Institution | undefined>(undefined);
	const [accountSources, setAccountSources] = useState<AccountSource[] | undefined>(undefined);
	const [subdomainInstitution, setSubdomainInstitution] = useState<Institution | undefined>(undefined);
	const [isMhic, setIsMhic] = useState(false);
	const [picPatient, setPicPatient] = useState<PatientObject | undefined>(undefined);
	const isAnonymous = account?.accountSourceId === AccountSourceId.ANONYMOUS;

	const query = useQuery();
	const history = useHistory();
	const location = useLocation();
	const immediateSupportRouteMatch = useRouteMatch<{ supportRoleId: string }>({
		path: '/immediate-support/:supportRoleId',
	});
	const subdomain = useSubdomain();

	const immediateAccess = query.get('immediateAccess');

	const signOutAndClearContext = useCallback(() => {
		Cookies.remove('accessToken');
		Cookies.remove('authRedirectUrl');
		Cookies.remove('immediateAccess');
		Cookies.remove('seenWaivedCopay');
		Cookies.remove('x-mhic-cobalt-token');
		Cookies.remove('piccobalt_patientcontext');

		let signInPath = '/sign-in';
		const hostname = window.location.hostname.toLowerCase();
		
		if (hostname.indexOf('pic.') === 0) {
			if (isMhic) {
				const redirectUrl = hostname.indexOf('pic.dev.') === 0 ? 'https://pic.dev.cobaltinnovations.org/sign-in-email' : 'https://pic.cobaltinnovations.org/sign-in-email';
				window.location.href = redirectUrl;
				return;
			}

			signInPath = '/patient-sign-in';
		}

		history.push(signInPath);
		setAccount(undefined);
		setInstitution(undefined);
	}, [subdomain, history, isMhic]);

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

			accountService
				.createAnonymousAccount()
				.fetch()
				.then((response) => {
					setInitialized(true);

					history.replace({
						pathname: '/auth',
						search: '?' + new URLSearchParams({ accessToken: response.accessToken }).toString(),
					});
				})
				.catch((e) => {
					handleError(e);
				});
			return;
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

					setInitialized(!isPicPatientAccount(response.account));
					setIsMhic(isPicMhicAccount(response.account));
				})
				.catch((e) => {
					// Unable to initialize/fetch account
					// from stored cookie
					setInitialized(true);
					signOutAndClearContext();
				});
		}
	}, [handleError, history, immediateAccess, immediateSupportRouteMatch, initialized, location.pathname, location.search, signOutAndClearContext]);

	// Fetch subdomain instituion on mount
	useEffect(() => {
		institutionService
			.getInstitution({ subdomain })
			.fetch()
			.then((response) => {
				setAccountSources(response.accountSources);
				setSubdomainInstitution(response.institution);
			});
	}, [subdomain]);

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
		isMhic,
		picPatient,
		signOutAndClearContext,
	};

	return (
		<AccountContext.Provider value={value}>
			{subdomain === 'pic' && account && isPicPatientAccount(account) && (
				<PicPatientAuthCtx
					onPatientChange={(patient) => {
						setPicPatient(patient);
						setInitialized(true);
					}}
					onUnauthorized={signOutAndClearContext}
				/>
			)}
			{props.children}
		</AccountContext.Provider>
	);
};

const AccountConsumer = AccountContext.Consumer;

export { AccountContext, AccountProvider, AccountConsumer };
