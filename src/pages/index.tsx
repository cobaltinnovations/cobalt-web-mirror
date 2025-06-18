import Cookies from 'js-cookie';
import React, { FC, useState, useCallback, useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';

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
	analyticsService,
	coursesService,
} from '@/lib/services';
import {
	GroupSessionRequestModel,
	GroupSessionModel,
	CALL_TO_ACTION_DISPLAY_AREA_ID,
	CallToActionModel,
	INSTITUTION_BLURB_TYPE_ID,
	InstitutionBlurb,
	Content,
	Tag,
	AnalyticsNativeEventTypeId,
	AnalyticsNativeEventClickthroughTopicCenterSource,
	SITE_LOCATION_ID,
	CourseModel,
} from '@/lib/models';

import { getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession } from '@/lib/utils';
import { useAppRootLoaderData } from '@/routes/root';
import { useScreeningFlow } from './screening/screening.hooks';
import useAnalytics from '@/hooks/use-analytics';
import useHandleError from '@/hooks/use-handle-error';
import PathwaysSection from '@/components/pathways-section';
import ResourceLibraryCard, { SkeletonResourceLibraryCard } from '@/components/resource-library-card';
import ScreeningFlowCta from '@/components/screening-flow-cta';
import Team from '@/components/team';
import { GroupSessionDetailNavigationSource } from '@/routes/group-session-detail';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import CallToActionBlock from '@/components/call-to-action-block';
import FeatureScreeningCta from '@/components/feature-screening-cta';
import { CourseContinue } from '@/components/courses';
import { PreviewCanvas } from '@/components/preview-canvas';
import { ScreeningFlow } from '@/components/screening-v2';

const Index: FC = () => {
	const { featuredTopicCenter, featuredTopicCenters, legacyFeaturedTopicCenter, legacySecondaryFeaturedTopicCenter } =
		useAppRootLoaderData();
	const { account, institution } = useAccount();
	const navigate = useNavigate();
	const { trackEvent } = useAnalytics();
	const handleError = useHandleError();

	const [showScreeningFlowCta, setShowScreeningFlowCta] = useState(false);
	const [callsToAction, setCallsToAction] = useState<CallToActionModel[]>([]);
	const [inTheStudioEvents, setInTheStudioEvents] = useState<(GroupSessionRequestModel | GroupSessionModel)[]>([]);
	const [content, setContent] = useState<Content[]>([]);
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, Tag>>();
	const [availableCourses, setAvailableCourses] = useState<CourseModel[]>([]);
	const [comingSoonCourses, setComingSoonCourses] = useState<CourseModel[]>([]);
	const [inProgressCourses, setInProgressCourses] = useState<CourseModel[]>([]);
	const [completedCourses, setCompletedCourses] = useState<CourseModel[]>([]);
	const [institutionBlurbs, setInstitutionBlurbs] = useState<Record<INSTITUTION_BLURB_TYPE_ID, InstitutionBlurb>>();
	const [showOnboardingModal, setShowOnboardingModal] = useState(false);

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

		const [recommendationsResponse, blurbsResponse, coursesResponse] = await Promise.all([
			recommendationsService.getRecommendations(account?.accountId).fetch(),
			institutionService.getInstitutionBlurbs().fetch(),
			coursesService.getCourses().fetch(),
		]);

		setInTheStudioEvents([
			...recommendationsResponse.groupSessionRequests,
			...recommendationsResponse.groupSessions,
		]);
		setContent(recommendationsResponse.contents);
		setTagsByTagId(recommendationsResponse.tagsByTagId);
		setInProgressCourses(coursesResponse.inProgress);
		setAvailableCourses(coursesResponse.available);
		setComingSoonCourses(coursesResponse.comingSoon);
		setCompletedCourses(coursesResponse.completed);
		setInstitutionBlurbs(blurbsResponse.institutionBlurbsByInstitutionBlurbTypeId);

		if (institution.onboardingScreeningFlowId) {
			const { sessionFullyCompleted } = await screeningService
				.getScreeningFlowCompletionStatusByScreeningFlowId(institution.onboardingScreeningFlowId)
				.fetch();

			if (!sessionFullyCompleted) {
				setShowOnboardingModal(true);
			}
		}

		const roleId = Cookies.get('roleId');
		if (roleId) {
			try {
				await accountService.postRoleRequest(account?.accountId, roleId).fetch();
				Cookies.remove('roleId');
			} catch (error) {
				// dont throw
			}
		}

		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_HOME);
	}, [account?.accountId, institution.onboardingScreeningFlowId]);

	const fetchCallsToAction = useCallback(async () => {
		const response = await callToActionService
			.getCallsToAction({ callToActionDisplayAreaId: CALL_TO_ACTION_DISPLAY_AREA_ID.HOME })
			.fetch();

		setCallsToAction(response.callsToAction);
	}, []);

	const handleStartCourseButtonClick = useCallback(
		async (courseId: string) => {
			try {
				const { courseSession } = await coursesService.createCourseSession({ courseId }).fetch();
				const { course } = await coursesService.getCourseDetail(courseSession.courseId).fetch();
				const courseUnitId = getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession(
					course.courseModules,
					courseSession
				);

				if (!courseUnitId) {
					throw new Error('courseUnitId undefined.');
				}

				navigate(`/courses/${course.urlName}/course-units/${courseUnitId}`);
			} catch (error) {
				handleError(error);
			}
		},
		[handleError, navigate]
	);

	const memoizedOnboardingScreeningFlowParams = useMemo(
		() => ({ screeningFlowId: institution.onboardingScreeningFlowId }),
		[institution.onboardingScreeningFlowId]
	);
	const handleOnboardingScreeningFlowComplete = useCallback(() => {
		setShowOnboardingModal(false);
	}, []);

	if (institution?.integratedCareEnabled) {
		return <Navigate to="/ic" />;
	}

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	const hasLandingPageFeatures = institution?.features.filter((f) => f.landingPageVisible).length > 0;
	const showFeatureScreeningCta =
		!institution.epicFhirEnabled && institution?.featureScreeningFlowId && !institution.hasTakenFeatureScreening;

	return (
		<>
			<Helmet>
				<title>Cobalt | Employee Mental Health & Wellness @ {institution.name}</title>
			</Helmet>

			<PreviewCanvas title={institution.name} show={showOnboardingModal}>
				{institution.onboardingScreeningFlowId && (
					<Container>
						<Row>
							<Col md={12} lg={{ span: 6, offset: 3 }}>
								<ScreeningFlow
									screeningFlowParams={memoizedOnboardingScreeningFlowParams}
									onScreeningFlowComplete={handleOnboardingScreeningFlowComplete}
								/>
							</Col>
						</Row>
					</Container>
				)}
			</PreviewCanvas>

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
					{showFeatureScreeningCta && (
						<FeatureScreeningCta
							onStartAssessment={() => {
								startScreeningFlow();
								trackEvent({
									action: 'HP Take Assessment',
								});
							}}
						/>
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

			{institution.preferLegacyTopicCenters ? (
				<>
					{legacyFeaturedTopicCenter && (
						<Container className="pt-4 pt-lg-8">
							<CallToActionBlock
								subheading="Featured Topic"
								heading={legacyFeaturedTopicCenter.featuredTitle!}
								descriptionHtml={legacyFeaturedTopicCenter.featuredDescription!}
								imageUrl={legacyFeaturedTopicCenter.imageUrl!}
								primaryActionText={legacyFeaturedTopicCenter.featuredCallToAction!}
								onPrimaryActionClick={() => {
									analyticsService.persistEvent(
										AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER,
										{
											topicCenterId: legacyFeaturedTopicCenter.topicCenterId,
											source: AnalyticsNativeEventClickthroughTopicCenterSource.HOME_FEATURE,
										}
									);

									if (legacyFeaturedTopicCenter.urlOverride) {
										window.location.href = legacyFeaturedTopicCenter.urlOverride;
									} else {
										navigate('/featured-topics/' + legacyFeaturedTopicCenter.urlName);
									}
								}}
								className="mb-4"
							/>
						</Container>
					)}
				</>
			) : (
				<>
					{featuredTopicCenter && (
						<Container className="pt-4 pt-lg-8">
							<CallToActionBlock
								heading={featuredTopicCenter.headline}
								descriptionHtml={featuredTopicCenter.description}
								imageUrl={featuredTopicCenter.imageUrl}
								primaryActionText={featuredTopicCenter.callToAction}
								onPrimaryActionClick={() => {
									analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE, {
										pageId: featuredTopicCenter.pageId,
										source: AnalyticsNativeEventClickthroughTopicCenterSource.HOME_FEATURE,
										siteLocationId: SITE_LOCATION_ID.FEATURED_TOPIC,
									});

									navigate(featuredTopicCenter.relativeUrl);
								}}
							/>
						</Container>
					)}
				</>
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
									<div className="d-flex align-items-center justify-content-between">
										<h3 className="mb-0">Group Sessions</h3>
										<Link to="/group-sessions">See all</Link>
									</div>
									<Carousel responsive={responsiveDefaults}>
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

				{institution.preferLegacyTopicCenters ? (
					<>
						{legacySecondaryFeaturedTopicCenter && (
							<Container className="pt-4 pt-lg-8">
								<CallToActionBlock
									variant="light"
									heading={legacySecondaryFeaturedTopicCenter.featuredTitle ?? ''}
									descriptionHtml={legacySecondaryFeaturedTopicCenter.featuredDescription ?? ''}
									imageUrl={legacySecondaryFeaturedTopicCenter.imageUrl ?? ''}
									primaryActionText={legacySecondaryFeaturedTopicCenter.featuredCallToAction ?? ''}
									onPrimaryActionClick={() => {
										analyticsService.persistEvent(
											AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER,
											{
												topicCenterId: legacySecondaryFeaturedTopicCenter.topicCenterId,
												source: AnalyticsNativeEventClickthroughTopicCenterSource.HOME_SECONDARY_FEATURE,
											}
										);

										if (legacySecondaryFeaturedTopicCenter.urlOverride) {
											try {
												const url = new URL(legacySecondaryFeaturedTopicCenter.urlOverride);
												const isExternal = url.origin !== window.location.origin;
												if (isExternal) {
													window.location.href =
														legacySecondaryFeaturedTopicCenter.urlOverride;
												} else {
													navigate(legacySecondaryFeaturedTopicCenter.urlOverride);
												}
											} catch (error) {
												navigate(legacySecondaryFeaturedTopicCenter.urlOverride);
											}
										} else {
											navigate('/featured-topics/' + legacySecondaryFeaturedTopicCenter.urlName);
										}
									}}
								/>
							</Container>
						)}
					</>
				) : (
					<>
						{featuredTopicCenters.slice(1).length > 0 && (
							<Container className="pt-4 pt-lg-8">
								{featuredTopicCenters.slice(1).map((ftc, ftcIndex) => {
									const isLast = featuredTopicCenters.slice(1).length - 1 === ftcIndex;

									return (
										<CallToActionBlock
											className={classNames({ 'mb-4': !isLast })}
											variant="light"
											heading={ftc.headline}
											descriptionHtml={ftc.description}
											imageUrl={ftc.imageUrl}
											primaryActionText={ftc.callToAction}
											onPrimaryActionClick={() => {
												analyticsService.persistEvent(
													AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE,
													{
														pageId: ftc.pageId,
														source: AnalyticsNativeEventClickthroughTopicCenterSource.HOME_FEATURE,
														siteLocationId: SITE_LOCATION_ID.FEATURED_TOPIC,
													}
												);

												navigate(ftc.relativeUrl);
											}}
										/>
									);
								})}
							</Container>
						)}
					</>
				)}

				{content.length > 0 && (
					<Container className="py-20">
						<Row>
							<Col>
								<div className="d-flex align-items-center justify-content-between">
									<h3 className="mb-0">Resource Library</h3>
									<Link to="/resource-library">See all</Link>
								</div>
								<Carousel responsive={responsiveDefaults}>
									{content.map((content) => {
										return (
											<ResourceLibraryCard
												key={content.contentId}
												linkTo={`/resource-library/${content.contentId}`}
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
				)}

				{(inProgressCourses.length > 0 ||
					availableCourses.length > 0 ||
					comingSoonCourses.length > 0 ||
					completedCourses.length > 0) && (
					<Container className="pt-20">
						{inProgressCourses.length > 0 && (
							<Row className="pb-16 pb-lg-32">
								<Col>
									<div className="mb-8 d-flex align-items-center justify-content-between">
										<h3 className="mb-0">Continue Learning</h3>
										{/* course history template */}
										{/* <Link to="/#">View learning history</Link> */}
									</div>
									{inProgressCourses.map((course, courseIndex) => {
										const isLast = inProgressCourses.length - 1 === courseIndex;

										return (
											<CourseContinue
												className={classNames({ 'mb-8': !isLast })}
												key={course.courseId}
												course={course}
											/>
										);
									})}
								</Col>
							</Row>
						)}
						{availableCourses.length > 0 && (
							<Row className="pb-16 pb-lg-32">
								<Col>
									<div className="mb-8">
										<h3 className="mb-0">Other Courses</h3>
									</div>
									{availableCourses.map((course, courseIndex) => {
										const isLast = availableCourses.length - 1 === courseIndex;

										return (
											<CallToActionBlock
												className={classNames({ 'mb-8': !isLast })}
												key={course.courseId}
												heading={course.title}
												descriptionHtml={course.description}
												imageUrl={course.imageUrl}
												primaryActionText="Start Course"
												onPrimaryActionClick={() => {
													handleStartCourseButtonClick(course.courseId);
												}}
												secondaryActionText="Learn More"
												onSecondaryActionClick={() => {
													navigate(`/courses/${course.urlName}`);
												}}
											/>
										);
									})}
								</Col>
							</Row>
						)}
						{comingSoonCourses.length > 0 && (
							<Row className="pb-16 pb-lg-32">
								<Col>
									<div className="mb-8">
										<h3 className="mb-0">Coming Soon</h3>
									</div>
									{comingSoonCourses.map((course, courseIndex) => {
										const isLast = comingSoonCourses.length - 1 === courseIndex;

										return (
											<CallToActionBlock
												className={classNames({ 'mb-8': !isLast })}
												key={course.courseId}
												variant="light"
												subheading="Coming soon"
												heading={course.title}
												descriptionHtml={course.description}
												imageUrl={course.imageUrl}
											/>
										);
									})}
								</Col>
							</Row>
						)}
						{completedCourses.length > 0 && (
							<Row className="pb-16 pb-lg-32">
								<Col>
									<div className="mb-8">
										<h3 className="mb-0">Completed</h3>
									</div>
									{completedCourses.map((course, courseIndex) => {
										const isLast = completedCourses.length - 1 === courseIndex;

										return (
											<CallToActionBlock
												className={classNames({ 'mb-8': !isLast })}
												key={course.courseId}
												variant="light"
												subheading="Completed"
												heading={course.title}
												descriptionHtml={course.description}
												imageUrl={course.imageUrl}
												primaryActionText="View Course"
												onPrimaryActionClick={() => {
													navigate(`/courses/${course.urlName}`);
												}}
											/>
										);
									})}
								</Col>
							</Row>
						)}
					</Container>
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
