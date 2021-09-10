import React, { FC } from 'react';
import { Col, Container } from 'react-bootstrap';

const HomeWrapper: FC = ({ children }) => (
	<Container>
		<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 8, offset: 2 }}>
			{children}
		</Col>
	</Container>
);

export default HomeWrapper;
