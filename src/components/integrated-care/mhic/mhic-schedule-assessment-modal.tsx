import moment from 'moment';
import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import useHandleError from '@/hooks/use-handle-error';
import DatePicker from '@/components/date-picker';
import TimeInputV2 from '@/components/time-input-v2';
import InputHelper from '@/components/input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	assessmentId?: string;
	onSave(): void;
}

export const MhicScheduleAssessmentModal: FC<Props> = ({ assessmentId, onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [formValues, setFormValues] = useState({
		date: undefined as Date | undefined,
		time: '',
		link: '',
	});
	const [isSaving, setIsSaving] = useState(false);

	const handleOnEnter = useCallback(() => {
		// todo
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				setIsSaving(true);

				console.log('formValues.date:', moment(formValues.date).format('YYYY-MM-DD'));
				console.log('formValues.time:', formValues.time);
				console.log('formValues.link:', formValues.link);

				onSave();
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[formValues.date, formValues.link, formValues.time, handleError, onSave]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>{assessmentId ? 'Edit Assessment Appointment' : 'Schedule Assessment'}</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<DatePicker
						className="mb-4"
						labelText="Date"
						selected={formValues.date}
						onChange={(date) => {
							setFormValues((previousValues) => ({
								...previousValues,
								date: date ?? undefined,
							}));
						}}
						disabled={isSaving}
					/>
					<TimeInputV2
						id="outreact-modal__time-input"
						className="mb-4"
						label="Assessment Time"
						value={formValues.time}
						onChange={(time) => {
							setFormValues((previousValues) => ({
								...previousValues,
								time,
							}));
						}}
						disabled={isSaving}
					/>
					<InputHelper
						type="text"
						label="Outlook Calendar Link"
						value={formValues.link}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								link: currentTarget.value,
							}));
						}}
						disabled={isSaving}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
						Cancel
					</Button>
					<Button variant="primary" type="submit">
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
