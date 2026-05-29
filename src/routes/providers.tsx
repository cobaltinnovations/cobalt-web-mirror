import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import HeroContainer from '@/components/hero-container';
import useAccount from '@/hooks/use-account';

export const loader = () => {
	return null;
};

export const Component = () => {
	const { institution } = useAccount();

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Providers</title>
			</Helmet>

			<HeroContainer>
				<h2 className="text-center">Providers</h2>
			</HeroContainer>

			<Container className="py-16">
				<Row>
					<Col>todo</Col>
				</Row>
			</Container>
		</>
	);
};
