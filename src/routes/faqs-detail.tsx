import React from 'react';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { faqsService } from '@/lib/services';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { faqUrlName } = params;

	const { faqTopic, faq } = await faqsService.getFaqDetail(faqUrlName!).fetch();
	return { faqTopic, faq };
};

export const Component = () => {
	const { faq } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

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
						<div dangerouslySetInnerHTML={{ __html: faq.answer }} />
					</Col>
				</Row>
			</Container>
		</>
	);
};
