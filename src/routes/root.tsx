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
import { accountService, institutionService } from '@/lib/services';
import { getCookieOrParamAsBoolean, getSubdomain } from '@/lib/utils';
import { clearTokenCookies, updateTokenCookies } from '@/routes/auth';
import Loader from '@/components/loader';
import { AnonymousAccountExpirationStrategyId } from '@/lib/models';

type AppRootLoaderData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;

export function useAppRootLoaderData() {
	return useRouteLoaderData('root') as AppRootLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	let subdomain = getSubdomain(url);

	const isTrackedSession = getCookieOrParamAsBoolean(url, 'track');
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

	if (accessToken && accountResponse) {
		accountId = updateTokenCookies(
			accessToken,
			institutionResponse.institution.anonymousAccountExpirationStrategyId ===
				AnonymousAccountExpirationStrategyId.SINGLE_SESSION
		);
	}

	return {
		subdomain,
		accountSourceId,
		isTrackedSession,
		accountId,
		institutionResponse,
		accountResponse,
	};
}

export const Component = () => {
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

			<ScrollRestoration
				getKey={(location) => {
					if (location.pathname.includes('my-calendar')) {
						return location.pathname;
					}

					return location.key;
				}}
			/>
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
