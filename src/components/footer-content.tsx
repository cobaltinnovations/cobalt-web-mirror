import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const FooterContent = ({ platformName }: { platformName: string }) => {
	return (
		<Row className="d-none d-md-block">
			<Col>
				<p className="mb-4">
					{platformName} is committed to your privacy. Your personal information will only be shared in
					support of providing services or when legally required. Your personal information is also protected
					under HIPAA and/or State law.
				</p>
				<p>
					<strong>
						{platformName} is also committed to your safety. If you are in crisis, call 911, 988 or text 741
						741. Click <Link to="/in-crisis">here</Link> for more resources, or go to your nearest emergency
						department or crisis center.
					</strong>
				</p>
			</Col>
		</Row>
	);
};

export default FooterContent;
