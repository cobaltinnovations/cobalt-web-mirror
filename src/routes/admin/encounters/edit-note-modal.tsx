import React, { FC, useCallback, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import LoadingButton from '@/components/loading-button';
import WysiwygBasic, { wysiwygValueHasContent } from '@/components/wysiwyg-basic';
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
	const inputRef = useRef<ReactQuill>(null);
	const [noteInputValue, setNoteInputValue] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const normalizedNoteInputValue = noteInputValue.trim();
	const noteInputHasContent = wysiwygValueHasContent(normalizedNoteInputValue);

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

			if (!careEncounterNote || !noteInputHasContent) {
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
		[careEncounterNote, handleError, normalizedNoteInputValue, noteInputHasContent, onSave]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter} onEntered={handleOnEntered}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Note</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<Form.Group>
						<Form.Label>Note</Form.Label>
						<WysiwygBasic
							ref={inputRef}
							ariaLabel="Note"
							value={noteInputValue}
							disabled={isSaving}
							height={160}
							toolbarPreset="care-encounter-message"
							onChange={setNoteInputValue}
						/>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<LoadingButton
						type="submit"
						variant="primary"
						isLoading={isSaving}
						disabled={isSaving || !noteInputHasContent}
					>
						Save
					</LoadingButton>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
