import React, { FC, Suspense, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter as Router, Route, useLocation } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import config from '@/lib/config';
import { addMaximumScaleToViewportMetaTag, isIos } from '@/lib/utils/device-utils';

import Alert from '@/components/alert';
import ErrorModal from '@/components/error-modal';
import SentryErrorBoundary from '@/components/sentry-error-boundary';
import SentryRoutes from '@/components/sentry-routes';
import Footer from '@/components/footer';
import InCrisisModal from '@/components/in-crisis-modal';
import Loader from '@/components/loader';
import PrivateRoute from '@/components/private-route';
import ReauthModal from '@/components/reauth-modal';
import ConsentModal from '@/components/consent-modal';
import ErrorDisplay from '@/components/error-display';
import HeaderUnauthenticated from '@/components/header-unauthenticated';

import { AppRoutes, RouteConfig, NoMatch } from '@/routes';

import { useCustomBootstrapStyles } from '@/jss/hooks/use-custom-bootstrap-styles';
import { useGlobalStyles } from '@/jss/hooks/use-global-styles';

import { AccountProvider } from '@/contexts/account-context';
import { AlertProvider } from '@/contexts/alert-context';
import { AnalyticsProvider } from '@/contexts/analytics-context';
import { BookingProvider } from '@/contexts/booking-context';
import { ErrorModalProvider } from '@/contexts/error-modal-context';
import { InCrisisModalProvider } from '@/contexts/in-crisis-modal-context';
import { ReauthModalProvider } from '@/contexts/reauth-modal-context';
import { FlagsProvider } from '@/contexts/flags-context';

import DownForMaintenance from '@/pages/down-for-maintenance';

import useUrlViewTracking from '@/hooks/use-url-view-tracking';
import useConsentState from '@/hooks/use-consent-state';
import { CobaltThemeProvider } from './jss/theme';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-multi-carousel/lib/styles.css';
import './scss/main.scss';
import Flags from './components/flags';

const AppWithProviders: FC = () => {
	const { show, isCall, closeInCrisisModal } = useInCrisisModal();
	const { account, failedToInit, initialized } = useAccount();
	const { showConsentModal } = useConsentState();
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	if (failedToInit) {
		return (
			<>
				<HeaderUnauthenticated hideSignInButton />
				<ErrorDisplay
					error={{}}
					showBackButton={false}
					showRetryButton={true}
					onRetryButtonClick={() => {
						window.location.reload();
					}}
				/>
			</>
		);
	}

	if (!initialized) {
		return <Loader />;
	}

	return (
		<>
			<ConsentModal show={showConsentModal} />
			<InCrisisModal show={show} isCall={isCall} onHide={closeInCrisisModal} />
			<ErrorModal />
			<ReauthModal />

			<Alert />
			<Flags />

			<SentryRoutes>
				{AppRoutes.map((config, groupIndex) => {
					return (
						<Route key={groupIndex} element={<config.layout />}>
							{config.routes.map((route, index) => {
								return <Route key={index} path={route.path} element={<AppRoute route={route} />} />;
							})}
						</Route>
					);
				})}
			</SentryRoutes>

			{account && <Footer />}
		</>
	);
};

const AppRoute = ({ route }: { route: RouteConfig }) => {
	const { account, institution, didCheckImmediateFlag } = useAccount();

	useUrlViewTracking();

	const isEnabled = useMemo(() => {
		return typeof route.routeGuard === 'function'
			? route.routeGuard({
					account,
					institution,
			  })
			: true;
	}, [account, institution, route]);

	const RouteElement = useMemo(() => {
		return isEnabled ? route.main : NoMatch;
	}, [isEnabled, route.main]);

	// hold-off registering/rendering routes until
	// immediate flags/param is checked & proessed
	if (!didCheckImmediateFlag) {
		return null;
	}

	return (
		<Suspense fallback={<Loader />}>
			<SentryErrorBoundary>
				{route.private ? (
					<PrivateRoute>
						<RouteElement />
					</PrivateRoute>
				) : (
					<RouteElement />
				)}
			</SentryErrorBoundary>
		</Suspense>
	);
};

const ThemedApp: FC = () => {
	useGlobalStyles();
	useCustomBootstrapStyles();

	// Can put application blocking pages here, while still using styles
	if (config.COBALT_WEB_DOWN_FOR_MAINTENANCE === 'true') {
		return <DownForMaintenance />;
	}

	return (
		<ErrorModalProvider>
			<ReauthModalProvider>
				<AccountProvider>
					<AlertProvider>
						<BookingProvider>
							<InCrisisModalProvider>
								<AnalyticsProvider>
									<FlagsProvider>
										<AppWithProviders />
									</FlagsProvider>
								</AnalyticsProvider>
							</InCrisisModalProvider>
						</BookingProvider>
					</AlertProvider>
				</AccountProvider>
			</ReauthModalProvider>
		</ErrorModalProvider>
	);
};

const App: FC = () => {
	const appInitialied = useRef(false);

	// One time startup code here.
	useEffect(() => {
		if (appInitialied.current) {
			return;
		}

		if (isIos()) {
			addMaximumScaleToViewportMetaTag();
		}

		appInitialied.current = true;
	}, []);

	return (
		<Router>
			<CobaltThemeProvider>
				<ThemedApp />
			</CobaltThemeProvider>
		</Router>
	);
};

export default App;
