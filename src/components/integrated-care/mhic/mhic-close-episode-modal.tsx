import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

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
	const [selectedReason, setSelectedReason] = useState('');

	const handleOnEnter = useCallback(() => {
		setSelectedReason('');
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Close Episode</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Label className="mb-1">Reason for Closure:</Form.Label>
				<Form.Check
					type="radio"
					name="reason-for-closure"
					id="reason-for-closure__INELIGIBLE"
					label="Ineligible due to insurance"
					value="INELIGIBLE"
					checked={'INELIGIBLE' === selectedReason}
					onChange={({ currentTarget }) => {
						setSelectedReason(currentTarget.value);
					}}
				/>
				<Form.Check
					type="radio"
					name="reason-for-closure"
					id="reason-for-closure__REFUSED_CARE"
					label="Refused Care"
					value="REFUSED_CARE"
					checked={'REFUSED_CARE' === selectedReason}
					onChange={({ currentTarget }) => {
						setSelectedReason(currentTarget.value);
					}}
				/>
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
