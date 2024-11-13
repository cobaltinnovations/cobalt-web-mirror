import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { careResourceService } from '@/lib/services';
import { CareResourceLocationModel } from '@/lib/models';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 720,
	},
});

interface Props extends ModalProps {
	defaultValue?: string;
	careResourceLocationId: string;
	onSave(careResourceLocation: CareResourceLocationModel): void;
}

export const MhicInternalNotesModal: FC<Props> = ({ defaultValue, careResourceLocationId, onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [formValue, setFormValue] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const handleOnEnter = useCallback(() => {
		setFormValue(defaultValue ?? '');
		setIsSaving(false);
	}, [defaultValue]);

	const handleSaveButtonClick = useCallback(async () => {
		try {
			setIsSaving(true);
			const response = await careResourceService
				.addInternalNotes({ careResourceLocationId, internalNotes: formValue })
				.fetch();
			onSave(response.careResourceLocation);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	}, [careResourceLocationId, formValue, handleError, onSave]);

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
