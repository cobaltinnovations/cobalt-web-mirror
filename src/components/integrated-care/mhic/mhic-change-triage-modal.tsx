import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientOrderModel } from '@/lib/models';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrder: PatientOrderModel;
	onSave(patientOrder: PatientOrderModel): void;
}

export const MhicChangeTriageModal: FC<Props> = ({ patientOrder, onSave, ...props }) => {
	const classes = useStyles();
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const [isSaving, setIsSaving] = useState(false);

	const handleOnEnter = useCallback(() => {
		//TODO: Set initial values
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				setIsSaving(true);

				addFlag({
					variant: 'success',
					title: 'Assessment triage overridden',
					actions: [],
				});

				// onSave(response.patientOrder);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[addFlag, handleError]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Override Assessment Triage</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<p className="mb-4 fw-semibold">
						Please review proposed changes with a clinician before overriding the assessment triage.
					</p>
					<p className="mb-5">The patient will be enrolled in the new triage selected</p>
					<InputHelper
						as="select"
						className="mb-4"
						label="Care Type"
						value=""
						onChange={({ currentTarget }) => {
							window.alert(`Set care type: ${currentTarget.value}`);
						}}
						disabled={isSaving}
					>
						<option key={''} value={''}>
							Select...
						</option>
					</InputHelper>
					<InputHelper
						as="select"
						className="mb-4"
						label="Care Focus"
						value=""
						onChange={({ currentTarget }) => {
							window.alert(`Set care focus: ${currentTarget.value}`);
						}}
						disabled={isSaving}
					>
						<option key={''} value={''}>
							Select...
						</option>
					</InputHelper>
					<InputHelper
						as="textarea"
						label="Reason for Override:"
						value={''}
						onChange={({ currentTarget }) => {
							window.alert(`Set comment: ${currentTarget.value}`);
						}}
						disabled={isSaving}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<Button variant="primary" type="submit" disabled={isSaving}>
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
