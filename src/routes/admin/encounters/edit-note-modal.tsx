import React, { FC, useCallback, useRef, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';
import LoadingButton from '@/components/loading-button';
import useHandleError from '@/hooks/use-handle-error';
import { CareEncounterNoteModel } from '@/lib/models';
import { careEncounterService } from '@/lib/services';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	careEncounterNote?: CareEncounterNoteModel;
	onSave(careEncounterNote: CareEncounterNoteModel): Promise<void>;
}

export const EditNoteModal: FC<Props> = ({ careEncounterNote, onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const inputRef = useRef<HTMLInputElement>(null);
	const [noteInputValue, setNoteInputValue] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const normalizedNoteInputValue = noteInputValue.trim();

	const handleOnEnter = useCallback(() => {
		setNoteInputValue(careEncounterNote?.note ?? '');
		setIsSaving(false);
	}, [careEncounterNote]);

	const handleOnEntered = useCallback(() => {
		inputRef.current?.focus();
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (!careEncounterNote || !normalizedNoteInputValue) {
				return;
			}

			setIsSaving(true);

			try {
				const response = await careEncounterService
					.updateCareEncounterNote(careEncounterNote.careEncounterId, careEncounterNote.careEncounterNoteId, {
						note: normalizedNoteInputValue,
					})
					.fetch();

				await onSave(response.careEncounterNote);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[careEncounterNote, handleError, normalizedNoteInputValue, onSave]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter} onEntered={handleOnEntered}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Note</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						ref={inputRef}
						as="textarea"
						label="Note"
						aria-label="Note"
						value={noteInputValue}
						disabled={isSaving}
						onChange={({ currentTarget }) => {
							setNoteInputValue(currentTarget.value);
						}}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<LoadingButton
						type="submit"
						variant="primary"
						isLoading={isSaving}
						disabled={isSaving || !normalizedNoteInputValue}
					>
						Save
					</LoadingButton>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
