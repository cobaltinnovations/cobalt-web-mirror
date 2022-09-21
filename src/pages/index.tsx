import Cookies from 'js-cookie';
import React, { FC, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import useAccount from '@/hooks/use-account';

import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import Carousel, { responsiveDefaults } from '@/components/carousel';
import StudioEvent from '@/components/studio-event';
import OnYourTimeItem from '@/components/on-your-time-item';

import { recommendationsService, groupSessionsService, accountService } from '@/lib/services';
import { GroupSessionRequestModel, Content, GroupSessionModel } from '@/lib/models';

import { ReactComponent as ConnectWithSupportIcon } from '@/assets/icons/icon-connect-with-support.svg';
import { Exception } from 'sass';

const Index: FC = () => {
	const { account, institution } = useAccount();

	const navigate = useNavigate();

	const [inTheStudioEvents, setInTheStudioEvents] = useState<(GroupSessionRequestModel | GroupSessionModel)[]>([]);
	const [onYourTimeContent, setOnYourTimeContent] = useState<Content[]>([]);

	const accountId = account?.accountId;
	const fetchData = useCallback(async () => {
		if (!accountId) return;

		const response = await recommendationsService.getRecommendations(accountId).fetch();

		setInTheStudioEvents([...response.groupSessionRequests, ...response.groupSessions]);
		setOnYourTimeContent(response.contents);

		const roleId = Cookies.get('roleId');
		if (roleId) {
			try {
				await accountService.postRoleRequest(accountId, roleId).fetch();
				Cookies.remove('roleId');
			} catch (error) {
				// dont throw
			}
		}
	}, [accountId]);

	function handleConnectWithSupportButtonClick() {
		navigate('/connect-with-support');
	}

	return (
		<AsyncPage fetchData={fetchData}>
			{institution?.supportEnabled && (
				<HeroContainer className="text-center">
					<h1 className="mb-3">Recommended for you</h1>
					<p className="mb-5">
						Peers, Resilience Coaches, Therapists, Psychiatrists, and more are here to help
					</p>
					<div className="d-flex justify-content-center">
						<Button className="d-flex align-items-center" onClick={handleConnectWithSupportButtonClick}>
							<ConnectWithSupportIcon className="me-2" />
							Connect with support
						</Button>
					</div>
				</HeroContainer>
			)}

			{inTheStudioEvents.length > 0 && (
				<>
					<Container className="pt-20">
						<Row>
							<Col>
								<h3 className="mb-2">Group Sessions</h3>
							</Col>
						</Row>
					</Container>
					<Container>
						<Row>
							<Col>
								<Carousel
									responsive={responsiveDefaults}
									// description="Explainer text goes here. What is in the studio?"
									calloutTitle="Explore all"
									calloutOnClick={() => {
										navigate('/in-the-studio');
									}}
								>
									{inTheStudioEvents.map((inTheStudioEvent) => {
										if (groupSessionsService.isGroupSession(inTheStudioEvent)) {
											return (
												<Link
													key={inTheStudioEvent.groupSessionId}
													className="text-decoration-none"
													to={`/in-the-studio/group-session-scheduled/${inTheStudioEvent.groupSessionId}`}
												>
													<StudioEvent groupEvent={inTheStudioEvent} />
												</Link>
											);
										} else if (groupSessionsService.isGroupSessionByRequest(inTheStudioEvent)) {
											return (
												<Link
													key={inTheStudioEvent.groupSessionRequestId}
													className="text-decoration-none"
													to={`/in-the-studio/group-session-by-request/${inTheStudioEvent.groupSessionRequestId}`}
												>
													<StudioEvent groupEvent={inTheStudioEvent} />
												</Link>
											);
										} else {
											// eslint-disable-next-line no-throw-literal
											throw 'Unrecognized session';
										}
									})}
								</Carousel>
							</Col>
						</Row>
					</Container>
				</>
			)}

			{onYourTimeContent.length > 0 && (
				<>
					<Container className="pt-20">
						<Row>
							<Col>
								<h3 className="mb-2">On Your Time</h3>
							</Col>
						</Row>
					</Container>
					<Container>
						<Row>
							<Col>
								<Carousel
									responsive={{
										externalMonitor: {
											...responsiveDefaults.externalMonitor,
											items: 4,
										},
										desktopExtraLarge: {
											...responsiveDefaults.desktopExtraLarge,
											items: 4,
										},
										desktop: {
											...responsiveDefaults.desktop,
											items: 3,
										},
										tablet: {
											...responsiveDefaults.tablet,
											items: 2,
										},
										mobile: {
											...responsiveDefaults.mobile,
											items: 2,
											partialVisibilityGutter: 16,
										},
									}}
									// description="Explainer text goes here. What is on your time?"
									calloutTitle="Explore all"
									calloutOnClick={() => {
										navigate('/on-your-time');
									}}
								>
									{onYourTimeContent.map((onYourOwnTimeItem) => {
										return (
											<Link
												key={onYourOwnTimeItem.contentId}
												to={`/on-your-time/${onYourOwnTimeItem.contentId}`}
												className="d-block mb-2 text-decoration-none"
											>
												<OnYourTimeItem
													imageUrl={onYourOwnTimeItem.imageUrl}
													tag={onYourOwnTimeItem.newFlag ? 'NEW' : ''}
													title={onYourOwnTimeItem.title}
													type={onYourOwnTimeItem.contentTypeLabel}
													author={onYourOwnTimeItem.author}
													duration={onYourOwnTimeItem.duration}
												/>
											</Link>
										);
									})}
								</Carousel>
							</Col>
						</Row>
					</Container>

					<Container className="pb-20">
						<Row>
							<Col>
								<div className="d-flex justify-content-center mb-4">
									<Button
										variant="light"
										onClick={() => {
											navigate('/on-your-time', { state: { personalize: true } });
										}}
									>
										Personalize Recommendations
									</Button>
								</div>
							</Col>
						</Row>
					</Container>
				</>
			)}
		</AsyncPage>
	);
};

export default Index;
