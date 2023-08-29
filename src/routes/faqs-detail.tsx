import React from 'react';
import { LoaderFunctionArgs, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { createUseStyles } from 'react-jss';

import { faqsService } from '@/lib/services';
import { HEADER_HEIGHT } from '@/components/header-v2';
import TabBar from '@/components/tab-bar';

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
	const { faqTopic, faq } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const { pathname } = useLocation();
	const navigate = useNavigate();

	return (
		<>
			<Helmet>
				<title>Cobalt | FAQ</title>
			</Helmet>

			<Container className="py-14">
				<Row>
					<Col lg={{ offset: 1, span: 6 }}>
						{faqTopic.name} {faq.question}
					</Col>
					<Col lg={{ offset: 1, span: 3 }} className="d-none d-lg-block">
						<TabBar
							key="faq-tabbar"
							className="position-sticky"
							style={{ top: HEADER_HEIGHT + 56 }}
							orientation="vertical"
							value="NO_VALUE"
							tabs={[]}
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
