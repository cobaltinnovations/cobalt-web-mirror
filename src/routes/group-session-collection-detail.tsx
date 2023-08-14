import React from 'react';
import { Link, LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { GROUP_SESSION_STATUS_ID, GROUP_SESSION_SORT_ORDER } from '@/lib/models';
import { groupSessionsService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import Loader from '@/components/loader';
import HeroContainer from '@/components/hero-container';
import StudioEvent from '@/components/studio-event';
import NoData from '@/components/no-data';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { groupSessionCollectionId } = params as { groupSessionCollectionId: string };
	const [{ groupSessionCollections }, { groupSessions }] = await Promise.all([
		groupSessionsService.getGroupSessionCollections().fetch(),
		groupSessionsService
			.getGroupSessions({
				viewType: 'PATIENT',
				groupSessionStatusId: GROUP_SESSION_STATUS_ID.ADDED,
				orderBy: GROUP_SESSION_SORT_ORDER.START_TIME_ASCENDING,
				...(groupSessionCollectionId === 'UPCOMING_SESSIONS' ? {} : { groupSessionCollectionId }),
				pageSize: 1000,
				pageNumber: 0,
			})
			.fetch(),
	]);

	const groupSessionCollection = groupSessionCollections.find(
		(collection) => collection.groupSessionCollectionId === groupSessionCollectionId
	) ?? {
		groupSessionCollectionId: 'UPCOMING_SESSIONS',
		description: 'Upcoming Sessions',
		displayOrder: 0,
		institutionId: '',
	};

	return { groupSessionCollection, groupSessions };
};

export const Component = () => {
	const navigate = useNavigate();
	const { groupSessionCollection, groupSessions } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const { institution } = useAccount();
	const { renderedCollectPhoneModal, didCheckScreeningSessions } = useScreeningFlow({
		screeningFlowId: institution?.groupSessionsScreeningFlowId,
	});

	if (!didCheckScreeningSessions) {
		return (
			<>
				{renderedCollectPhoneModal}
				<Loader />
			</>
		);
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | Group Sessions - {groupSessionCollection?.description}</title>
			</Helmet>

			<HeroContainer className="bg-n75">
				<p className="mb-5 text-gray fs-large text-center">Group Sessions</p>
				<h1 className="mb-6 text-center">{groupSessionCollection?.description}</h1>
				<p className="fs-large text-center">[TODO]: Add description of the collection</p>
			</HeroContainer>

			<Container className="py-14">
				{groupSessions.length > 0 ? (
					<Row>
						{groupSessions.map((groupSession) => {
							return (
								<Col md={6} lg={4} key={groupSession.groupSessionId} className="mb-8">
									<Link
										className="d-block text-decoration-none h-100"
										to={`/group-sessions/${groupSession.groupSessionId}`}
									>
										<StudioEvent className="h-100" studioEvent={groupSession} />
									</Link>
								</Col>
							);
						})}
					</Row>
				) : (
					<Row>
						<Col>
							<NoData
								title="Upcoming Sessions"
								description="There are no group sessions available."
								actions={[]}
							/>
						</Col>
					</Row>
				)}
			</Container>

			{institution?.groupSessionRequestsEnabled && (
				<Container fluid className="bg-n75">
					<Container className="py-10 py-lg-20">
						<Row>
							<Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
								<h2 className="mb-6 text-center">Looking to schedule a group session for your team?</h2>
								<p className="mb-6 fs-large text-center">
									Request a session and we'll work with you to find a dedicated time for a
									wellness-focused group session for your team.
								</p>
								<div className="text-center">
									<Button
										variant="primary"
										onClick={() => {
											navigate('/group-sessions/request');
										}}
									>
										Request a Session
									</Button>
								</div>
							</Col>
						</Row>
					</Container>
				</Container>
			)}
		</>
	);
};
