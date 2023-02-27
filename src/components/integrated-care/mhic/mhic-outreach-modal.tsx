import moment from 'moment';
import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientOrderOutreachModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
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
	patientOrderId: string;
	outreachToEdit?: PatientOrderOutreachModel;
	onSave(patientOrderOutreach: PatientOrderOutreachModel, isEdit: boolean): void;
}

export const MhicOutreachModal: FC<Props> = ({ patientOrderId, outreachToEdit, onSave, ...props }) => {
	const handleError = useHandleError();
	const classes = useStyles();
	const [formValues, setFormValues] = useState({
		date: undefined as Date | undefined,
		time: '',
		comment: '',
	});
	const [isSaving, setIsSaving] = useState(false);

	const handleOnEnter = useCallback(() => {
		if (outreachToEdit) {
			setFormValues({
				date: new Date(outreachToEdit.outreachDate),
				time: moment(outreachToEdit.outreachTime, 'HH:mm').format('h:mm A'),
				comment: outreachToEdit.note,
			});
			return;
		}

		setFormValues({
			date: new Date(),
			time: moment().format('h:mm A'),
			comment: '',
		});
	}, [outreachToEdit]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			try {
				setIsSaving(true);

				if (outreachToEdit) {
					const response = await integratedCareService
						.updatePatientOrderOutreach(outreachToEdit.patientOrderOutreachId, {
							outreachDate: moment(formValues.date).format('YYYY-MM-DD'),
							outreachTime: formValues.time,
							note: formValues.comment,
						})
						.fetch();

					onSave(response.patientOrderOutreach, true);
				} else {
					const response = await integratedCareService
						.postPatientOrderOutreach({
							patientOrderId,
							outreachDate: moment(formValues.date).format('YYYY-MM-DD'),
							outreachTime: formValues.time,
							note: formValues.comment,
						})
						.fetch();

					onSave(response.patientOrderOutreach, false);
				}
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[formValues.comment, formValues.date, formValues.time, handleError, onSave, outreachToEdit, patientOrderId]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>{outreachToEdit ? 'Edit Outreach Attempt' : 'Add Outreach Attempt'}</Modal.Title>
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
						label="Time"
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
						as="textarea"
						label="Comment"
						value={formValues.comment}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								comment: currentTarget.value,
							}));
						}}
						disabled={isSaving}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<Button
						variant="primary"
						type="submit"
						disabled={isSaving || !formValues.date || !formValues.time || !formValues.comment}
					>
						{outreachToEdit ? 'Save' : 'Add Attempt'}
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
