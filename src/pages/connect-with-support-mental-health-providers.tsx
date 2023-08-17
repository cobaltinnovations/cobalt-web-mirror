import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { InstitutionFeature } from '@/lib/models';
import { accountService, institutionService, screeningService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import HeroContainer from '@/components/hero-container';
import NoData from '@/components/no-data';
import AsyncWrapper from '@/components/async-page';

const ConnectWithSupportMentalHealthProviders = () => {
	const navigate = useNavigate();
	const { account, institution } = useAccount();
	const { startScreeningFlow, renderedCollectPhoneModal, renderedPreScreeningLoader } = useScreeningFlow({
		screeningFlowId: institution?.providerTriageScreeningFlowId,
		instantiateOnLoad: false,
	});

	const featureDetails = useMemo(
		() => (institution?.features ?? []).find((feature) => feature.featureId === 'MENTAL_HEALTH_PROVIDERS'),
		[institution?.features]
	);

	const [hasCompletedScreening, setHasCompletedScreening] = useState(false);
	const [recommendedFeature, setRecommendedFeature] = useState<InstitutionFeature>();
	const [myChartAuthUrl, setMyChartAuthUrl] = useState('');

	const fetchData = useCallback(async () => {
		if (!institution.providerTriageScreeningFlowId) {
			throw new Error('providerTriageScreeningFlowId is undefined.');
		}

		const { sessionFullyCompleted } = await screeningService
			.getScreeningFlowCompletionStatusByScreeningFlowId(institution.providerTriageScreeningFlowId)
			.fetch();

		if (sessionFullyCompleted) {
			setHasCompletedScreening(true);

			if (!account?.accountId) {
				throw new Error('accountId is undefined.');
			}

			const { myChartConnectionRequired } = await accountService
				.getBookingRequirements(account.accountId)
				.fetch();

			if (myChartConnectionRequired) {
				const { authenticationUrl } = await institutionService
					.getMyChartAuthenticationUrl(institution.institutionId)
					.fetch();

				setMyChartAuthUrl(authenticationUrl);
			} else {
				const { features } = await accountService.getRecommendedFeatures(account.accountId).fetch();
				const matchingInstitutionFeature = institution.features.find(
					(f) => f.featureId === features[0]?.featureId
				);

				setRecommendedFeature(matchingInstitutionFeature);

				if (matchingInstitutionFeature) {
					navigate(matchingInstitutionFeature.urlName, { replace: true });
				}
			}
		} else {
			setHasCompletedScreening(false);
		}
	}, [
		account?.accountId,
		institution.features,
		institution.institutionId,
		institution.providerTriageScreeningFlowId,
		navigate,
	]);

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

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
							{hasCompletedScreening ? (
								<NoData
									title={`Connect to ${institution.myChartName}`}
									description={`Connect to ${institution.myChartName} to see a list of providers and their available telehealth appointment times. If you need an in-person appointment, please call us at ${institution.clinicalSupportPhoneNumberDescription}.`}
									actions={[
										{
											variant: 'primary',
											title: myChartAuthUrl
												? `Connect to ${institution.myChartName}`
												: 'View Providers',
											onClick: () => {
												if (myChartAuthUrl) {
													window.open(myChartAuthUrl, '_blank', 'noopener, noreferrer');
													return;
												}

												if (recommendedFeature) {
													navigate(recommendedFeature.urlName);
												}
											},
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
							) : (
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
