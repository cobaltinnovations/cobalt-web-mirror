import React, { FC, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom';
import { ThemeProvider as BootstrapThemeProvider } from 'react-bootstrap';

import config from '@/lib/config';
import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import useGoogleAnalytics from '@/hooks/use-google-analytics';

import Footer from '@/components/footer';
import PrivateRoute from '@/components/private-route';
import InCrisisModal from '@/components/in-crisis-modal';
import Alert from '@/components/alert';
import ErrorModal from '@/components/error-modal';

import { Routes } from '@/routes';

import prefixes from '@/jss/bootstrap-theme/_prefixes';
import { useGlobalStyles } from '@/jss/hooks/use-global-styles';
import { useCustomBootstrapStyles } from '@/jss/hooks/use-custom-bootstrap-styles';
import useSubdomain from '@/hooks/use-subdomain';

import { AccountProvider } from '@/contexts/account-context';
import { HeaderProvider } from '@/contexts/header-context';
import { InCrisisModalProvider } from '@/contexts/in-crisis-modal-context';
import { BookingProvider } from '@/contexts/booking-context';
import { AlertProvider } from '@/contexts/alert-context';
import { ErrorModalProvider } from '@/contexts/error-modal-context';

import NoMatch from '@/pages/no-match';
import DownForMaintenance from '@/pages/down-for-maintenance';

const queryClient = new QueryClient();

const AppWithProviders: FC = () => {
	useGoogleAnalytics();

	const { show, isCall, closeInCrisisModal } = useInCrisisModal();
	const { account, institution } = useAccount();

	const { pathname } = useLocation();
	const subdomain = useSubdomain();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return (
		<>
			<InCrisisModal show={show} isCall={isCall} onHide={closeInCrisisModal} />
			<ErrorModal />

			<Alert />

			<Switch>
				{Routes.map((route, index) => {
					return <Route key={index} path={route.path} exact={route.exact} children={route.header ? <route.header /> : null} />;
				})}
			</Switch>
			<Switch>
				{Routes.map((route, index) => {
					const isEnabled = route.checkEnabled ? route.checkEnabled({ subdomain, account, institution }) : true;

					if (route.private) {
						return (
							<PrivateRoute key={index} path={route.path} exact={route.exact} enabled={isEnabled} unauthRedirect={route.unauthRedirect}>
								<route.main />
							</PrivateRoute>
						);
					} else {
						return (
							<Route key={index} path={route.path} exact={route.exact}>
								{isEnabled ? <route.main /> : <NoMatch />}
							</Route>
						);
					}
				})}
			</Switch>
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
			<HeaderProvider>
				<AccountProvider>
					<AlertProvider>
						<BookingProvider>
							<InCrisisModalProvider>
								<AppWithProviders />
							</InCrisisModalProvider>
						</BookingProvider>
					</AlertProvider>
				</AccountProvider>
			</HeaderProvider>
		</ErrorModalProvider>
	);
};

const App: FC = () => {
	return (
		<Router>
			<QueryClientProvider client={queryClient}>
				<BootstrapThemeProvider prefixes={prefixes}>
					<ThemedApp />
				</BootstrapThemeProvider>
			</QueryClientProvider>
		</Router>
	);
};

export default App;
