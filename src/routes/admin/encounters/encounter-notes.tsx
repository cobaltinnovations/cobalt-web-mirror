import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import classNames from 'classnames';

import InputHelper from '@/components/input-helper';
import LoadingButton from '@/components/loading-button';
import NoData from '@/components/no-data';
import SvgIcon from '@/components/svg-icon';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { CareEncounterModel, CareEncounterNoteModel } from '@/lib/models';
import { careEncounterService } from '@/lib/services';
import { EditNoteModal } from './edit-note-modal';

const useStyles = createUseThemedStyles((theme) => ({
	notes: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	noteList: {
		flex: 1,
		padding: 32,
		overflowY: 'auto',
	},
	inputOuter: {
		padding: 32,
		backgroundColor: theme.colors.n0,
		boxShadow: '0px -4px 8px rgba(41, 40, 39, 0.15), 0px 0px 1px rgba(41, 40, 39, 0.31)',
	},
}));

interface Props {
	careEncounter: CareEncounterModel;
	onNotesChange(careEncounterNotes: CareEncounterNoteModel[]): Promise<void>;
}

export const EncounterNotes = ({ careEncounter, onNotesChange }: Props) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const noteInputRef = useRef<HTMLInputElement>(null);
	const [noteInputValue, setNoteInputValue] = useState('');
	const [noteToEdit, setNoteToEdit] = useState<CareEncounterNoteModel>();
	const [isAddingNote, setIsAddingNote] = useState(false);
	const normalizedNoteInputValue = noteInputValue.trim();
	const notesEditable = careEncounter.notesEditable;

	useEffect(() => {
		noteInputRef.current?.focus();
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (!normalizedNoteInputValue || !notesEditable) {
				return;
			}

			setIsAddingNote(true);

			try {
				const response = await careEncounterService
					.createCareEncounterNote(careEncounter.careEncounterId, { note: normalizedNoteInputValue })
					.fetch();

				await onNotesChange([response.careEncounterNote, ...careEncounter.careEncounterNotes]);
				setNoteInputValue('');
				addFlag({
					variant: 'success',
					title: 'Note Added',
					actions: [],
				});
			} catch (error) {
				handleError(error);
			} finally {
				setIsAddingNote(false);
			}
		},
		[
			addFlag,
			careEncounter.careEncounterId,
			careEncounter.careEncounterNotes,
			handleError,
			notesEditable,
			normalizedNoteInputValue,
			onNotesChange,
		]
	);

	const handleEditNoteSave = useCallback(
		async (careEncounterNote: CareEncounterNoteModel) => {
			await onNotesChange(
				careEncounter.careEncounterNotes.map((currentCareEncounterNote) =>
					currentCareEncounterNote.careEncounterNoteId === careEncounterNote.careEncounterNoteId
						? careEncounterNote
						: currentCareEncounterNote
				)
			);
			setNoteToEdit(undefined);
			addFlag({
				variant: 'success',
				title: 'Note Updated',
				actions: [],
			});
		},
		[addFlag, careEncounter.careEncounterNotes, onNotesChange]
	);

	return (
		<>
			<EditNoteModal
				careEncounterNote={noteToEdit}
				show={Boolean(noteToEdit)}
				onSave={handleEditNoteSave}
				onHide={() => {
					setNoteToEdit(undefined);
				}}
			/>

			<div className={classes.notes}>
				<div className={classes.noteList}>
					{careEncounter.careEncounterNotes.length > 0 ? (
						careEncounter.careEncounterNotes.map((careEncounterNote, noteIndex) => (
							<div
								key={careEncounterNote.careEncounterNoteId}
								className={classNames({
									'mb-6': noteIndex < careEncounter.careEncounterNotes.length - 1,
								})}
							>
								<div className="mb-2 d-flex align-items-center justify-content-between gap-4">
									<p className="mb-0 fw-bold">
										{careEncounterNote.createdByAccountDisplayName ?? 'Unknown'}
									</p>
									<div className="d-flex align-items-center">
										<p className="mb-0 me-2 text-gray">{careEncounterNote.createdDescription}</p>
										<Button
											variant="transparent-secondary"
											className="p-2"
											aria-label="Edit Note"
											disabled={!notesEditable}
											onClick={() => {
												setNoteToEdit(careEncounterNote);
											}}
										>
											<SvgIcon kit="far" icon="pen" size={16} className="d-flex" />
										</Button>
									</div>
								</div>
								<p className="mb-0">{careEncounterNote.note}</p>
							</div>
						))
					) : (
						<NoData title="No Notes" actions={[]} />
					)}
				</div>

				<div className={classes.inputOuter}>
					<Form onSubmit={handleFormSubmit}>
						<InputHelper
							ref={noteInputRef}
							className="mb-4"
							as="textarea"
							label="Your Note:"
							aria-label="Your Note:"
							value={noteInputValue}
							disabled={!notesEditable || isAddingNote}
							onChange={({ currentTarget }) => {
								setNoteInputValue(currentTarget.value);
							}}
						/>
						<div className="text-right">
							<LoadingButton
								type="submit"
								variant="primary"
								isLoading={isAddingNote}
								disabled={!normalizedNoteInputValue || !notesEditable || isAddingNote}
							>
								Add Note
							</LoadingButton>
						</div>
					</Form>
				</div>
			</div>
		</>
	);
};
