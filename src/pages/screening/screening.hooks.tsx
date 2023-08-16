import { useAppRootLoaderData } from '@/routes/root';
import CollectPhoneModal from '@/components/collect-phone-modal';
import { CrisisAnalyticsEvent, ScreeningAnalyticsEvent } from '@/contexts/analytics-context';
import useAnalytics from '@/hooks/use-analytics';
import useHandleError from '@/hooks/use-handle-error';
import {
	ScreeningFlowVersion,
	ScreeningSession,
	ScreeningSessionDestination,
	ScreeningSessionDestinationId,
} from '@/lib/models';
import { screeningService } from '@/lib/services';
import React, { useMemo } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useMatches, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';
import { GroupSessionDetailNavigationSource } from '@/routes/group-session-detail';
import Cookies from 'js-cookie';

export function useScreeningNavigation() {
	const navigate = useNavigate();
	const { trackEvent } = useAnalytics();
	const revalidator = useRevalidator();

	const matches = useMatches();

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
					: `/screening-questions/${contextId}`
			);
		},
		[matches, navigate]
	);

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
				case ScreeningSessionDestinationId.GROUP_SESSION_LIST: {
					const collectionId = Cookies.get('groupSessionCollectionId') ?? 'UPCOMING_SESSIONS';
					const navigationSource =
						(Cookies.get('groupSessionDetailNavigationSource') as GroupSessionDetailNavigationSource) ??
						GroupSessionDetailNavigationSource.GROUP_SESSION_LIST;

					const navigationSourceToDestinationUrlMap = {
						[GroupSessionDetailNavigationSource.HOME_PAGE]: '/',
						[GroupSessionDetailNavigationSource.GROUP_SESSION_LIST]: '/group-sessions',
						[GroupSessionDetailNavigationSource.GROUP_SESSION_COLLECTION]:
							'/group-sessions/collection/' + collectionId,
						[GroupSessionDetailNavigationSource.TOPIC_CENTER]: '/topic-centers/spaces-of-color',
						[GroupSessionDetailNavigationSource.ADMIN_LIST]: '/admin/group-sessions',
					};

					navigate(
						{
							pathname: navigationSourceToDestinationUrlMap[navigationSource] ?? '/group-sessions',
							search: new URLSearchParams(params).toString(),
						},
						{
							state: {
								screeningSessionDestinationResultId: destination.screeningSessionDestinationResultId,
							},
							replace,
						}
					);
					return;
				}
				case ScreeningSessionDestinationId.GROUP_SESSION_DETAIL:
					navigate(
						{
							pathname: '/group-sessions/' + destination.context.groupSessionId,
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
				case ScreeningSessionDestinationId.IC_MHIC_CLINICAL_SCREENING:
				case ScreeningSessionDestinationId.IC_PATIENT_CLINICAL_SCREENING:
					const nextQuestionId = destination.context.nextScreeningQuestionContextId;
					if (!nextQuestionId || typeof nextQuestionId !== 'string') {
						throw new Error('Next Question Context Unknown');
					}

					navigateToQuestion(nextQuestionId);
					return;
				case ScreeningSessionDestinationId.HOME:
					window.location.href = '/';
					return;
				case ScreeningSessionDestinationId.MENTAL_HEALTH_PROVIDER_RECOMMENDATIONS:
					window.location.href = '/connect-with-support/recommendations';
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
		[navigate, navigateToQuestion, revalidator, trackEvent]
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
	groupSessionId,
	patientOrderId,
	instantiateOnLoad = true,
	checkCompletionState = true,
	disabled = false,
}: {
	screeningFlowId?: string;
	groupSessionId?: string;
	patientOrderId?: string;
	instantiateOnLoad?: boolean;
	checkCompletionState?: boolean;
	disabled?: boolean;
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
	const [hasCompletedScreening, setHasCompletedScreening] = useState(false);

	const incompleteSessions = useMemo(() => {
		return screeningSessions.filter((session) => !session.completed);
	}, [screeningSessions]);

	const hasIncompleteScreening = incompleteSessions.length > 0;

	const createScreeningSession = useCallback(() => {
		if (disabled) {
			throw new Error('Screening Flow is disabled');
		}

		setIsCreatingScreeningSession(true);

		return screeningService
			.createScreeningSession({
				screeningFlowVersionId: activeFlowVersion?.screeningFlowVersionId,
				groupSessionId,
				patientOrderId,
			})
			.fetch()
			.then((sessionResponse) => {
				navigateToNext(sessionResponse.screeningSession);
			})
			.catch((e) => {
				handleError(e);
			})
			.finally(() => {
				setIsCreatingScreeningSession(false);
			});
	}, [
		activeFlowVersion?.screeningFlowVersionId,
		disabled,
		groupSessionId,
		handleError,
		navigateToNext,
		patientOrderId,
	]);

	const resumeScreeningSession = useCallback(
		(screeningSessionId?: string | null) => {
			if (disabled) {
				throw new Error('Screening Flow is disabled');
			}

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
		[activeFlowVersion, disabled, hasIncompleteScreening, incompleteSessions, navigateToNext]
	);

	const resumeOrCreateScreeningSession = useCallback(
		(screeningSessionId?: string | null) => {
			if (disabled) {
				throw new Error('Screening Flow is disabled');
			}

			if (hasIncompleteScreening) {
				return resumeScreeningSession(screeningSessionId);
			} else {
				return createScreeningSession();
			}
		},
		[createScreeningSession, disabled, hasIncompleteScreening, resumeScreeningSession]
	);

	const startScreeningFlow = useCallback(async () => {
		if (disabled) {
			throw new Error('Screening Flow is disabled');
		}

		if (!activeFlowVersion) {
			throw new Error('Unknown Active Flow Version');
		}

		if (activeFlowVersion.phoneNumberRequired) {
			setShowPhoneModal(true);
		} else {
			resumeOrCreateScreeningSession();
		}
	}, [activeFlowVersion, disabled, resumeOrCreateScreeningSession]);

	const startScreeningFlowIfNoneCompleted = useCallback(async () => {
		if (disabled) {
			throw new Error('Screening Flow is disabled');
		}

		if (hasCompletedScreening) {
			setDidCheckScreeningSessions(true);
			return;
		}

		return startScreeningFlow();
	}, [disabled, hasCompletedScreening, startScreeningFlow]);

	useEffect(() => {
		if (disabled) {
			return;
		}

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

		Promise.all([
			fetchScreeningsRequest.fetch().then((response) => setScreeningSessions(response.screeningSessions)),
			fetchFlowVersionsRequest.fetch().then((response) => {
				const activeVersion = response.screeningFlowVersions.find(
					(version) => version.screeningFlowVersionId === response.activeScreeningFlowVersionId
				);

				setActiveFlowVersion(activeVersion);
			}),
		]).catch((e) => {
			handleError(e);
		});

		return () => {
			fetchScreeningsRequest.abort();
		};
	}, [disabled, handleError, isImmediateSession, isSkipped, patientOrderId, screeningFlowId]);

	useEffect(() => {
		if (disabled || !screeningFlowId || !checkCompletionState) {
			return;
		}

		screeningService
			.getScreeningFlowCompletionStatusByScreeningFlowId(screeningFlowId)
			.fetch()
			.then((response) => setHasCompletedScreening(response.sessionFullyCompleted))
			.catch((e) => handleError(e));
	}, [checkCompletionState, disabled, handleError, screeningFlowId]);

	useEffect(() => {
		if (disabled || !instantiateOnLoad || !activeFlowVersion) {
			return;
		}

		startScreeningFlowIfNoneCompleted();
	}, [activeFlowVersion, disabled, instantiateOnLoad, startScreeningFlowIfNoneCompleted]);

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
						handleError(e);
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
