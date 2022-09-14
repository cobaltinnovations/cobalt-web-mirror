import useTrackModalView from '@/hooks/use-track-modal-view';
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
	useTrackModalView('IneligibleBookingModal', props.show);
	const classes = useIneligibleBookingModal();

	return (
		<Modal {...props} dialogClassName={classes.ineligibleBookingModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Let's Find the Right Match</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-0">
					Based on your responses, we do not believe this provider is the right fit for your needs. Please
					select an appointment with a different provider.
				</p>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button variant="primary" onClick={props.onHide}>
						Okay
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default IneligibleBookingModal;
