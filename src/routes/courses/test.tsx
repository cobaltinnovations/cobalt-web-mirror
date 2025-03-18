import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

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
			</Container>
		</>
	);
};
