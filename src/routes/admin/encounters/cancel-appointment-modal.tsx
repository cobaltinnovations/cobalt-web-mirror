import React, { FC, useCallback, useState } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';
import SvgIcon from '@/components/svg-icon';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

export const CancelAppointmentModal: FC<ModalProps> = ({ onHide, ...props }) => {
	const classes = useStyles();
	const [cancellationNote, setCancellationNote] = useState('');

	const handleOnEnter = useCallback(() => {
		setCancellationNote('');
	}, []);

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
				<Button variant="outline-primary" className="me-2" onClick={onHide}>
					Keep Appointment
				</Button>
				<Button
					variant="danger"
					onClick={() => {
						return;
					}}
				>
					Cancel Appointment
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
