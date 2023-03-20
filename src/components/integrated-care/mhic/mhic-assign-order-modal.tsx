import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { AccountModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrderIds: string[];
	panelAccounts: AccountModel[];
	onSave(patientOrderCount: number, panelAccountDisplayName: string): void;
}

export const MhicAssignOrderModal: FC<Props> = ({ patientOrderIds, panelAccounts, onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [selectedPanelAccountId, setSelectedPanelAccountId] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const handleOnEnter = useCallback(() => {
		setSelectedPanelAccountId('');
		setIsSaving(false);
	}, []);

	const handleSaveButtonClick = useCallback(async () => {
		try {
			setIsSaving(true);

			const patientOrderCount = patientOrderIds.length;
			const panelAccountDisplayName =
				panelAccounts.find((pa) => pa.accountId === selectedPanelAccountId)?.displayName ?? '';

			await integratedCareService
				.assignPatientOrders({
					panelAccountId: selectedPanelAccountId,
					patientOrderIds,
				})
				.fetch();

			onSave(patientOrderCount, panelAccountDisplayName);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	}, [handleError, onSave, panelAccounts, patientOrderIds, selectedPanelAccountId]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Assign MHIC</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Label className="mb-1">Select MHIC to Assign</Form.Label>
				{panelAccounts.map((panelAccount) => (
					<Form.Check
						type="radio"
						name="panel-account"
						id={`panel-account__${panelAccount.accountId}`}
						label={panelAccount.displayName}
						value={panelAccount.accountId}
						checked={panelAccount.accountId === selectedPanelAccountId}
						onChange={({ currentTarget }) => {
							setSelectedPanelAccountId(currentTarget.value);
						}}
						disabled={isSaving}
					/>
				))}
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
					Cancel
				</Button>
				<Button
					variant="primary"
					onClick={handleSaveButtonClick}
					disabled={!selectedPanelAccountId || isSaving}
				>
					Assign
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
