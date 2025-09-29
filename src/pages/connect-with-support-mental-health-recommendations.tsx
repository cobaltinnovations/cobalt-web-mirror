import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { FeatureId, InstitutionFeature } from '@/lib/models';
import { accountService, screeningService } from '@/lib/services';
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
	const [appointmentScheduledByFeatureId, setAppointmentScheduledByFeatureId] = useState<Record<string, boolean>>({});
	const [showPsychiatristRecommendation, setShowPsychiatristRecommendation] = useState(false);

	const hasScehduledPsychiatrist = !!appointmentScheduledByFeatureId[FeatureId.PSYCHIATRIST];

	const fetchData = useCallback(async () => {
		if (!account?.accountId) {
			throw new Error('accountId is undefined.');
		}

		if (!institution.providerTriageScreeningFlowId) {
			throw new Error('institution.providerTriageScreeningFlowId is undefined.');
		}

		const [
			{ sessionFullyCompleted, sessionFullyCompletedAtDescription },
			recommendationsResponse,
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

		setAppointmentScheduledByFeatureId(recommendationsResponse.appointmentScheduledByFeatureId);
		const psychiatristIndex = recommendationsResponse.features.findIndex(
			(f) => f.featureId === FeatureId.PSYCHIATRIST
		);
		setShowPsychiatristRecommendation(psychiatristIndex > -1);

		const firstRecommendation = recommendationsResponse.features
			.filter((f) => f.featureId !== FeatureId.PSYCHIATRIST)
			.pop();
		const matchingInstitutionFeature = institution.features.find(
			(f) => f.featureId === firstRecommendation?.featureId
		);

		setCompletedAtDescription(sessionFullyCompletedAtDescription);
		setRecommendedFeature(matchingInstitutionFeature);
	}, [account?.accountId, institution.features, institution.providerTriageScreeningFlowId, navigate]);

	return (
		<>
			<Helmet>
				<title>{institution.name ?? 'Cobalt'} | Connect with Support - Mental Health Recommendations</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<Container className="py-20">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							{recommendedFeature ? (
								<>
									<h1 className="mb-1">Assessment Results</h1>
									<p className="mb-6 fs-large text-gray">Completed {completedAtDescription}</p>
									<hr className="mb-4" />

									{(() => {
										// Title override or default
										const alertTitle =
											recommendedFeature.recommendationTitleOverride ||
											`${recommendedFeature.treatmentDescription} Recommended`;

										// Description override or default
										const alertDescription =
											recommendedFeature.recommendationDescriptionOverride ? (
												<div
													dangerouslySetInnerHTML={{
														__html: recommendedFeature.recommendationDescriptionOverride,
													}}
												/>
											) : (
												<>
													<p>
														Based on the symptoms reported we recommend{' '}
														<strong>{recommendedFeature.treatmentDescription}</strong>. You
														can schedule a telehealth appointment with one of the providers
														listed.
													</p>
													<p>
														<strong>
															(Services billed to insurance. The patient is responsible
															for any co-pays or remaining balance.)
														</strong>
													</p>
												</>
											);

										const bookingTitle =
											recommendedFeature.recommendationBookingTitleOverride ??
											`Schedule with ${recommendedFeature.name}`;
										const bookingUrl =
											recommendedFeature.recommendationBookingUrlOverride ??
											recommendedFeature.urlName;

										return (
											<InlineAlert
												variant="info"
												title={alertTitle}
												description={alertDescription}
												action={{
													title: bookingTitle,
													onClick: () => navigate(bookingUrl),
												}}
											/>
										);
									})()}

									{showPsychiatristRecommendation && (
										<PsychiatristRecommendation
											className="mt-4"
											showScheduled={hasScehduledPsychiatrist}
										/>
									)}

									<p className="mt-4 fs-small">
										<strong>Your responses are not reviewed in real time.</strong> If you are in
										crisis, you can contact the Crisis Line 24 hours a day by calling 988. If you
										have an urgent or life-threatening issue, call 911 or go to the nearest
										emergency room.
									</p>
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
