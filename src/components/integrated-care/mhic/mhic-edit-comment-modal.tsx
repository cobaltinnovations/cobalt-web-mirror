import React, { FC, useCallback, useRef, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';
import useHandleError from '@/hooks/use-handle-error';
import { integratedCareService } from '@/lib/services';
import { PatientOrderNoteModel } from '@/lib/models';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrderNote?: PatientOrderNoteModel;
	onSave(patientOrderNote: PatientOrderNoteModel): void;
}

export const MhicEditCommentModal: FC<Props> = ({ patientOrderNote, onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();

	const inputRef = useRef<HTMLInputElement>(null);
	const [commentInputValue, setCommentInputValue] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const handleOnEntering = useCallback(() => {
		setCommentInputValue(patientOrderNote?.note ?? '');
	}, [patientOrderNote]);

	const handleOnEntered = useCallback(() => {
		inputRef.current?.focus();
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				if (!patientOrderNote) {
					throw new Error('patientOrderNote is undefined.');
				}

				setIsSaving(true);

				const response = await integratedCareService
					.updateNote(patientOrderNote.patientOrderNoteId, { note: commentInputValue })
					.fetch();

				onSave(response.patientOrderNote);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[commentInputValue, handleError, onSave, patientOrderNote]
	);

	return (
		<Modal
			{...props}
			dialogClassName={classes.modal}
			centered
			onEntering={handleOnEntering}
			onEntered={handleOnEntered}
		>
			<Modal.Header closeButton>
				<Modal.Title>Edit Comment</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						ref={inputRef}
						as="textarea"
						label="Comment"
						value={commentInputValue}
						onChange={({ currentTarget }) => {
							setCommentInputValue(currentTarget.value);
						}}
						disabled={isSaving}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<Button type="submit" variant="primary" disabled={!commentInputValue || isSaving}>
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
