import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

export async function loader() {
	return null;
}

export const Component = () => {
	return (
		<>
			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<h2 className="mb-0">PageBuilder</h2>
					</Col>
				</Row>
			</Container>
		</>
	);
};
