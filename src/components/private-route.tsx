import Cookies from 'js-cookie';
import React, { PropsWithChildren, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useAccount from '@/hooks/use-account';

const PrivateRoute = ({ children }: PropsWithChildren) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { initialized, account } = useAccount();
	const notAuthRedirectPath = '/sign-in';

	useEffect(() => {
		if (initialized && !account) {
			const redirectUrl = location.pathname + (location.search || '');
			if (redirectUrl !== '/') {
				Cookies.set('authRedirectUrl', redirectUrl);
			}

			navigate(notAuthRedirectPath);
		} else {
			Cookies.remove('authRedirectUrl');
		}
	}, [account, initialized, location.pathname, location.search, navigate]);

	return <>{children}</>;
};

export default PrivateRoute;
