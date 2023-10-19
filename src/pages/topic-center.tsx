import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import { SkeletonTopicCenterGroupSession, TopicCenterGroupSession } from '@/components/topic-center-group-session';
import { Masonry } from '@/components/masonry';
import { TopicCenterPinboardItem } from '@/components/topic-center-pinboard-item';
import classNames from 'classnames';
import useAnalytics from '@/hooks/use-analytics';
import { TopicCenterAnalyticsEvent } from '@/contexts/analytics-context';
import ResourceLibraryCard, { SkeletonResourceLibraryCard } from '@/components/resource-library-card';
import { SkeletonText } from '@/components/skeleton-loaders';
import { GroupSessionDetailNavigationSource } from '@/routes/group-session-detail';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import { useTopicCenterState } from '@/hooks/use-topic-center-state';

const TopicCenter = () => {
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
						<HeroContainer className="bg-p700">
							<SkeletonText type="h1" numberOfLines={2} className="mb-0 text-center" />
						</HeroContainer>
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
				<HeroContainer className="bg-p700">
					<h1 className="mb-0 text-white text-center">{topicCenter?.name}</h1>
				</HeroContainer>

				{topicCenter?.topicCenterRows.map((topicCenterRow, topicCenterRowIndex) => {
					const backgroundColorClass = topicCenterRowIndex % 2 === 0 ? 'bg-n50' : 'bg-n75';
					const containerClassNames = 'pb-12 pt-lg-14 pb-lg-22 pt-10';

					return (
						<React.Fragment key={topicCenterRow.topicCenterRowId}>
							{topicCenterRow.groupSessions.length > 0 && (
								<Container fluid className={backgroundColorClass} key={topicCenterRow.topicCenterRowId}>
									<Container className={containerClassNames}>
										<Row>
											<Col
												md={{ span: 10, offset: 1 }}
												lg={{ span: 8, offset: 2 }}
												xl={{ span: 6, offset: 3 }}
											>
												<h2 className="mb-2 mb-lg-4 text-center">{topicCenterRow.title}</h2>
												<p className="mb-6 mb-lg-12 fs-large text-center">
													{topicCenterRow.description}
												</p>
											</Col>
										</Row>

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
								<Container fluid className={backgroundColorClass} key={topicCenterRow.topicCenterRowId}>
									<Container className={containerClassNames}>
										<Row>
											<Col
												md={{ span: 10, offset: 1 }}
												lg={{ span: 8, offset: 2 }}
												xl={{ span: 6, offset: 3 }}
											>
												<h2 className="mb-2 mb-lg-4 text-center">{topicCenterRow.title}</h2>
												<p className="mb-6 mb-lg-12 fs-large text-center">
													{topicCenterRow.description}
												</p>
											</Col>
										</Row>

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

							{topicCenterRow.pinboardNotes.length > 0 && (
								<Container fluid className={backgroundColorClass} key={topicCenterRow.topicCenterRowId}>
									<Container fluid="lg" className={containerClassNames}>
										<Row>
											<Col
												md={{ span: 10, offset: 1 }}
												lg={{ span: 8, offset: 2 }}
												xl={{ span: 6, offset: 3 }}
											>
												<h2 className="mb-2 mb-lg-4 text-center">{topicCenterRow.title}</h2>
												<p className="mb-6 mb-lg-12 fs-large text-center">
													{topicCenterRow.description}
												</p>
											</Col>
										</Row>

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
																className="mb-lg-8"
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
										<Row>
											<Col
												md={{ span: 10, offset: 1 }}
												lg={{ span: 8, offset: 2 }}
												xl={{ span: 6, offset: 3 }}
											>
												<h2 className="mb-2 mb-lg-4 text-center">{topicCenterRow.title}</h2>
												<p className="mb-6 mb-lg-12 fs-large text-center">
													{topicCenterRow.description}
												</p>
											</Col>
										</Row>

										<Row>
											{topicCenterRow.contents.map((content) => {
												return (
													<Col
														xs={6}
														sm={6}
														md={6}
														lg={4}
														key={content.contentId}
														className="mb-8"
													>
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
																topicCenter.tagsByTagId
																	? content.tagIds.map((tagId) => {
																			return topicCenter.tagsByTagId[tagId];
																	  })
																	: []
															}
															contentTypeId={content.contentTypeId}
															duration={content.durationInMinutesDescription}
															trackEvent={() => {
																trackContentEvent(topicCenterRow, content);
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

export default TopicCenter;
