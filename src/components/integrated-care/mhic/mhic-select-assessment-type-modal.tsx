import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { ModifiedAssessmentTypeId } from '@/lib/models';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onSave(assessmentTypeId: AssessmentTypeId): void;
}

export type AssessmentTypeId = 'DEFAULT' | ModifiedAssessmentTypeId;

export const MhicSelectAssessmentTypeModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const [assessmentTypeId, setAssessmentTypeId] = useState<AssessmentTypeId>('DEFAULT');

	const handleOnEnter = useCallback(() => {
		setAssessmentTypeId('DEFAULT');
	}, []);

	const handleSaveButtonClick = useCallback(async () => {
		onSave(assessmentTypeId);
	}, [assessmentTypeId, onSave]);

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
					checked={assessmentTypeId === 'DEFAULT'}
					onChange={() => {
						setAssessmentTypeId('DEFAULT');
					}}
				/>
				<Form.Check
					type="radio"
					name="assessment-type"
					id="assessment-type__modified-safety"
					label="Modified - Safety Only (Permission needed)"
					value="SAFETY"
					checked={assessmentTypeId === 'SAFETY'}
					onChange={() => {
						setAssessmentTypeId('SAFETY');
					}}
				/>
				<Form.Check
					type="radio"
					name="assessment-type"
					id="assessment-type__modified-full"
					label="Modified - Full (Permission needed)"
					value="FULL"
					checked={assessmentTypeId === 'FULL'}
					onChange={() => {
						setAssessmentTypeId('FULL');
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
