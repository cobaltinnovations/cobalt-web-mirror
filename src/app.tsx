import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './app-providers';
import { CobaltThemeProvider } from './jss/theme';
import { routes } from './routes';
import { appCreateBrowserRouter } from './app-sentry';
import Loader from './components/loader';
import { environment } from './environments/environment.env';

const router = appCreateBrowserRouter(routes);

console.log('isDev', environment.isDev);
console.log('testVar', environment.testVar);
console.log('testVar', environment.testVar2);

export const App = () => {
	return (
		<CobaltThemeProvider>
			<AppProviders>
				<RouterProvider router={router} fallbackElement={<Loader />} />
			</AppProviders>
		</CobaltThemeProvider>
	);
};
