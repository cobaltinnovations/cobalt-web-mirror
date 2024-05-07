import React from 'react';
import * as Sentry from '@sentry/react';
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
			Sentry.reactRouterV6BrowserTracingIntegration({
				useEffect: React.useEffect,
				useLocation,
				useNavigationType,
				createRoutesFromChildren,
				matchRoutes,
			}),
		],
		ignoreErrors: [
			// These errors are coming from Office 365 scanning safe-links
			// https://github.com/getsentry/sentry-javascript/issues/3440#issuecomment-865857552
			'Non-Error promise rejection captured',
			// Random plugins/extensions
			'top.GLOBALS',
			// See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
			'originalCreateNotification',
			'canvas.contentDocument',
			'MyApp_RemoveAllHighlights',
			'http://tt.epicplay.com',
			"Can't find variable: ZiteReader",
			'jigsaw is not defined',
			'ComboSearch is not defined',
			'http://loading.retry.widdit.com/',
			'atomicFindClose',
			// Facebook borked
			'fb_xd_fragment',
			// ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
			// reduce this. (thanks @acdha)
			// See http://stackoverflow.com/questions/4113268
			'bmi_SafeAddOnload',
			'EBCallBackMessageReceived',
			// See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
			'conduitPage',
			// Chrome synced credentials injection, See https://github.com/getsentry/sentry/issues/61469
			/^__gCrWeb\./,
		],
		denyUrls: [
			// Facebook flakiness
			/graph\.facebook\.com/i,
			// Facebook blocked
			/connect\.facebook\.net\/en_US\/all\.js/i,
			// Woopra flakiness
			/eatdifferent\.com\.woopra-ns\.com/i,
			/static\.woopra\.com\/js\/woopra\.js/i,
			// Chrome extensions
			/extensions\//i,
			/^chrome:\/\//i,
			/^chrome-extension:\/\//i,
			// Other plugins
			/127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
			/webappstoolbarba\.texthelp\.com\//i,
			/metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
		],
	});
}
