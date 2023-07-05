import InputHelper from '@/components/input-helper';
import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';

export async function loader() {
	return null;
}

export const Component = () => {
	return (
		<>
			<Container className="py-10">
				<Row>
					<Col>
						<h2 className="mb-1">Add Cobalt Group Session</h2>
						<p className="mb-0 fs-large">
							Complete all <span className="text-danger">*required fields</span> before publishing.
							Published group sessions will appear on the Group Sessions page of Cobalt.
						</p>
					</Col>
				</Row>
			</Container>
			<hr />
			<Container>
				<Row className="py-10">
					<Col>
						<h4 className="mb-4">Basic Info</h4>
						<p className="mb-4">
							Write a clear, brief title to help people quickly understand what your group session is
							about.
						</p>
						<p>
							Include a friendly URL to make the web address at penncobalt.com easier to read. A friendly
							URL includes 1-3 words separated by hyphens that describe the content of the webpage (ex.
							tolerating-uncertainty).
						</p>
					</Col>
					<Col>
						<InputHelper className="mb-3" type="text" label="Session Title" required />
						<InputHelper type="text" label="Friendly URL" />
					</Col>
				</Row>
				<hr />
				<Row className="py-10">
					<Col>
						<h4 className="mb-4">Location</h4>
						<p>Only virtual sessions are allowed at this time.</p>
					</Col>
					<Col>
						<Card bsPrefix="form-card">
							<Card.Header>Virtual</Card.Header>
							<Card.Body>
								<InputHelper
									className="mb-2"
									type="text"
									label="Video Link URL (Bluejeans/Zoom, etc.)"
									required
								/>
								<p className="mb-0">
									Include the URL to the Bluejeans/Zoom/etc. address where the session will be hosted.
								</p>
							</Card.Body>
						</Card>
					</Col>
				</Row>
				<hr />
				<Row className="py-10">
					<Col>
						<h4 className="mb-4">Capacity</h4>
						<p>Enter a number to set a limit on how many people are allowed to attend.</p>
					</Col>
					<Col>
						<InputHelper type="number" label="Number of seats available" required />
					</Col>
				</Row>
				<hr />
				<Row className="py-10">
					<Col>
						<h4 className="mb-4">Facilitator</h4>
						<p>Enter the information for the person who will be running this session.</p>
					</Col>
					<Col>
						<InputHelper className="mb-3" type="text" label="Facilitator Name" required />
						<InputHelper type="email" label="Facilitator Email Address" required />
					</Col>
				</Row>
				<hr />
				<Row className="py-10">
					<Col>
						<h4 className="mb-4">Notification Email</h4>
						<p>
							Add an email that will receive notifications when people register for the event or cancel
							registration
						</p>
					</Col>
					<Col>
						<InputHelper type="email" label="Notification Email" required />
					</Col>
				</Row>
			</Container>
		</>
	);
};
