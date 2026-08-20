import React, { FC, useCallback, useState } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';
import LoadingButton from '@/components/loading-button';
import SvgIcon from '@/components/svg-icon';
import { CancelCareEncounterAppointmentRequestBody } from '@/lib/services';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onSave(data: CancelCareEncounterAppointmentRequestBody): Promise<void>;
}

export const CancelAppointmentModal: FC<Props> = ({ onHide, onSave, ...props }) => {
	const classes = useStyles();
	const [cancellationNote, setCancellationNote] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const normalizedCancellationNote = cancellationNote.trim();

	const handleOnEnter = useCallback(() => {
		setCancellationNote('');
		setIsLoading(false);
	}, []);

	const handleSave = useCallback(async () => {
		if (!normalizedCancellationNote) {
			return;
		}

		setIsLoading(true);

		try {
			await onSave({ cancellationReason: normalizedCancellationNote });
		} finally {
			setIsLoading(false);
		}
	}, [normalizedCancellationNote, onSave]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter} onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title>Cancel Appointment</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-4 fw-bold">Are you sure you want to cancel the appointment?</p>
				<InputHelper
					as="textarea"
					label="Note about cancellation"
					aria-label="Note about cancellation"
					required
					disabled={isLoading}
					value={cancellationNote}
					onChange={({ currentTarget }) => {
						setCancellationNote(currentTarget.value);
					}}
				/>
				<div className="d-flex align-items-center mt-2 text-muted">
					<SvgIcon kit="fas" icon="circle-info" size={16} className="me-2 flex-shrink-0" />
					<p className="mb-0">This note will appear in the cancellation email to the patient.</p>
				</div>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={onHide} disabled={isLoading}>
					Keep Appointment
				</Button>
				<LoadingButton
					variant="danger"
					isLoading={isLoading}
					disabled={isLoading || !normalizedCancellationNote}
					onClick={handleSave}
				>
					Cancel Appointment
				</LoadingButton>
			</Modal.Footer>
		</Modal>
	);
};
