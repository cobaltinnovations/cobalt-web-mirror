import React, { FC, useState, useEffect, useCallback } from 'react';
import { Redirect } from 'react-router-dom';

import Loader from '@/components/loader';
import ErrorDisplay from '@/components/error-display';
import { ERROR_CODES } from '@/lib/http-client';

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
	const [fetchPageDataError, setFetchPageDataError] = useState(undefined);
	const [displayState, setDisplayState] = useState(DISPLAY_STATES.LOADING);

	const fetchPageData = useCallback(async () => {
		setDisplayState(DISPLAY_STATES.LOADING);
		setFetchPageDataError(undefined);

		try {
			await fetchData();
			setDisplayState(DISPLAY_STATES.SUCCESS);
		} catch (error) {
			if (error.code === ERROR_CODES.REQUEST_ABORTED) {
				// nothing to handle
				// -- AsyncPage likely unmounted
				return;
			}

			if (error.code === 'AUTHENTICATION_REQUIRED') {
				return <Redirect to="/sign-in" />;
			}

			setFetchPageDataError(error);
			setDisplayState(DISPLAY_STATES.ERROR);
		}
	}, [fetchData]);

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
