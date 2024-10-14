import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

export const loader = async () => {
	return null;
};

export const Component = () => {
	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Resources</title>
			</Helmet>
			<Container className="py-16">
				<Row>
					<Col>Resources Page</Col>
				</Row>
			</Container>
		</>
	);
};
