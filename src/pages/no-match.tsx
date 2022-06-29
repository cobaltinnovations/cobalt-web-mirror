import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import useHeaderTitle from '@/hooks/use-header-title';

const NoMatch: FC = () => {
	useHeaderTitle(null);

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
