import React, { FC, useState, useEffect, useCallback, PropsWithChildren, ReactNode } from 'react';

import Loader from '@/components/loader';
import ErrorDisplay from '@/components/error-display';
import useHandleError from '@/hooks/use-handle-error';

enum DISPLAY_STATES {
	LOADING = 'LOADING',
	SUCCESS = 'SUCCESS',
	ERROR = 'ERROR',
}

interface AsyncWrapperProps extends PropsWithChildren {
	fetchData(): void | Promise<void>;
	abortFetch?(): void;
	showBackButton?: boolean;
	showRetryButton?: boolean;
	loadingComponent?: ReactNode;
}

const AsyncWrapper: FC<AsyncWrapperProps> = ({
	children,
	fetchData,
	abortFetch,
	showBackButton = true,
	showRetryButton = true,
	loadingComponent,
}) => {
	const [fetchPageDataError, setFetchPageDataError] = useState<unknown | undefined>(undefined);
	const [displayState, setDisplayState] = useState(DISPLAY_STATES.LOADING);

	const fetchPageDataErrorHandler = useCallback((error: unknown) => {
		setFetchPageDataError(error);
		setDisplayState(DISPLAY_STATES.ERROR);
	}, []);
	const handleError = useHandleError(fetchPageDataErrorHandler);

	const fetchPageData = useCallback(async () => {
		setDisplayState(DISPLAY_STATES.LOADING);
		setFetchPageDataError(undefined);

		try {
			await fetchData();
			setDisplayState(DISPLAY_STATES.SUCCESS);
		} catch (error) {
			handleError(error);
		}
	}, [fetchData, handleError]);

	useEffect(() => {
		fetchPageData();

		return () => {
			typeof abortFetch === 'function' && abortFetch();
		};
	}, [fetchPageData, abortFetch]);

	function getDisplayState() {
		switch (displayState) {
			case DISPLAY_STATES.LOADING:
				if (loadingComponent) {
					return loadingComponent;
				}

				return <Loader />;
			case DISPLAY_STATES.SUCCESS:
				return children;
			case DISPLAY_STATES.ERROR:
				return (
					<ErrorDisplay
						error={fetchPageDataError}
						showBackButton={showBackButton}
						showRetryButton={showRetryButton}
						onRetryButtonClick={fetchPageData}
					/>
				);
			default:
				return <></>;
		}
	}

	return <>{getDisplayState()}</>;
};

export default AsyncWrapper;
