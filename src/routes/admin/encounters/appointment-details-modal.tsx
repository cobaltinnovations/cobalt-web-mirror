import React, { FC } from 'react';
import { Col, Container, Modal, ModalProps, Row } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { AppointmentModel } from '@/lib/models';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
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
							<p className="mb-0">{appointment?.startTimeDescription}</p>
						</Col>
					</Row>
					<Row>
						<Col xs={5}>
							<p className="mb-0">Canceled Date</p>
						</Col>
						<Col xs={7}>
							<p className="mb-0">{appointment?.canceledAtDescription ?? 'Not canceled'}</p>
						</Col>
					</Row>
				</Container>
			</Modal.Body>
		</Modal>
	);
};
