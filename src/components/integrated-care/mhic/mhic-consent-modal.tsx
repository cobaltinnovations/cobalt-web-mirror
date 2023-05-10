import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientOrderConsentStatusId, PatientOrderModel } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';
import { integratedCareService } from '@/lib/services';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrder: PatientOrderModel;
	onSave(patientOrder: PatientOrderModel): void;
}

export const MhicConsentModal: FC<Props> = ({ patientOrder, onSave, ...props }) => {
	const handleError = useHandleError();
	const classes = useStyles();
	const [selectedPatientOrderConsentStatusId, setSelectedPatientOrderConsentStatusId] =
		useState<PatientOrderConsentStatusId>();
	const [isSaving, setIsSaving] = useState(false);

	const handleOnEnter = useCallback(() => {
		setSelectedPatientOrderConsentStatusId(undefined);
		setIsSaving(false);
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
			event.preventDefault();

			try {
				if (!patientOrder) {
					throw new Error('patientOrder is undefined.');
				}

				if (!selectedPatientOrderConsentStatusId) {
					throw new Error('selectedPatientOrderConsentStatusId is undefined.');
				}

				setIsSaving(true);

				const response = await integratedCareService
					.updatePatientOrderConsentStatus(patientOrder.patientOrderId, {
						patientOrderConsentStatusId: selectedPatientOrderConsentStatusId,
					})
					.fetch();

				onSave(response.patientOrder);
			} catch (error) {
				handleError(error);
				setIsSaving(false);
			}
		},
		[handleError, onSave, patientOrder, selectedPatientOrderConsentStatusId]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEntering={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Patient Consent</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
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
							setSelectedPatientOrderConsentStatusId(currentTarget.value as PatientOrderConsentStatusId);
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
							setSelectedPatientOrderConsentStatusId(currentTarget.value as PatientOrderConsentStatusId);
						}}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<Button type="submit" variant="primary" disabled={!selectedPatientOrderConsentStatusId || isSaving}>
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
