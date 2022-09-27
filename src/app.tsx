import React, { FC, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import config from '@/lib/config';

import Alert from '@/components/alert';
import ErrorModal from '@/components/error-modal';
import Footer from '@/components/footer';
import InCrisisModal from '@/components/in-crisis-modal';
import Loader from '@/components/loader';
import PrivateRoute from '@/components/private-route';
import ReauthModal from '@/components/reauth-modal';

import { AppRoutes, NoMatch } from '@/routes';

import { useCustomBootstrapStyles } from '@/jss/hooks/use-custom-bootstrap-styles';
import { useGlobalStyles } from '@/jss/hooks/use-global-styles';

import { AccountProvider } from '@/contexts/account-context';
import { AlertProvider } from '@/contexts/alert-context';
import { AnalyticsProvider } from '@/contexts/analytics-context';
import { BookingProvider } from '@/contexts/booking-context';
import { ErrorModalProvider } from '@/contexts/error-modal-context';
import { InCrisisModalProvider } from '@/contexts/in-crisis-modal-context';
import { ReauthModalProvider } from '@/contexts/reauth-modal-context';

import DownForMaintenance from '@/pages/down-for-maintenance';

import useUrlViewTracking from '@/hooks/use-url-view-tracking';
import useConsentRedirect from '@/hooks/use-consent-redirect';
import { CobaltThemeProvider } from './jss/theme';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-multi-carousel/lib/styles.css';
import './scss/main.scss';

const AppWithProviders: FC = () => {
	const { show, isCall, closeInCrisisModal } = useInCrisisModal();
	const { account, institution, initialized, didCheckImmediateFlag } = useAccount();

	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	useConsentRedirect();
	useUrlViewTracking();

	if (!initialized) {
		return <Loader />;
	}

	return (
		<>
			<InCrisisModal show={show} isCall={isCall} onHide={closeInCrisisModal} />
			<ErrorModal />
			<ReauthModal />

			<Alert />

			<Routes>
				{AppRoutes.map((config, groupIndex) => {
					return (
						<Route key={groupIndex} element={<config.layout />}>
							{config.routes.map((route, index) => {
								// hold-off registering/rendering routes until
								// immediate flags/param is checked & proessed
								if (!didCheckImmediateFlag) {
									return null;
								}

								const isEnabled =
									typeof route.routeGuard === 'function'
										? route.routeGuard({
												account,
												institution,
										  })
										: true;

								const renderMainRouteComponent = () => {
									if (!isEnabled) {
										return <NoMatch />;
									}

									return <route.main />;
								};

								return (
									<Route
										key={index}
										path={route.path}
										element={
											<Suspense fallback={<Loader />}>
												{route.private ? (
													<PrivateRoute>{renderMainRouteComponent()}</PrivateRoute>
												) : (
													renderMainRouteComponent()
												)}
											</Suspense>
										}
									/>
								);
							})}
						</Route>
					);
				})}
			</Routes>

			<Footer />
		</>
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
									<AppWithProviders />
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
	return (
		<Router>
			<CobaltThemeProvider>
				<ThemedApp />
			</CobaltThemeProvider>
		</Router>
	);
};

export default App;
