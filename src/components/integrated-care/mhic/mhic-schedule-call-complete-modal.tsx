import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Form, Modal, ModalProps, Row } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientOrderModel, PatientOrderScheduledOutreach } from '@/lib/models';
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

export const MhicScheduleCallCompleteModal = ({
	patientOrderScheduledOutreach,
	patientOrder,
	onSave,
	...props
}: Props) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { addFlag } = useFlags();

	const [formValues, setFormValues] = useState({
		date: undefined as Date | undefined,
		time: '',
		callResult: '',
		comment: '',
	});
	const [isSaving, setIsSaving] = useState(false);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				if (!patientOrder) {
					throw new Error('patientOrder is undefined.');
				}

				if (!patientOrderScheduledOutreach) {
					throw new Error('patientOrderScheduledOutreach is undefined.');
				}

				setIsSaving(true);

				await integratedCareService
					.completeScheduledOutreaach(patientOrderScheduledOutreach.patientOrderScheduledOutreachId, {
						patientOrderOutreachResultId: formValues.callResult,
						completedAtDate: moment(formValues.date).format(DateFormats.API.Date),
						completedAtTime: moment(formValues.time, DateFormats.UI.TimeSlotInput).format(
							DateFormats.API.Time
						),
						message: formValues.comment,
					})
					.fetch();

				const patientOrderResponse = await integratedCareService
					.getPatientOrder(patientOrder.patientOrderId)
					.fetch();

				addFlag({
					variant: 'success',
					title: 'Phone call completed',
					description: "This call was completed and logged in the patient's contact history.",
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
			formValues.callResult,
			formValues.comment,
			formValues.date,
			formValues.time,
			handleError,
			onSave,
			patientOrder,
			patientOrderScheduledOutreach,
		]
	);

	useEffect(() => {
		if (props.show) {
			setFormValues({
				date: undefined as Date | undefined,
				time: '',
				callResult: '',
				comment: '',
			});
		}
	}, [props.show]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Complete Phone Call</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<p className="mb-0">
						<strong>Enter the details of your call to confirm it was completed</strong>
					</p>
					<p className="mb-4">The call details will be logged in the patient's contact history.</p>
					<Row className="mb-4">
						<Col>
							<DatePicker
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
						label="Select Call Result"
						value={formValues.callResult}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								callResult: currentTarget.value,
							}));
						}}
						required
					>
						<option value="">TODO: Options</option>
					</InputHelper>
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
					<Button type="submit" variant="primary" disabled={isSaving}>
						Confirm
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
