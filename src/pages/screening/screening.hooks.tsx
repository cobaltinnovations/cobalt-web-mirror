import { useAppRootLoaderData } from '@/routes/root';
import CollectPhoneModal from '@/components/collect-phone-modal';
import { CrisisAnalyticsEvent, ScreeningAnalyticsEvent } from '@/contexts/analytics-context';
import useAnalytics from '@/hooks/use-analytics';
import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import {
	ScreeningFlowVersion,
	ScreeningSession,
	ScreeningSessionDestination,
	ScreeningSessionDestinationId,
} from '@/lib/models';
import { screeningService } from '@/lib/services';
import React, { useMemo } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useMatches, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';

export function useScreeningNavigation() {
	const location = useLocation();
	const navigate = useNavigate();
	const { trackEvent } = useAnalytics();
	const revalidator = useRevalidator();

	const matches = useMatches();

	const navigateToDestination = useCallback(
		(destination?: ScreeningSessionDestination, params?: Record<string, any>, replace = false) => {
			switch (destination?.screeningSessionDestinationId) {
				case ScreeningSessionDestinationId.CRISIS:
					trackEvent(CrisisAnalyticsEvent.presentScreeningCrisis());
					window.location.href = '/in-crisis';
					return;
				case ScreeningSessionDestinationId.CONTENT_LIST:
					navigate(
						{
							pathname: '/resource-library',
							search: new URLSearchParams({ recommended: 'true', ...params }).toString(),
						},
						{
							replace,
						}
					);
					return;
				case ScreeningSessionDestinationId.GROUP_SESSION_LIST:
					navigate(
						{
							pathname: '/in-the-studio',
							search: new URLSearchParams(params).toString(),
						},
						{
							replace,
						}
					);
					return;
				case ScreeningSessionDestinationId.IC_MHIC_SCREENING_SESSION_RESULTS:
					revalidator.revalidate();
					navigate(
						{
							pathname: `/ic/mhic/order-assessment/${destination.context.patientOrderId}`,
						},
						{
							replace,
						}
					);
					return;
				case ScreeningSessionDestinationId.IC_PATIENT_SCREENING_SESSION_RESULTS:
					revalidator.revalidate();
					navigate(
						{
							pathname: '/ic/patient/assessment-complete',
							search: new URLSearchParams(params).toString(),
						},
						{
							replace,
						}
					);
					return;
				case ScreeningSessionDestinationId.HOME:
					window.location.href = '/';
					return;
				case ScreeningSessionDestinationId.ONE_ON_ONE_PROVIDER_LIST:
				default: {
					navigate(
						{
							pathname: '/connect-with-support',
							search: new URLSearchParams(params).toString(),
						},
						{
							replace,
						}
					);
					return;
				}
			}
		},
		[navigate, revalidator, trackEvent]
	);

	const navigateToQuestion = useCallback(
		(contextId: string) => {
			const routeMatches = matches.reverse();
			const mhicRouteMatch = routeMatches.find((match) => {
				return match.pathname.includes('/ic/mhic') && !!match.params['patientOrderId'];
			});

			const icPatientRouteMatch = routeMatches.find((match) => {
				return match.pathname.includes('/ic/patient');
			});

			navigate(
				mhicRouteMatch
					? `/ic/mhic/order-assessment/${mhicRouteMatch.params.patientOrderId}/${contextId}`
					: icPatientRouteMatch
					? `/ic/patient/assessment/${contextId}`
					: `/screening-questions/${contextId}`,
				{ state: location.state }
			);
		},
		[location.state, matches, navigate]
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

export function useScreeningFlow({
	screeningFlowId,
	patientOrderId,
	instantiateOnLoad = true,
}: {
	screeningFlowId?: string;
	patientOrderId?: string;
	instantiateOnLoad?: boolean;
}) {
	const { isImmediateSession } = useAppRootLoaderData();
	const [searchParams] = useSearchParams();
	// For now - if not in "on load" mode, ignore the concept of "skipped"
	const isSkipped = instantiateOnLoad ? searchParams.get('skipped') === 'true' : false;
	const [didCheckScreeningSessions, setDidCheckScreeningSessions] = useState(!screeningFlowId || isSkipped);
	const [screeningSessions, setScreeningSessions] = useState<ScreeningSession[]>([]);
	const [showPhoneModal, setShowPhoneModal] = useState(false);
	const { trackEvent } = useAnalytics();

	const [activeFlowVersion, setActiveFlowVersion] = useState<ScreeningFlowVersion>();
	const handleError = useHandleError();
	const { navigateToNext, navigateToDestination } = useScreeningNavigation();
	const [isCreatingScreeningSession, setIsCreatingScreeningSession] = useState(false);

	const incompleteSessions = useMemo(() => {
		return screeningSessions.filter((session) => !session.completed);
	}, [screeningSessions]);

	// TODO: Replace this with 'getScreeningFlowCompletionStatusByScreeningFlowId(screeningFlowId)'
	const hasCompletedScreening = useMemo(() => {
		return screeningSessions.some((session) => session.completed && !session.skipped);
	}, [screeningSessions]);

	const hasIncompleteScreening = incompleteSessions.length > 0;

	const createScreeningSession = useCallback(() => {
		setIsCreatingScreeningSession(true);

		return screeningService
			.createScreeningSession({
				screeningFlowVersionId: activeFlowVersion?.screeningFlowVersionId,
				patientOrderId,
			})
			.fetch()
			.then((sessionResponse) => {
				navigateToNext(sessionResponse.screeningSession);
			})
			.catch((e) => {
				if ((e as any).code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			})
			.finally(() => {
				setIsCreatingScreeningSession(false);
			});
	}, [activeFlowVersion?.screeningFlowVersionId, handleError, navigateToNext, patientOrderId]);

	const resumeScreeningSession = useCallback(
		(screeningSessionId?: string | null) => {
			if (!activeFlowVersion) {
				throw new Error('Unknown Active Flow Version');
			}

			if (!hasIncompleteScreening) {
				throw new Error('No incomplete sessions to resume');
			}

			const lastIncomplete = incompleteSessions[incompleteSessions.length - 1];

			// resume session by id if specified
			if (screeningSessionId) {
				const incompleteSession = incompleteSessions.find(
					(session) => session.screeningSessionId === screeningSessionId
				);

				if (!incompleteSession) {
					throw new Error('Unknown Screening Session');
				}

				return navigateToNext(incompleteSession);
			}

			// default to last incomplete session known for user
			return navigateToNext(lastIncomplete);
		},
		[activeFlowVersion, hasIncompleteScreening, incompleteSessions, navigateToNext]
	);

	const resumeOrCreateScreeningSession = useCallback(
		(screeningSessionId?: string | null) => {
			if (hasIncompleteScreening) {
				return resumeScreeningSession(screeningSessionId);
			} else {
				return createScreeningSession();
			}
		},
		[createScreeningSession, hasIncompleteScreening, resumeScreeningSession]
	);

	const startScreeningFlow = useCallback(async () => {
		if (!activeFlowVersion) {
			throw new Error('Unknown Active Flow Version');
		}

		if (activeFlowVersion.phoneNumberRequired) {
			setShowPhoneModal(true);
		} else {
			resumeOrCreateScreeningSession();
		}
	}, [activeFlowVersion, resumeOrCreateScreeningSession]);

	const startScreeningFlowIfNoneCompleted = useCallback(async () => {
		if (hasCompletedScreening) {
			setDidCheckScreeningSessions(true);
			return;
		}

		return startScreeningFlow();
	}, [hasCompletedScreening, startScreeningFlow]);

	useEffect(() => {
		if (isImmediateSession || isSkipped) {
			setDidCheckScreeningSessions(true);
			return;
		}

		if (!screeningFlowId) {
			return;
		}

		const fetchScreeningsRequest = screeningService.getScreeningSessionsByFlowId({
			screeningFlowId,
			patientOrderId,
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
	}, [handleError, isImmediateSession, isSkipped, patientOrderId, screeningFlowId]);

	useEffect(() => {
		if (!instantiateOnLoad || !activeFlowVersion) {
			return;
		}

		startScreeningFlowIfNoneCompleted();
	}, [activeFlowVersion, instantiateOnLoad, startScreeningFlowIfNoneCompleted]);

	const renderedCollectPhoneModal = (
		<CollectPhoneModal
			show={showPhoneModal}
			screeningFlowSkipTypeId={activeFlowVersion?.screeningFlowSkipTypeId}
			skippable={activeFlowVersion?.skippable}
			onSkip={() => {
				trackEvent(ScreeningAnalyticsEvent.skipPhoneNumberPrompt());

				if (!activeFlowVersion?.screeningFlowVersionId) {
					return;
				}

				screeningService
					.skipScreeningFlowVersion(activeFlowVersion?.screeningFlowVersionId)
					.fetch()
					.then((response) => {
						setShowPhoneModal(false);
						navigateToDestination(
							response.screeningSession.screeningSessionDestination,
							{ skipped: true },
							true // replace
						);
					})
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

				createScreeningSession();
			}}
		/>
	);

	return {
		didCheckScreeningSessions,
		hasCompletedScreening,
		renderedCollectPhoneModal,
		startScreeningFlow,
		startScreeningFlowIfNoneCompleted,
		createScreeningSession,
		resumeScreeningSession,
		isCreatingScreeningSession,
	};
}
