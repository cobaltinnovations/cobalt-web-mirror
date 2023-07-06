import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { AccountSupportRole } from '@/lib/models';
import { accountService, screeningService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import HeroContainer from '@/components/hero-container';
import NoData from '@/components/no-data';
import AsyncWrapper from '@/components/async-page';
import RenderJson from '@/components/render-json';

const ConnectWithSupportMentalHealthProviders = () => {
	const navigate = useNavigate();
	const { account, institution } = useAccount();
	const { startScreeningFlow, renderedCollectPhoneModal } = useScreeningFlow({
		screeningFlowId: institution?.providerTriageScreeningFlowId,
		instantiateOnLoad: false,
	});

	const featureDetails = useMemo(
		() => (institution?.features ?? []).find((feature) => feature.featureId === 'MENTAL_HEALTH_PROVIDERS'),
		[institution?.features]
	);

	const [hasCompletedScreening, setHasCompletedScreening] = useState(false);
	const [supportRoles, setSupportRoles] = useState<AccountSupportRole[]>([]);

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
			return;
		}

		if (!account?.accountId) {
			throw new Error('accountId is undefined.');
		}

		const response = await accountService.getRecommendedSupportRoles(account.accountId).fetch();
		setSupportRoles(response.supportRoles);
	}, [account?.accountId, institution.providerTriageScreeningFlowId]);

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
				<Container>
					<Row>
						<Col>
							{!hasCompletedScreening && (
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
							)}

							{hasCompletedScreening && (
								<>
									<RenderJson json={supportRoles} />
									<Button
										onClick={() => {
											navigate('/connect-with-support/mental-health-providers/recommendations');
										}}
									>
										See Assessment Results
									</Button>
								</>
							)}
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};

export default ConnectWithSupportMentalHealthProviders;
