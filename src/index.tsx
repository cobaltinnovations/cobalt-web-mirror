import App from '@/app';
import '@/polyfills';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';

if (__SENTRY_DSN__ && __SENTRY_RELEASE__) {
	Sentry.init({
		dsn: __SENTRY_DSN__,
		release: __SENTRY_RELEASE__,
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
	});
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);
