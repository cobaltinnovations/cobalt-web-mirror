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
				<title>Cobalt | Integrated Care - Add Resource</title>
			</Helmet>

			<Container>
				<Row>
					<Col>TODO: Resource Detail</Col>
				</Row>
			</Container>
		</>
	);
};
