import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

import AsyncPage from '@/components/async-page';
import PageHeader from '@/components/page-header';
import ResourceLibraryCard, { SkeletonResourceLibraryCard } from '@/components/resource-library-card';
import { SkeletonImage, SkeletonText } from '@/components/skeleton-loaders';
import { TopicCenterAnalyticsEvent } from '@/contexts/analytics-context';
import useAnalytics from '@/hooks/use-analytics';
import { useTopicCenterState } from '@/hooks/use-topic-center-state';

const FeaturedTopic = () => {
	const { mixpanel, trackEvent } = useAnalytics();
	const { topicCenterId } = useParams<{ topicCenterId: string }>();
	const { fetchData, topicCenter, trackContentEvent } = useTopicCenterState(topicCenterId);

	const featuredTopicRow = topicCenter?.topicCenterRows[0];

	return (
		<>
			<Helmet>
				<title>Cobalt | {topicCenter?.name ?? 'Featured Topic'}</title>
			</Helmet>

			<AsyncPage
				fetchData={fetchData}
				loadingComponent={
					<>
						<Container fluid className="bg-n75 p-16">
							<Row>
								<Col xs={12} md={8}>
									<SkeletonText type="h1" numberOfLines={1} />
									<SkeletonText type="p" numberOfLines={3} />
								</Col>

								<Col xs={12} md={4}>
									<SkeletonImage height={200} />
								</Col>
							</Row>
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
					className="bg-n75"
					title={topicCenter?.name!}
					descriptionHtml={topicCenter?.description}
					imageUrl={topicCenter?.imageUrl}
					imageAlt={topicCenter?.name}
				/>

				{(featuredTopicRow?.contents.length ?? 0) > 0 && (
					<Container fluid className="bg-n50" key={featuredTopicRow?.topicCenterRowId}>
						<Container className="pb-12 pt-lg-14 pb-lg-22 pt-12">
							<Row>
								{featuredTopicRow?.contents.map((content) => {
									return (
										<Col xs={6} sm={6} md={6} lg={4} key={content.contentId} className="mb-8">
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
													topicCenter?.tagsByTagId
														? content.tagIds.map((tagId) => {
																return topicCenter.tagsByTagId[tagId];
														  })
														: []
												}
												contentTypeId={content.contentTypeId}
												duration={content.durationInMinutesDescription}
												trackEvent={() => {
													trackContentEvent(featuredTopicRow, content);
													const contentUrl = `/resource-library/${content.contentId}`;
													const eventLabel = `topicCenterTitle:${topicCenter?.name}, sectionTitle:${featuredTopicRow.title}, cardTitle:${content.title}, url:${contentUrl}`;
													trackEvent(
														TopicCenterAnalyticsEvent.clickOnYourTimeContent(eventLabel)
													);

													mixpanel.track('Topic Center Content Click', {
														'Topic Center ID': topicCenter?.topicCenterId,
														'Topic Center Title': topicCenter?.name,
														'Section Title': featuredTopicRow?.title,
														'Content ID': content.contentId,
														'Content Title': content.title,
													});
												}}
											/>
										</Col>
									);
								})}
							</Row>
						</Container>
					</Container>
				)}
			</AsyncPage>
		</>
	);
};

export default FeaturedTopic;
