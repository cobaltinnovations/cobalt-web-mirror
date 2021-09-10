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
	const classes = useConfirmIntakeAssessmentModalStyles();

	return (
		<Modal {...props} dialogClassName={classes.confirmIntakeAssessmentModal} centered>
			<Modal.Header>
				<h3 className="mb-0">first, a few questions</h3>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-0">
					This provider would like to know a bit more about you to determine whether they're a good match.
				</p>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					cancel
				</Button>
				<Button variant="primary" size="sm" onClick={onConfirm}>
					next
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmIntakeAssessmentModal;
