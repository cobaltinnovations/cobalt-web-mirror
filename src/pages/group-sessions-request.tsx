import React from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';

const GroupSessionsRequest = () => {
	return (
		<Container className="py-14">
			<Row>
				<Col lg={{ span: 8, offset: 2 }}>
					<h1 className="mb-6">Request a Group Session</h1>
					<p className="mb-4">
						Use this form to request a group session for your team (minimum of 5 people). Topics can range
						from mindfulness to resilience to how to increase daily activity. Please request your session at
						least two weeks in advance of the desired date. Upon submission of this form, please allow 1-2
						business days to hear back from the session coordinator. Sessions are held virtually.
					</p>
					<p className="mb-0 text-danger">Requred *</p>
				</Col>
			</Row>
			<Row>
				<Col lg={{ span: 8, offset: 2 }}>
					<Form></Form>
				</Col>
			</Row>
		</Container>
	);
};

export default GroupSessionsRequest;
