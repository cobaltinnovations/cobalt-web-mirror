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
				<title>Cobalt | Account Settings</title>
			</Helmet>

			<Container>
				<Row>
					<Col>Account Settings Page</Col>
				</Row>
			</Container>
		</>
	);
};
