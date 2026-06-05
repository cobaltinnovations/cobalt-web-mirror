import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useAccount from '@/hooks/use-account';

export const loader = () => {
	return null;
};

export const Component = () => {
	const { institution } = useAccount();

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Confirm Appointment Time</title>
			</Helmet>

			<Container>
				<Row>
					<Col>TODO</Col>
				</Row>
			</Container>
		</>
	);
};
