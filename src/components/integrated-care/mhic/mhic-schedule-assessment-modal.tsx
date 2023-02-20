import React, { FC, useCallback, useState } from 'react';
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
	assessmentId?: string;
	onSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicScheduleAssessmentModal: FC<Props> = ({ assessmentId, onSave, ...props }) => {
	const classes = useStyles();
	const [coverageEnds, setCoverageEnds] = useState<Date | undefined>(undefined);

	const handleOnEnter = useCallback(() => {
		setCoverageEnds(undefined);
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>{assessmentId ? 'Edit Assessment Appointment' : 'Schedule Assessment'}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<DatePicker
					className="mb-4"
					labelText="Assessment Date"
					selected={coverageEnds}
					onChange={(date) => {
						if (!date) {
							return;
						}

						setCoverageEnds(date);
					}}
				/>
				<InputHelper
					as="select"
					className="mb-4"
					label="Assessment Time"
					value=""
					onChange={() => {
						return;
					}}
				/>
				<InputHelper
					type="text"
					label="Outlook Calendar Link"
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
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
