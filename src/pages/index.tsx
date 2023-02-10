import Cookies from 'js-cookie';
import React, { FC, useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import useAccount from '@/hooks/use-account';

import AsyncPage from '@/components/async-page';
import HomeHero from '@/components/home-hero';
import Carousel, { responsiveDefaults } from '@/components/carousel';
import StudioEvent, { StudioEventSkeleton } from '@/components/studio-event';
import CallToAction from '@/components/call-to-action';

import {
	recommendationsService,
	groupSessionsService,
	accountService,
	callToActionService,
	screeningService,
	institutionService,
} from '@/lib/services';
import {
	GroupSessionRequestModel,
	GroupSessionModel,
	CALL_TO_ACTION_DISPLAY_AREA_ID,
	CallToActionModel,
	ResourceLibraryContentModel,
	TagModel,
	INSTITUTION_BLURB_TYPE_ID,
	InstitutionBlurb,
} from '@/lib/models';

import config from '@/lib/config';
import SentryDebugButtons from '@/components/sentry-debug-buttons';
import ResourceLibraryCard, { SkeletonResourceLibraryCard } from '@/components/resource-library-card';
import ScreeningFlowCta from '@/components/screening-flow-cta';
import Team from '@/components/team';
import useFlags from '@/hooks/use-flags';

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
	},
};

const Index: FC = () => {
	const { account, institution } = useAccount();
	const navigate = useNavigate();
	const { addFlag } = useFlags();

	const [inTheStudioEvents, setInTheStudioEvents] = useState<(GroupSessionRequestModel | GroupSessionModel)[]>([]);
	const [content, setContent] = useState<ResourceLibraryContentModel[]>([]);
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, TagModel>>();
	const [callsToAction, setCallsToAction] = useState<CallToActionModel[]>([]);
	const [showScreeningFlowCta, setShowScreeningFlowCta] = useState(false);
	const [institutionBlurbs, setInstitutionBlurbs] = useState<Record<INSTITUTION_BLURB_TYPE_ID, InstitutionBlurb>>();

	const checkScreenFlowStatus = useCallback(async () => {
		if (!institution?.recommendedContentEnabled || !institution?.contentScreeningFlowId) {
			return;
		}

		try {
			const { sessionFullyCompleted } = await screeningService
				.getScreeningFlowCompletionStatusByScreeningFlowId(institution.contentScreeningFlowId)
				.fetch();

			if (sessionFullyCompleted) {
				setShowScreeningFlowCta(false);
			} else {
				setShowScreeningFlowCta(true);
			}
		} catch (error) {
			// dont throw
		}
	}, [institution?.contentScreeningFlowId, institution?.recommendedContentEnabled]);

	const fetchData = useCallback(async () => {
		if (!account?.accountId) return;

		const [recommendationsResponse, blurbsResponse] = await Promise.all([
			recommendationsService.getRecommendations(account?.accountId).fetch(),
			institutionService.getInstitutionBlurbs().fetch(),
		]);

		setInTheStudioEvents([
			...recommendationsResponse.groupSessionRequests,
			...recommendationsResponse.groupSessions,
		]);
		setContent(recommendationsResponse.contents);
		setTagsByTagId(recommendationsResponse.tagsByTagId);
		setInstitutionBlurbs(blurbsResponse.institutionBlurbsByInstitutionBlurbTypeId);

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

	useEffect(() => {
		if (institution?.integratedCareEnabled) {
			navigate('/ic');
		}
	}, [institution?.integratedCareEnabled, navigate]);

	return (
		<>
			<HomeHero />

			<AsyncPage fetchData={checkScreenFlowStatus}>
				{showScreeningFlowCta && (
					<Container className="pt-12">
						<Row>
							<Col>
								<ScreeningFlowCta />
							</Col>
						</Row>
					</Container>
				)}
			</AsyncPage>

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
									<StudioEventSkeleton />
								</Col>
								<Col md={6} lg={4}>
									<StudioEventSkeleton />
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
										description="Register for virtual group sessions led by experts covering a range of topics, from managing anxiety to healthy living and more."
										calloutTitle="Explore all"
										calloutOnClick={() => {
											navigate('/in-the-studio');
										}}
									>
										{inTheStudioEvents.map((groupSession) => {
											let renderKey = '';
											let detailUrl = '';

											if (groupSessionsService.isGroupSession(groupSession)) {
												renderKey = groupSession.groupSessionId;
												detailUrl = `/in-the-studio/group-session-scheduled/${groupSession.groupSessionId}`;
											} else if (groupSessionsService.isGroupSessionByRequest(groupSession)) {
												renderKey = groupSession.groupSessionRequestId;
												detailUrl = `/in-the-studio/group-session-by-request/${groupSession.groupSessionRequestId}`;
											} else {
												console.warn('attempting to render an unknown studio event');
												return null;
											}

											return (
												<Link
													key={renderKey}
													className="d-block text-decoration-none h-100"
													to={detailUrl}
												>
													<StudioEvent className="h-100" studioEvent={groupSession} />
												</Link>
											);
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
						<Container className="pb-20">
							<Row>
								<Col>
									<Carousel
										responsive={resourceLibraryCarouselConfig}
										description="Browse a variety of digital resources to support your general wellness, including articles, podcasts, apps and more."
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
					</>
				)}

				{config.COBALT_WEB_SHOW_DEBUG === 'true' && (
					<Container className="mb-20">
						<Row>
							<Col>
								<Button
									variant="primary"
									onClick={() => {
										addFlag({
											variant: 'primary',
											title: 'Regular news, everyone',
											description: 'Nothing to worry about, everything is going great!',
											actions: [
												{
													title: 'Understood',
													onClick: () => {
														return;
													},
												},
												{
													title: 'No thanks',
													onClick: () => {
														return;
													},
												},
											],
										});
									}}
								>
									Primary flag
								</Button>
								<Button
									variant="success"
									onClick={() => {
										addFlag({
											variant: 'success',
											title: 'Good news, everyone',
											description: 'Nothing to worry about, everything is going great!',
											actions: [
												{
													title: 'Understood',
													onClick: () => {
														return;
													},
												},
												{
													title: 'No thanks',
													onClick: () => {
														return;
													},
												},
											],
										});
									}}
								>
									Success flag
								</Button>
								<Button
									variant="warning"
									onClick={() => {
										addFlag({
											variant: 'warning',
											title: 'Cautionary news, everyone',
											description: 'Nothing to worry about, everything is going great!',
											actions: [
												{
													title: 'Understood',
													onClick: () => {
														return;
													},
												},
												{
													title: 'No thanks',
													onClick: () => {
														return;
													},
												},
											],
										});
									}}
								>
									Warning flag
								</Button>
								<Button
									variant="danger"
									onClick={() => {
										addFlag({
											variant: 'danger',
											title: 'Bad news, everyone',
											description: 'Nothing to worry about, everything is going great!',
											actions: [
												{
													title: 'Understood',
													onClick: () => {
														return;
													},
												},
												{
													title: 'No thanks',
													onClick: () => {
														return;
													},
												},
											],
										});
									}}
								>
									Danger flag
								</Button>
							</Col>
						</Row>
					</Container>
				)}

				{config.COBALT_WEB_SENTRY_SHOW_DEBUG && <SentryDebugButtons />}

				{institutionBlurbs?.[INSTITUTION_BLURB_TYPE_ID.TEAM] && (
					<Team teamMembers={institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.TEAM].institutionTeamMembers} />
				)}
				{institutionBlurbs?.[INSTITUTION_BLURB_TYPE_ID.ABOUT] && (
					<>
						<Container>
							<Row>
								<Col>
									<hr />
								</Col>
							</Row>
						</Container>
						<Container className="pt-18 pb-24">
							<Row>
								<Col lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
									<h2 className="mb-6 text-center">
										{institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.ABOUT].title}
									</h2>
									<div
										dangerouslySetInnerHTML={{
											__html: institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.ABOUT].description,
										}}
									/>
								</Col>
							</Row>
						</Container>
					</>
				)}
			</AsyncPage>
		</>
	);
};

export default Index;
