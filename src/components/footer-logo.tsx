import React from 'react';
import { Row, Col } from 'react-bootstrap';

import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-small-text.svg';

const FooterLogo = () => {
	return (
		<Row className="mb-4">
			<Col>
				<p className="text-primary text-center text-md-start">
					<LogoSmallText />
				</p>

				<p className="text-primary text-center text-md-start">Powered by Cobalt Innovations, Inc.</p>
			</Col>
		</Row>
	);
};

export default FooterLogo;
