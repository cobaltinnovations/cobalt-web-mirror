import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './app-providers';
import { CobaltThemeProvider } from './jss/theme';
import { routes } from './routes';
import { appCreateBrowserRouter } from './app-sentry';
import Loader from './components/loader';

const router = appCreateBrowserRouter(routes);

export const App = () => {
	return (
		<CobaltThemeProvider>
			<AppProviders>
				<RouterProvider router={router} fallbackElement={<Loader />} />
			</AppProviders>
		</CobaltThemeProvider>
	);
};
