import Cookies from 'js-cookie';
import React, { Suspense } from 'react';
import { Loader } from 'react-bootstrap-typeahead';
import { LoaderFunctionArgs, Outlet, useRouteError, useRouteLoaderData } from 'react-router-dom';

import { queryClient } from '@/app-providers';
import Alert from '@/components/alert';
import ConsentModal from '@/components/consent-modal';
import ErrorDisplay from '@/components/error-display';
import ErrorModal from '@/components/error-modal';
import Flags from '@/components/flags';
import Footer from '@/components/footer';
import HeaderUnauthenticated from '@/components/header-unauthenticated';
import InCrisisModal from '@/components/in-crisis-modal';
import ReauthModal from '@/components/reauth-modal';
import { AccountProvider } from '@/contexts/account-context';
import { AnalyticsProvider } from '@/contexts/analytics-context';
import { BookingProvider } from '@/contexts/booking-context';
import useAccount from '@/hooks/use-account';
import useConsentState from '@/hooks/use-consent-state';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import useUrlViewTracking from '@/hooks/use-url-view-tracking';
import { accountService, institutionService } from '@/lib/services';
import { getCookieOrParamAsBoolean, getSubdomain } from '@/lib/utils';
import { updateTokenCookies } from '@/routes/auth';

type AppRootLoaderData = Awaited<ReturnType<typeof loader>>;

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

	const institutionResponse = await queryClient.ensureQueryData(
		institutionService.getInstitution({
			subdomain,
			accountSourceId,
		})
	);

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
	}

	if (accessToken) {
		accountId = updateTokenCookies(accessToken);
	}

	return {
		subdomain,
		accountSourceId,
		isTrackedSession,
		isImmediateSession,
		initialData: {
			accountId,
			institutionResponse,
		},
	};
}

export const Component = () => {
	useUrlViewTracking();

	return (
		<AnalyticsProvider>
			<AccountProvider>
				<BookingProvider>
					<Suspense fallback={<Loader />}>
						<Layout />
					</Suspense>
				</BookingProvider>
			</AccountProvider>
		</AnalyticsProvider>
	);
};

const Layout = () => {
	const { show, isCall, closeInCrisisModal } = useInCrisisModal();

	const { account } = useAccount();
	const { showConsentModal } = useConsentState();

	return (
		<>
			<InCrisisModal show={show} isCall={isCall} onHide={closeInCrisisModal} />
			<ConsentModal show={showConsentModal} />
			<ErrorModal />
			<ReauthModal />

			<Alert />
			<Flags />

			<Outlet />

			{account && <Footer />}
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
