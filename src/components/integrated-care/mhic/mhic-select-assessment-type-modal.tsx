import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onSave(modifiedAssessment: boolean): void;
}

export const MhicSelectAssessmentTypeModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const [modifiedAssessment, setModifiedAssessment] = useState(false);

	const handleOnEnter = useCallback(() => {
		setModifiedAssessment(false);
	}, []);

	const handleSaveButtonClick = useCallback(async () => {
		onSave(modifiedAssessment);
	}, [modifiedAssessment, onSave]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Select Assessment Type</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Check
					type="radio"
					name="assessment-type"
					id="assessment-type__default"
					label="Default"
					value="DEFAULT"
					checked={modifiedAssessment === false}
					onChange={() => {
						setModifiedAssessment(false);
					}}
				/>
				<Form.Check
					type="radio"
					name="assessment-type"
					id="assessment-type__modified"
					label="Modified (Permission needed)"
					value="MODIFIED"
					checked={modifiedAssessment}
					onChange={() => {
						setModifiedAssessment(true);
					}}
				/>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button variant="primary" onClick={handleSaveButtonClick}>
					Begin Assessment
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
