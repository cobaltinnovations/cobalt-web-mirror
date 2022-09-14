import CollectPhoneModal from '@/components/collect-phone-modal';
import { ScreeningAnalyticsEvent } from '@/contexts/analytics-context';
import useAnalytics from '@/hooks/use-analytics';
import useHandleError from '@/hooks/use-handle-error';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import { ERROR_CODES, OrchestratedRequest } from '@/lib/http-client';
import {
	ScreeningFlowVersion,
	ScreeningSession,
	ScreeningSessionDestination,
	ScreeningSessionDestinationId,
} from '@/lib/models';
import { screeningService } from '@/lib/services';
import Cookies from 'js-cookie';
import React, { useMemo } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface UseOrchestratedRequestHookOptions {
	initialize: boolean | string;
}

export function useOrchestratedRequest<T>(
	req: OrchestratedRequest<T>,
	options: UseOrchestratedRequestHookOptions = {
		initialize: true,
	}
) {
	const { initialize } = options;
	const [{ fetch, abort, requestComplete }, refetch] = useState(req);
	const [response, setResponse] = useState<T>();
	const [isLoading, setIsLoading] = useState(!!initialize);

	const abortedRef = useRef(false);
	const initialFetchResolver = useRef<(v: T) => void>();

	const doFetch = useCallback(async () => {
		setIsLoading(true);
		try {
			abortedRef.current = false;

			const res = await fetch();

			if (initialFetchResolver.current) {
				initialFetchResolver.current(res);
				delete initialFetchResolver.current;
			}

			setResponse(res);

			return res;
		} catch (e) {
			return Promise.reject(e);
		} finally {
			if (abortedRef.current) {
				return;
			}

			setIsLoading(false);
		}
	}, [fetch]);

	const initialFetch = useCallback(() => {
		if (initialize) {
			return new Promise((res) => {
				initialFetchResolver.current = res;
			});
		}
	}, [initialize]);

	useEffect(() => {
		if (initialize) {
			doFetch();
		}
	}, [doFetch, initialize]);

	useEffect(() => {
		return () => {
			if (initialize && !requestComplete) {
				abort();
			}
		};
	}, [abort, initialize, requestComplete]);

	return {
		response,
		refetch,
		isLoading,
		initialFetch,
	};
}

export function useScreeningNavigation() {
	const location = useLocation();
	const navigate = useNavigate();
	const { openInCrisisModal } = useInCrisisModal();

	const navigateToDestination = useCallback(
		(destination?: ScreeningSessionDestination, state?: Record<string, any>) => {
			switch (destination?.screeningSessionDestinationId) {
				case ScreeningSessionDestinationId.CRISIS:
					openInCrisisModal(true);
					return;
				case ScreeningSessionDestinationId.ONE_ON_ONE_PROVIDER_LIST:
				default: {
					navigate(`/connect-with-support`, { state });
					return;
				}
			}
		},
		[navigate, openInCrisisModal]
	);

	const navigateToQuestion = useCallback(
		(contextId: string) => {
			navigate(`/screening-questions/${contextId}`, { state: location.state });
		},
		[location.state, navigate]
	);

	const navigateToNext = useCallback(
		(session: ScreeningSession) => {
			if (session?.nextScreeningQuestionContextId) {
				navigateToQuestion(session.nextScreeningQuestionContextId);
			} else if (session?.screeningSessionDestination) {
				navigateToDestination(session.screeningSessionDestination);
			}
		},
		[navigateToDestination, navigateToQuestion]
	);

	return {
		navigateToDestination,
		navigateToQuestion,
		navigateToNext,
	};
}

export function useScreeningFlow(screeningFlowId?: string) {
	const [didCheckScreeningSessions, setDidCheckScreeningSessions] = useState(!screeningFlowId);
	const [screeningSessions, setScreeningSessions] = useState<ScreeningSession[]>([]);
	const [showPhoneModal, setShowPhoneModal] = useState(false);
	const { trackEvent } = useAnalytics();

	const [activeFlowVersion, setActiveFlowVersion] = useState<ScreeningFlowVersion>();
	const handleError = useHandleError();
	const { navigateToNext } = useScreeningNavigation();

	const incompleteSessions = useMemo(() => {
		return screeningSessions.filter((session) => !session.completed);
	}, [screeningSessions]);

	const hasCompletedScreening = useMemo(() => {
		return screeningSessions.some((session) => session.completed);
	}, [screeningSessions]);

	useEffect(() => {
		const isImmediate = Cookies.get('immediateAccess');

		if (isImmediate) {
			setDidCheckScreeningSessions(true);
			return;
		}

		if (!screeningFlowId) {
			return;
		}

		const fetchScreeningsRequest = screeningService.getScreeningSessionsByFlowId({
			screeningFlowId,
		});
		const fetchFlowVersionsRequest = screeningService.getScreeningFlowVersionsByFlowId({ screeningFlowId });

		Promise.all([fetchScreeningsRequest.fetch(), fetchFlowVersionsRequest.fetch()])
			.then(([screeningsResponse, versionsResponse]) => {
				setScreeningSessions(screeningsResponse.screeningSessions);
				const activeVersion = versionsResponse.screeningFlowVersions.find(
					(version) => version.screeningFlowVersionId === versionsResponse.activeScreeningFlowVersionId
				);

				setActiveFlowVersion(activeVersion);
			})
			.catch((e) => {
				if ((e as any).code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return () => {
			fetchScreeningsRequest.abort();
		};
	}, [handleError, screeningFlowId]);

	useEffect(() => {
		if (!activeFlowVersion) {
			return;
		}

		if (!hasCompletedScreening && activeFlowVersion.phoneNumberRequired) {
			setShowPhoneModal(true);
		} else {
			setDidCheckScreeningSessions(true);
		}
	}, [activeFlowVersion, hasCompletedScreening]);

	const renderedCollectPhoneModal = (
		<CollectPhoneModal
			show={showPhoneModal}
			skippable={activeFlowVersion?.skippable}
			onSkip={() => {
				trackEvent(ScreeningAnalyticsEvent.skipPhoneNumberPrompt());

				if (!activeFlowVersion?.screeningFlowVersionId) {
					return;
				}

				setDidCheckScreeningSessions(true);

				screeningService
					.skipScreeningFlowVersion(activeFlowVersion?.screeningFlowVersionId)
					.fetch()
					.catch((e) => {
						if ((e as any).code !== ERROR_CODES.REQUEST_ABORTED) {
							handleError(e);
						}
					});
			}}
			onSuccess={() => {
				if (!screeningFlowId) {
					return;
				}

				setShowPhoneModal(false);

				if (incompleteSessions.length === 0) {
					screeningService
						.createScreeningSession({
							screeningFlowVersionId: activeFlowVersion?.screeningFlowVersionId,
						})
						.fetch()
						.then((sessionResponse) => {
							navigateToNext(sessionResponse.screeningSession);
						})
						.catch((e) => {
							if ((e as any).code !== ERROR_CODES.REQUEST_ABORTED) {
								handleError(e);
							}
						});
				} else {
					navigateToNext(incompleteSessions[incompleteSessions.length - 1]);
				}
			}}
		/>
	);

	return {
		didCheckScreeningSessions,
		hasCompletedScreening,
		renderedCollectPhoneModal,
	};
}
