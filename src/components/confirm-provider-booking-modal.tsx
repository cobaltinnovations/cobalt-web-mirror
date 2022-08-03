import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { Provider, AvailabilityTimeSlot } from '@/lib/models';

const useconfirmProviderBookingModalStyles = createUseStyles({
	confirmProviderBookingModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface ConfirmProviderBookingModalProps extends ModalProps {
	onConfirm(): void;
	formattedDate: string;
	provider?: Provider;
	selectedTimeSlot?: AvailabilityTimeSlot;
	timeSlotEndTime?: string;
}

const ConfirmProviderBookingModal: FC<ConfirmProviderBookingModalProps> = ({
	onConfirm,
	formattedDate,
	provider,
	selectedTimeSlot,
	timeSlotEndTime,
	...props
}) => {
	const classes = useconfirmProviderBookingModalStyles();

	return (
		<Modal {...props} dialogClassName={classes.confirmProviderBookingModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>confirm your appointment</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-0 fw-normal">
					Do you want to book this session with <strong>{provider?.name}</strong> for{' '}
					<strong>{formattedDate}</strong> from <strong>{selectedTimeSlot?.timeDescription}</strong> to{' '}
					<strong>{timeSlotEndTime}</strong>?
				</p>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button variant="outline-primary" onClick={props.onHide}>
						cancel
					</Button>
					<Button className="ms-2" variant="primary" onClick={onConfirm}>
						reserve
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmProviderBookingModal;
