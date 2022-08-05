import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const NoMatch: FC = () => {
	return (
		<Container>
			<Row>
				<Col>
					<p className="text-center fs-h3 mt-5">Sorry, the resource you requested was not found.</p>
				</Col>
			</Row>
		</Container>
	);
};

export default NoMatch;
