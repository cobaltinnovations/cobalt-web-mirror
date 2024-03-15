import React from 'react';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import {
	createBrowserRouter,
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from 'react-router-dom';

export let appCreateBrowserRouter = createBrowserRouter;

if (__SENTRY_DSN__ && __SENTRY_RELEASE__) {
	appCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);

	Sentry.init({
		dsn: __SENTRY_DSN__, //'https://3c09aa7b1aed4dbf907387181df79b52@o1430936.ingest.sentry.io/6781979', //__SENTRY_DSN__,
		release: __SENTRY_RELEASE__, //'local-data-router',
		tracesSampleRate: __DEV__ ? 1.0 : 0.2,
		integrations: [
			new BrowserTracing({
				routingInstrumentation: Sentry.reactRouterV6Instrumentation(
					React.useEffect,
					useLocation,
					useNavigationType,
					createRoutesFromChildren,
					matchRoutes
				),
			}),
		],
		// These errors are coming from Office 365 scanning safe-links
		// https://github.com/getsentry/sentry-javascript/issues/3440#issuecomment-865857552
		ignoreErrors: ['Non-Error promise rejection captured'],
	});
}
