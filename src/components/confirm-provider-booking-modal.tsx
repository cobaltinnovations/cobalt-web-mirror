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
			<Modal.Header>
				<h3 className="mb-0">confirm your appointment</h3>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-2 font-body-normal">
					Do you want to book this session with <strong>{provider?.name}</strong> for{' '}
					<strong>{formattedDate}</strong> from <strong>{selectedTimeSlot?.timeDescription}</strong> to{' '}
					<strong>{timeSlotEndTime}</strong>?
				</p>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					cancel
				</Button>

				<Button variant="primary" size="sm" onClick={onConfirm}>
					reserve
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmProviderBookingModal;
