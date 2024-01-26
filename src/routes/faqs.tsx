import React from 'react';
import { Link, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import { createUseStyles } from 'react-jss';

import { faqsService } from '@/lib/services';
import { HEADER_HEIGHT } from '@/components/header-v2';
import HeroContainer from '@/components/hero-container';
import TabBar from '@/components/tab-bar';

import { ReactComponent as QuestionMarkIcon } from '@/assets/icons/icon-help-fill.svg';

const useStyles = createUseStyles({
	scrollAnchor: {
		top: -88,
		position: 'relative',
	},
});

const ResponsiveEllipsis = responsiveHOC()(HTMLEllipsis);

export const loader = async () => {
	const { faqTopics, faqsByFaqTopicId } = await faqsService.getFaqTopics().fetch();
	return { faqTopics, faqsByFaqTopicId };
};

export const Component = () => {
	const classes = useStyles();
	const { faqTopics, faqsByFaqTopicId } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const { pathname, hash } = useLocation();
	const navigate = useNavigate();

	return (
		<>
			<Helmet>
				<title>Cobalt | FAQ</title>
			</Helmet>

			<HeroContainer className="bg-n75">
				<h1 className="mb-6 text-center">Frequently Asked Questions</h1>
				<p className="mb-0 fs-large text-center">
					Learn everything about Cobalt and the most frequently asked questions.
				</p>
			</HeroContainer>

			<Container className="py-14">
				<Row>
					<Col lg={{ offset: 1, span: 6 }}>
						{faqTopics.map((faqTopic, faqTopicIndex) => {
							const isLast = faqTopicIndex === faqTopics.length - 1;
							return (
								<div key={faqTopic.faqTopicId}>
									<div className={classes.scrollAnchor} id={faqTopic.urlName} />
									<h2 className="mb-8">{faqTopic.name}</h2>
									{faqsByFaqTopicId[faqTopic.faqTopicId].map((faq) => {
										return (
											<div key={faq.faqId} className="mb-8 d-flex">
												<QuestionMarkIcon className="me-4 text-primary flex-shrink-0 " />
												<div>
													<h5 className="mb-2">
														<Link
															to={`/faqs/${faq.urlName}`}
															className="text-decoration-none"
														>
															{faq.question}
														</Link>
													</h5>
													<ResponsiveEllipsis unsafeHTML={faq.answer} maxLine={2} />
												</div>
											</div>
										);
									})}
									{!isLast && <hr className="mb-8" />}
								</div>
							);
						})}
					</Col>
					<Col lg={{ offset: 1, span: 3 }} className="d-none d-lg-block">
						<TabBar
							key="faq-tabbar"
							className="position-sticky"
							style={{ top: HEADER_HEIGHT + 56 }}
							orientation="vertical"
							value={hash}
							tabs={faqTopics.map((faqTopic) => {
								return {
									title: faqTopic.name,
									value: `#${faqTopic.urlName}`,
								};
							})}
							onTabClick={(value) => {
								navigate(`${pathname}${value}`);
							}}
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
};
