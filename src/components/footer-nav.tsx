import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const firstColLinks = [
	{
		label: 'Home',
		to: '/',
	},
	{
		label: 'Connect with Support',
		to: '/connect-with-support',
	},
	{
		label: 'Group Sessions',
		to: '/in-the-studio',
	},
	{
		label: 'Resource Library',
		to: '/resource-library',
	},
];

const seconColLinks = [
	{
		label: 'Contact Us',
		to: '/feedback',
	},
	{
		label: 'Privacy',
		to: '/privacy',
	},
];

const FooterNav = () => {
	return (
		<Row>
			<Col className="text-center text-md-start" xs={12} md={6}>
				{firstColLinks.map((link) => (
					<Link key={link.label} className="d-block fw-normal text-decoration-none mb-3" to={link.to}>
						{link.label}
					</Link>
				))}
			</Col>

			<Col className="text-center text-md-start" xs={12} md={6}>
				{seconColLinks.map((link) => (
					<Link key={link.label} className="d-block fw-normal text-decoration-none mb-3" to={link.to}>
						{link.label}
					</Link>
				))}
			</Col>
		</Row>
	);
};

export default FooterNav;
