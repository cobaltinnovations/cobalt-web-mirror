import React, { FC, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientOrderConsentStatusId } from '@/lib/models';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 720,
	},
});

interface Props extends ModalProps {
	onSave(): void;
}

export const MhicConsentModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const [selectedPatientOrderConsentStatusId, setSelectedPatientOrderConsentStatusId] = useState('');

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Patient Consent</Modal.Title>
			</Modal.Header>
			<Form>
				<Modal.Body>
					<Form.Label className="mb-1">Does the patient consent to taking the assessment?</Form.Label>
					<Form.Check
						type="radio"
						name="patient-consent"
						id={`patient-consent__${PatientOrderConsentStatusId.CONSENTED}`}
						label="Yes, patient consents"
						value={PatientOrderConsentStatusId.CONSENTED}
						checked={PatientOrderConsentStatusId.CONSENTED === selectedPatientOrderConsentStatusId}
						onChange={({ currentTarget }) => {
							setSelectedPatientOrderConsentStatusId(currentTarget.value);
						}}
					/>
					<Form.Check
						type="radio"
						name="patient-consent"
						id={`patient-consent__${PatientOrderConsentStatusId.REJECTED}`}
						label="No, patient does not consent"
						value={PatientOrderConsentStatusId.REJECTED}
						checked={PatientOrderConsentStatusId.REJECTED === selectedPatientOrderConsentStatusId}
						onChange={({ currentTarget }) => {
							setSelectedPatientOrderConsentStatusId(currentTarget.value);
						}}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={() => {
							onSave();
						}}
						disabled={!selectedPatientOrderConsentStatusId}
					>
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
