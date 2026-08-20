import React, { useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import InputHelper from '@/components/input-helper';
import NoData from '@/components/no-data';
import SvgIcon from '@/components/svg-icon';
import { createUseThemedStyles } from '@/jss/theme';
import { CareEncounterModel, CareEncounterStatusId } from '@/lib/models';

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
}

export const EncounterNotes = ({ careEncounter }: Props) => {
	const classes = useStyles();
	const noteInputRef = useRef<HTMLInputElement>(null);
	const [noteInputValue, setNoteInputValue] = useState('');
	const notes = careEncounter.notes?.trim();
	const isEncounterOpen = careEncounter.careEncounterStatusId === CareEncounterStatusId.OPEN;

	useEffect(() => {
		noteInputRef.current?.focus();
	}, []);

	return (
		<div className={classes.notes}>
			<div className={classes.noteList}>
				{notes ? (
					<div>
						<div className="mb-2 d-flex align-items-center justify-content-between gap-4">
							<p className="mb-0 fw-bold">{careEncounter.appointment.provider?.name ?? 'Unknown'}</p>
							<div className="d-flex align-items-center">
								<p className="mb-0 me-2 text-gray">{careEncounter.lastUpdatedDescription}</p>
								<Button
									variant="transparent-secondary"
									className="p-2"
									aria-label="Edit Note"
									disabled={!isEncounterOpen}
								>
									<SvgIcon kit="far" icon="pen" size={16} className="d-flex" />
								</Button>
							</div>
						</div>
						<p className="mb-0">{notes}</p>
					</div>
				) : (
					<NoData title="No Notes" actions={[]} />
				)}
			</div>

			<div className={classes.inputOuter}>
				<Form
					onSubmit={(event) => {
						event.preventDefault();
					}}
				>
					<InputHelper
						ref={noteInputRef}
						className="mb-4"
						as="textarea"
						label="Your Note:"
						aria-label="Your Note:"
						value={noteInputValue}
						disabled={!isEncounterOpen}
						onChange={({ currentTarget }) => {
							setNoteInputValue(currentTarget.value);
						}}
					/>
					<div className="text-right">
						<Button type="submit" variant="primary" disabled={!noteInputValue.trim() || !isEncounterOpen}>
							Add Note
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
};
