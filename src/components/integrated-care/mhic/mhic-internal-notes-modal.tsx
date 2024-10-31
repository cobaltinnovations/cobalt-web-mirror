import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 720,
	},
});

interface Props extends ModalProps {
	careResourceLocationId: string;
	onSave(): void;
}

export const MhicInternalNotesModal: FC<Props> = ({ careResourceLocationId, onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [formValue, setFormValue] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const handleOnEnter = useCallback(() => {
		setFormValue('');
		setIsSaving(false);
	}, []);

	const handleSaveButtonClick = useCallback(async () => {
		try {
			setIsSaving(true);
			console.log('formValue: ', formValue);
			onSave();
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	}, [formValue, handleError, onSave]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Internal Notes</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<InputHelper
					as="textarea"
					label="Internal Notes"
					value={formValue}
					onChange={({ currentTarget }) => {
						setFormValue(currentTarget.value);
					}}
				/>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
					Cancel
				</Button>
				<Button variant="primary" onClick={handleSaveButtonClick} disabled={isSaving}>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
