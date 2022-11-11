import React, { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';

import { TopicCenterModel } from '@/lib/models';
import { topicCenterService } from '@/lib/services';

import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import { TopicCenterGroupSession } from '@/components/topic-center-group-session';
import { Masonry } from '@/components/masonry';
import { TopicCenterPinboardItem } from '@/components/topic-center-pinboard-item';
import OnYourTimeItem from '@/components/on-your-time-item';
import classNames from 'classnames';
import useAnalytics from '@/hooks/use-analytics';
import { TopicCenterAnalyticsEvent } from '@/contexts/analytics-context';

const TopicCenter = () => {
	const { trackEvent } = useAnalytics();
	const navigate = useNavigate();
	const { topicCenterId } = useParams<{ topicCenterId: string }>();
	const [topicCenter, setTopicCenter] = useState<TopicCenterModel>();

	const fetchData = useCallback(async () => {
		if (!topicCenterId) {
			throw new Error('topicCenterId is undefined.');
		}

		const response = await topicCenterService.getTopicCenterById(topicCenterId).fetch();
		setTopicCenter(response.topicCenter);
	}, [topicCenterId]);

	return (
		<AsyncPage fetchData={fetchData}>
			<HeroContainer className="bg-p700">
				<h1 className="mb-0 text-white text-center">{topicCenter?.name}</h1>
			</HeroContainer>

			{topicCenter?.topicCenterRows.map((topicCenterRow, topicCenterRowIndex) => {
				const backgroundColorClass = topicCenterRowIndex % 2 === 0 ? 'bg-n50' : 'bg-n75';

				return (
					<React.Fragment key={topicCenterRow.topicCenterRowId}>
						{topicCenterRow.groupSessions.length > 0 && (
							<Container fluid className={backgroundColorClass} key={topicCenterRow.topicCenterRowId}>
								<Container className="pt-10 pb-12 pt-lg-14 pb-lg-22">
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
															const eventLabel = `${groupSession.title} - ${groupSession.startDateTimeDescription}`;
															trackEvent(
																TopicCenterAnalyticsEvent.clickGroupSession(
																	topicCenter.name,
																	eventLabel
																)
															);

															navigate(
																`/in-the-studio/group-session-scheduled/${groupSession.groupSessionId}`
															);
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
								<Container className="pt-10 pb-12 pt-lg-14 pb-lg-22">
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
																		groupSessionRequest.title
																	)
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
								<Container fluid="lg" className="pt-10 pb-12 pt-lg-14 pb-lg-22">
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
															topicCenterName={topicCenter.name}
															className="mb-lg-8"
															title={pinboardNote.title}
															description={pinboardNote.description}
															url={pinboardNote.url}
															imageUrl={pinboardNote.imageUrl}
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
								<Container className="pt-10 pb-12 pt-lg-14 pb-lg-22">
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
												<Col xs={6} md={4} lg={3} key={content.contentId}>
													<Link
														to={`/on-your-time/${content.contentId}`}
														className="d-block mb-8 text-decoration-none"
														onClick={() => {
															trackEvent(
																TopicCenterAnalyticsEvent.clickOnYourTimeContent(
																	topicCenter.name,
																	content.title
																)
															);
														}}
													>
														<OnYourTimeItem
															imageUrl={content.imageUrl}
															tag={content.newFlag ? 'NEW' : ''}
															title={content.title}
															author={content.author}
															type={content.contentTypeLabel}
															duration={content.duration}
														/>
													</Link>
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
	);
};

export default TopicCenter;
