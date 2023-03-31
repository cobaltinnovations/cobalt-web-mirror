import moment from 'moment';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import useHandleError from '@/hooks/use-handle-error';
import DatePicker from '@/components/date-picker';
import TimeInputV2 from '@/components/time-input-v2';
import InputHelper from '@/components/input-helper';
import classNames from 'classnames';
import { integratedCareService } from '@/lib/services';
import { PatientOrderModel, PatientOrderScheduledMessageGroup } from '@/lib/models';
import useFlags from '@/hooks/use-flags';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 470,
	},
	flex1: {
		flex: 1,
	},
});

enum PATIENT_ORDER_SCHEDULED_MESSAGE_TYPE_IDS {
	WELCOME = 'WELCOME',
	RESOURCE_CHECK_IN = 'RESOURCE_CHECK_IN',
}

enum CONTACT_METHOD_IDS {
	EMAIL = 'EMAIL',
	SMS = 'SMS',
}

const messageTypes = [
	{
		patientOrderScheduledMessageTypeId: PATIENT_ORDER_SCHEDULED_MESSAGE_TYPE_IDS.WELCOME,
		title: 'Welcome',
	},
	{
		patientOrderScheduledMessageTypeId: PATIENT_ORDER_SCHEDULED_MESSAGE_TYPE_IDS.RESOURCE_CHECK_IN,
		title: 'Check-in',
	},
];

interface Props extends ModalProps {
	patientOrder: PatientOrderModel;
	messageToEdit?: PatientOrderScheduledMessageGroup;
	onSave(patientOrderScheduledMessageGroup: PatientOrderScheduledMessageGroup): void;
}

export const MhicMessageModal: FC<Props> = ({ patientOrder, messageToEdit, onSave, ...props }) => {
	const classes = useStyles();
	const { addFlag } = useFlags();
	const handleError = useHandleError();

	const contactMethods = useMemo(
		() => [
			{
				contactMethodId: CONTACT_METHOD_IDS.EMAIL,
				title: 'Email',
				disabled: !patientOrder.patientEmailAddress,
			},
			{
				contactMethodId: CONTACT_METHOD_IDS.SMS,
				title: 'Text (SMS)',
				disabled: !patientOrder.patientPhoneNumber,
			},
		],
		[patientOrder.patientEmailAddress, patientOrder.patientPhoneNumber]
	);
	const [formValues, setFormValues] = useState({
		messageType: '',
		date: undefined as Date | undefined,
		time: '',
		contactMethods: [] as string[],
	});
	const [isSaving, setIsSaving] = useState(false);

	const handleOnEnter = useCallback(() => {
		if (messageToEdit) {
			setFormValues({
				messageType: messageToEdit.patientOrderScheduledMessageTypeId,
				date: moment(messageToEdit.scheduledAtDate, 'YYYY-MM-DD').toDate(),
				time: moment(messageToEdit.scheduledAtTime, 'HH:mm').format('h:mm A'),
				contactMethods: messageToEdit.patientOrderScheduledMessages.map((m) => m.messageTypeId),
			});
			return;
		}

		setFormValues({
			messageType: PATIENT_ORDER_SCHEDULED_MESSAGE_TYPE_IDS.WELCOME,
			date: new Date(),
			time: moment().format('h:mm A'),
			contactMethods: [],
		});
	}, [messageToEdit]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			try {
				setIsSaving(true);

				if (messageToEdit) {
					window.alert('[TODO]: Save edit message');
				} else {
					const response = await integratedCareService
						.sendMessage({
							patientOrderId: patientOrder.patientOrderId,
							patientOrderScheduledMessageTypeId: formValues.messageType,
							messageTypeIds: formValues.contactMethods,
							scheduledAtDate: moment(formValues.date).format('YYYY-MM-DD'),
							scheduledAtTime: formValues.time,
						})
						.fetch();

					addFlag({
						variant: 'success',
						title: `${response.patientOrderScheduledMessageGroup.patientOrderScheduledMessageTypeDescription} message scheduled`,
						description: `A ${response.patientOrderScheduledMessageGroup.patientOrderScheduledMessageTypeDescription} message is scheduled for ${response.patientOrderScheduledMessageGroup.scheduledAtDateTimeDescription}`,
						actions: [],
					});

					onSave(response.patientOrderScheduledMessageGroup);
				}
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[
			addFlag,
			formValues.contactMethods,
			formValues.date,
			formValues.messageType,
			formValues.time,
			handleError,
			messageToEdit,
			onSave,
			patientOrder.patientOrderId,
		]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>{messageToEdit ? 'Edit Scheduled Message' : 'Send Message'}</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
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
						className="mb-4"
						as="select"
						label="Message Type"
						value={formValues.messageType}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								messageType: currentTarget.value,
							}));
						}}
						required
						disabled={!!messageToEdit}
					>
						{messageTypes.map((messageType) => (
							<option
								key={messageType.patientOrderScheduledMessageTypeId}
								value={messageType.patientOrderScheduledMessageTypeId}
							>
								{messageType.title}
							</option>
						))}
					</InputHelper>
					<Form.Group>
						<Form.Label className="mb-1">Contact Method:</Form.Label>
						{contactMethods.map((contactMethod) => (
							<Form.Check
								key={contactMethod.contactMethodId}
								name="contact-method"
								id={`contact-method--${contactMethod.contactMethodId}`}
								label={contactMethod.title}
								value={contactMethod.contactMethodId}
								checked={formValues.contactMethods.includes(contactMethod.contactMethodId)}
								onChange={({ currentTarget }) => {
									setFormValues((previousValues) => {
										const targetIndex = previousValues.contactMethods.indexOf(currentTarget.value);

										if (targetIndex > -1) {
											previousValues.contactMethods.splice(targetIndex, 1);
										} else {
											previousValues.contactMethods.push(currentTarget.value);
										}

										return {
											...previousValues,
										};
									});
								}}
								disabled={isSaving || contactMethod.disabled}
							/>
						))}
					</Form.Group>
				</Modal.Body>
				<Modal.Footer className="d-flex align-items-center justify-content-between">
					<div>
						{messageToEdit && (
							<Button
								variant="danger"
								onClick={() => {
									window.alert('[TODO]: Delete the message');
								}}
								disabled={isSaving}
							>
								Delete
							</Button>
						)}
					</div>
					<div className="d-flex align-items-center">
						<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
							Cancel
						</Button>
						<Button
							variant="primary"
							type="submit"
							disabled={
								isSaving ||
								!formValues.messageType ||
								!formValues.date ||
								!formValues.time ||
								formValues.contactMethods.length <= 0
							}
						>
							Save
						</Button>
					</div>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
