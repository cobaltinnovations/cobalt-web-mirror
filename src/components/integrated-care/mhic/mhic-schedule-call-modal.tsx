import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Form, Modal, ModalProps, Row } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import {
	PatientOrderModel,
	PatientOrderResourcingTypeId,
	PatientOrderScheduledOutreach,
	PatientOrderScheduledOutreachReasonId,
} from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import DatePicker from '@/components/date-picker';
import TimeInputV2 from '@/components/time-input-v2';
import { DateFormats } from '@/lib/utils';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrderScheduledOutreach?: PatientOrderScheduledOutreach;
	patientOrder: PatientOrderModel;
	onSave(updatedPatientOrder: PatientOrderModel): void;
}

export const MhicScheduleCallModal = ({ patientOrderScheduledOutreach, patientOrder, onSave, ...props }: Props) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { addFlag } = useFlags();

	const [formValues, setFormValues] = useState({
		date: undefined as Date | undefined,
		time: '',
		contactType: PatientOrderScheduledOutreachReasonId.RESOURCE_FOLLOWUP,
		notes: '',
	});
	const [isSaving, setIsSaving] = useState(false);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				if (!patientOrder) {
					throw new Error('patientOrder is undefined.');
				}

				setIsSaving(true);

				let sceduledOutreachResponse = undefined;

				if (!!patientOrderScheduledOutreach?.patientOrderScheduledOutreachId) {
					sceduledOutreachResponse = await integratedCareService
						.updateScheduledOutreach(patientOrderScheduledOutreach.patientOrderScheduledOutreachId, {
							patientOrderScheduledOutreachReasonId:
								formValues.contactType as PatientOrderScheduledOutreachReasonId,
							patientOrderOutreachTypeId: PatientOrderResourcingTypeId.PHONE_CALL,
							scheduledAtDate: moment(formValues.date).format(DateFormats.API.Date),
							scheduledAtTime: moment(formValues.time, DateFormats.UI.TimeSlotInput).format(
								DateFormats.API.Time
							),
							message: formValues.notes,
						})
						.fetch();
				} else {
					sceduledOutreachResponse = await integratedCareService
						.createScheduledOutreach({
							patientOrderScheduledOutreachReasonId:
								formValues.contactType as PatientOrderScheduledOutreachReasonId,
							patientOrderOutreachTypeId: PatientOrderResourcingTypeId.PHONE_CALL,
							scheduledAtDate: moment(formValues.date).format(DateFormats.API.Date),
							scheduledAtTime: moment(formValues.time, DateFormats.UI.TimeSlotInput).format(
								DateFormats.API.Time
							),
							message: formValues.notes,
							patientOrderId: patientOrder.patientOrderId,
						})
						.fetch();
				}

				const patientOrderResponse = await integratedCareService
					.getPatientOrder(patientOrder.patientOrderId)
					.fetch();

				addFlag({
					variant: 'success',
					title: 'Voicemail task assigned',
					description: `${
						patientOrderResponse.patientOrder.panelAccountDisplayName
					} is scheduled for a phone call with ${
						patientOrderResponse.patientOrder.patientDisplayName ?? 'the patient'
					} on ${sceduledOutreachResponse.patientOrderScheduledOutreach.scheduledAtDateDescription} as ${
						sceduledOutreachResponse.patientOrderScheduledOutreach.scheduledAtTimeDescription
					}`,
					actions: [],
				});

				onSave(patientOrderResponse.patientOrder);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[
			addFlag,
			formValues.contactType,
			formValues.date,
			formValues.notes,
			formValues.time,
			handleError,
			onSave,
			patientOrder,
			patientOrderScheduledOutreach?.patientOrderScheduledOutreachId,
		]
	);

	useEffect(() => {
		if (props.show) {
			setFormValues({
				date: undefined,
				time: '',
				contactType: PatientOrderScheduledOutreachReasonId.RESOURCE_FOLLOWUP,
				notes: '',
			});
		}
	}, [props.show]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Header closeButton>
				<Modal.Title>{patientOrderScheduledOutreach ? 'Edit Scheduled' : 'Schedule'} Phone Call</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<Row>
						<Col>
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
								required
							/>
						</Col>
						<Col>
							<TimeInputV2
								date={formValues.date}
								id="schedule-phone-call__time-input"
								label="Time"
								className="mb-4"
								value={formValues.time}
								onChange={(time) => {
									setFormValues((previousValues) => ({
										...previousValues,
										time,
									}));
								}}
								disabled={isSaving}
								required
							/>
						</Col>
					</Row>
					<InputHelper
						className="mb-4"
						as="select"
						label="Contact Type"
						value={formValues.contactType}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								contactType: currentTarget.value as PatientOrderScheduledOutreachReasonId,
							}));
						}}
						required
					>
						<option value={PatientOrderScheduledOutreachReasonId.RESOURCE_FOLLOWUP}>
							Resource Follow-up
						</option>
						<option value={PatientOrderScheduledOutreachReasonId.OTHER}>Other</option>
					</InputHelper>
					<InputHelper
						as="textarea"
						label="Notes"
						value={formValues.notes}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								notes: currentTarget.value,
							}));
						}}
						disabled={isSaving}
						required
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<Button type="submit" variant="primary" disabled={isSaving}>
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
