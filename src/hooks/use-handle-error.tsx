import { useCallback, useContext } from 'react';
import { useHistory } from 'react-router';

import { ErrorConfig } from '@/lib/http-client';
import { isErrorConfig } from '@/lib/utils/error-utils';

import { ErrorModalContext } from '@/contexts/error-modal-context';
import { ReauthModalContext } from '@/contexts/reauth-modal-context';

function useHandleError(): (error: ErrorConfig | unknown) => void {
	const history = useHistory();
	const { setShow, setError } = useContext(ErrorModalContext);
	const { setShowReauthModal, setSignOnUrl } = useContext(ReauthModalContext);

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

					history.replace('/sign-in');
					return;
				} else {
					setShow(true);
					setError(error);
				}
			}
		},
		[history, setSignOnUrl, setShowReauthModal, setShow, setError]
	);

	return handleError;
}

export default useHandleError;
