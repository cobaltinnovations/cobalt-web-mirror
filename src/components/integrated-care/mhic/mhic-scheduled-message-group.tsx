import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import { PatientOrderScheduledMessageGroup } from '@/lib/models';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';

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
						<EditIcon className="d-flex" />
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
