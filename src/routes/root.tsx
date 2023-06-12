import Cookies from 'js-cookie';
import React, { Suspense } from 'react';

import {
	LoaderFunctionArgs,
	Outlet,
	ScrollRestoration,
	redirect,
	useRouteError,
	useRouteLoaderData,
} from 'react-router-dom';

import Alert from '@/components/alert';
import ConsentModal from '@/components/consent-modal';
import ErrorDisplay from '@/components/error-display';
import ErrorModal from '@/components/error-modal';
import Flags from '@/components/flags';
import HeaderUnauthenticated from '@/components/header-unauthenticated';
import InCrisisModal from '@/components/in-crisis-modal';
import ReauthModal from '@/components/reauth-modal';
import { AccountProvider } from '@/contexts/account-context';
import { AnalyticsProvider } from '@/contexts/analytics-context';
import { BookingProvider } from '@/contexts/booking-context';
import useConsentState from '@/hooks/use-consent-state';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import useUrlViewTracking from '@/hooks/use-url-view-tracking';
import { accountService, institutionService } from '@/lib/services';
import { getCookieOrParamAsBoolean, getSubdomain } from '@/lib/utils';
import { clearTokenCookies, updateTokenCookies } from '@/routes/auth';
import Loader from '@/components/loader';

type AppRootLoaderData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;

export function useAppRootLoaderData() {
	return useRouteLoaderData('root') as AppRootLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	let subdomain = getSubdomain(url);

	const isTrackedSession = getCookieOrParamAsBoolean(url, 'track');
	const isImmediateSession = getCookieOrParamAsBoolean(url, 'immediateAccess');
	const accountSourceId = url.searchParams.get('accountSourceId');

	let accessToken = Cookies.get('accessToken');
	let accountId = Cookies.get('accountId');

	const institutionRequest = institutionService.getInstitution({
		subdomain,
		accountSourceId,
	});

	let accountRequest = accountId ? accountService.account(accountId) : undefined;

	let [institutionResponse, accountResponse] = await Promise.all([
		institutionRequest.fetch(),
		accountRequest?.fetch().catch(() => {
			clearTokenCookies();

			return new Error();
		}),
	]);

	if (accountResponse instanceof Error) {
		Cookies.set('authRedirectUrl', url.pathname + url.search);

		return redirect('/sign-in');
	}

	if (
		institutionResponse.institution.immediateAccessEnabled &&
		!accessToken &&
		!isTrackedSession &&
		isImmediateSession
	) {
		const anonymousAccountDataRequest = accountService.createAnonymousAccount();

		request.signal.addEventListener('abort', () => {
			anonymousAccountDataRequest.abort();
		});

		const anonymousAccountResponse = await anonymousAccountDataRequest.fetch();

		accessToken = anonymousAccountResponse.accessToken;
		accountResponse = {
			...anonymousAccountResponse,
			institution: institutionResponse.institution,
		};
	}

	if (accessToken && accountResponse) {
		accountId = updateTokenCookies(accessToken);
	}

	return {
		subdomain,
		accountSourceId,
		isTrackedSession,
		isImmediateSession,
		accountId,
		institutionResponse,
		accountResponse,
	};
}

export const Component = () => {
	useUrlViewTracking();

	return (
		<AccountProvider>
			<AnalyticsProvider>
				<BookingProvider>
					<Layout />
				</BookingProvider>
			</AnalyticsProvider>
		</AccountProvider>
	);
};

const Layout = () => {
	const { show, isCall, closeInCrisisModal } = useInCrisisModal();

	const { showConsentModal } = useConsentState();

	return (
		<>
			<InCrisisModal show={show} isCall={isCall} onHide={closeInCrisisModal} />
			<ConsentModal show={showConsentModal} />
			<ErrorModal />
			<ReauthModal />

			<Alert />
			<Flags />

			<Suspense fallback={<Loader />}>
				<Outlet />
			</Suspense>

			<ScrollRestoration />
		</>
	);
};

const AppRootErrorLayout = () => {
	const error = useRouteError();

	return (
		<>
			<HeaderUnauthenticated hideSignInButton />

			<ErrorDisplay
				error={error}
				showBackButton={false}
				showRetryButton={true}
				onRetryButtonClick={() => {
					window.location.reload();
				}}
			/>
		</>
	);
};

export const errorElement = <AppRootErrorLayout />;
