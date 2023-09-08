import Cookies from 'js-cookie';
import React, { FC, useState, useCallback } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

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

import PathwaysSection from '@/components/pathways-section';
import ResourceLibraryCard, { SkeletonResourceLibraryCard } from '@/components/resource-library-card';
import ScreeningFlowCta from '@/components/screening-flow-cta';
import Team from '@/components/team';
import NoData from '@/components/no-data';
import { useScreeningFlow } from './screening/screening.hooks';
import useAnalytics from '@/hooks/use-analytics';
import { GroupSessionDetailNavigationSource } from '@/routes/group-session-detail';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import CallToActionBlock from '@/components/call-to-action-block';
import { useAppRootLoaderData } from '@/routes/root';

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
	const { featuredTopicCenter } = useAppRootLoaderData();
	const { account, institution } = useAccount();
	const navigate = useNavigate();
	const { trackEvent } = useAnalytics();

	const [inTheStudioEvents, setInTheStudioEvents] = useState<(GroupSessionRequestModel | GroupSessionModel)[]>([]);
	const [content, setContent] = useState<ResourceLibraryContentModel[]>([]);
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, TagModel>>();
	const [callsToAction, setCallsToAction] = useState<CallToActionModel[]>([]);
	const [showScreeningFlowCta, setShowScreeningFlowCta] = useState(false);
	const [institutionBlurbs, setInstitutionBlurbs] = useState<Record<INSTITUTION_BLURB_TYPE_ID, InstitutionBlurb>>();

	const featuresScreeningFlow = useScreeningFlow({
		screeningFlowId: institution?.featureScreeningFlowId,
		instantiateOnLoad: false,
		disabled: !institution?.featuresEnabled,
	});
	const { startScreeningFlow, renderedCollectPhoneModal, renderedPreScreeningLoader } = featuresScreeningFlow;

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

	if (institution?.integratedCareEnabled) {
		return <Navigate to="/ic" />;
	}

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	const hasLandingPageFeatures = institution?.features.filter((f) => f.landingPageVisible).length > 0;

	return (
		<>
			<Helmet>
				<title>{`Cobalt | Employee Mental Health &amp; Wellness @ ${institution.name}`}</title>
			</Helmet>

			{institution?.featuresEnabled ? (
				<>
					{renderedCollectPhoneModal}

					<Container className="pt-16 pt-lg-24 pb-16">
						<Row>
							{hasLandingPageFeatures ? (
								<Col>
									<h5 className="mb-5 text-center text-gray">Welcome to Cobalt</h5>
									<h1 className="mb-0 text-center">What can we help you find today?</h1>
								</Col>
							) : (
								<Col>
									<h1 className="mb-5 text-center">Welcome to Cobalt!</h1>
									<p className="mb-0 fs-large text-center">
										Cobalt is a new wellness platform created specifically for {institution.name}{' '}
										employees
										<span className="d-block">
											to connect you to accessible and affordable mental health resources.
										</span>
									</p>
								</Col>
							)}
						</Row>
					</Container>
					{hasLandingPageFeatures && (
						<PathwaysSection className="mb-10" featuresScreeningFlow={featuresScreeningFlow} />
					)}
					{institution?.featureScreeningFlowId && !institution.hasTakenFeatureScreening && (
						<Container className="mb-10">
							<Row>
								<Col>
									<NoData
										className="bg-p50"
										title="Not sure what you need?"
										description={
											institution.epicFhirEnabled
												? 'Take an assessment for on your own time resources or speak with a resource navigator'
												: ''
										}
										actions={[
											{
												size: 'lg',
												variant: 'primary',
												title: 'Take the Assessment',
												onClick: () => {
													startScreeningFlow();
													trackEvent({
														action: 'HP Take Assessment',
													});
												},
											},
											...(institution.epicFhirEnabled
												? [
														{
															size: 'lg' as const,
															variant: 'outline-primary',
															title: 'Speak with a Resource Navigator',
															onClick: () => {
																window.open(institution.externalContactUsUrl, '_blank');
															},
														},
												  ]
												: []),
										]}
									/>
								</Col>
							</Row>
						</Container>
					)}
				</>
			) : (
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
				</>
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

			{featuredTopicCenter && (
				<Container className="pt-4 pt-lg-8">
					<CallToActionBlock
						subheading="Featured Topic"
						heading={featuredTopicCenter.featuredTitle!}
						descriptionHtml={featuredTopicCenter.featuredDescription!}
						imageUrl={featuredTopicCenter.imageUrl!}
						primaryActionText={featuredTopicCenter.featuredCallToAction!}
						onPrimaryActionClick={() => {
							navigate('/featured-topics/' + featuredTopicCenter.urlName);
						}}
						className="mb-4"
					/>
				</Container>
			)}

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
						<IneligibleBookingModal uiType="group-session" />

						<Container className="pt-20">
							<Row>
								<Col>
									<Carousel
										responsive={responsiveDefaults}
										description="Group Sessions"
										calloutTitle="Explore all"
										calloutOnClick={() => {
											navigate('/group-sessions');
										}}
									>
										{inTheStudioEvents.map((groupSession) => {
											let renderKey = '';
											let detailUrl = '';

											if (groupSessionsService.isGroupSession(groupSession)) {
												renderKey = groupSession.groupSessionId;
												detailUrl = `/group-sessions/${groupSession.urlName}`;
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
													state={{
														navigationSource: GroupSessionDetailNavigationSource.HOME_PAGE,
													}}
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
						<Container className="py-20 pb-20">
							<Row>
								<Col>
									<Carousel
										responsive={resourceLibraryCarouselConfig}
										description="Resource Library"
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
