import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';
import useHandleError from '@/hooks/use-handle-error';
import { PatientOrderModel, PatientOrderVoicemailTask } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useFlags from '@/hooks/use-flags';
import { useMhicLayoutLoaderData } from '@/routes/ic/mhic/mhic-layout';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrderVoicemailTask?: PatientOrderVoicemailTask;
	patientOrder: PatientOrderModel;
	onSave(updatedPatientOrder: PatientOrderModel): void;
}

export const MhicVoicemailTaskModal: FC<Props> = ({ patientOrderVoicemailTask, patientOrder, onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { orderServicerAccounts } = useMhicLayoutLoaderData();
	const { addFlag } = useFlags();

	const [panelAccountId, setPanelAccountId] = useState(patientOrder.panelAccountId ?? '');
	const [message, setMessage] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				if (!patientOrder) {
					throw new Error('patientOrder is undefined.');
				}

				setIsSaving(true);

				const update = !!patientOrderVoicemailTask?.patientOrderVoicemailTaskId;

				if (update) {
					await integratedCareService
						.updateVoicemailTask(patientOrderVoicemailTask.patientOrderVoicemailTaskId, {
							panelAccountId,
							message,
						})
						.fetch();
				} else {
					await integratedCareService
						.createVoicemailTask({ panelAccountId, patientOrderId: patientOrder.patientOrderId, message })
						.fetch();
				}

				const response = await integratedCareService.getPatientOrder(patientOrder.patientOrderId).fetch();

				const assignedMhic = orderServicerAccounts.find((pA) => pA.accountId === panelAccountId);
				addFlag({
					variant: 'success',
					title: `Voicemail task ${update ? 'updated' : 'created'}`,
					description: `A task for ${patientOrder.patientDisplayName} was  ${
						update ? 'updated' : 'created'
					}.`,
					actions: [],
				});

				onSave(response.patientOrder);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[
			addFlag,
			handleError,
			message,
			onSave,
			panelAccountId,
			orderServicerAccounts,
			patientOrder,
			patientOrderVoicemailTask?.patientOrderVoicemailTaskId,
		]
	);

	useEffect(() => {
		if (props.show) {
			setPanelAccountId(patientOrder.panelAccountId ?? '');
			setMessage(patientOrderVoicemailTask?.message ?? '');
		}
	}, [patientOrder.panelAccountId, patientOrderVoicemailTask?.message, props.show]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Header closeButton>
				<Modal.Title>{patientOrderVoicemailTask ? 'Edit' : 'Add'} Voicemail Task</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						as="textarea"
						required
						label="Voicemail Details"
						value={message}
						onChange={({ currentTarget }) => {
							setMessage(currentTarget.value);
						}}
						disabled={isSaving}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<Button type="submit" variant="primary" disabled={!panelAccountId || !message || isSaving}>
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
