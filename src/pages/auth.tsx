import React, { FC, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

import useAccount from '@/hooks/use-account';
import useQuery from '@/hooks/use-query';

import Loader from '@/components/loader';

import { accountService } from '@/lib/services';

type DecodedAccessToken = {
	sub: string;
	exp: number;
};

const Auth: FC = () => {
	const { account, setAccount, setInstitution } = useAccount();
	const navigate = useNavigate();
	const query = useQuery();

	const accessTokenFromQuery = query.get('accessToken');

	const successfulAuthRedirect = useCallback(() => {
		const authRedirectUrl = Cookies.get('authRedirectUrl');

		return navigate(authRedirectUrl || '/', { replace: true });
	}, [navigate]);

	const fetchAccount = useCallback(
		async (accountId: string) => {
			try {
				const response = await accountService.account(accountId).fetch();
				setAccount(response.account);
				setInstitution(response.institution);
			} catch (error) {
				return navigate('/sign-in', { replace: true });
			}
		},
		[navigate, setAccount, setInstitution]
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
			return navigate('/sign-in', { replace: true });
		}

		fetchAccount(decodedAccessToken.sub);
	}, [accessTokenFromQuery, account, fetchAccount, navigate, successfulAuthRedirect]);

	return <Loader />;
};

export default Auth;
