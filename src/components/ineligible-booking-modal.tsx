import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useIneligibleBookingModal = createUseStyles({
	ineligibleBookingModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface IneligibleBookingModalProps extends ModalProps {}

const IneligibleBookingModal: FC<IneligibleBookingModalProps> = (props) => {
	const classes = useIneligibleBookingModal();

	return (
		<Modal {...props} dialogClassName={classes.ineligibleBookingModal} centered>
			<Modal.Header>
				<h3 className="mb-0">let's find the right match</h3>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-0">
					Based on your responses, we do not believe this provider is the right fit for your needs. Please
					select an appointment with a different provider.
				</p>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="primary" className="ms-auto" size="sm" onClick={props.onHide}>
					okay
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default IneligibleBookingModal;
