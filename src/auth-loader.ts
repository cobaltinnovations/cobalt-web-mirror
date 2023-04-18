import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import { LoaderFunctionArgs, redirect } from 'react-router-dom';
import { AUTH_REDIRECT_URLS } from './lib/config/constants';
import { accountService } from './lib/services';
import { LoginDestinationIdRouteMap } from './contexts/account-context';
import { isErrorConfig } from './lib/utils/error-utils';

export function processAccessToken(accessToken: string) {
	const decodedAccessToken = jwtDecode(accessToken) as { sub: string; exp: number };
	const expirationDate = new Date(decodedAccessToken.exp * 1000);

	Cookies.set('accessToken', accessToken, { expires: expirationDate });
	Cookies.set('accountId', decodedAccessToken.sub, { expires: expirationDate });

	return decodedAccessToken;
}

export async function authLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	const accessToken = url.searchParams.get('accessToken');

	if (!accessToken) {
		return redirect('/sign-in');
	}

	const decodedAccessToken = processAccessToken(accessToken);

	const ssoRedirectUrl = Cookies.get('ssoRedirectUrl');
	let authRedirectUrl = ssoRedirectUrl || Cookies.get('authRedirectUrl') || '/';

	if (AUTH_REDIRECT_URLS.some((url) => authRedirectUrl.startsWith(url))) {
		authRedirectUrl = '/';
	}

	try {
		const accountDataRequest = accountService.account(decodedAccessToken.sub);

		request.signal.addEventListener('abort', () => {
			accountDataRequest.abort();
		});

		const response = await accountDataRequest.fetch();

		try {
			const parsedRedirectUrl = new URL(window.location.origin + authRedirectUrl);

			if (parsedRedirectUrl.pathname === '/') {
				authRedirectUrl = LoginDestinationIdRouteMap[response.account.loginDestinationId] || authRedirectUrl;
			}
		} catch (e) {
			// bad authRedirectUrl from queryParam/cookie
			authRedirectUrl = LoginDestinationIdRouteMap[response.account.loginDestinationId];
		}

		Cookies.remove('ssoRedirectUrl');
		Cookies.remove('authRedirectUrl');

		return redirect(authRedirectUrl);
	} catch (error) {
		if (!isErrorConfig(error) || error.code !== 'AUTHENTICATION_REQUIRED') {
			Cookies.set('authRedirectUrl', authRedirectUrl);
		}

		return redirect('/sign-in');
	}
}
