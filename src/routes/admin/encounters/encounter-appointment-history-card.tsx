import React from 'react';
import { Button, Card } from 'react-bootstrap';

import { createUseThemedStyles } from '@/jss/theme';
import { AppointmentModel, ATTENDANCE_STATUS_ID } from '@/lib/models';

const useStyles = createUseThemedStyles((theme) => ({
	item: {
		width: '100%',
		padding: '20px 16px',
		minHeight: 'auto',
		display: 'flex',
		borderRadius: 0,
		textAlign: 'left',
		alignItems: 'center',
		color: theme.colors.n900,
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		'&:not(:last-child)': {
			borderBottom: `1px solid ${theme.colors.border}`,
		},
		'&:hover, &:focus, &:active': {
			color: theme.colors.n900,
			backgroundColor: theme.colors.n75,
		},
	},
}));

interface Props {
	appointments: AppointmentModel[];
	onSelect(appointment: AppointmentModel): void;
}

const getAppointmentStatus = (appointment: AppointmentModel) => {
	if (appointment.canceled) {
		return 'Canceled';
	}

	switch (appointment.attendanceStatusId) {
		case ATTENDANCE_STATUS_ID.ATTENDED:
			return 'Attended';
		case ATTENDANCE_STATUS_ID.MISSED:
			return 'Missed';
		default:
			return 'Scheduled';
	}
};

export const EncounterAppointmentHistoryCard = ({ appointments, onSelect }: Props) => {
	const classes = useStyles();

	if (appointments.length === 0) {
		return null;
	}

	return (
		<Card bsPrefix="ic-card">
			<Card.Header>
				<Card.Title>Appointment History</Card.Title>
			</Card.Header>
			<Card.Body className="p-0 overflow-hidden">
				{appointments.map((appointment) => (
					<Button
						key={appointment.appointmentId}
						variant="transparent-secondary"
						className={classes.item}
						aria-label={`View appointment details for ${appointment.startTimeDescription}`}
						onClick={() => {
							onSelect(appointment);
						}}
					>
						<span className="fw-semibold">{appointment.startTimeDescription}</span>
						<span className="ms-4 text-gray fw-normal">{getAppointmentStatus(appointment)}</span>
					</Button>
				))}
			</Card.Body>
		</Card>
	);
};
