import { Container, Row, Col } from 'react-bootstrap';
import NoData from './no-data';
import React from 'react';
import useAccount from '@/hooks/use-account';

export interface FeatureScreeningCtaProps {
	onStartAssessment: () => void;
}

function FeatureScreeningCta({ onStartAssessment }: FeatureScreeningCtaProps) {
	const { institution } = useAccount();

	return (
		<Container className="mb-10">
			<Row>
				<Col>
					<NoData
						className="bg-p50"
						title="Not sure what you need?"
						actions={
							institution.epicFhirEnabled
								? [
										{
											size: 'lg' as const,
											variant: 'outline-primary',
											title: 'Speak with a Resource Navigator',
											onClick: () => {
												window.open(institution.externalContactUsUrl, '_blank');
											},
										},
								  ]
								: [
										{
											size: 'lg',
											variant: 'primary',
											title: 'Take the Assessment',
											onClick: onStartAssessment,
										},
								  ]
						}
					/>
				</Col>
			</Row>
		</Container>
	);
}

export default FeatureScreeningCta;
