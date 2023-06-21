import moment from 'moment';
import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import DatePicker from '@/components/date-picker';
import TimeInputV2 from '@/components/time-input-v2';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrder: PatientOrderModel;
	onSave(patientOrder: PatientOrderModel): void;
}

export const MhicScheduleAssessmentModal: FC<Props> = ({ patientOrder, onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [formValues, setFormValues] = useState({
		date: undefined as Date | undefined,
		time: '',
	});
	const [isSaving, setIsSaving] = useState(false);

	const handleOnEnter = useCallback(() => {
		setFormValues({
			date: patientOrder.patientOrderScheduledScreeningScheduledDateTime
				? moment(patientOrder.patientOrderScheduledScreeningScheduledDateTime).toDate()
				: undefined,
			time: patientOrder.patientOrderScheduledScreeningScheduledDateTime
				? moment(patientOrder.patientOrderScheduledScreeningScheduledDateTime).format('h:mm A')
				: '',
		});
	}, [patientOrder.patientOrderScheduledScreeningScheduledDateTime]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				setIsSaving(true);

				if (patientOrder.patientOrderScheduledScreeningId) {
					const assessmentResponse = await integratedCareService
						.updateScheduledAssessment(patientOrder.patientOrderScheduledScreeningId, {
							scheduledDate: moment(formValues.date).format('YYYY-MM-DD'),
							scheduledTime: formValues.time,
						})
						.fetch();

					addFlag({
						variant: 'success',
						title: 'Assessment updated',
						description: `Assessment was updated for ${patientOrder.patientDisplayName} to ${assessmentResponse.patientOrderScheduledScreening.scheduledDateTimeDescription}`,
						actions: [],
					});
				} else {
					const assessmentResponse = await integratedCareService
						.scheduleAssessment({
							scheduledDate: moment(formValues.date).format('YYYY-MM-DD'),
							scheduledTime: formValues.time,
							patientOrderId: patientOrder.patientOrderId,
						})
						.fetch();

					addFlag({
						variant: 'success',
						title: 'Assessment scheduled',
						description: `Assessment was scheduled for ${patientOrder.patientDisplayName} at ${assessmentResponse.patientOrderScheduledScreening.scheduledDateTimeDescription}`,
						actions: [],
					});
				}

				const response = await integratedCareService.getPatientOrder(patientOrder.patientOrderId).fetch();
				onSave(response.patientOrder);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[
			addFlag,
			formValues.date,
			formValues.time,
			handleError,
			onSave,
			patientOrder.patientDisplayName,
			patientOrder.patientOrderId,
			patientOrder.patientOrderScheduledScreeningId,
		]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>
					{patientOrder.patientOrderScheduledScreeningId
						? 'Edit Assessment Appointment'
						: 'Schedule Assessment'}
				</Modal.Title>
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
						date={formValues.date}
						id="schedule-assessment__time-input"
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
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<Button variant="primary" type="submit" disabled={isSaving}>
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
