import React, { FC, useState, useEffect, useCallback, useContext, PropsWithChildren, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import Loader from '@/components/loader';
import ErrorDisplay from '@/components/error-display';
import { ERROR_CODES } from '@/lib/http-client';
import { isErrorConfig } from '@/lib/utils/error-utils';
import { ReauthModalContext } from '@/contexts/reauth-modal-context';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	'@global': {
		'.page-enter': {
			opacity: 0,
		},
		'.page-enter-active': {
			opacity: 1,
		},
		'.page-exit': {
			opacity: 1,
		},
		'.page-exit-active': {
			opacity: 0,
		},
		'.page-enter-active, .page-exit-active': {
			transition: `opacity 200ms`,
		},
	},
});

enum DISPLAY_STATES {
	LOADING = 'LOADING',
	SUCCESS = 'SUCCESS',
	ERROR = 'ERROR',
}

interface AsyncWrapperProps extends PropsWithChildren {
	fetchData(): void;
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
	useStyles();
	const navigate = useNavigate();
	const [fetchPageDataError, setFetchPageDataError] = useState<unknown | undefined>(undefined);
	const [displayState, setDisplayState] = useState(DISPLAY_STATES.LOADING);
	const { setShowReauthModal, setSignOnUrl } = useContext(ReauthModalContext);

	const loadingRef = React.useRef<HTMLDivElement>(null);
	const successRef = React.useRef<HTMLDivElement>(null);
	const errorRef = React.useRef<HTMLDivElement>(null);
	const nodeRef =
		displayState === DISPLAY_STATES.LOADING
			? loadingRef
			: displayState === DISPLAY_STATES.SUCCESS
			? successRef
			: errorRef;

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

					navigate('/sign-in', { replace: true });
					return;
				}
			}

			setFetchPageDataError(error);
			setDisplayState(DISPLAY_STATES.ERROR);
		}
	}, [fetchData, navigate, setShowReauthModal, setSignOnUrl]);

	useEffect(() => {
		fetchPageData();

		return () => {
			typeof abortFetch === 'function' && abortFetch();
		};
	}, [fetchPageData, abortFetch]);

	return (
		<SwitchTransition mode="out-in">
			<CSSTransition
				key={displayState}
				nodeRef={nodeRef}
				addEndListener={(done) => {
					nodeRef.current?.addEventListener('transitionend', done, false);
				}}
				classNames="page"
			>
				<div ref={nodeRef}>
					{displayState === DISPLAY_STATES.LOADING && (
						<>{loadingComponent ? <>{loadingComponent}</> : <Loader />}</>
					)}
					{displayState === DISPLAY_STATES.SUCCESS && <>{children}</>}
					{displayState === DISPLAY_STATES.ERROR && (
						<ErrorDisplay
							error={fetchPageDataError}
							showBackButton={showBackButton}
							showRetryButton={showRetryButton}
							onRetryButtonClick={fetchPageData}
						/>
					)}
				</div>
			</CSSTransition>
		</SwitchTransition>
	);
};

export default AsyncWrapper;
