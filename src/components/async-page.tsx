import React, { FC, useState, useEffect, useCallback, useContext } from 'react';
import { Redirect } from 'react-router-dom';

import Loader from '@/components/loader';
import ErrorDisplay from '@/components/error-display';
import { ErrorConfig, ERROR_CODES } from '@/lib/http-client';
import { isErrorConfig } from '@/lib/utils/error-utils';
import { ReauthModalContext } from '@/contexts/reauth-modal-context';

enum DISPLAY_STATES {
	LOADING = 'LOADING',
	SUCCESS = 'SUCCESS',
	ERROR = 'ERROR',
}

interface AsyncPageProps {
	fetchData(): void;
	abortFetch?(): void;
}

const AsyncPage: FC<AsyncPageProps> = ({ children, fetchData, abortFetch }) => {
	const [fetchPageDataError, setFetchPageDataError] = useState<ErrorConfig | undefined>(undefined);
	const [displayState, setDisplayState] = useState(DISPLAY_STATES.LOADING);
	const { setShowReauthModal, setSignOnUrl } = useContext(ReauthModalContext);

	const fetchPageData = useCallback(async () => {
		setDisplayState(DISPLAY_STATES.LOADING);
		setFetchPageDataError(undefined);

		try {
			await fetchData();
			setDisplayState(DISPLAY_STATES.SUCCESS);
		} catch (error) {
			if (isErrorConfig(error)) {
				if (error.code === ERROR_CODES.REQUEST_ABORTED) {
					// nothing to handle
					// -- AsyncPage likely unmounted
					return;
				}

				if (error.code === 'AUTHENTICATION_REQUIRED') {
					if (error.apiError?.accessTokenStatus === 'PARTIALLY_EXPIRED') {
						if (error.apiError.signOnUrl) {
							setSignOnUrl(error.apiError.signOnUrl);
						}

						setShowReauthModal(true);
						return;
					}

					return <Redirect to="/sign-in" />;
				}

				setFetchPageDataError(error);
			}

			setDisplayState(DISPLAY_STATES.ERROR);
		}
	}, [fetchData, setShowReauthModal, setSignOnUrl]);

	useEffect(() => {
		fetchPageData();

		return () => {
			typeof abortFetch === 'function' && abortFetch();
		};
	}, [fetchPageData, abortFetch]);

	function getDisplayState() {
		switch (displayState) {
			case DISPLAY_STATES.LOADING:
				return <Loader />;
			case DISPLAY_STATES.SUCCESS:
				return children;
			case DISPLAY_STATES.ERROR:
				return (
					<ErrorDisplay
						error={fetchPageDataError}
						showBackButton={true}
						showRetryButton={true}
						onRetryButtonClick={fetchPageData}
					/>
				);
			default:
				return <></>;
		}
	}

	return <>{getDisplayState()}</>;
};

export default AsyncPage;
