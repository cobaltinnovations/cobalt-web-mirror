import React, { FC, useCallback } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import DatePicker from '@/components/date-picker';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicFollowUpMessageModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();

	const handleOnEnter = useCallback(() => {
		//TODO: Set/reset values
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Follow Up Message</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<DatePicker
					className="mb-4"
					labelText="Scheduled Date"
					selected={undefined}
					onChange={(date) => {
						if (!date) {
							return;
						}

						// set date
					}}
				/>
				<Form.Group>
					<Form.Label className="mb-1">Contact method</Form.Label>
					<Form.Check
						className="mb-1"
						type="checkbox"
						name="contact-method"
						id="contact-method__SMS"
						value="SMS"
						label="Text (SMS)"
					/>
					<Form.Check
						className="mb-0"
						type="checkbox"
						name="contact-method"
						id="contact-method__EMAIL"
						value="EMAIL"
						label="Email"
					/>
				</Form.Group>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button variant="primary" onClick={onSave}>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
