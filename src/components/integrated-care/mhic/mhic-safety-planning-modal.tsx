import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientOrderModel, PatientOrderSafetyPlanningStatusId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrder: PatientOrderModel;
	onSave(patientOrder: PatientOrderModel): void;
}

export const MhicSafetyPlanningModal: FC<Props> = ({ patientOrder, onSave, ...props }) => {
	const classes = useStyles();
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const [isSaving, setIsSaving] = useState(false);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				setIsSaving(true);

				const response = await integratedCareService
					.updateSafetyPlanningStatus(patientOrder.patientOrderId, {
						patientOrderSafetyPlanningStatusId:
							PatientOrderSafetyPlanningStatusId.CONNECTED_TO_SAFETY_PLANNING,
					})
					.fetch();

				addFlag({
					variant: 'success',
					title: 'Handoff Complete',
					description: `${response.patientOrder.patientDisplayName} has been connected to Safety Planning`,
					actions: [],
				});

				onSave(response.patientOrder);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[addFlag, handleError, onSave, patientOrder.patientOrderId]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Complete Safety Handoff</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<p className="mb-0 fw-semibold">Did you connect the patient to Safety Planning?</p>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<Button type="submit" variant="primary" disabled={isSaving}>
						Mark Complete
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
