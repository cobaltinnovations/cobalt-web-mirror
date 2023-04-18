import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import React, { Suspense } from 'react';
import { Loader } from 'react-bootstrap-typeahead';
import { LoaderFunctionArgs, Outlet, matchPath, useRouteError } from 'react-router-dom';
import Alert from './components/alert';
import ConsentModal from './components/consent-modal';
import ErrorModal from './components/error-modal';
import Flags from './components/flags';
import Footer from './components/footer';
import InCrisisModal from './components/in-crisis-modal';
import ReauthModal from './components/reauth-modal';
import { AccountProvider } from './contexts/account-context';
import { AnalyticsProvider } from './contexts/analytics-context';
import { BookingProvider } from './contexts/booking-context';
import useAccount from './hooks/use-account';
import useConsentState from './hooks/use-consent-state';
import useInCrisisModal from './hooks/use-in-crisis-modal';
import { getSubdomain } from './hooks/use-subdomain';
import useUrlViewTracking from './hooks/use-url-view-tracking';
import { AccountModel, AccountSource, Institution } from './lib/models';
import { accountService, institutionService } from './lib/services';
import HeaderUnauthenticated from './components/header-unauthenticated';
import ErrorDisplay from './components/error-display';
import { processAccessToken } from './auth-loader';

export interface AppRootLoaderData {
	isTrackedSession: boolean;
	isImmediateSession: boolean;
	institution: Institution;
	accountSources: AccountSource[];
	account?: AccountModel;
}

export async function appRootLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	let account: AccountModel | undefined = undefined;
	let accessToken = Cookies.get('accessToken');

	// Check MyChart access token
	const myChartAccessToken = url.searchParams.get('myChartAccessToken');
	if (myChartAccessToken) {
		const accountDataRequest = accountService.getMyChartAccount(myChartAccessToken);

		request.signal.addEventListener('abort', () => {
			accountDataRequest.abort();
		});

		const response = await accountDataRequest.fetch();

		accessToken = response.accessToken;
		processAccessToken(accessToken);
	}
	// end -- MyChart check

	// Check if session should be tracked
	let isTrackedSession = url.searchParams.get('track') === 'true';
	if (isTrackedSession) {
		Cookies.set('track', 'true');
	}

	isTrackedSession = isTrackedSession || Cookies.get('track') === 'true';
	// end -- track check

	// Check if session should be immediate
	let isImmediateSession = url.searchParams.get('immediateAccess') === 'true';
	const immediateSupportPathMatch = matchPath('/immediate-support/:supportRoleId', url.pathname);

	if (isImmediateSession || !!immediateSupportPathMatch) {
		Cookies.set('immediateAccess', 'true');
	}

	isImmediateSession = isImmediateSession || Cookies.get('immediateAccess') === 'true';
	// end -- immediate check

	// Get institution data
	const subdomain = getSubdomain();
	const accountSourceId = url.searchParams.get('accountSourceId');

	const institutionDataRequest = institutionService.getInstitution({
		subdomain,
		...(accountSourceId ? { accountSourceId } : {}),
	});

	request.signal.addEventListener('abort', () => {
		institutionDataRequest.abort();
	});

	const institutionResponse = await institutionDataRequest.fetch();

	const institution = institutionResponse.institution;
	// end -- institution data

	const decodedAccessToken = accessToken ? (jwtDecode(accessToken) as { sub: string; exp: number }) : undefined;

	// Handle Immediate Access
	if (!decodedAccessToken && institution.immediateAccessEnabled && isImmediateSession && !isTrackedSession) {
		const anonymousAccountDataRequest = accountService.createAnonymousAccount();

		request.signal.addEventListener('abort', () => {
			anonymousAccountDataRequest.abort();
		});

		const anonymousAccountResponse = await anonymousAccountDataRequest.fetch();

		processAccessToken(anonymousAccountResponse.accessToken);

		account = anonymousAccountResponse.account;
	} else if (decodedAccessToken) {
		// load account data if logged in
		const accountDataRequest = accountService.account(decodedAccessToken.sub);

		request.signal.addEventListener('abort', () => {
			accountDataRequest.abort();
		});

		const accountResponse = await accountDataRequest.fetch();

		account = accountResponse.account;
	}

	return {
		accountSources: institutionResponse.accountSources,
		institution: institutionResponse.institution,
		account,
		isTrackedSession,
		isImmediateSession,
	};
}

export const AppRoot = () => {
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

export const AppRootErrorLayout = () => {
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
