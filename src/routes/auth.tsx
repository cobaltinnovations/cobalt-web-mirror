import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { LoaderFunctionArgs, Navigate, redirect, useLoaderData } from 'react-router-dom';

import { LoginDestinationIdRouteMap } from '@/contexts/account-context';
import useAccount from '@/hooks/use-account';
import { AUTH_REDIRECT_URLS } from '@/lib/config/constants';
import { accountService } from '@/lib/services';
import Loader from '@/components/loader';

type AuthLoaderData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	const myChartAccessToken = url.searchParams.get('myChartAccessToken');

	let accessToken = url.searchParams.get('accessToken');

	if (myChartAccessToken) {
		const myChartAccountRequest = accountService.getMyChartAccount(myChartAccessToken);
		request.signal.onabort = () => {
			myChartAccountRequest.abort();
		};
		const myChartAccountResponse = await myChartAccountRequest.fetch();
		accessToken = myChartAccountResponse.accessToken;
	}

	if (!accessToken) {
		return redirect('/sign-in');
	}

	const accountId = updateTokenCookies(accessToken);

	const ssoRedirectUrl = Cookies.get('ssoRedirectUrl');
	let authRedirectUrl = ssoRedirectUrl || Cookies.get('authRedirectUrl') || '/';

	if (AUTH_REDIRECT_URLS.some((url) => authRedirectUrl.startsWith(url))) {
		authRedirectUrl = '/';
	}

	try {
		const parsedRedirectUrl = new URL(window.location.origin + authRedirectUrl);
		authRedirectUrl = parsedRedirectUrl.pathname;
	} catch (e) {
		// bad authRedirectUrl from queryParam/cookie
		authRedirectUrl = '/';
	}

	Cookies.remove('ssoRedirectUrl');
	Cookies.remove('authRedirectUrl');

	return {
		authRedirectUrl,
		accountId,
	};
}

export const Component = () => {
	const { accountId, authRedirectUrl } = useLoaderData() as AuthLoaderData;
	const { account, setAccountId } = useAccount();
	const [destination, setDestination] = useState<string | null>(null);

	useEffect(() => {
		setAccountId(accountId);
	}, [accountId, setAccountId]);

	useEffect(() => {
		if (!account) {
			return;
		}

		let redirectTo = authRedirectUrl;

		if (redirectTo === '/') {
			redirectTo = LoginDestinationIdRouteMap[account?.loginDestinationId] || authRedirectUrl;
		}

		Cookies.remove('ssoRedirectUrl');
		Cookies.remove('authRedirectUrl');

		setDestination(redirectTo);
	}, [account, authRedirectUrl]);

	if (!destination) {
		return <Loader />;
	}

	return <Navigate to={destination} />;
};

export function updateTokenCookies(accessToken: string) {
	const decodedAccessToken = jwtDecode(accessToken) as { sub: string; exp: number };
	const expirationDate = new Date(decodedAccessToken.exp * 1000);
	const accountId = decodedAccessToken.sub;

	const cookieOptions = {
		expires: expirationDate,
	};

	Cookies.set('accessToken', accessToken, cookieOptions);
	Cookies.set('accountId', accountId, cookieOptions);

	return accountId;
}
