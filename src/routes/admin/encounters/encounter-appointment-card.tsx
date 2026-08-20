import React from 'react';
import { Button, Card, Dropdown } from 'react-bootstrap';

import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import NoData from '@/components/no-data';
import SvgIcon from '@/components/svg-icon';
import { createUseThemedStyles } from '@/jss/theme';
import { AppointmentModel } from '@/lib/models';

const useStyles = createUseThemedStyles((theme) => ({
	body: {
		gap: 24,
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	appointment: {
		gap: 16,
		display: 'flex',
		alignItems: 'center',
	},
	calendarIcon: {
		width: 36,
		height: 36,
		display: 'flex',
		flexShrink: 0,
		borderRadius: '50%',
		alignItems: 'center',
		justifyContent: 'center',
		color: theme.colors.p500,
		backgroundColor: theme.colors.p50,
	},
	actions: {
		gap: 16,
		display: 'flex',
		alignItems: 'center',
	},
	joinButton: {
		color: `${theme.colors.n0} !important`,
		textDecoration: 'none !important',
		'&:hover, &:focus, &:active': {
			color: `${theme.colors.n0} !important`,
			textDecoration: 'none !important',
		},
	},
}));

interface Props {
	appointment: AppointmentModel;
	onCancel(): void;
}

export const EncounterAppointmentCard = ({ appointment, onCancel }: Props) => {
	const classes = useStyles();

	if (appointment.canceled) {
		return <NoData title="No Active Appointment" actions={[]} />;
	}

	return (
		<Card bsPrefix="ic-card">
			<Card.Header>
				<Card.Title>Appointment</Card.Title>
			</Card.Header>
			<Card.Body className={classes.body}>
				<div className={classes.appointment}>
					<div className={classes.calendarIcon}>
						<SvgIcon kit="far" icon="calendar" size={16} className="d-flex" />
					</div>
					<h5 className="mb-0 text-uppercase">{appointment.startTimeDescription}</h5>
				</div>

				<div className={classes.actions}>
					<Button
						as="a"
						className={classes.joinButton}
						href={appointment.videoconferenceUrl}
						target="_blank"
						rel="noopener noreferrer"
						variant="primary"
					>
						Join Video Call
					</Button>

					<Dropdown>
						<Dropdown.Toggle
							as={DropdownToggle}
							id={`encounter-appointment-actions--${appointment.appointmentId}`}
							variant="outline-primary"
							className="d-flex align-items-center"
						>
							Edit
							<SvgIcon kit="far" icon="chevron-down" size={16} className="ms-2" />
						</Dropdown.Toggle>
						<Dropdown.Menu compact as={DropdownMenu} align="end" renderOnMount>
							<Dropdown.Item className="d-flex align-items-center text-danger" onClick={onCancel}>
								<SvgIcon kit="far" icon="calendar-xmark" size={16} className="me-2" />
								Cancel
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</div>
			</Card.Body>
		</Card>
	);
};
