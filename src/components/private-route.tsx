import Cookies from 'js-cookie';
import React, { PropsWithChildren, useEffect, useState } from 'react';

import useAccount from '@/hooks/use-account';
import Loader from './loader';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { accountService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

const PrivateRoute = ({ children }: PropsWithChildren) => {
	const handleError = useHandleError();
	const { institution, isImmediateSession, isTrackedSession, initialized, account, processAccessToken, setAccount } =
		useAccount();
	const [canRender, setCanRender] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	const redirectTo = `${location.pathname}?${searchParams.toString()}`;
	useEffect(() => {
		if (!institution) {
			return;
		}

		if (!account && (!isImmediateSession || isTrackedSession)) {
			Cookies.set('authRedirectUrl', redirectTo.startsWith('/auth') ? '/' : redirectTo);

			navigate('/sign-in', { replace: true });
		}
	}, [account, institution, isImmediateSession, isTrackedSession, navigate, redirectTo]);

	// Handle/start anonymous/immediate sessions when appropriate
	const immediateAccess = searchParams.get('immediateAccess');
	useEffect(() => {
		if (account) {
			return;
		}

		if (institution?.immediateAccessEnabled && immediateAccess && !isTrackedSession) {
			accountService
				.createAnonymousAccount()
				.fetch()
				.then((response) => {
					processAccessToken(response.accessToken, false);
					setAccount(response.account);
				})
				.catch((e) => {
					handleError(e);
				});
		}
	}, [
		handleError,
		institution?.immediateAccessEnabled,
		immediateAccess,
		isTrackedSession,
		processAccessToken,
		setAccount,
		account,
	]);

	useEffect(() => {
		setCanRender(initialized && !!account);
	}, [account, initialized]);

	return <>{canRender ? children : <Loader />}</>;
};

export default PrivateRoute;
