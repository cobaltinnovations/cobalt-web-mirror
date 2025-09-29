import React, { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import HeroContainer from '@/components/hero-container';
import InCrisisTemplate from '@/components/in-crisis-template';
import { AnalyticsNativeEventTypeId } from '@/lib/models';
import { analyticsService } from '@/lib/services';
import useAccount from '@/hooks/use-account';

const InCrisis = () => {
	const { institution } = useAccount();

	useEffect(() => {
		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_IN_CRISIS);
	}, []);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Crisis Support</title>
			</Helmet>

			<HeroContainer>
				<h2 className="mb-0 text-center">In Crisis</h2>
			</HeroContainer>
			<Container className="pt-6 pt-lg-14 pb-6 pb-lg-30">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h5 className="mb-2">Important!</h5>
						<p className="mb-6">
							If you are in crisis, contact one of the listed resources for immediate help or go to your
							nearest emergency department or crisis center.
						</p>
						<hr className="mb-6" />
						<InCrisisTemplate />
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default InCrisis;
