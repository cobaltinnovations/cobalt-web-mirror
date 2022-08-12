import useTrackModalView from '@/hooks/use-track-modal-view';
import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useConfirmIntakeAssessmentModalStyles = createUseStyles({
	confirmIntakeAssessmentModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface ConfirmIntakeAssessmentModalProps extends ModalProps {
	onConfirm(): void;
}

const ConfirmIntakeAssessmentModal: FC<ConfirmIntakeAssessmentModalProps> = ({ onConfirm, ...props }) => {
	useTrackModalView('ConfirmIntakeAssessmentModal', props.show);
	const classes = useConfirmIntakeAssessmentModalStyles();

	return (
		<Modal {...props} dialogClassName={classes.confirmIntakeAssessmentModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>first, a few questions</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-0">
					This provider would like to know a bit more about you to determine whether they're a good match.
				</p>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button variant="outline-primary" onClick={props.onHide}>
						cancel
					</Button>
					<Button className="ms-2" variant="primary" onClick={onConfirm}>
						next
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmIntakeAssessmentModal;
