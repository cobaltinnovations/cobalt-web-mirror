import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { ErrorConfig } from '@/lib/http-client';
import { isErrorConfig } from '@/lib/utils/error-utils';

import { ErrorModalContext } from '@/contexts/error-modal-context';
import { ReauthModalContext } from '@/contexts/reauth-modal-context';

function useHandleError(): (error: ErrorConfig | unknown) => void {
	const navigate = useNavigate();
	const { setShow, setError } = useContext(ErrorModalContext);
	const { setShowReauthModal, setSignOnUrl } = useContext(ReauthModalContext);
	const [redirectToSignIn, setRedirectToSignIn] = useState(false);

	const handleError = useCallback(
		(error: ErrorConfig | unknown) => {
			if (isErrorConfig(error)) {
				if (error.code === 'AUTHENTICATION_REQUIRED') {
					if (error.apiError?.accessTokenStatus === 'PARTIALLY_EXPIRED') {
						if (error.apiError.signOnUrl) {
							setSignOnUrl(error.apiError.signOnUrl);
						}

						setShowReauthModal(true);
						return;
					}

					setRedirectToSignIn(true);
					return;
				} else {
					setShow(true);
					setError(error);
				}
			}
		},
		[setSignOnUrl, setShowReauthModal, setShow, setError]
	);

	useEffect(() => {
		if (redirectToSignIn) {
			navigate('/sign-in', { replace: true });
		}
	}, [navigate, redirectToSignIn]);

	return handleError;
}

export default useHandleError;
