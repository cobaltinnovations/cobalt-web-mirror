import React, { useMemo } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import HeroContainer from '@/components/hero-container';
import NoData from '@/components/no-data';

const ConnectWithSupportMentalHealthProviders = () => {
	const { institution } = useAccount();
	const { startScreeningFlow, renderedCollectPhoneModal } = useScreeningFlow({
		screeningFlowId: institution?.featureScreeningFlowId,
		instantiateOnLoad: false,
	});

	const featureDetails = useMemo(
		() => (institution?.features ?? []).find((feature) => feature.featureId === 'MENTAL_HEALTH_PROVIDERS'),
		[institution?.features]
	);

	return (
		<>
			<Helmet>
				<title>Cobalt | Connect with Support - Mental Health Providers</title>
			</Helmet>
			{featureDetails && (
				<HeroContainer className="bg-n75">
					<h1 className="mb-4 text-center">{featureDetails.name}</h1>
					<p className="mb-0 text-center fs-large">{featureDetails.description}</p>
				</HeroContainer>
			)}

			{renderedCollectPhoneModal}

			<Container>
				<Row>
					<Col>
						<NoData
							title="No Providers Recommended"
							description="Please take the assessment to see recommended providers."
							actions={[
								{
									variant: 'primary',
									title: 'Take Assessment',
									onClick: () => {
										startScreeningFlow();
									},
								},
							]}
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default ConnectWithSupportMentalHealthProviders;
