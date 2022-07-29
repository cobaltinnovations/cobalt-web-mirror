import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import { OrchestratedRequest } from '@/lib/http-client';
import { ScreeningSession, ScreeningSessionDestination, ScreeningSessionDestinationId } from '@/lib/models';
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

interface HistoryLocationState {
	routedClinicIds?: string[];
	routedProviderId?: string;
	routedSupportRoleIds?: string[];
}

export function useScreeningNavigation() {
	const location = useLocation();
	const navigate = useNavigate();
	const { openInCrisisModal } = useInCrisisModal();

	const navigateToDestination = useCallback(
		(destination: ScreeningSessionDestination, state?: Record<string, any>) => {
			switch (destination.screeningSessionDestinationId) {
				case ScreeningSessionDestinationId.CRISIS:
					openInCrisisModal(true);
					return;
				case ScreeningSessionDestinationId.ONE_ON_ONE_PROVIDER_LIST:
				default: {
					const params = new URLSearchParams({});

					const locationState = location.state as HistoryLocationState;
					const clinicIds = locationState?.routedClinicIds ?? [];
					const providerId = locationState?.routedProviderId;
					const supportRoleIds = locationState?.routedSupportRoleIds ?? [];

					if (Array.isArray(clinicIds)) {
						for (const clinicId of clinicIds) {
							params.append('clinicId', clinicId);
						}
					}

					if (providerId) {
						params.append('providerId', providerId);
					}

					if (Array.isArray(supportRoleIds)) {
						for (const supportRoleId of supportRoleIds) {
							params.append('supportRoleId', supportRoleId);
						}
					}

					navigate(`/connect-with-support${params.toString() ? `?${params.toString()}` : ''}`, { state });
					return;
				}
			}
		},
		[location.state, navigate, openInCrisisModal]
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
