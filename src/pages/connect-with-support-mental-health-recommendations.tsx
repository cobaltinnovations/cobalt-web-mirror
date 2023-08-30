import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { InstitutionFeature } from '@/lib/models';
import { accountService, institutionService, screeningService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncWrapper from '@/components/async-page';
import NoData from '@/components/no-data';
import InlineAlert from '@/components/inline-alert';
import { cloneDeep } from 'lodash';

const ConnectWithSupportMentalHealthRecommendations = () => {
	const navigate = useNavigate();
	const { account, institution } = useAccount();
	const [completedAtDescription, setCompletedAtDescription] = useState('N/A');
	const [recommendedFeature, setRecommendedFeature] = useState<InstitutionFeature>();
	const [myChartAuthUrl, setMyChartAuthUrl] = useState('');
	const [psychiatristFeature, setPsychiatristFeature] = useState<InstitutionFeature>();

	const fetchData = useCallback(async () => {
		if (!account?.accountId) {
			throw new Error('accountId is undefined.');
		}

		if (!institution.providerTriageScreeningFlowId) {
			throw new Error('institution.providerTriageScreeningFlowId is undefined.');
		}

		const [{ sessionFullyCompletedAtDescription }, { features }, { myChartConnectionRequired }] = await Promise.all(
			[
				screeningService
					.getScreeningFlowCompletionStatusByScreeningFlowId(institution.providerTriageScreeningFlowId)
					.fetch(),
				accountService.getRecommendedFeatures(account.accountId).fetch(),
				accountService.getBookingRequirements(account.accountId).fetch(),
			]
		);

		const featuresClone = cloneDeep(features);
		const psychiatristIndex = featuresClone.findIndex((f) => f.featureId === 'PSYCHIATRIST');

		if (psychiatristIndex > -1) {
			featuresClone.splice(psychiatristIndex, 1);
			setPsychiatristFeature(institution.features.find((f) => f.featureId === 'PSYCHIATRIST'));
		}

		const matchingInstitutionFeature = institution.features.find(
			(f) => f.featureId === featuresClone[0]?.featureId
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
										Based on your answers, we recommend{' '}
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
												: 'View Providers'}
										</Button>
									</div>
									{psychiatristFeature && (
										<InlineAlert
											className="mb-4"
											variant="warning"
											title="Medication"
											description="If you are interested in a medication evaluation or medication management you must schedule with our psychiatrist."
											action={{
												title: 'Schedule with Psychiatrist',
												onClick: () => {
													navigate(psychiatristFeature.urlName);
												},
											}}
										/>
									)}
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
