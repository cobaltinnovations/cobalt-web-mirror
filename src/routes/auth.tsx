import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { LoaderFunctionArgs, Navigate, redirect, useLoaderData, useRevalidator } from 'react-router-dom';

import { LoginDestinationIdRouteMap } from '@/contexts/account-context';
import useAccount from '@/hooks/use-account';
import { config } from '@/config';
import { accountService, institutionService } from '@/lib/services';
import Loader from '@/components/loader';
import { getSubdomain } from '@/lib/utils';
import { AnonymousAccountExpirationStrategyId } from '@/lib/models';

type AuthLoaderData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	let subdomain = getSubdomain(url);

	const myChartAccessToken = url.searchParams.get('myChartAccessToken');
	const accountSourceId = url.searchParams.get('accountSourceId');

	let accessToken = url.searchParams.get('accessToken');

	const institutionResponse = await institutionService
		.getInstitution({
			subdomain,
			accountSourceId,
		})
		.fetch();

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

	const accountId = updateTokenCookies(
		accessToken,
		institutionResponse.institution.anonymousAccountExpirationStrategyId ===
			AnonymousAccountExpirationStrategyId.SINGLE_SESSION
	);

	let authRedirectUrl = Cookies.get('authRedirectUrl') || '/';

	if (config.authRedirectUrls.some((url) => authRedirectUrl.startsWith(url))) {
		authRedirectUrl = '/';
	}

	try {
		const parsedRedirectUrl = new URL(window.location.origin + authRedirectUrl);
		authRedirectUrl = parsedRedirectUrl.pathname + parsedRedirectUrl.search;
	} catch (e) {
		// bad authRedirectUrl from queryParam/cookie
		authRedirectUrl = '/';
	}

	Cookies.remove('authRedirectUrl');

	return {
		authRedirectUrl,
		accountId,
	};
}

export const Component = () => {
	const { accountId, authRedirectUrl } = useLoaderData() as AuthLoaderData;
	const { account } = useAccount();
	const [destination, setDestination] = useState<string | null>(null);
	const revalidator = useRevalidator();

	useEffect(() => {
		setDestination(authRedirectUrl);

		return () => {
			Cookies.remove('authRedirectUrl');
		};
	}, [authRedirectUrl]);

	const shouldRevalidate = !!destination && !!accountId && !account && revalidator.state === 'idle';

	useEffect(() => {
		if (shouldRevalidate) {
			revalidator.revalidate();
		}
	}, [revalidator, shouldRevalidate]);

	if (!destination || !account) {
		return <Loader />;
	}

	return <Navigate to={destination === '/' ? LoginDestinationIdRouteMap[account.loginDestinationId] : destination} />;
};

export function decodeAccessToken(accessToken: string) {
	const decodedAccessToken = jwtDecode(accessToken) as { sub: string; exp: number };
	const accountId = decodedAccessToken.sub;
	const expirationDate = new Date(decodedAccessToken.exp * 1000);

	return { accountId, expirationDate };
}

export function updateTokenCookies(accessToken: string, isSession: boolean = false) {
	const { accountId, expirationDate } = decodeAccessToken(accessToken);

	const cookieOptions = {
		...(!isSession && { expires: expirationDate }),
	};

	Cookies.set('accessToken', accessToken, cookieOptions);

	return accountId;
}
