import Cookies from 'js-cookie';
import React, { Suspense, useEffect } from 'react';

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
import { accountService, institutionService, topicCenterService } from '@/lib/services';
import { getCookieOrParamAsBoolean, getSubdomain } from '@/lib/utils';
import { decodeAccessToken, updateTokenCookies } from '@/routes/auth';
import Loader from '@/components/loader';
import { AccountSourceId, AnonymousAccountExpirationStrategyId, TopicCenterModel } from '@/lib/models';
import { clearChunkLoadErrorStorage } from '@/lib/utils/error-utils';

type AppRootLoaderData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;

const isUrlPathAcceptableForAnonymousImplicitAccountCreation = (urlPath = window.location.pathname) => {
	// Check for /resource-library: match exactly or followed by a slash.
	if (urlPath === '/resource-library' || urlPath.startsWith('/resource-library/')) {
		return true;
	}

	// Check for /group-sessions: match exactly or followed by a slash.
	if (urlPath === '/group-sessions' || urlPath.startsWith('/group-sessions/')) {
		return true;
	}

	// Check for /connect-with-support: match exactly or followed by a slash.
	if (urlPath === '/connect-with-support' || urlPath.startsWith('/connect-with-support/')) {
		return true;
	}

	// Check for /in-crisis: match exactly
	if (urlPath === '/in-crisis') {
		return true;
	}

	// Define the other prefixes that must be followed by something (i.e., they always end with a slash).
	const prefixes = ['/pages/', '/community/', '/featured-topics/'];

	// Check if path starts with any of these prefixes.
	return prefixes.some((prefix) => urlPath.startsWith(prefix));
};

export function useAppRootLoaderData() {
	return useRouteLoaderData('root') as AppRootLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	let subdomain = getSubdomain(url);

	const isTrackedSession = getCookieOrParamAsBoolean(url, 'track');
	const accountSourceId = url.searchParams.get('accountSourceId');

	let accessToken = Cookies.get('accessToken');
	let accountId: string | undefined;

	if (accessToken) {
		const decodedToken = decodeAccessToken(accessToken);
		accountId = decodedToken.accountId;
	}

	const institutionRequest = institutionService.getInstitution({
		subdomain,
		accountSourceId,
	});

	let accountRequest = accountId ? accountService.account(accountId) : undefined;

	let [institutionResponse, accountResponse] = await Promise.all([
		institutionRequest.fetch(),
		accountRequest?.fetch().catch(() => {
			Cookies.remove('accessToken');

			return new Error();
		}),
	]);

	if (accountResponse instanceof Error) {
		Cookies.set('authRedirectUrl', url.pathname + url.search);

		return redirect('/sign-in');
	}

	// If no access token existed at all, then we're OK to create an implicit anonymous account so long as the following hold:
	// 1. The institution supports these kinds of accounts
	// 2. The URL path starts with a supported prefix
	if (!accessToken) {
		const anonymousImplicitAccountSourceSupported =
			institutionResponse.accountSources.filter(
				(accountSource) => accountSource.accountSourceId === AccountSourceId.ANONYMOUS_IMPLICIT
			).length > 0;

		if (
			anonymousImplicitAccountSourceSupported &&
			isUrlPathAcceptableForAnonymousImplicitAccountCreation(window.location.pathname)
		) {
			const createAnonymousImplicitAccountRequest = await accountService.createAnonymousAccount({
				accountSourceId: AccountSourceId.ANONYMOUS_IMPLICIT,
			});

			const anonymousImplicitAccountAccessToken = (await createAnonymousImplicitAccountRequest.fetch())
				.accessToken;

			const authRedirectUrl = window.location.pathname + (window.location.search || '');
			Cookies.set('authRedirectUrl', authRedirectUrl);

			window.location.href = `/auth?accessToken=${encodeURIComponent(anonymousImplicitAccountAccessToken)}`;
		}
	}

	if (accessToken && accountResponse) {
		accountId = updateTokenCookies(
			accessToken,
			institutionResponse.institution.anonymousAccountExpirationStrategyId ===
				AnonymousAccountExpirationStrategyId.SINGLE_SESSION
		);
	}

	let featuredTopicCenter: TopicCenterModel | undefined;
	if (accessToken && institutionResponse.institution.featuredTopicCenterId) {
		const response = await topicCenterService
			.getTopicCenterById(institutionResponse.institution.featuredTopicCenterId)
			.fetch();

		featuredTopicCenter = response.topicCenter;
	}

	let secondaryFeaturedTopicCenter: TopicCenterModel | undefined;
	if (accessToken && institutionResponse.institution.featuredSecondaryTopicCenterId) {
		const response = await topicCenterService
			.getTopicCenterById(institutionResponse.institution.featuredSecondaryTopicCenterId)
			.fetch();

		secondaryFeaturedTopicCenter = response.topicCenter;
	}

	return {
		subdomain,
		accountSourceId,
		isTrackedSession,
		accountId,
		institutionResponse,
		accountResponse,
		featuredTopicCenter,
		secondaryFeaturedTopicCenter,
	};
}

export const Component = () => {
	useEffect(() => {
		setTimeout(() => {
			// removes the flag indicating a chunk load error has occurred and page force-refresed
			// timeout so we don't get into an "infinite refresh loop"
			// and gives enough time for ErrorDisplay to handle `ChunkLoadError`s
			clearChunkLoadErrorStorage();
		}, 1000);
	}, []);

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
