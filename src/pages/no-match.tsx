import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import useHeaderTitle from '@/hooks/use-header-title';
import fonts from '@/jss/fonts';

const NoMatch: FC = () => {
	useHeaderTitle(null);

	return (
		<Container>
			<Row>
				<Col>
					<p className="text-center mt-5" style={{ ...fonts.xl }}>
						Sorry, the resource you requested was not found.
					</p>
				</Col>
			</Row>
		</Container>
	);
};

export default NoMatch;
