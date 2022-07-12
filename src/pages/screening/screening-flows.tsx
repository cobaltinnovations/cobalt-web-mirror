import AsyncPage from '@/components/async-page';
import CollectPhoneModal from '@/components/collect-phone-modal';
import useHandleError from '@/hooks/use-handle-error';
import useQuery from '@/hooks/use-query';
import { ERROR_CODES } from '@/lib/http-client';
import { ScreeningSession } from '@/lib/models';
import { screeningService } from '@/lib/services';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useOrchestratedRequest, useScreeningNavigation } from './screening.hooks';

const ScreeningFlowsPage = () => {
	const handleError = useHandleError();
	const queryParams = useQuery();
	const { screeningFlowId } = useParams<{ screeningFlowId: string }>();
	const targetAccountId = queryParams.get('targetAccountId');
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

	const createFlowSession = useCallback(() => {
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

	const shouldCreateNewSession = response?.screeningSessions.length === 0;
	useEffect(() => {
		if (!shouldCreateNewSession) {
			return;
		}

		createFlowSession();
	}, [createFlowSession, shouldCreateNewSession]);

	const shouldDefaultSelectOnlySession = response?.screeningSessions.length === 1;
	useEffect(() => {
		if (!shouldDefaultSelectOnlySession) {
			return;
		}

		setSelectedSession(response?.screeningSessions[0]);
	}, [response?.screeningSessions, shouldDefaultSelectOnlySession]);

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
					if (!selectedSession?.screeningSessionDestination) {
						return;
					}

					navigateToDestination(selectedSession.screeningSessionDestination, {
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

				<div className="text-center my-8">
					<Button
						onClick={() => {
							createFlowSession();
						}}
					>
						Create New
					</Button>
				</div>
				<pre>{JSON.stringify({ isLoading, screeningFlowId, response }, null, 4)}</pre>
				<p>Grab flow id from url params</p>

				<p>
					the /screening-flows/:screeningFlowId page shows a spinner and makes a GET /screening-sessions call
					to BE with the flow ID.
				</p>

				<p>
					If there are no screening sessions available for the flow ID, call POST /screening-sessions and
					check the API response for collectPhoneNumber.
				</p>
				<ul>
					<li>
						If true, show popup to collect it and save it, then redirect to FE GET
						/screening-question-contexts/screeningQuestionContextId (or whatever your “show this question”
						endpoint is)
					</li>
					<li>
						If there is one or more screening session that is not complete, show list of them with created
						time and link to “continue” next to each, or a “start new” below. Use same collectPhoneNumber
						logic as above.
					</li>
				</ul>
			</Container>
		</AsyncPage>
	);
};

export default ScreeningFlowsPage;
