import React, { useEffect, useMemo } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useAccount from '@/hooks/use-account';
import HeroContainer from '@/components/hero-container';
import MedicationPresriber from '@/components/medication-prescriber';
import { AnalyticsNativeEventTypeId, FeatureId } from '@/lib/models';
import { analyticsService } from '@/lib/services';

const ConnectWithSupportMedicationPrescriber = () => {
	const { institution } = useAccount();

	const featureDetails = useMemo(
		() => (institution?.features ?? []).find((feature) => feature.featureId === FeatureId.MEDICATION_PRESCRIBER),
		[institution?.features]
	);

	useEffect(() => {
		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MEDICATION_PRESCRIBER);
	}, []);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Connect with Support - Medication Prescriber</title>
			</Helmet>

			{featureDetails && (
				<HeroContainer className="bg-n75">
					<h1 className="mb-4 text-center">{featureDetails.name}</h1>
					<p className="mb-0 text-center fs-large">{featureDetails.description}</p>
				</HeroContainer>
			)}
			<Container>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<MedicationPresriber />
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default ConnectWithSupportMedicationPrescriber;
