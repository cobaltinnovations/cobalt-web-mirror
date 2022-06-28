import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import useHeaderTitle from '@/hooks/use-header-title';
import { useCobaltTheme } from '@/jss/theme';

const NoMatch: FC = () => {
	useHeaderTitle(null);
	const { fonts } = useCobaltTheme();

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
