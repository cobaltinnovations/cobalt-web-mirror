import Cookies from 'js-cookie';
import React, { FC, useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import useAccount from '@/hooks/use-account';

import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import Carousel, { responsiveDefaults } from '@/components/carousel';
import StudioEvent from '@/components/studio-event';
import CallToAction from '@/components/call-to-action';

import { recommendationsService, groupSessionsService, accountService, callToActionService } from '@/lib/services';
import {
	GroupSessionRequestModel,
	GroupSessionModel,
	CALL_TO_ACTION_DISPLAY_AREA_ID,
	CallToActionModel,
	ResourceLibraryContentModel,
	TagModel,
} from '@/lib/models';

import { ReactComponent as ConnectWithSupportIcon } from '@/assets/icons/icon-connect-with-support.svg';
import config from '@/lib/config';
import SentryDebugButtons from '@/components/sentry-debug-buttons';
import ResourceLibraryCard, { SkeletonResourceLibraryCard } from '@/components/resource-library-card';

const resourceLibraryCarouselConfig = {
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
		items: 1,
		partialVisibilityGutter: 16,
	},
};

const Index: FC = () => {
	const { account, institution } = useAccount();

	const navigate = useNavigate();

	const [inTheStudioEvents, setInTheStudioEvents] = useState<(GroupSessionRequestModel | GroupSessionModel)[]>([]);
	const [content, setContent] = useState<ResourceLibraryContentModel[]>([]);
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, TagModel>>();
	const [callsToAction, setCallsToAction] = useState<CallToActionModel[]>([]);

	const fetchData = useCallback(async () => {
		if (!account?.accountId) return;

		const response = await recommendationsService.getRecommendations(account?.accountId).fetch();

		setInTheStudioEvents([...response.groupSessionRequests, ...response.groupSessions]);
		setContent(response.contents);
		setTagsByTagId(response.tagsByTagId);

		const roleId = Cookies.get('roleId');
		if (roleId) {
			try {
				await accountService.postRoleRequest(account?.accountId, roleId).fetch();
				Cookies.remove('roleId');
			} catch (error) {
				// dont throw
			}
		}
	}, [account?.accountId]);

	const fetchCallsToAction = useCallback(async () => {
		const response = await callToActionService
			.getCallsToAction({ callToActionDisplayAreaId: CALL_TO_ACTION_DISPLAY_AREA_ID.HOME })
			.fetch();

		setCallsToAction(response.callsToAction);
	}, []);

	function handleConnectWithSupportButtonClick() {
		navigate('/connect-with-support');
	}

	useEffect(() => {
		if (institution?.integratedCareEnabled) {
			navigate('/ic');
		}
	}, [institution?.integratedCareEnabled, navigate]);

	return (
		<>
			{institution?.supportEnabled && (
				<HeroContainer className="text-center">
					<h1 className="mb-3">Recommended for you</h1>
					<p className="mb-5">
						Peers, Coping First Aid Coaches, Therapists, Psychiatrists, and more are here to help
					</p>
					<div className="d-flex justify-content-center">
						<Button className="d-flex align-items-center" onClick={handleConnectWithSupportButtonClick}>
							<ConnectWithSupportIcon className="me-2" />
							Connect with support
						</Button>
					</div>
				</HeroContainer>
			)}

			<AsyncPage fetchData={fetchCallsToAction}>
				{callsToAction.length > 0 && (
					<Container className="pt-4 pt-lg-8">
						<Row>
							<Col>
								{callsToAction.map((cta, index) => {
									const isLast = callsToAction.length - 1 === index;
									return (
										<CallToAction
											key={`cta-${index}`}
											className={!isLast ? 'mb-4' : ''}
											callToAction={cta}
										/>
									);
								})}
							</Col>
						</Row>
					</Container>
				)}
			</AsyncPage>

			<AsyncPage
				fetchData={fetchData}
				loadingComponent={
					<>
						<Container className="pt-20">
							<Row className="mb-12">
								<Col>
									<h3 className="mb-2">Group Sessions</h3>
								</Col>
							</Row>
							<Row>
								<Col md={6} lg={4}>
									<SkeletonResourceLibraryCard />
								</Col>
								<Col md={6} lg={4}>
									<SkeletonResourceLibraryCard />
								</Col>
							</Row>
						</Container>
						<Container className="pt-20">
							<Row className="mb-12">
								<Col>
									<h3 className="mb-2">Resource Library</h3>
								</Col>
							</Row>
							<Row>
								<Col sm={6} md={4} lg={3}>
									<SkeletonResourceLibraryCard />
								</Col>
								<Col sm={6} md={4} lg={3}>
									<SkeletonResourceLibraryCard />
								</Col>
							</Row>
						</Container>
					</>
				}
			>
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
														className="d-block text-decoration-none h-100"
														to={`/in-the-studio/group-session-scheduled/${inTheStudioEvent.groupSessionId}`}
													>
														<StudioEvent className="h-100" studioEvent={inTheStudioEvent} />
													</Link>
												);
											} else if (groupSessionsService.isGroupSessionByRequest(inTheStudioEvent)) {
												return (
													<Link
														key={inTheStudioEvent.groupSessionRequestId}
														className="d-block text-decoration-none h-100"
														to={`/in-the-studio/group-session-by-request/${inTheStudioEvent.groupSessionRequestId}`}
													>
														<StudioEvent className="h-100" studioEvent={inTheStudioEvent} />
													</Link>
												);
											} else {
												throw new Error('Unrecognized group session type');
											}
										})}
									</Carousel>
								</Col>
							</Row>
						</Container>
					</>
				)}

				{content.length > 0 && (
					<>
						<Container className="pt-20">
							<Row>
								<Col>
									<h3 className="mb-2">Resource Library</h3>
								</Col>
							</Row>
						</Container>
						<Container>
							<Row>
								<Col>
									<Carousel
										responsive={resourceLibraryCarouselConfig}
										// description="Explainer text goes here. What is on your time?"
										calloutTitle="Explore all"
										calloutOnClick={() => {
											navigate('/resource-library');
										}}
									>
										{content.map((content) => {
											return (
												<ResourceLibraryCard
													key={content.contentId}
													contentId={content.contentId}
													className="h-100"
													imageUrl={content.imageUrl}
													badgeTitle={content.newFlag ? 'New' : ''}
													title={content.title}
													author={content.author}
													description={content.description}
													tags={
														tagsByTagId
															? content.tagIds.map((tagId) => {
																	return tagsByTagId[tagId];
															  })
															: []
													}
													contentTypeId={content.contentTypeId}
													duration={content.durationInMinutesDescription}
												/>
											);
										})}
									</Carousel>
								</Col>
							</Row>
						</Container>

						<Container className="pb-20">
							<Row>
								<Col>
									<div className="d-flex justify-content-center mb-4"></div>
								</Col>
							</Row>
						</Container>
					</>
				)}

				{config.COBALT_WEB_SENTRY_SHOW_DEBUG && <SentryDebugButtons />}
			</AsyncPage>
		</>
	);
};

export default Index;
