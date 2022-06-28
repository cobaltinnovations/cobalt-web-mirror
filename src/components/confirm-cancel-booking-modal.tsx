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
			<Modal.Header>
				<h3 className="mb-0">cancel reservation</h3>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-0 font-secondary-bold">are you sure?</p>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					no
				</Button>
				<Button variant="primary" size="sm" onClick={onConfirm}>
					yes
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmCancelBookingModal;
