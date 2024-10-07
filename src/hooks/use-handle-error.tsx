import { useCallback, useContext } from 'react';

import { CobaltError, isApiError, isDeferredDataError } from '@/lib/http-client';

import { ErrorModalContext } from '@/contexts/error-modal-context';
import { ReauthModalContext } from '@/contexts/reauth-modal-context';
import useAccount from './use-account';
import axios from 'axios';
import { AnalyticsNativeEventAccountSignedOutSource } from '@/lib/models';

function useHandleError(handler?: (error: CobaltError) => boolean | Promise<boolean>): (error: unknown) => void {
	const { signOutAndClearContext } = useAccount();
	const { displayModalForError } = useContext(ErrorModalContext);
	const { setShowReauthModal, setSignOnUrl } = useContext(ReauthModalContext);

	const handleError = useCallback(
		async (error: unknown) => {
			let handled: CobaltError;

			if (error instanceof CobaltError) {
				handled = error;
			} else if (axios.isAxiosError(error)) {
				handled = CobaltError.fromAxiosError(error);

				if (
					!handled.axiosError?.response ||
					handled.axiosError?.response?.status === 0 ||
					handled.axiosError?.request?.status === 0
				) {
					handled = CobaltError.fromStatusCode0(error);
				} else if (handled.axiosError?.code === 'ECONNABORTED') {
					handled = CobaltError.fromEConnAborted(error);
				}
			} else if (isApiError(error)) {
				handled = CobaltError.fromApiError(error);
			} else if (isDeferredDataError(error)) {
				handled = CobaltError.fromDeferredDataAbort();
			} else if (axios.isCancel(error)) {
				handled = CobaltError.fromCancelledRequest();
			} else {
				handled = CobaltError.fromUnknownError(error);
			}

			if (handled.apiError?.code === 'AUTHENTICATION_REQUIRED') {
				if (handled.apiError?.accessTokenStatus === 'PARTIALLY_EXPIRED' && handled.apiError.signOnUrl) {
					setSignOnUrl(handled.apiError.signOnUrl);
					setShowReauthModal(true);
				} else {
					signOutAndClearContext(AnalyticsNativeEventAccountSignedOutSource.ACCESS_TOKEN_EXPIRED);
				}

				return;
			}

			if (handler) {
				const didHandle = await handler(handled);

				if (didHandle) {
					return;
				}
			}

			if (handled.reportableToUser) {
				displayModalForError(handled);
			}
		},
		[displayModalForError, handler, setShowReauthModal, setSignOnUrl, signOutAndClearContext]
	);

	return handleError;
}

export default useHandleError;
