import React, { FC, useCallback, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface EncounterClosureReason {
	encounterClosureReasonId: string;
	description: string;
}

export const CloseEncounterModal: FC<ModalProps> = (props) => {
	const classes = useStyles();
	const [selectedReasonId, setSelectedReasonId] = useState('');
	const [encounterClosureReasons] = useState<EncounterClosureReason[]>([
		{ encounterClosureReasonId: 'option-1', description: 'Option' },
		{ encounterClosureReasonId: 'option-2', description: 'Option' },
		{ encounterClosureReasonId: 'option-3', description: 'Option' },
		{ encounterClosureReasonId: 'option-4', description: 'Option' },
		{ encounterClosureReasonId: 'option-5', description: 'Option' },
		{ encounterClosureReasonId: 'other', description: 'Other' },
	]);

	const handleOnEnter = useCallback(() => {
		setSelectedReasonId('');
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Close Encounter</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Label className="mb-1">Reason for Closure:</Form.Label>
				{encounterClosureReasons.map((closureReason) => (
					<Form.Check
						key={closureReason.encounterClosureReasonId}
						type="radio"
						name="reason-for-closure"
						id={`reason-for-closure__${closureReason.encounterClosureReasonId}`}
						label={closureReason.description}
						value={closureReason.encounterClosureReasonId}
						checked={closureReason.encounterClosureReasonId === selectedReasonId}
						onChange={({ currentTarget }) => {
							setSelectedReasonId(currentTarget.value);
						}}
					/>
				))}
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button variant="primary" onClick={props.onHide} disabled={!selectedReasonId}>
					Close Encounter
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
