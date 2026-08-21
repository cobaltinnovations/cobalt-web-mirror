import React, { FC } from 'react';
import { Col, Container, Modal, ModalProps, Row } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { AppointmentModel } from '@/lib/models';
import { EncounterScreeningAnswers } from './encounter-screening-answers-card';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 720,
	},
});

interface Props extends ModalProps {
	appointment?: AppointmentModel;
}

export const AppointmentDetailsModal: FC<Props> = ({ appointment, onHide, ...props }) => {
	const classes = useStyles();

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title>Appointment Details</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Container fluid>
					<Row className="mb-4">
						<Col xs={5}>
							<p className="mb-0">Appointment Date</p>
						</Col>
						<Col xs={7}>
							<p className="mb-0 text-end">{appointment?.startTimeDescription}</p>
						</Col>
					</Row>
					<Row className="mb-4">
						<Col xs={5}>
							<p className="mb-0">Canceled Date</p>
						</Col>
						<Col xs={7}>
							<p className="mb-0 text-end">{appointment?.canceledAtDescription ?? 'Not canceled'}</p>
						</Col>
					</Row>
					<Row>
						<Col xs={5}>
							<p className="mb-0">Cancellation Reason</p>
						</Col>
						<Col xs={7}>
							<p className="mb-0 text-end">{appointment?.cancellationReason ?? 'Not provided'}</p>
						</Col>
					</Row>
					<div className="border-top mt-6 pt-6">
						<h5 className="mb-4">Screening Answers</h5>
						<EncounterScreeningAnswers screeningSessionResult={appointment?.screeningSessionResult} />
					</div>
				</Container>
			</Modal.Body>
		</Modal>
	);
};
