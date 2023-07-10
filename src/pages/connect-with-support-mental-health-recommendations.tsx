import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { InstitutionFeature } from '@/lib/models';
import { accountService, institutionService, screeningService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncWrapper from '@/components/async-page';
import NoData from '@/components/no-data';

const ConnectWithSupportMentalHealthRecommendations = () => {
	const navigate = useNavigate();
	const { account, institution } = useAccount();
	const [completedAtDescription, setCompletedAtDescription] = useState('N/A');
	const [recommendedFeature, setRecommendedFeature] = useState<InstitutionFeature>();
	const [myChartAuthUrl, setMyChartAuthUrl] = useState('');

	const fetchData = useCallback(async () => {
		if (!account?.accountId) {
			throw new Error('accountId is undefined.');
		}

		const { features } = await accountService.getRecommendedFeatures(account.accountId).fetch();
		const matchingInstitutionFeature = institution.features.find((f) => f.featureId === features[0]?.featureId);
		setRecommendedFeature(matchingInstitutionFeature);

		const { myChartConnectionRequired } = await accountService.getBookingRequirements(account.accountId).fetch();
		if (!myChartConnectionRequired) {
			return;
		}

		if (!institution.institutionId) {
			throw new Error('institutionId is undefined.');
		}

		const { authenticationUrl } = await institutionService
			.getMyChartAuthenticationUrl(institution.institutionId)
			.fetch();

		setMyChartAuthUrl(authenticationUrl);

		if (!institution.providerTriageScreeningFlowId) {
			throw new Error('institution.providerTriageScreeningFlowId is undefined.');
		}

		const { sessionFullyCompletedAtDescription } = await screeningService
			.getScreeningFlowCompletionStatusByScreeningFlowId(institution.providerTriageScreeningFlowId)
			.fetch();
		setCompletedAtDescription(sessionFullyCompletedAtDescription);
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
										Based on the symptoms reported we recommend that you meet with a{' '}
										<strong>{recommendedFeature.name}</strong>
									</p>
									<p className="mb-6 fs-large">
										You can <strong>schedule a telehealth appointment</strong> with a Mental health
										Provider by browsing the list of providers and choosing an available appointment
										time. If you need an in-person appointment, please call us at{' '}
										<a href={`tel:${institution.clinicalSupportPhoneNumber}`}>
											{institution.clinicalSupportPhoneNumberDescription ?? 'N/A'}
										</a>
									</p>
									<div className="text-center">
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
