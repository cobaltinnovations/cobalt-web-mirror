import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientOrderClosureReasonModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onSave(patientOrderClosureReasonId: string): void;
}

export const MhicCloseEpisodeModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [selectedReasonId, setSelectedReasonId] = useState('');
	const [patientOrderClosureReasons, setPatientOrderClosureReasons] = useState<PatientOrderClosureReasonModel[]>([]);

	const getClosureReasons = useCallback(async () => {
		try {
			const response = await integratedCareService.getPatientOrderClosureReasons().fetch();
			setPatientOrderClosureReasons(response.patientOrderClosureReasons);
		} catch (error) {
			handleError(error);
		}
	}, [handleError]);

	const handleOnEnter = useCallback(() => {
		setSelectedReasonId('');
		getClosureReasons();
	}, [getClosureReasons]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Close Episode</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Label className="mb-1">Reason for Closure:</Form.Label>
				{patientOrderClosureReasons.length <= 0 && (
					<p className="mb-0 text-danger">No closure reasons found.</p>
				)}
				{patientOrderClosureReasons.map((closureReason) => (
					<Form.Check
						key={closureReason.patientOrderClosureReasonId}
						type="radio"
						name="reason-for-closure"
						id={`reason-for-closure__${closureReason.patientOrderClosureReasonId}`}
						label={closureReason.description}
						value={closureReason.patientOrderClosureReasonId}
						checked={closureReason.patientOrderClosureReasonId === selectedReasonId}
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
				<Button
					variant="primary"
					onClick={() => {
						onSave(selectedReasonId);
					}}
					disabled={!selectedReasonId}
				>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
