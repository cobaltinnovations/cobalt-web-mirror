import React, { useEffect } from 'react';
import { LoaderFunctionArgs, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { analyticsService, faqsService } from '@/lib/services';
import TabBar from '@/components/tab-bar';
import { HEADER_HEIGHT } from '@/components/header-v2';
import { createUseStyles } from 'react-jss';
import { AnalyticsNativeEventTypeId } from '@/lib/models';

const useStyles = createUseStyles({
	scrollAnchor: {
		top: -88,
		position: 'relative',
	},
});

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { faqUrlName } = params;

	const { faqTopic, faq } = await faqsService.getFaqDetail(faqUrlName!).fetch();
	return { faqTopic, faq };
};

export const Component = () => {
	const classes = useStyles();
	const { faq } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const { pathname, hash } = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_FAQ_DETAIL, {
			faqId: faq.faqId,
		});
	}, [faq]);

	return (
		<>
			<Helmet>
				<title>Cobalt | FAQ</title>
			</Helmet>

			<Container className="py-14">
				<Row className="mb-8">
					<Col lg={{ offset: 1, span: 6 }}>
						<h2 className="mb-0">{faq.question}</h2>
					</Col>
				</Row>
				<Row>
					<Col lg={{ offset: 1, span: 6 }}>
						<div className="mb-8" dangerouslySetInnerHTML={{ __html: faq.answer }} />
						{faq.faqSubtopics.map((subtopic) => (
							<div className="mb-8" key={subtopic.faqId}>
								<div className={classes.scrollAnchor} id={subtopic.urlName} />
								<h3 className="mb-4">{subtopic.name}</h3>
								<div dangerouslySetInnerHTML={{ __html: subtopic.description }} />
							</div>
						))}
					</Col>
					{faq.faqSubtopics.length > 0 && (
						<Col lg={{ offset: 1, span: 3 }} className="d-none d-lg-block">
							<TabBar
								key="faq-tabbar"
								className="position-sticky"
								style={{ top: HEADER_HEIGHT + 56 }}
								orientation="vertical"
								value={hash}
								tabs={faq.faqSubtopics.map((subtopic) => {
									return {
										title: subtopic.name,
										value: `#${subtopic.urlName}`,
									};
								})}
								onTabClick={(value) => {
									navigate(`${pathname}${value}`);
								}}
							>
								<p className="text-uppercase fw-bold text-muted">On This Page</p>
							</TabBar>
						</Col>
					)}
				</Row>
			</Container>
		</>
	);
};
