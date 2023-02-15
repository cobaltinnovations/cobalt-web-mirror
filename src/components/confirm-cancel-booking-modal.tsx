import useTrackModalView from '@/hooks/use-track-modal-view';
import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useConfirmCancelBookingModalStyles = createUseStyles({
	confirmCancelBookingModal: {
		maxWidth: 295,
	},
});

interface ConfirmCancelBookingModalProps extends ModalProps {
	onConfirm(): void;
}

const ConfirmCancelBookingModal: FC<ConfirmCancelBookingModalProps> = ({ onConfirm, ...props }) => {
	useTrackModalView('ConfirmCancelBookingModal', props.show);
	const classes = useConfirmCancelBookingModalStyles();

	return (
		<Modal {...props} dialogClassName={classes.confirmCancelBookingModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Cancel Reservation</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-0 fw-bold">Are you sure?</p>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button variant="outline-primary" onClick={props.onHide}>
						No
					</Button>
					<Button className="ms-2" variant="primary" onClick={onConfirm}>
						Yes
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmCancelBookingModal;
