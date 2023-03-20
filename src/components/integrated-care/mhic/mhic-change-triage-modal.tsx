import React, { FC, useCallback } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicChangeTriageModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();

	const handleOnEnter = useCallback(() => {
		//TODO: Set initial values
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Change Triage</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<InputHelper
					as="select"
					className="mb-4"
					label="Care Type"
					value=""
					onChange={({ currentTarget }) => {
						window.alert(`Set care type: ${currentTarget.value}`);
					}}
				>
					<option key={''} value={''}>
						Select...
					</option>
				</InputHelper>
				<InputHelper
					as="select"
					className="mb-4"
					label="Care Focus"
					value=""
					onChange={({ currentTarget }) => {
						window.alert(`Set care focus: ${currentTarget.value}`);
					}}
				>
					<option key={''} value={''}>
						Select...
					</option>
				</InputHelper>
				<InputHelper
					as="select"
					className="mb-4"
					label="Reason"
					value=""
					onChange={({ currentTarget }) => {
						window.alert(`Set reason: ${currentTarget.value}`);
					}}
				>
					<option key={''} value={''}>
						Select...
					</option>
				</InputHelper>
				<InputHelper
					as="textarea"
					label="Note:"
					value={''}
					onChange={({ currentTarget }) => {
						window.alert(`Set comment: ${currentTarget.value}`);
					}}
				/>
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
