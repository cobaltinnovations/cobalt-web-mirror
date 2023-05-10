import moment from 'moment';
import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseStyles } from 'react-jss';

import { PatientOrderModel, PatientOrderResourcingStatusId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import DatePicker from '@/components/date-picker';
import TimeInputV2 from '@/components/time-input-v2';
import InputHelper from '@/components/input-helper';
import useAccount from '@/hooks/use-account';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
	flex1: {
		flex: 1,
	},
});

interface Props extends ModalProps {
	patientOrder: PatientOrderModel;
	onSave(patientOrder: PatientOrderModel): void;
}

export const MhicResourcesModal: FC<Props> = ({ patientOrder, onSave, ...props }) => {
	const classes = useStyles();
	const { institution } = useAccount();
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const [isSaving, setIsSaving] = useState(false);
	const [formValues, setFormValues] = useState({
		date: undefined as Date | undefined,
		time: '',
		comment: '',
	});

	const handleOnEntering = useCallback(() => {
		setFormValues({
			date: new Date(),
			time: moment().format('h:mm A'),
			comment: '',
		});
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				setIsSaving(true);

				const response = await integratedCareService
					.updateResourcingStatus(patientOrder.patientOrderId, {
						patientOrderResourcingStatusId: PatientOrderResourcingStatusId.SENT_RESOURCES,
						resourcesSentAtDate: moment(formValues.date).format('YYYY-MM-DD'),
						resourcesSentAtTime: formValues.time,
						resourcesSentNote: formValues.comment,
					})
					.fetch();

				addFlag({
					variant: 'success',
					title: 'Resources marked as sent',
					actions: [],
				});

				onSave(response.patientOrder);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[
			addFlag,
			formValues.comment,
			formValues.date,
			formValues.time,
			handleError,
			onSave,
			patientOrder.patientOrderId,
		]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEntering={handleOnEntering}>
			<Modal.Header closeButton>
				<Modal.Title>Mark Resources as Sent</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<p className="mb-4 fw-semibold">
						Confirm resources have been sent through {institution?.myChartName ?? 'MyChart'}
					</p>
					<p className="mb-4">
						A check-in message will be scheduled automatically based on the date the resources were marked
						as sent.
					</p>
					<div className="mb-4 d-flex align-items-start">
						<div className={classNames(classes.flex1, 'me-2')}>
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
						</div>
						<div className={classNames(classes.flex1, 'ms-2')}>
							<TimeInputV2
								date={formValues.date}
								id="outreact-modal__time-input"
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
						</div>
					</div>
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
						Mark as Sent
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
