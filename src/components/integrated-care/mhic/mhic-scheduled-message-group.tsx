import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import { PatientOrderScheduledMessageGroup } from '@/lib/models';
import SvgIcon from '@/components/svg-icon';

interface MhicScheduledMessageGroupProps {
	message: PatientOrderScheduledMessageGroup;
	onEditClick(message: PatientOrderScheduledMessageGroup): void;
	disabled?: boolean;
}

export const MhicScheduledMessageGroup = ({ message, onEditClick, disabled }: MhicScheduledMessageGroupProps) => {
	return (
		<Card key={message.patientOrderScheduledMessageGroupId} className="mb-6" bsPrefix="ic-card">
			<Card.Header>
				<Card.Title>Message scheduled for {message.scheduledAtDateTimeDescription}</Card.Title>
				<div className="button-container">
					<Button
						variant="light"
						className="p-2"
						onClick={() => {
							onEditClick(message);
						}}
						disabled={disabled}
					>
						<SvgIcon kit="far" icon="pen" size={16} className="d-flex" />
					</Button>
				</div>
			</Card.Header>
			<Card.Body>
				<Container fluid>
					<Row className="mb-4">
						<Col xs={3}>
							<p className="m-0 text-gray">Message Type</p>
						</Col>
						<Col xs={9}>
							<p className="m-0">{message.patientOrderScheduledMessageTypeDescription}</p>
						</Col>
					</Row>
					<Row>
						<Col xs={3}>
							<p className="m-0 text-gray">Contact Method</p>
						</Col>
						<Col xs={9}>
							<p className="m-0">
								{message.patientOrderScheduledMessages.map((m) => m.messageTypeDescription).join(', ')}
							</p>
						</Col>
					</Row>
				</Container>
			</Card.Body>
		</Card>
	);
};
