import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { AccountModel, PatientOrderCountModel } from '@/lib/models';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	currentPanelAccountId: string;
	panelAccounts: AccountModel[];
	activePatientOrderCountsByPanelAccountId: Record<string, PatientOrderCountModel>;
	onSwitchButtonClick(accountId: string, event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicSwitchAccountModal: FC<Props> = ({
	currentPanelAccountId,
	panelAccounts,
	activePatientOrderCountsByPanelAccountId,
	onSwitchButtonClick,
	...props
}) => {
	const classes = useStyles();
	const [selectedPanelAccountId, setSelectedPanelAccountId] = useState('');

	const handleOnEnter = useCallback(() => {
		setSelectedPanelAccountId(currentPanelAccountId);
	}, [currentPanelAccountId]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Switch Panel View</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Label className="mb-1">Select View</Form.Label>
				{panelAccounts.map((panelAccount) => {
					return (
						<Form.Check
							key={panelAccount.accountId}
							type="radio"
							name="select-view"
							id={`select-view__${panelAccount.accountId}`}
							label={`${panelAccount.displayName} (${
								activePatientOrderCountsByPanelAccountId[panelAccount.accountId]
									.activePatientOrderCountDescription
							})`}
							value={panelAccount.accountId}
							checked={panelAccount.accountId === selectedPanelAccountId}
							onChange={({ currentTarget }) => {
								setSelectedPanelAccountId(currentTarget.value);
							}}
						/>
					);
				})}
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button
					variant="primary"
					onClick={(event) => {
						onSwitchButtonClick(selectedPanelAccountId, event);
					}}
				>
					Switch
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
