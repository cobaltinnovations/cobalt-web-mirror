import useTrackModalView from '@/hooks/use-track-modal-view';
import React, { FC } from 'react';
import { ModalProps, Modal, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useSessionCancelModalStyles = createUseStyles({
	sessionCancelModal: {
		width: '90%',
		maxWidth: 600,
		margin: '0 auto',
	},
});

interface SessionCancelModalProps extends ModalProps {
	onCancel(): void;
}

const SessionCancelModal: FC<SessionCancelModalProps> = ({ onCancel, ...props }) => {
	useTrackModalView('SessionCancelModal', props.show);
	const classes = useSessionCancelModalStyles();

	return (
		<Modal {...props} dialogClassName={classes.sessionCancelModal} centered>
			<Modal.Header closeButton bsPrefix="cobalt-modal__header--admin">
				<Modal.Title bsPrefix="cobalt-modal__title--admin">Cancel Group Session</Modal.Title>
			</Modal.Header>
			<Modal.Body bsPrefix="cobalt-modal__body--admin">
				<h5 className="mb-5 text-center">Are you sure you want to cancel this group session?</h5>
				<p className="text-center">
					Sessions cannot be un-cancelled. Any attendees of this session will be sent an email notifying them
					of the cancellation.
				</p>
			</Modal.Body>
			<Modal.Footer bsPrefix="cobalt-modal__footer--admin">
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					No Don't Cancel
				</Button>
				<Button variant="danger" size="sm" className="ms-3" onClick={onCancel}>
					Yes, Cancel Session
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SessionCancelModal;
