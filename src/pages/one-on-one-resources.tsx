import React, { FC, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';
import HeroContainer from '@/components/hero-container';

const OneOnOneResources: FC = () => {
	const fetchData = useCallback(() => {
		return;
	}, []);

	return (
		<>
			<Helmet>
				<title>Cobalt | 1:1 Resources</title>
			</Helmet>
			<AsyncPage fetchData={fetchData}>
				<Breadcrumb
					breadcrumbs={[
						{
							to: '/',
							title: 'Home',
						},
						{
							to: '/connect-with-support',
							title: 'Connect with Support',
						},
						{
							to: '/#',
							title: '1:1 Resources',
						},
					]}
				/>
				<HeroContainer>
					<h2 className="mb-0 text-center">1:1 Resources</h2>
				</HeroContainer>
				<Container className="pt-5 pb-8">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h6>Peers</h6>
							<p className="mb-5">
								Peers support is offered by health system colleagues with similar experiences for
								individuals seeking reduced isolation and acknowledgement of challenges and difficulties
								unique to their work through brief one-on-one sessions and offer for follow up.
							</p>
							<h6>Coping First Aid Coaches</h6>
							<p className="mb-5">
								Coping First Aid is one-to-one support with a trained and supervised Coping First Aid
								Coach for anyone in the Cobalt Platform Community who needs support with coping,
								resilience strategies, or finding mental health resources through brief one-on-one
								sessions, with follow-up appointments as needed.
							</p>
							<h6>Psychotherapists*</h6>
							<p className="mb-5">
								Psychotherapy is the assessment, diagnosis, and treatment of symptoms by licensed
								clinicians for individuals seeking to address anxiety, depression, trauma, or other
								mental health symptoms through ongoing one-on-one sessions.
							</p>
							<h6>Psychiatrists*</h6>
							<p className="mb-5">
								Psychiatry is the assessment, diagnosis, and medical treatment of symptoms by
								board-certified psychiatrists for individuals seeking relief from persistent or severe
								insomnia, anxiety, depression, or other mental health symptoms through one-on-one
								appointments with the option of medication management.
							</p>
						</Col>
					</Row>
				</Container>
			</AsyncPage>
		</>
	);
};

export default OneOnOneResources;
