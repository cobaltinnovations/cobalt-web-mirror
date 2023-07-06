import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { screeningService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import { useBookingRequirementsNavigation } from '@/hooks/use-booking-requirements-navigation';
import HeroContainer from '@/components/hero-container';
import NoData from '@/components/no-data';
import AsyncWrapper from '@/components/async-page';

const ConnectWithSupportMentalHealthProviders = () => {
	const navigate = useNavigate();
	const { institution } = useAccount();
	const { startScreeningFlow, renderedCollectPhoneModal } = useScreeningFlow({
		screeningFlowId: institution?.providerTriageScreeningFlowId,
		instantiateOnLoad: false,
	});
	const checkBookingRequirementsAndRedirect = useBookingRequirementsNavigation();

	const featureDetails = useMemo(
		() => (institution?.features ?? []).find((feature) => feature.featureId === 'MENTAL_HEALTH_PROVIDERS'),
		[institution?.features]
	);

	const [hasCompletedScreening, setHasCompletedScreening] = useState(false);

	const fetchData = useCallback(async () => {
		if (!institution?.providerTriageScreeningFlowId) {
			throw new Error('providerTriageScreeningFlowId is undefined.');
		}

		const { sessionFullyCompleted } = await screeningService
			.getScreeningFlowCompletionStatusByScreeningFlowId(institution.providerTriageScreeningFlowId)
			.fetch();

		if (sessionFullyCompleted) {
			setHasCompletedScreening(true);
		} else {
			setHasCompletedScreening(false);
		}
	}, [institution.providerTriageScreeningFlowId]);

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

			<AsyncWrapper fetchData={fetchData}>
				<Container className="py-15">
					<Row>
						<Col>
							{hasCompletedScreening && (
								<NoData
									title={`Connect to ${institution.myChartName}`}
									description={`Connect to ${institution.myChartName} to see a list of providers and their available telehealth appointment times. If you need an in-person appointment, please call us at ${institution.clinicalSupportPhoneNumberDescription}.`}
									actions={[
										{
											variant: 'primary',
											title: `Connect to ${institution.myChartName}`,
											onClick: checkBookingRequirementsAndRedirect,
										},
										{
											variant: 'outline-primary',
											title: 'View my Results',
											onClick: () => {
												navigate('/connect-with-support/recommendations');
											},
										},
									]}
								/>
							)}

							{!hasCompletedScreening && (
								<NoData
									title="No Providers Recommended"
									description="Please take the assessment to see recommended providers."
									actions={[
										{
											variant: 'primary',
											title: 'Take Assessment',
											onClick: startScreeningFlow,
										},
									]}
								/>
							)}
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};

export default ConnectWithSupportMentalHealthProviders;
