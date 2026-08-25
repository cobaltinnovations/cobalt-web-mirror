import React, { FC } from 'react';
import { Col, Container, Modal, ModalProps, Row } from 'react-bootstrap';
import moment from 'moment';

import { createUseThemedStyles } from '@/jss/theme';
import { AppointmentModel } from '@/lib/models';
import { EncounterScreeningAnswers } from './encounter-screening-answers-card';

const useStyles = createUseThemedStyles((theme) => ({
	modal: {
		maxWidth: 720,
	},
	summary: {
		padding: 28,
	},
	canceledSummary: {
		borderLeft: `1px solid ${theme.colors.border}`,
		backgroundColor: theme.colors.d50,
		'@media (max-width: 575.98px)': {
			borderLeft: 0,
			borderTop: `1px solid ${theme.colors.border}`,
		},
	},
	reason: {
		padding: 28,
		backgroundColor: theme.colors.n50,
		borderTop: `1px solid ${theme.colors.border}`,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	screeningAnswers: {
		padding: 28,
	},
}));

interface Props extends ModalProps {
	appointment?: AppointmentModel;
}

const formatTimestampDescription = (description?: string) => {
	const normalizedDescription = description?.trim();

	return normalizedDescription
		? normalizedDescription.replace(' at ', ' • ').replace(/(\d)\s([AP]M)$/i, '$1$2')
		: 'Unknown';
};

const getAppointmentDayAndDuration = (appointment?: AppointmentModel) => {
	const appointmentDate = appointment?.localStartDate
		? moment(appointment.localStartDate, 'YYYY-MM-DD', true)
		: undefined;
	const appointmentDay = appointmentDate?.isValid() ? appointmentDate.format('dddd') : undefined;

	return [appointmentDay, appointment?.durationInMinutesDescription].filter(Boolean).join(' • ');
};

export const AppointmentDetailsModal: FC<Props> = ({ appointment, onHide, ...props }) => {
	const classes = useStyles();
	const appointmentDayAndDuration = getAppointmentDayAndDuration(appointment);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title>Appointment Details</Modal.Title>
			</Modal.Header>
			<Modal.Body className="p-0">
				<Container fluid className="p-0">
					<Row className="g-0">
						<Col xs={12} sm={appointment?.canceled ? 6 : 12} className={classes.summary}>
							<p className="mb-2 text-uppercase text-gray">Original Appointment</p>
							<h4 className="mb-2">{formatTimestampDescription(appointment?.startTimeDescription)}</h4>
							{appointmentDayAndDuration && (
								<p className="mb-0 text-gray fs-large">{appointmentDayAndDuration}</p>
							)}
						</Col>

						{appointment?.canceled && (
							<Col xs={12} sm={6} className={`${classes.summary} ${classes.canceledSummary}`}>
								<p className="mb-2 text-uppercase text-gray">Canceled</p>
								<h4 className="mb-2">
									{formatTimestampDescription(appointment.canceledAtDescription)}
								</h4>
								<p className="mb-0 text-gray fs-large">
									By {appointment.canceledByAccountDisplayName?.trim() || 'Care Navigator'}
								</p>
							</Col>
						)}
					</Row>

					{appointment?.canceled && (
						<div className={classes.reason}>
							<span className="me-2 text-uppercase fw-semibold">Reason</span>
							<span className="text-gray fst-italic">
								{appointment.cancellationReason?.trim() || 'No reason provided'}
							</span>
						</div>
					)}

					<div className={classes.screeningAnswers}>
						<h4 className="mb-6">Appointment Screening Answers</h4>
						<EncounterScreeningAnswers screeningSessionResult={appointment?.screeningSessionResult} />
					</div>
				</Container>
			</Modal.Body>
		</Modal>
	);
};
