import { Container, Row, Col } from 'react-bootstrap';
import NoData from './no-data';
import React, { useMemo } from 'react';
import useAccount from '@/hooks/use-account';
import { FeatureId } from '@/lib/models';
import { useNavigate } from 'react-router-dom';

export interface FeatureScreeningCtaProps {
	onStartAssessment: () => void;
}

function FeatureScreeningCta({ onStartAssessment }: FeatureScreeningCtaProps) {
	const { institution } = useAccount();
	const navigate = useNavigate();
	const resourceNavigatorFeature = useMemo(
		() => institution.features.find(({ featureId }) => featureId === FeatureId.RESOURCE_NAVIGATOR),
		[institution.features]
	);

	return (
		<Container className="mb-10">
			<Row>
				<Col>
					<NoData
						className="bg-p50"
						title="Not sure what you need?"
						actions={[
							...(institution.epicFhirEnabled
								? [
										{
											variant: 'outline-primary',
											title: 'Speak with a Resource Navigator',
											onClick: () => {
												window.open(institution.externalContactUsUrl, '_blank');
											},
										},
								  ]
								: [
										{
											variant: 'primary',
											title: 'Take the Assessment',
											onClick: onStartAssessment,
										},
								  ]),
							...(resourceNavigatorFeature?.providerId
								? [
										{
											variant: 'primary',
											title: resourceNavigatorFeature.navDescription,
											onClick: () =>
												navigate(`/provider-info/${resourceNavigatorFeature.providerId}`),
										},
								  ]
								: []),
						]}
					/>
				</Col>
			</Row>
		</Container>
	);
}

export default FeatureScreeningCta;
