import React, { FC, useMemo } from 'react';
import { Route, RouteProps, Redirect, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

import useAccount from '@/hooks/use-account';
import Loader from '@/components/loader';
import NoMatch from '@/pages/no-match';
import useSubdomain from '@/hooks/use-subdomain';

const blockingPaths: string[] = ['/intro-assessment'];

const PrivateRoute: FC<RouteProps & { enabled?: boolean; unauthRedirect?: string }> = ({ children, enabled = true, unauthRedirect, ...routeProps }) => {
	const location = useLocation();
	const { initialized, account } = useAccount();
	const subdomain = useSubdomain();

	const notAuthRedirectPath = unauthRedirect || (subdomain === 'pic' ? '/patient-sign-in' : '/sign-in');

	const privateChildren = useMemo(() => {
		if (!initialized) {
			return <Loader />;
		}

		const isBlockingPath = typeof routeProps.path === 'string' && blockingPaths.includes(routeProps.path);

		if (!account) {
			if (!isBlockingPath) {
				const redirectUrl = location.pathname + (location.search || '');
				if (redirectUrl !== '/') {
					Cookies.set('authRedirectUrl', redirectUrl);
				}
			}

			return <Redirect to={notAuthRedirectPath} />;
		}

		if (!enabled) {
			return <NoMatch />;
		}

		// const isBlockedPath = !['/crisis-resources', '/privacy'].includes(location.pathname);
		// const needsAssessment = isBlockedPath && !account.completedIntroAssessment;
		// const isImmediate = Cookies.get('immediateAccess');

		// if (!isImmediate && needsAssessment && routeProps.path !== '/intro-assessment') {
		// 	return <Redirect to="/intro-assessment" />;
		// }

		if (!isBlockingPath) {
			Cookies.remove('authRedirectUrl');
		}

		return children;
	}, [account, children, enabled, initialized, location.pathname, location.search, routeProps.path, notAuthRedirectPath]);

	return <Route {...routeProps}>{privateChildren}</Route>;
};

export default PrivateRoute;
