import Cookies from 'js-cookie';
import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useMatches, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';
import {
	ScreeningFlowVersion,
	ScreeningSession,
	ScreeningSessionDestination,
	ScreeningSessionDestinationId,
	ModifiedAssessmentTypeId,
} from '@/lib/models';
import { screeningService } from '@/lib/services';
import { CrisisAnalyticsEvent, ScreeningAnalyticsEvent } from '@/contexts/analytics-context';
import useAnalytics from '@/hooks/use-analytics';
import useHandleError from '@/hooks/use-handle-error';
import { GroupSessionDetailNavigationSource } from '@/routes/group-session-detail';
import Loader from '@/components/loader';
import CollectPhoneModal from '@/components/collect-phone-modal';
import AccountSourcesModal from '@/components/account-sources-modal';
import useAccount from '@/hooks/use-account';
import useAccountSourceClickHandler from '@/hooks/use-account-source-click-handler';

export function useScreeningNavigation() {
	const navigate = useNavigate();
	const { trackEvent } = useAnalytics();
	const revalidator = useRevalidator();

	const matches = useMatches();

	const navigateToQuestion = useCallback(
		(contextId: string) => {
			const routeMatches = [...matches].reverse();
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
					const collectionUrlName = Cookies.get('groupSessionCollectionUrlName') ?? '';
					const navigationSource =
						(Cookies.get('groupSessionDetailNavigationSource') as GroupSessionDetailNavigationSource) ??
						GroupSessionDetailNavigationSource.GROUP_SESSION_LIST;
					const topicCenterPath = Cookies.get('groupSessionDetailFromTopicCenterPath');

					const navigationSourceToDestinationUrlMap = {
						[GroupSessionDetailNavigationSource.HOME_PAGE]: '/',
						[GroupSessionDetailNavigationSource.GROUP_SESSION_LIST]: '/group-sessions',
						[GroupSessionDetailNavigationSource.GROUP_SESSION_COLLECTION]:
							'/group-sessions/collection/' + collectionUrlName,
						[GroupSessionDetailNavigationSource.TOPIC_CENTER]: topicCenterPath,
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

					Cookies.remove('groupSessionDetailNavigationSource');
					Cookies.remove('groupSessionDetailFromTopicCenterPath');
					Cookies.remove('groupSessionCollectionUrlName');
					return;
				}
				case ScreeningSessionDestinationId.GROUP_SESSION_DETAIL:
					navigate(
						{
							pathname: '/group-sessions/' + destination.context.groupSessionUrlName,
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
				case ScreeningSessionDestinationId.INSTITUTION_REFERRAL:
					window.location.href = `${destination.context.institutionReferralUrl}`;
					return;
				case ScreeningSessionDestinationId.INSTITUTION_REFERRER_DETAIL:
					revalidator.revalidate();
					navigate(
						{
							pathname: `/referrals/${destination.context.institutionReferrerUrlName}`,
						},
						{
							replace,
						}
					);
					return;
				case ScreeningSessionDestinationId.ONE_ON_ONE_PROVIDER_LIST:
				default: {
					navigate(
						{
							pathname: '/',
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

	const handleAccountSourceClick = useAccountSourceClickHandler();
	const { account } = useAccount();
	const [showAccountSourcesModal, setShowAccountSourcesModal] = useState(false);
	const fetchKey = useMemo(
		() =>
			[screeningFlowId ?? '', patientOrderId ?? '', groupSessionId ?? '', checkCompletionState ? '1' : '0'].join(
				'|'
			),
		[checkCompletionState, groupSessionId, patientOrderId, screeningFlowId]
	);
	const fetchStateRef = useRef<{ key: string | null; inFlight: boolean }>({ key: null, inFlight: false });

	const incompleteSessions = useMemo(() => {
		return screeningSessions.filter((session) => !session.completed);
	}, [screeningSessions]);

	const hasIncompleteScreening = incompleteSessions.length > 0;

	const createScreeningSession = useCallback(
		(modifiedAssessment?: boolean, modifiedAssessmentType?: ModifiedAssessmentTypeId) => {
			if (disabled) {
				throw new Error('Screening Flow is disabled');
			}

			setIsCreatingScreeningSession(true);

			const isModifiedAssessment = modifiedAssessmentType ? true : Boolean(modifiedAssessment);
			const metadata =
				isModifiedAssessment || modifiedAssessmentType
					? {
							modifiedAssessment: isModifiedAssessment,
							...(modifiedAssessmentType && { modifiedAssessmentType }),
					  }
					: undefined;

			return screeningService
				.createScreeningSession({
					screeningFlowVersionId: activeFlowVersion?.screeningFlowVersionId,
					groupSessionId,
					patientOrderId,
					...(metadata && { metadata }),
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
		},
		[
			activeFlowVersion?.screeningFlowVersionId,
			disabled,
			groupSessionId,
			handleError,
			navigateToNext,
			patientOrderId,
		]
	);

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

	const startScreeningFlow = useCallback(
		async (forceCreate?: boolean) => {
			if (disabled) {
				throw new Error('Screening Flow is disabled');
			}

			if (!activeFlowVersion) {
				throw new Error('Unknown Active Flow Version');
			}

			if (
				activeFlowVersion.requiredAccountSources &&
				activeFlowVersion.requiredAccountSources.length > 0 &&
				account?.accountSourceId
			) {
				const currentAccountSourceId = account.accountSourceId;
				const availableAccountSourceIds = activeFlowVersion.requiredAccountSources.map(
					(as) => as.accountSourceId
				);
				const accountSourceIdIsValid = availableAccountSourceIds.includes(currentAccountSourceId);

				if (!accountSourceIdIsValid) {
					setShowAccountSourcesModal(true);
					return;
				}
			}

			if (activeFlowVersion.phoneNumberRequired) {
				setShowPhoneModal(true);
			} else {
				if (forceCreate) {
					if (disabled) {
						throw new Error('Screening Flow is disabled');
					}

					createScreeningSession();
					return;
				}

				resumeOrCreateScreeningSession();
			}
		},
		[account?.accountSourceId, activeFlowVersion, createScreeningSession, disabled, resumeOrCreateScreeningSession]
	);

	const startScreeningFlowIfNoneCompleted = useCallback(async () => {
		if (disabled) {
			throw new Error('Screening Flow is disabled');
		}

		return startScreeningFlow();
	}, [disabled, startScreeningFlow]);

	useEffect(() => {
		if (disabled || !screeningFlowId) {
			return;
		}

		if (isSkipped) {
			setDidCheckScreeningSessions(true);
			return;
		}

		if (fetchStateRef.current.key === fetchKey) {
			if (fetchStateRef.current.inFlight || didCheckScreeningSessions) {
				return;
			}
		}

		fetchStateRef.current = { key: fetchKey, inFlight: true };

		const fetchScreeningsRequest = screeningService.getScreeningSessionsByFlowId({
			screeningFlowId,
			patientOrderId,
		});
		const fetchFlowVersionsRequest = screeningService.getScreeningFlowVersionsByFlowId({ screeningFlowId });

		const fetchCheckCompletionRequest = checkCompletionState
			? screeningService.getScreeningFlowCompletionStatusByScreeningFlowId(screeningFlowId)
			: null;
		let isMounted = true;
		const fetchCompletionPromise = fetchCheckCompletionRequest
			? fetchCheckCompletionRequest.fetch().then((response) => {
					if (!isMounted) {
						return;
					}

					setHasCompletedScreening(response.sessionFullyCompleted);
			  })
			: Promise.resolve();

		Promise.all([
			fetchScreeningsRequest.fetch().then((response) => {
				if (!isMounted) {
					return;
				}

				setScreeningSessions(response.screeningSessions);
			}),
			fetchFlowVersionsRequest.fetch().then((response) => {
				if (!isMounted) {
					return;
				}

				const activeVersion = response.screeningFlowVersions.find(
					(version) => version.screeningFlowVersionId === response.activeScreeningFlowVersionId
				);

				setActiveFlowVersion(activeVersion);
			}),
			fetchCompletionPromise,
		])
			.then(() => {
				if (!isMounted) {
					return;
				}

				setDidCheckScreeningSessions(true);
			})
			.catch((e) => {
				if (!isMounted) {
					return;
				}

				handleError(e);
			})
			.finally(() => {
				fetchStateRef.current.inFlight = false;
			});

		return () => {
			isMounted = false;
			fetchScreeningsRequest.abort();
			fetchFlowVersionsRequest.abort();
			fetchCheckCompletionRequest?.abort();
		};
	}, [
		checkCompletionState,
		didCheckScreeningSessions,
		disabled,
		fetchKey,
		handleError,
		isSkipped,
		patientOrderId,
		screeningFlowId,
	]);

	useEffect(() => {
		if (disabled || !instantiateOnLoad || !activeFlowVersion) {
			return;
		}

		startScreeningFlowIfNoneCompleted();
	}, [activeFlowVersion, disabled, instantiateOnLoad, startScreeningFlowIfNoneCompleted]);

	// TODO: Move components to layout/context provider
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

	const renderedAccountSourcesModal = (
		<>
			{activeFlowVersion?.requiredAccountSources && (
				<AccountSourcesModal
					accountSources={activeFlowVersion.requiredAccountSources}
					onAccountSourceClick={handleAccountSourceClick}
					show={showAccountSourcesModal}
					onHide={() => {
						setShowAccountSourcesModal(false);
					}}
				/>
			)}
		</>
	);

	// used to block render/ui until flowVersion/completion-state is resolved
	const renderedPreScreeningLoader =
		disabled || didCheckScreeningSessions ? null : (
			<div className="my-10">
				{renderedCollectPhoneModal}
				<Loader />
			</div>
		);

	return {
		didCheckScreeningSessions,
		hasCompletedScreening,
		renderedCollectPhoneModal,
		renderedPreScreeningLoader,
		renderedAccountSourcesModal,
		startScreeningFlow,
		createScreeningSession,
		resumeScreeningSession,
		isCreatingScreeningSession,
	};
}
