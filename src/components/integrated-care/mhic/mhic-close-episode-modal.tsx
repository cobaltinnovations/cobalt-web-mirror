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
	onSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicCloseEpisodeModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [selectedReason, setSelectedReason] = useState('');
	const [patientOrderClosureReasons, setPatientOrderClosureReasons] = useState<PatientOrderClosureReasonModel[]>([]);

	const getClosureReasones = useCallback(async () => {
		try {
			const response = await integratedCareService.getPatientOrderClosureReasons().fetch();
			setPatientOrderClosureReasons(response.patientOrderClosureReasons);
		} catch (error) {
			handleError(error);
		}
	}, [handleError]);

	const handleOnEnter = useCallback(() => {
		setSelectedReason('');
		getClosureReasones();
	}, [getClosureReasones]);

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
						type="radio"
						name="reason-for-closure"
						id={`reason-for-closure__${closureReason.patientOrderClosureReasonId}`}
						label="Ineligible due to insurance"
						value={closureReason.patientOrderClosureReasonId}
						checked={closureReason.patientOrderClosureReasonId === selectedReason}
						onChange={({ currentTarget }) => {
							setSelectedReason(currentTarget.value);
						}}
					/>
				))}
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button variant="primary" onClick={onSave} disabled={!selectedReason}>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
