import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { FeatureId, InstitutionFeature } from '@/lib/models';
import { accountService, institutionService, screeningService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncWrapper from '@/components/async-page';
import NoData from '@/components/no-data';
import InlineAlert from '@/components/inline-alert';
import { PsychiatristRecommendation } from '@/components/psychiatrist-recommendation';

const ConnectWithSupportMentalHealthRecommendations = () => {
	const navigate = useNavigate();
	const { account, institution } = useAccount();
	const [completedAtDescription, setCompletedAtDescription] = useState('N/A');
	const [recommendedFeature, setRecommendedFeature] = useState<InstitutionFeature>();
	const [myChartAuthUrl, setMyChartAuthUrl] = useState('');
	const [showPsychiatristRecommendation, setShowPsychiatristRecommendation] = useState(false);

	const fetchData = useCallback(async () => {
		if (!account?.accountId) {
			throw new Error('accountId is undefined.');
		}

		if (!institution.providerTriageScreeningFlowId) {
			throw new Error('institution.providerTriageScreeningFlowId is undefined.');
		}

		const [
			{ sessionFullyCompleted, sessionFullyCompletedAtDescription },
			{ features },
			{ myChartConnectionRequired },
		] = await Promise.all([
			screeningService
				.getScreeningFlowCompletionStatusByScreeningFlowId(institution.providerTriageScreeningFlowId)
				.fetch(),
			accountService.getRecommendedFeatures(account.accountId).fetch(),
			accountService.getBookingRequirements(account.accountId).fetch(),
		]);

		if (myChartConnectionRequired || !sessionFullyCompleted) {
			navigate('/connect-with-support/mental-health-providers', {
				replace: true,
			});
			return;
		}

		const psychiatristIndex = features.findIndex((f) => f.featureId === FeatureId.PSYCHIATRIST);
		setShowPsychiatristRecommendation(psychiatristIndex > -1);

		const firstRecommendation = features.filter((f) => f.featureId !== FeatureId.PSYCHIATRIST).pop();
		const matchingInstitutionFeature = institution.features.find(
			(f) => f.featureId === firstRecommendation?.featureId
		);

		setCompletedAtDescription(sessionFullyCompletedAtDescription);
		setRecommendedFeature(matchingInstitutionFeature);

		if (!myChartConnectionRequired) {
			return;
		}

		const { authenticationUrl } = await institutionService
			.getMyChartAuthenticationUrl(institution.institutionId)
			.fetch();

		setMyChartAuthUrl(authenticationUrl);
	}, [
		account?.accountId,
		institution.features,
		institution.institutionId,
		institution.providerTriageScreeningFlowId,
		navigate,
	]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Connect with Support - Mental Health Recommendations</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<Container className="py-20">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							{recommendedFeature ? (
								<>
									<h1 className="mb-1">Assessment Results</h1>
									<p className="mb-6 fs-large text-gray">Completed {completedAtDescription}</p>
									<hr className="mb-8" />
									<p className="mb-6 fs-large">
										Based on the symptoms reported we recommend{' '}
										<strong>{recommendedFeature.treatmentDescription}</strong>.
									</p>
									<p className="mb-6 fs-large">
										You can schedule a telehealth appointment with one of the providers listed.
									</p>
									<div className="mb-8 text-center">
										<Button
											variant="primary"
											size="lg"
											onClick={() => {
												if (myChartAuthUrl) {
													window.open(myChartAuthUrl, '_blank', 'noopener, noreferrer');
													return;
												}

												navigate(recommendedFeature.urlName);
											}}
										>
											{myChartAuthUrl
												? `Connect to ${institution.myChartName}`
												: 'Schedule an Appointment'}
										</Button>
									</div>

									{showPsychiatristRecommendation && <PsychiatristRecommendation />}

									<InlineAlert
										variant="primary"
										title="Your responses are not reviewed in real time"
										description="If you are in crisis, you can contact the Crisis Line 24 hours a day by calling 988. If you have an urgent or life-threatening issue, call 911 or go to the nearest emergency room."
									/>
								</>
							) : (
								<NoData
									title="No Support Roles Found"
									description="Copy TBD"
									actions={[
										{
											variant: 'primary',
											title: 'Return Home',
											onClick: () => {
												navigate('/');
											},
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

export default ConnectWithSupportMentalHealthRecommendations;
