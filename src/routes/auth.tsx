import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { LoaderFunctionArgs, Navigate, redirect, useLoaderData, useRevalidator } from 'react-router-dom';

import { LoginDestinationIdRouteMap } from '@/contexts/account-context';
import useAccount from '@/hooks/use-account';
import { config } from '@/config';
import { accountService, analyticsService, institutionService } from '@/lib/services';
import Loader from '@/components/loader';
import { getSubdomain } from '@/lib/utils';
import { AnalyticsNativeEventTypeId, AnonymousAccountExpirationStrategyId } from '@/lib/models';

type AuthLoaderData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	let subdomain = getSubdomain(url);

	const myChartAccessToken = url.searchParams.get('myChartAccessToken');
	const accountSourceId = url.searchParams.get('accountSourceId');
	let forceDestination = url.searchParams.get('forceDestination');

	// We might need to URL-decode the `forceDestionation` query parameter
	if (forceDestination && forceDestination.includes('%')) {
		forceDestination = decodeURIComponent(forceDestination);
	}

	let accessToken = url.searchParams.get('accessToken');

	const institutionResponse = await institutionService
		.getInstitution({
			subdomain,
			accountSourceId,
		})
		.fetch();

	const accessTokenAlreadyOnFile = !!Cookies.get('accessToken');

	// Keep some transient session data around to avoid making double-calls to POST /accounts/mychart
	// because this auth flow runs twice in rapid succession.
	// TODO: rework the auth flow more generally here on the FE so we don't execute it twice.
	let myChartAccessTokenFromSessionStorage = sessionStorage.getItem('cobalt.myChartAccessToken');
	let myChartCobaltAccessTokenFromSessionStorage = sessionStorage.getItem('cobalt.myChartCobaltAccessToken');

	if (myChartAccessToken) {
		if (myChartAccessTokenFromSessionStorage === myChartAccessToken && myChartCobaltAccessTokenFromSessionStorage) {
			// We have saved-off data from previous go-round: use it instead of calling POST /accounts/mychart again.
			accessToken = myChartCobaltAccessTokenFromSessionStorage;

			try {
				sessionStorage.removeItem('cobalt.myChartAccessToken');
				sessionStorage.removeItem('cobalt.myChartCobaltAccessToken');
			} catch (ignored) {
				// Nothing to do
			}
		} else {
			const myChartAccountRequest = accountService.getMyChartAccount(myChartAccessToken);
			request.signal.onabort = () => {
				myChartAccountRequest.abort();
			};
			const myChartAccountResponse = await myChartAccountRequest.fetch();
			accessToken = myChartAccountResponse.accessToken;

			// Save off for next go-round
			try {
				sessionStorage.setItem('cobalt.myChartAccessToken', myChartAccessToken);
				sessionStorage.setItem('cobalt.myChartCobaltAccessToken', accessToken);
			} catch (ignored) {
				// Nothing to do
			}
		}
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

	// We can run through this auth code path multiple times (redundantly).
	// Only send an analytics event if this is a non-redundant invocation.
	// Suppose we did not do this: there would then be duplicate analytics events fired for sign-in
	if (!accessTokenAlreadyOnFile) {
		let analyticsRedirectUrl = forceDestination
			? forceDestination
			: authRedirectUrl && authRedirectUrl !== '/'
				? authRedirectUrl
				: undefined;
		analyticsService.persistEvent(AnalyticsNativeEventTypeId.ACCOUNT_SIGNED_IN, {
			accountId: accountId,
			redirectUrl: analyticsRedirectUrl,
		});
	}

	if (forceDestination) {
		authRedirectUrl = forceDestination;
	}

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
