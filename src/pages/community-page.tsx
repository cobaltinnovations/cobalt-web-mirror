import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import AsyncPage from '@/components/async-page';
import { SkeletonTopicCenterGroupSession, TopicCenterGroupSession } from '@/components/topic-center-group-session';
import { Masonry } from '@/components/masonry';
import { TopicCenterPinboardItem } from '@/components/topic-center-pinboard-item';
import useAnalytics from '@/hooks/use-analytics';
import { TopicCenterAnalyticsEvent } from '@/contexts/analytics-context';
import ResourceLibraryCard, { SkeletonResourceLibraryCard } from '@/components/resource-library-card';
import { SkeletonText } from '@/components/skeleton-loaders';
import { GroupSessionDetailNavigationSource } from '@/routes/group-session-detail';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import { useTopicCenterState } from '@/hooks/use-topic-center-state';
import PageHeader, { PageHeaderSkeleton } from '@/components/page-header';
import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import Carousel from '@/components/carousel';
import { resourceLibraryCarouselConfig } from './resource-library';
import classNames from 'classnames';
import { analyticsService } from '@/lib/services';
import { AnalyticsNativeEventTypeId } from '@/lib/models';

const CommunityPage = () => {
	const { mixpanel, trackEvent } = useAnalytics();
	const navigate = useNavigate();
	const location = useLocation();
	const { topicCenterId } = useParams<{ topicCenterId: string }>();
	const { fetchData, topicCenter, trackContentEvent } = useTopicCenterState(topicCenterId);

	return (
		<>
			<Helmet>
				<title>Cobalt | Topic Center</title>
			</Helmet>

			<IneligibleBookingModal uiType="group-session" />

			<AsyncPage
				fetchData={fetchData}
				loadingComponent={
					<>
						<PageHeaderSkeleton className="bg-p700 text-white" />

						<Container fluid className="bg-n50">
							<Container className="pt-10 pb-12 pt-lg-14 pb-lg-22">
								<Row>
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
									>
										<SkeletonText type="h2" width="75%" className="mb-2 mb-lg-4 text-center" />
										<SkeletonText type="p" className="mb-6 mb-lg-12 text-center" />
									</Col>
								</Row>
								<Row>
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 10, offset: 1 }}
										xl={{ span: 8, offset: 2 }}
									>
										<SkeletonTopicCenterGroupSession />
									</Col>
								</Row>
							</Container>
						</Container>
						<Container fluid className="bg-n75">
							<Container className="pt-10 pb-12 pt-lg-14 pb-lg-22">
								<Row>
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
									>
										<SkeletonText type="h2" width="75%" className="mb-2 mb-lg-4 text-center" />
										<SkeletonText type="p" className="mb-6 mb-lg-12 text-center" />
									</Col>
								</Row>
								<Row>
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 10, offset: 1 }}
										xl={{ span: 8, offset: 2 }}
									>
										<SkeletonTopicCenterGroupSession />
									</Col>
								</Row>
							</Container>
						</Container>

						<Container fluid className="bg-n50">
							<Container className="pt-10 pb-12 pt-lg-14 pb-lg-22">
								<Row>
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
									>
										<SkeletonText type="h2" width="75%" className="mb-2 mb-lg-4 text-center" />
										<SkeletonText type="p" className="mb-6 mb-lg-12 text-center" />
									</Col>
								</Row>
								<Row>
									<Col xs={6} sm={6} md={6} lg={4} className="mb-8">
										<SkeletonResourceLibraryCard />
									</Col>
									<Col xs={6} sm={6} md={6} lg={4} className="mb-8">
										<SkeletonResourceLibraryCard />
									</Col>
									<Col xs={6} sm={6} md={6} lg={4} className="mb-8">
										<SkeletonResourceLibraryCard />
									</Col>
								</Row>
							</Container>
						</Container>
					</>
				}
			>
				<PageHeader
					className="bg-p700 text-white"
					title={
						<>
							<p className="fs-large">Community</p>
							<h1>{topicCenter?.name}</h1>
						</>
					}
					descriptionHtml={topicCenter?.description}
					imageUrl={topicCenter?.imageUrl}
					imageAlt={topicCenter?.name}
				/>

				{topicCenter?.topicCenterRows.map((topicCenterRow, topicCenterRowIndex) => {
					const backgroundColorClass = topicCenterRowIndex % 2 === 0 ? 'bg-n50' : 'bg-n75';
					const containerClassNames = 'pt-10 pt-lg-16 pb-12 pb-lg-24';

					// const showScheduledGroupSessionSection = topicCenterRow.groupSessions.length > 0;
					// const showByRequestGroupSessionSection = topicCenterRow.groupSessionRequests.length > 0;
					// const showGroupSessionSection =
					// 	showScheduledGroupSessionSection || showByRequestGroupSessionSection;

					const topicCenterRowHeader = (
						<Row className="mb-6 mb-lg-12">
							<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
								<h2 className="mb-2 mb-lg-4 text-center">{topicCenterRow.title}</h2>
								{topicCenterRow.description && (
									<p className="lead mb-0 fs-large text-center">{topicCenterRow.description}</p>
								)}
							</Col>
						</Row>
					);

					return (
						<React.Fragment key={topicCenterRow.topicCenterRowId}>
							{/* Group Sessions as 'One Section' with Carousels */}
							{/* {showGroupSessionSection && (
								<Container fluid className="bg-n50" key={topicCenterRow.topicCenterRowId}>
									<Container className={containerClassNames}>
										{topicCenterRowHeader}

										{showScheduledGroupSessionSection && (
											<Row>
												<Col lg={3} className="mb-10 mb-lg-0 pt-4 pb-2">
													<ResourceLibrarySubtopicCard
														className="h-100"
														title={topicCenterRow.groupSessionsTitle!}
														description={topicCenterRow.groupSessionsDescription!}
													/>
												</Col>

												<Col lg={9}>
													<Carousel
														responsive={resourceLibraryCarouselConfig}
														trackStyles={{ paddingTop: 16, paddingBottom: 8 }}
														floatingButtonGroup
													>
														{topicCenterRow.groupSessions.map((groupSession) => {
															return (
																<ResourceLibraryCard
																	key={groupSession.groupSessionId}
																	linkTo={`/group-sessions/${groupSession.urlName}`}
																	linkToOptions={{
																		state: {
																			navigationSource:
																				GroupSessionDetailNavigationSource.TOPIC_CENTER,
																			topicCenterPath: location.pathname,
																		},
																	}}
																	className="h-100"
																	imageUrl={groupSession.imageUrl}
																	title={groupSession.title}
																	subtitle={groupSession.startDateTimeDescription}
																	authorPrefix="Hosted by"
																	author={groupSession.facilitatorName}
																	tags={[]}
																	trackEvent={() => {
																		trackEvent(
																			TopicCenterAnalyticsEvent.clickGroupSession(
																				topicCenter.name,
																				topicCenterRow.title
																			)
																		);

																		mixpanel.track(
																			'Topic Center Group Session Click',
																			{
																				'Topic Center ID':
																					topicCenter.topicCenterId,
																				'Topic Center Title': topicCenter.name,
																				'Section Title': topicCenterRow.title,
																				'Group Session ID':
																					groupSession.groupSessionId,
																				'Group Session Title':
																					groupSession.title,
																				'Group Session Start Time':
																					groupSession.startDateTime,
																			}
																		);
																	}}
																/>
															);
														})}
													</Carousel>
												</Col>
											</Row>
										)}

										{showByRequestGroupSessionSection && (
											<Row className={classNames({ 'mt-8': showScheduledGroupSessionSection })}>
												<Col lg={3} className="mb-10 mb-lg-0 pt-4 pb-2">
													<ResourceLibrarySubtopicCard
														className="h-100"
														title={topicCenterRow.groupSessionRequestsTitle!}
														description={topicCenterRow.groupSessionRequestsDescription!}
													/>
												</Col>

												<Col lg={9}>
													<Carousel
														responsive={resourceLibraryCarouselConfig}
														trackStyles={{ paddingTop: 16, paddingBottom: 8 }}
														floatingButtonGroup
													>
														{topicCenterRow.groupSessionRequests.map(
															(groupSessionRequest) => {
																return (
																	<ResourceLibraryCard
																		key={groupSessionRequest.groupSessionRequestId}
																		linkTo={`/in-the-studio/group-session-by-request/${groupSessionRequest.groupSessionRequestId}`}
																		className="h-100"
																		imageUrl={groupSessionRequest.imageUrl}
																		title={groupSessionRequest.title}
																		authorPrefix="BY REQUEST"
																		author={''}
																		tags={[]}
																		trackEvent={() => {
																			trackEvent(
																				TopicCenterAnalyticsEvent.clickGroupSessionByRequest(
																					topicCenter.name,
																					topicCenterRow.title
																				)
																			);

																			mixpanel.track(
																				'Topic Center Group Session By Request Click',
																				{
																					'Topic Center ID':
																						topicCenter.topicCenterId,
																					'Topic Center Title':
																						topicCenter.name,
																					'Section Title':
																						topicCenterRow.title,
																					'Group Session By Request ID':
																						groupSessionRequest.groupSessionRequestId,
																					'Group Session By Request Title':
																						groupSessionRequest.title,
																				}
																			);
																		}}
																	/>
																);
															}
														)}
													</Carousel>
												</Col>
											</Row>
										)}
									</Container>
								</Container>
							)} */}

							{topicCenterRow.groupSessions.length > 0 && (
								<Container
									fluid
									className={backgroundColorClass}
									key={'groupSessions-' + topicCenterRow.topicCenterRowId}
								>
									<Container className={containerClassNames}>
										{topicCenterRowHeader}

										<Row>
											<Col
												md={{ span: 10, offset: 1 }}
												lg={{ span: 10, offset: 1 }}
												xl={{ span: 8, offset: 2 }}
											>
												{topicCenterRow.groupSessions.map((groupSession, groupSessionIndex) => {
													const isLast =
														topicCenterRow.groupSessions.length - 1 === groupSessionIndex;

													return (
														<TopicCenterGroupSession
															key={groupSession.groupSessionId}
															className={classNames({
																'mb-8': !isLast,
															})}
															title={groupSession.title}
															titleSecondary={groupSession.appointmentTimeDescription}
															titleTertiary={`Hosted by: ${groupSession.facilitatorName}`}
															description={groupSession.description}
															badgeTitle={
																groupSession.seatsAvailable &&
																groupSession.seatsAvailable <= 20
																	? groupSession.seatsAvailableDescription
																	: ''
															}
															buttonTitle="Reserve a Place"
															onClick={() => {
																analyticsService.persistEvent(
																	AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER_GROUP_SESSION,
																	{
																		topicCenterId: topicCenter.topicCenterId,
																		groupSessionId: groupSession.groupSessionId,
																	}
																);

																trackEvent(
																	TopicCenterAnalyticsEvent.clickGroupSession(
																		topicCenter.name,
																		topicCenterRow.title
																	)
																);

																mixpanel.track('Topic Center Group Session Click', {
																	'Topic Center ID': topicCenter.topicCenterId,
																	'Topic Center Title': topicCenter.name,
																	'Section Title': topicCenterRow.title,
																	'Group Session ID': groupSession.groupSessionId,
																	'Group Session Title': groupSession.title,
																	'Group Session Start Time':
																		groupSession.startDateTime,
																});

																navigate(`/group-sessions/${groupSession.urlName}`, {
																	state: {
																		navigationSource:
																			GroupSessionDetailNavigationSource.TOPIC_CENTER,
																		topicCenterPath: location.pathname,
																	},
																});
															}}
															imageUrl={groupSession.imageUrl}
														/>
													);
												})}
											</Col>
										</Row>
									</Container>
								</Container>
							)}

							{topicCenterRow.groupSessionRequests.length > 0 && (
								<Container
									fluid
									className={backgroundColorClass}
									key={'groupSessionRequests-' + topicCenterRow.topicCenterRowId}
								>
									<Container className={containerClassNames}>
										{topicCenterRowHeader}

										<Row>
											<Col
												md={{ span: 10, offset: 1 }}
												lg={{ span: 10, offset: 1 }}
												xl={{ span: 8, offset: 2 }}
											>
												{topicCenterRow.groupSessionRequests.map(
													(groupSessionRequest, groupSessionRequestIndex) => {
														const isLast =
															topicCenterRow.groupSessionRequests.length - 1 ===
															groupSessionRequestIndex;

														return (
															<TopicCenterGroupSession
																key={groupSessionRequest.groupSessionRequestId}
																className={classNames({
																	'mb-8': !isLast,
																})}
																title={groupSessionRequest.title}
																titleSecondary="By Request"
																description={groupSessionRequest.description}
																buttonTitle="Submit a Request"
																onClick={() => {
																	trackEvent(
																		TopicCenterAnalyticsEvent.clickGroupSessionByRequest(
																			topicCenter.name,
																			topicCenterRow.title
																		)
																	);

																	mixpanel.track(
																		'Topic Center Group Session By Request Click',
																		{
																			'Topic Center ID':
																				topicCenter.topicCenterId,
																			'Topic Center Title': topicCenter.name,
																			'Section Title': topicCenterRow.title,
																			'Group Session By Request ID':
																				groupSessionRequest.groupSessionRequestId,
																			'Group Session By Request Title':
																				groupSessionRequest.title,
																		}
																	);

																	navigate(
																		`/in-the-studio/group-session-by-request/${groupSessionRequest.groupSessionRequestId}`
																	);
																}}
																imageUrl={groupSessionRequest.imageUrl}
															/>
														);
													}
												)}
											</Col>
										</Row>
									</Container>
								</Container>
							)}

							{(topicCenterRow.topicCenterRowTags ?? []).map((topicCenterRowTag, index) => {
								return (
									<Container fluid className={backgroundColorClass} key={'rt' + index}>
										<Container className={containerClassNames}>
											{topicCenterRowHeader}

											<Row>
												<Col lg={3} className="mb-10 mb-lg-0 pt-4 pb-2">
													<ResourceLibrarySubtopicCard
														className="h-100"
														title={topicCenterRowTag.title}
														description={topicCenterRowTag.description}
														toLabel={topicCenterRowTag.cta}
														to={topicCenterRowTag.ctaUrl}
														onClick={() => {
															analyticsService.persistEvent(
																AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER_TAG,
																{
																	topicCenterId: topicCenter.topicCenterId,
																	tagId: topicCenterRowTag.tagId,
																}
															);
														}}
													/>
												</Col>

												<Col lg={9}>
													<Carousel
														responsive={resourceLibraryCarouselConfig}
														trackStyles={{ paddingTop: 16, paddingBottom: 8 }}
														floatingButtonGroup
													>
														{topicCenterRowTag.contents.map((content) => {
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
																		topicCenter.tagsByTagId
																			? content.tagIds.map((tagId) => {
																					return topicCenter.tagsByTagId[
																						tagId
																					];
																			  })
																			: []
																	}
																	contentTypeId={content.contentTypeId}
																	duration={content.durationInMinutesDescription}
																	trackEvent={() => {
																		analyticsService.persistEvent(
																			AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER_CONTENT,
																			{
																				topicCenterId:
																					topicCenter.topicCenterId,
																				contentId: content.contentId,
																			}
																		);

																		trackContentEvent(topicCenterRow, content);
																	}}
																	trackTagEvent={(tag) => {
																		analyticsService.persistEvent(
																			AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER_TAG,
																			{
																				topicCenterId:
																					topicCenter.topicCenterId,
																				tagId: tag.tagId,
																			}
																		);
																	}}
																/>
															);
														})}
													</Carousel>
												</Col>
											</Row>
										</Container>
									</Container>
								);
							})}

							{topicCenterRow.pinboardNotes.length > 0 && (
								<Container fluid className="bg-n50" key={topicCenterRow.topicCenterRowId}>
									<Container className={containerClassNames}>
										{topicCenterRowHeader}

										<Row>
											<Col>
												<Masonry>
													{topicCenterRow.pinboardNotes.map((pinboardNote) => {
														return (
															<TopicCenterPinboardItem
																key={pinboardNote.pinboardNoteId}
																topicCenter={topicCenter}
																topicCenterRow={topicCenterRow}
																pinboardNote={pinboardNote}
																className="mb-8"
																onClick={(clickedUrl) => {
																	analyticsService.persistEvent(
																		AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER_PINBOARD_NOTE_LINK,
																		{
																			topicCenterId: topicCenter.topicCenterId,
																			pinboardNoteId: pinboardNote.pinboardNoteId,
																			linkUrl: clickedUrl,
																			linkText: pinboardNote.title,
																		}
																	);
																}}
															/>
														);
													})}
												</Masonry>
											</Col>
										</Row>
									</Container>
								</Container>
							)}

							{topicCenterRow.contents.length > 0 && (
								<Container fluid className={backgroundColorClass} key={topicCenterRow.topicCenterRowId}>
									<Container className={containerClassNames}>
										{topicCenterRowHeader}

										<Row>
											{topicCenterRow.contents.map((content) => {
												return (
													<Col
														xs={12}
														sm={12}
														md={6}
														lg={4}
														key={content.contentId}
														className="mb-8"
													>
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
																topicCenter.tagsByTagId
																	? content.tagIds.map((tagId) => {
																			return topicCenter.tagsByTagId[tagId];
																	  })
																	: []
															}
															contentTypeId={content.contentTypeId}
															duration={content.durationInMinutesDescription}
															trackEvent={() => {
																analyticsService.persistEvent(
																	AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER_CONTENT,
																	{
																		topicCenterId: topicCenter.topicCenterId,
																		contentId: content.contentId,
																	}
																);

																trackContentEvent(topicCenterRow, content);
															}}
															trackTagEvent={(tag) => {
																analyticsService.persistEvent(
																	AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER_TAG,
																	{
																		topicCenterId: topicCenter.topicCenterId,
																		tagId: tag.tagId,
																	}
																);
															}}
														/>
													</Col>
												);
											})}
										</Row>
									</Container>
								</Container>
							)}
						</React.Fragment>
					);
				})}
			</AsyncPage>
		</>
	);
};

export default CommunityPage;
