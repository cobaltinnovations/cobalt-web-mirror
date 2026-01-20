import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from '@/components/helmet';
import AsyncWrapper from './async-page';
import HeroContainer from './hero-container';
import InlineAlert from './inline-alert';
import NoData, { NoDataAction } from './no-data';
import { PsychiatristRecommendation } from './psychiatrist-recommendation';
import useAccount from '@/hooks/use-account';
import { AccountFeature, FeatureId, InstitutionFeature } from '@/lib/models';
import { accountService, institutionService } from '@/lib/services';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import { useNavigate } from 'react-router-dom';

interface SupportMentalHealthProvidersShellProps {
	myChartAuthUrlState: [string, React.Dispatch<React.SetStateAction<string>>];
	renderFeatureDetail: (featureDetail: InstitutionFeature) => ReactNode;
	connectTitle: string;
	connectDescription: ReactNode;
	connectActions: NoDataAction[];
	connectedTitle: string;
	connectedDescription: ReactNode;
	connectedCta: string;
}

export const SupportMentalHealthProvidersShell = ({
	renderFeatureDetail,
	connectTitle,
	connectDescription,
	connectActions,
	connectedTitle,
	connectedDescription,
	connectedCta,
	myChartAuthUrlState: [myChartAuthUrl, setMyChartAuthUrl],
}: SupportMentalHealthProvidersShellProps) => {
	const navigate = useNavigate();
	const { account, institution } = useAccount();
	const { startScreeningFlow, renderedCollectPhoneModal, renderedPreScreeningLoader, hasCompletedScreening } =
		useScreeningFlow({
			screeningFlowId: institution?.providerTriageScreeningFlowId,
			instantiateOnLoad: false,
		});

	const featureDetails = useMemo(
		() => (institution?.features ?? []).find((feature) => feature.featureId === FeatureId.MENTAL_HEALTH_PROVIDERS),
		[institution?.features]
	);

	const [appointmentScheduledByFeatureId, setAppointmentScheduledByFeatureId] = useState<Record<string, boolean>>({});
	const [recommendedFeatures, setRecommendedFeatures] = useState<AccountFeature[]>([]);
	const [showPsychiatristRecommendation, setShowPsychiatristRecommendation] = useState(false);

	const fetchData = useCallback(async () => {
		if (!institution.providerTriageScreeningFlowId) {
			throw new Error('providerTriageScreeningFlowId is undefined.');
		}

		if (!account?.accountId) {
			throw new Error('accountId is undefined.');
		}

		const { myChartConnectionRequired } = await accountService.getBookingRequirements(account.accountId).fetch();

		if (myChartConnectionRequired) {
			const { authenticationUrl } = await institutionService
				.getMyChartAuthenticationUrl(institution.institutionId)
				.fetch();

			setMyChartAuthUrl(authenticationUrl);
		}

		if (hasCompletedScreening) {
			const response = await accountService.getRecommendedFeatures(account.accountId).fetch();
			setAppointmentScheduledByFeatureId(response.appointmentScheduledByFeatureId);

			const psychiatristIndex = response.features.findIndex((f) => f.featureId === FeatureId.PSYCHIATRIST);
			setShowPsychiatristRecommendation(psychiatristIndex > -1);

			// remove psychiatrist from recommended features as it is handled separately
			setRecommendedFeatures(response.features.filter((f) => f.featureId !== FeatureId.PSYCHIATRIST));
		}
	}, [
		account?.accountId,
		hasCompletedScreening,
		institution.institutionId,
		institution.providerTriageScreeningFlowId,
		setMyChartAuthUrl,
	]);

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Connect with Support - Mental Health Providers</title>
			</Helmet>

			{featureDetails && (
				<HeroContainer className="bg-n75">
					<h1 className="mb-4 text-center">{featureDetails.name}</h1>

					{renderFeatureDetail(featureDetails)}
				</HeroContainer>
			)}

			{renderedCollectPhoneModal}

			<AsyncWrapper fetchData={fetchData}>
				<Container className="py-15">
					<Row>
						<Col>
							{myChartAuthUrl && (
								<NoData
									title={connectTitle}
									description={connectDescription}
									actions={connectActions}
								/>
							)}

							{!hasCompletedScreening && !myChartAuthUrl && (
								<NoData
									title={connectedTitle}
									description={connectedDescription}
									actions={[
										{
											variant: 'primary',
											title: connectedCta,
											onClick: () => startScreeningFlow(),
										},
									]}
								/>
							)}

							{hasCompletedScreening && (
								<>
									{recommendedFeatures.map((recommendedFeature) => {
										const featureDetails = institution.features.find(
											(f) => f.featureId === recommendedFeature.featureId
										);

										if (appointmentScheduledByFeatureId[recommendedFeature.featureId]) {
											return (
												<InlineAlert
													className="mb-4"
													variant="success"
													title="Appointment Scheduled"
													description={`Your ${recommendedFeature?.name} appointment is scheduled. You can manage and access your appointment through ${institution.myChartName} or view the event on Cobalt.`}
													action={[
														{
															title: 'Go to ' + institution.myChartName,
															onClick: () => {
																window.open(
																	institution.myChartDefaultUrl,
																	'_blank',
																	'noopener, noreferrer'
																);
															},
														},
														{
															title: 'View My Events',
															onClick: () => {
																navigate('/my-calendar');
															},
														},
													]}
												/>
											);
										}

										const alertTitle =
											featureDetails?.recommendationTitleOverride ||
											`${featureDetails?.treatmentDescription} Recommended`;

										const alertDescription = featureDetails?.recommendationDescriptionOverride ? (
											<div
												dangerouslySetInnerHTML={{
													__html: featureDetails?.recommendationDescriptionOverride,
												}}
											/>
										) : (
											<>
												<p>
													Based on the symptoms reported we recommend{' '}
													<strong>{featureDetails?.treatmentDescription}</strong>. You can
													schedule a telehealth appointment with one of the providers listed.
												</p>
												<p>
													<strong>
														(Services billed to insurance. The patient is responsible for
														any co-pays or remaining balance.)
													</strong>
												</p>
											</>
										);

										const bookingTitle =
											featureDetails?.recommendationBookingTitleOverride ??
											`Schedule with ${featureDetails?.name}`;
										const bookingUrl =
											featureDetails?.recommendationBookingUrlOverride ?? featureDetails?.urlName;

										return (
											<InlineAlert
												className="mb-4"
												variant="info"
												title={alertTitle}
												description={alertDescription}
												action={{
													title: bookingTitle,
													onClick: () => navigate(bookingUrl!),
												}}
											/>
										);
									})}

									{showPsychiatristRecommendation && (
										<PsychiatristRecommendation
											showScheduled={!!appointmentScheduledByFeatureId[FeatureId.PSYCHIATRIST]}
										/>
									)}
								</>
							)}
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};
