import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const FooterContent = () => {
	return (
		<Row className="d-none d-md-block">
			<Col>
				<p className="mb-4">
					Cobalt is committed to your privacy. You can browse and book services anonymously on this platform,
					and your personal information will only be shared in support of providing services or when legally
					required. Your personal information is also protected under HIPAA and/or State law.
				</p>
				<p>
					<strong>
						Cobalt is also committed to your safety. If you are in crisis, call 911, 988 or text 741 741.
						Click <Link to="/in-crisis">here</Link> for more resources, or go to your nearest emergency
						department or crisis center.
					</strong>
				</p>
			</Col>
		</Row>
	);
};

export default FooterContent;
