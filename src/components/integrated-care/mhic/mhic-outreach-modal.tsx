import React, { FC, useCallback } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';
import DatePicker from '@/components/date-picker';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	isEdit?: boolean;
	onSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicOutreachModal: FC<Props> = ({ isEdit, onSave, ...props }) => {
	const classes = useStyles();

	const handleOnEnter = useCallback(() => {
		// reset state
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>{isEdit ? 'Edit Outreach Attempt' : 'Add Outreach Attempt'}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<DatePicker
					className="mb-4"
					labelText="Date"
					selected={undefined}
					onChange={(date) => {
						if (!date) {
							return;
						}

						//set date
					}}
				/>
				<InputHelper
					as="select"
					className="mb-4"
					label="Time"
					value=""
					onChange={() => {
						return;
					}}
				/>
				<InputHelper
					as="textarea"
					label="Comment"
					value=""
					onChange={() => {
						return;
					}}
				/>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button variant="primary" onClick={onSave}>
					{isEdit ? 'Save' : 'Add Attempt'}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
