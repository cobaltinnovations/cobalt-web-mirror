import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useConfirmCancelBookingModalStyles = createUseStyles({
	confirmCancelBookingModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface ConfirmCancelBookingModalProps extends ModalProps {
	onConfirm(): void;
}

const ConfirmCancelBookingModal: FC<ConfirmCancelBookingModalProps> = ({ onConfirm, ...props }) => {
	const classes = useConfirmCancelBookingModalStyles();

	return (
		<Modal {...props} dialogClassName={classes.confirmCancelBookingModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>cancel reservation</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-0 fw-bold">are you sure?</p>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button variant="outline-primary" onClick={props.onHide}>
						no
					</Button>
					<Button className="ms-2" variant="primary" onClick={onConfirm}>
						yes
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmCancelBookingModal;
