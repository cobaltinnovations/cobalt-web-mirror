import React from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import useTrackModalView from '@/hooks/use-track-modal-view';

const useStyles = createUseStyles({
	ineligibleBookingModal: {
		maxWidth: 760,
	},
});

interface ProviderScheduleModalProps extends ModalProps {}

const ProviderScheduleModal = ({ ...props }: ProviderScheduleModalProps) => {
	useTrackModalView('IneligibleBookingModal', props.show);
	const classes = useStyles();

	return (
		<Modal {...props} dialogClassName={classes.ineligibleBookingModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Provider Schedule Modal</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>todo</p>{' '}
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button variant="primary" onClick={props.onHide}>
						Continue
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ProviderScheduleModal;
