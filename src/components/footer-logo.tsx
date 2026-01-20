import React from 'react';
import { Row, Col } from 'react-bootstrap';

import LogoSmallText from '@/assets/logos/logo-small-text.svg?react';
import useAccount from '@/hooks/use-account';

const FooterLogo = () => {
	const { institution } = useAccount();

	return (
		<Row className="mb-4">
			<Col>
				<p className="text-primary text-center text-md-start">
					{institution.footerLogoUrl ? (
						<img src={institution.footerLogoUrl} alt={institution.name} />
					) : (
						<LogoSmallText />
					)}
				</p>
				<p className="text-primary text-center text-md-start">Powered by Cobalt Innovations, Inc.</p>
			</Col>
		</Row>
	);
};

export default FooterLogo;
