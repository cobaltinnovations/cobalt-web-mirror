import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

const NoMatch: FC = () => {
	return (
		<>
			<Helmet>
				<title>Cobalt | 404</title>
			</Helmet>

			<Container>
				<Row>
					<Col>
						<p className="text-center fs-h3 mt-5">Sorry, the resource you requested was not found.</p>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default NoMatch;
