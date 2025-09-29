import HeroContainer from '@/components/hero-container';
import useAccount from '@/hooks/use-account';
import { AnalyticsNativeEventTypeId } from '@/lib/models';
import { analyticsService } from '@/lib/services';
import React, { useEffect, useMemo } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

export const loader = () => {
	return null;
};

export const Component = () => {
	const { institution } = useAccount();
	const feature = useMemo(
		() => institution.features.find((f) => f.featureId === 'RESOURCE_NAVIGATOR'),
		[institution.features]
	);

	useEffect(() => {
		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_RESOURCE_NAVIGATOR);
	}, []);

	return (
		<>
			<Helmet>
				<title>{institution.name ?? 'Cobalt'} | Resource Navigator</title>
			</Helmet>

			<HeroContainer>
				<h2 className="text-center">Resource Navigator</h2>
			</HeroContainer>

			<Container className="py-16">
				<Row>
					<Col
						md={{ span: 10, offset: 1 }}
						lg={{ span: 8, offset: 2 }}
						xl={{ span: 6, offset: 3 }}
						dangerouslySetInnerHTML={{ __html: feature?.description ?? '' }}
					></Col>
				</Row>
			</Container>
		</>
	);
};
