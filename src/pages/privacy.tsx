import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import useAccount from '@/hooks/use-account';
import HeroContainer from '@/components/hero-container';

const Privacy: FC = () => {
	const { institution } = useAccount();

	return (
		<>
			<HeroContainer>
				<h2 className="mb-0 text-center">Privacy</h2>
			</HeroContainer>
			<Container className="pt-5 pb-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<div dangerouslySetInnerHTML={{ __html: institution?.privacyContent ?? '' }} />
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default Privacy;
