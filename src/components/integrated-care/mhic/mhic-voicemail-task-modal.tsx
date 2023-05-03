import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';
import useHandleError from '@/hooks/use-handle-error';
import { AccountModel, PatientOrderModel, PatientOrderVoicemailTask } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useFlags from '@/hooks/use-flags';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrderVoicemailTask?: PatientOrderVoicemailTask;
	patientOrder: PatientOrderModel;
	panelAccounts: AccountModel[];
	onSave(updatedPatientOrder: PatientOrderModel): void;
}

export const MhicVoicemailTaskModal: FC<Props> = ({
	patientOrderVoicemailTask,
	patientOrder,
	panelAccounts,
	onSave,
	...props
}) => {
	const classes = useStyles();
	const handleError = useHandleError();
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

				if (!!patientOrderVoicemailTask?.patientOrderVoicemailTaskId) {
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

				const assignedMhic = panelAccounts.find((pA) => pA.accountId === panelAccountId);
				addFlag({
					variant: 'success',
					title: 'Voicemail task assigned',
					description: `A task for ${patientOrder.patientDisplayName} was assigned to ${
						assignedMhic?.displayName ?? 'the selected MHIC'
					}`,
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
			panelAccounts,
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
						as="select"
						required
						className="mb-4"
						label="MHIC Assigned"
						value={panelAccountId}
						onChange={({ currentTarget }) => {
							setPanelAccountId(currentTarget.value);
						}}
						disabled={isSaving}
					>
						<option value="">Unassigned</option>
						{panelAccounts.map((panelAccount) => {
							return (
								<option key={panelAccount.accountId} value={panelAccount.accountId}>
									{panelAccount.displayName}
								</option>
							);
						})}
					</InputHelper>
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
