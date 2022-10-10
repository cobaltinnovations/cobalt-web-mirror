import * as Sentry from '@sentry/react';
import React, { PropsWithChildren } from 'react';
import { Routes } from 'react-router-dom';

const BaseSentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

function SentryRoutes(props: PropsWithChildren) {
	if (__SENTRY_DSN__ && __SENTRY_RELEASE__) {
		return <BaseSentryRoutes {...props} />;
	}

	return <Routes {...props} />;
}

export default SentryRoutes;
