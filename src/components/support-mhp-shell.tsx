import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import AsyncWrapper from './async-page';
import HeroContainer from './hero-container';
import InlineAlert from './inline-alert';
import NoData, { NoDataAction } from './no-data';
import { PsychiatristRecommendation } from './psychiatrist-recommendation';
import useAccount from '@/hooks/use-account';
import { FeatureId, InstitutionFeature } from '@/lib/models';
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

	const [showPsychiatristRecommendation, setShowPsychiatristRecommendation] = useState(false);
	const [hasScheduled, setHasScheduled] = useState(false);
	const [recommendedFeature, setRecommendedFeature] = useState<InstitutionFeature>();

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
			const { appointmentAlreadyScheduled, features } = await accountService
				.getRecommendedFeatures(account.accountId)
				.fetch();
			setHasScheduled(appointmentAlreadyScheduled);

			const psychiatristIndex = features.findIndex((f) => f.featureId === FeatureId.PSYCHIATRIST);
			setShowPsychiatristRecommendation(psychiatristIndex > -1);

			const firstRecommendation = features.filter((f) => f.featureId !== FeatureId.PSYCHIATRIST).pop();
			const matchingInstitutionFeature = institution.features.find(
				(f) => f.featureId === firstRecommendation?.featureId
			);

			setRecommendedFeature(matchingInstitutionFeature);
		}
	}, [
		account?.accountId,
		hasCompletedScreening,
		institution.features,
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
				<title>Cobalt | Connect with Support - Mental Health Providers</title>
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
											onClick: startScreeningFlow,
										},
									]}
								/>
							)}

							{hasCompletedScreening && !hasScheduled && (
								<InlineAlert
									className="mb-4"
									variant="success"
									title="Assessment Complete"
									description={`Based on the symptoms reported, we recommend ${recommendedFeature?.treatmentDescription}. You can schedule a telehealth appointment with one of the providers listed.`}
									action={{
										title: 'Schedule with ' + recommendedFeature?.name,
										onClick: () => {
											navigate(recommendedFeature?.urlName ?? '');
										},
									}}
								/>
							)}

							{hasCompletedScreening && hasScheduled && (
								<InlineAlert
									className="mb-4"
									variant="success"
									title="Appointment Scheduled"
									description={`Your appointment with ${recommendedFeature?.name} has been scheduled. You can manage and access your appointment through ${institution.myChartName} or view the event on Cobalt.`}
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
							)}

							{showPsychiatristRecommendation && <PsychiatristRecommendation />}
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};