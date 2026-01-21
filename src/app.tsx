import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './app-providers';
import { CobaltThemeProvider } from './jss/theme';
import { routes } from './routes';
import { appCreateBrowserRouter } from './app-sentry';

const router = appCreateBrowserRouter(routes);

export const App = () => {
	return (
		<CobaltThemeProvider>
			<AppProviders>
				<RouterProvider router={router} />
			</AppProviders>
		</CobaltThemeProvider>
	);
};
