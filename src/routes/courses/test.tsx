import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { ScreeningFlow } from '@/components/screening-v2';
import useAccount from '@/hooks/use-account';

export async function loader() {
	return null;
}

export const Component = () => {
	const { institution } = useAccount();

	return (
		<>
			<Helmet>
				<title>Cobalt | Courses - Test</title>
			</Helmet>
			<Container>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{institution.onboardingScreeningFlowId && (
							<ScreeningFlow screeningFlowId={institution.onboardingScreeningFlowId} />
						)}
					</Col>
				</Row>
			</Container>
		</>
	);
};
