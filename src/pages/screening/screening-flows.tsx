import AsyncPage from '@/components/async-page';
import CollectPhoneModal from '@/components/collect-phone-modal';
import useHandleError from '@/hooks/use-handle-error';
import useHeaderTitle from '@/hooks/use-header-title';
import { ERROR_CODES } from '@/lib/http-client';
import { ScreeningSession } from '@/lib/models';
import { screeningService } from '@/lib/services';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import { useParams, useSearchParams } from 'react-router-dom';
import { useOrchestratedRequest, useScreeningNavigation } from './screening.hooks';

const ScreeningFlowsPage = () => {
	useHeaderTitle(null);
	const handleError = useHandleError();
	const [searchParams] = useSearchParams();
	const { screeningFlowId } = useParams<{ screeningFlowId: string }>();
	const targetAccountId = searchParams.get('targetAccountId');
	const [showPhoneModal, setShowPhoneModal] = useState(false);
	const [selectedSession, setSelectedSession] = useState<ScreeningSession>();
	const { navigateToDestination, navigateToNext } = useScreeningNavigation();

	const { response, isLoading, initialFetch } = useOrchestratedRequest(
		screeningService.getScreeningSessionsByFlowId({
			screeningFlowId,
			targetAccountId,
		}),
		{
			initialize: !!screeningFlowId,
		}
	);

	const incompleteSessions = useMemo(() => {
		return response?.screeningSessions.filter((session) => !session.completed);
	}, [response?.screeningSessions]);

	const createFlowSession = useCallback(() => {
		if (!screeningFlowId) {
			return;
		}

		const create = screeningService.createScreeningSession({ screeningFlowId, targetAccountId });

		create
			.fetch()
			.then((response) => {
				setSelectedSession(response.screeningSession);
			})
			.catch((e) => {
				if ((e as any).code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});
	}, [handleError, screeningFlowId, targetAccountId]);

	const shouldCreateNewSession = Array.isArray(incompleteSessions) && incompleteSessions.length === 0;
	useEffect(() => {
		if (!shouldCreateNewSession) {
			return;
		}

		createFlowSession();
	}, [createFlowSession, shouldCreateNewSession]);

	const shouldDefaultSelectOnlySession = Array.isArray(incompleteSessions) && incompleteSessions.length === 1;
	useEffect(() => {
		if (!shouldDefaultSelectOnlySession) {
			return;
		}

		setSelectedSession(incompleteSessions[0]);
	}, [incompleteSessions, shouldDefaultSelectOnlySession]);

	useEffect(() => {
		if (selectedSession?.promptForPhoneNumber) {
			setShowPhoneModal(true);
		} else if (selectedSession) {
			navigateToNext(selectedSession);
		}
	}, [navigateToNext, selectedSession]);

	return (
		<AsyncPage fetchData={initialFetch}>
			<CollectPhoneModal
				show={showPhoneModal}
				onSkip={() => {
					navigateToDestination(selectedSession?.screeningSessionDestination, {
						skipAssessment: true,
					});
				}}
				onSuccess={() => {
					setShowPhoneModal(false);

					if (!selectedSession) {
						return;
					}

					navigateToNext(selectedSession);
				}}
			/>

			<Container className="pt-16">
				{(response?.screeningSessions.length ?? 0) > 1 &&
					response?.screeningSessions.map((session, index) => {
						return (
							<Card key={index} className="mb-5 p-6">
								<div className="d-flex">
									<div>
										<Card.Title>Screening Seession #{index + 1}</Card.Title>
										<Card.Subtitle>{session.createdDescription}</Card.Subtitle>
									</div>

									<Button className="ms-auto" onClick={() => setSelectedSession(session)}>
										Continue
									</Button>
								</div>
							</Card>
						);
					})}

				{incompleteSessions && incompleteSessions.length > 1 && (
					<div className="text-center my-8">
						<Button
							onClick={() => {
								createFlowSession();
							}}
						>
							Create New
						</Button>
					</div>
				)}
			</Container>
		</AsyncPage>
	);
};

export default ScreeningFlowsPage;
