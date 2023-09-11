import { BookingContext } from '@/contexts/booking-context';
import useTrackModalView from '@/hooks/use-track-modal-view';
import React, { FC, useContext } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { useLocation, useNavigate } from 'react-router-dom';

const useAppointmentUnavailableStyles = createUseStyles({
	appointmentUnavailableModal: {
		maxWidth: 480,
	},
});

interface AppointmentUnavailableModalProps extends ModalProps {
	//
}

const AppointmentUnavailableModal: FC<AppointmentUnavailableModalProps> = ({ onConfirm, ...props }) => {
	useTrackModalView('AppointmentUnavailableModal', props.show);
	const classes = useAppointmentUnavailableStyles();
	const navigate = useNavigate();
	const location = useLocation();
	const { getExitBookingLocation } = useContext(BookingContext);

	return (
		<Modal {...props} dialogClassName={classes.appointmentUnavailableModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Appointment Unavailable</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<p className="fw-bold">This appointment time is no longer available</p>
				<p>Please choose a different appointment time.</p>
			</Modal.Body>

			<Modal.Footer>
				<div className="text-right">
					<Button
						variant="primary"
						onClick={() => {
							const exitUrl = getExitBookingLocation(location.state);
							navigate(exitUrl);
						}}
					>
						View Appointments
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default AppointmentUnavailableModal;
