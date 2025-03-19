import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { ScreeningFlow } from '@/components/screening-v2';

export async function loader() {
	return null;
}

export const Component = () => {
	return (
		<>
			<Helmet>
				<title>Cobalt | Courses - Test</title>
			</Helmet>
			<Container>
				<Row>
					<Col>
						<h2>Courses</h2>
					</Col>
				</Row>
				<Row>
					<Col>
						<ScreeningFlow screeningFlowId="1e5d618d-388b-4a4e-9d3a-34aca36914ca" />
					</Col>
				</Row>
			</Container>
		</>
	);
};
