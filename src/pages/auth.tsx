import React, { FC, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

import useAccount from '@/hooks/use-account';
import useQuery from '@/hooks/use-query';

import Loader from '@/components/loader';

import { accountService } from '@/lib/services';
import { isPicMhicAccount } from './pic/utils';

type DecodedAccessToken = {
	sub: string;
	exp: number;
};

const Auth: FC = () => {
	const { account, setAccount, setInstitution } = useAccount();
	const history = useHistory();
	const query = useQuery();

	const accessTokenFromQuery = query.get('accessToken');

	const successfulAuthRedirect = useCallback(() => {
		const authRedirectUrl = Cookies.get('authRedirectUrl');

		if (authRedirectUrl) {
			return history.replace(authRedirectUrl);
		}

		const defaultRedirectUrl = account && isPicMhicAccount(account) ? '/pic/mhic' : '/';

		return history.replace(defaultRedirectUrl);
	}, [history, account]);

	const fetchAccount = useCallback(
		async (accountId) => {
			try {
				const response = await accountService.account(accountId).fetch();
				setAccount(response.account);
				setInstitution(response.institution);
			} catch (error) {
				return history.replace('/sign-in');
			}
		},
		[history, setAccount, setInstitution]
	);

	useEffect(() => {
		const accessTokenFromCookie = Cookies.get('accessToken');

		if (accessTokenFromQuery === accessTokenFromCookie) {
			successfulAuthRedirect();
			return;
		}

		let decodedAccessToken: DecodedAccessToken;

		if (accessTokenFromQuery) {
			decodedAccessToken = jwtDecode(accessTokenFromQuery) as DecodedAccessToken;
			const expirationDate = new Date(decodedAccessToken.exp * 1000);
			Cookies.set('accessToken', accessTokenFromQuery, { expires: expirationDate });
		} else if (accessTokenFromCookie) {
			decodedAccessToken = jwtDecode(accessTokenFromCookie) as DecodedAccessToken;
		} else {
			return history.replace('/sign-in');
		}

		fetchAccount(decodedAccessToken.sub);
	}, [accessTokenFromQuery, account, fetchAccount, history, successfulAuthRedirect]);

	return <Loader />;
};

export default Auth;
