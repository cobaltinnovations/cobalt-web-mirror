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

	const messageTypes = useMemo(
		() => [
			{
				patientOrderScheduledMessageTypeId: PATIENT_ORDER_SCHEDULED_MESSAGE_TYPE_IDS.WELCOME,
				title: 'Welcome',
				disabled:
					patientOrder.patientOrderScheduledMessageGroups.filter(
						(mg) =>
							!mg.scheduledAtDateTimeHasPassed &&
							mg.patientOrderScheduledMessageTypeId === PATIENT_ORDER_SCHEDULED_MESSAGE_TYPE_IDS.WELCOME
					).length > 0,
			},
			{
				patientOrderScheduledMessageTypeId: PATIENT_ORDER_SCHEDULED_MESSAGE_TYPE_IDS.RESOURCE_CHECK_IN,
				title: 'Check-in',
				disabled:
					patientOrder.patientOrderScheduledMessageGroups.filter(
						(mg) =>
							!mg.scheduledAtDateTimeHasPassed &&
							mg.patientOrderScheduledMessageTypeId ===
								PATIENT_ORDER_SCHEDULED_MESSAGE_TYPE_IDS.RESOURCE_CHECK_IN
					).length > 0,
			},
		],
		[patientOrder.patientOrderScheduledMessageGroups]
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
			messageType: '',
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

				let response;
				if (messageToEdit) {
					response = await integratedCareService
						.updateMessage(messageToEdit.patientOrderScheduledMessageGroupId, {
							patientOrderScheduledMessageTypeId: formValues.messageType,
							messageTypeIds: formValues.contactMethods,
							scheduledAtDate: moment(formValues.date).format('YYYY-MM-DD'),
							scheduledAtTime: formValues.time,
						})
						.fetch();
				} else {
					response = await integratedCareService
						.sendMessage({
							patientOrderId: patientOrder.patientOrderId,
							patientOrderScheduledMessageTypeId: formValues.messageType,
							messageTypeIds: formValues.contactMethods,
							scheduledAtDate: moment(formValues.date).format('YYYY-MM-DD'),
							scheduledAtTime: formValues.time,
						})
						.fetch();
				}

				addFlag({
					variant: 'success',
					title: `${response.patientOrderScheduledMessageGroup.patientOrderScheduledMessageTypeDescription} message scheduled`,
					description: `A ${response.patientOrderScheduledMessageGroup.patientOrderScheduledMessageTypeDescription} message is scheduled for ${response.patientOrderScheduledMessageGroup.scheduledAtDateTimeDescription}`,
					actions: [],
				});

				onSave(response.patientOrderScheduledMessageGroup);
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

	const handleUndoButtonClick = useCallback(
		async (patientOrderScheduledMessageGroup: PatientOrderScheduledMessageGroup) => {
			const response = await integratedCareService
				.sendMessage({
					patientOrderId: patientOrder.patientOrderId,
					patientOrderScheduledMessageTypeId:
						patientOrderScheduledMessageGroup.patientOrderScheduledMessageTypeId,
					messageTypeIds: patientOrderScheduledMessageGroup.patientOrderScheduledMessages.map(
						(m) => m.messageTypeId
					),
					scheduledAtDate: patientOrderScheduledMessageGroup.scheduledAtDate,
					scheduledAtTime: moment(patientOrderScheduledMessageGroup.scheduledAtTime, 'HH:mm').format(
						'h:mm A'
					),
				})
				.fetch();

			addFlag({
				variant: 'success',
				title: `${response.patientOrderScheduledMessageGroup.patientOrderScheduledMessageTypeDescription} message scheduled`,
				description: `A ${response.patientOrderScheduledMessageGroup.patientOrderScheduledMessageTypeDescription} message is scheduled for ${response.patientOrderScheduledMessageGroup.scheduledAtDateTimeDescription}`,
				actions: [],
			});

			onSave(response.patientOrderScheduledMessageGroup);
		},
		[addFlag, onSave, patientOrder.patientOrderId]
	);

	const handleDeleteButtonClick = useCallback(async () => {
		if (!window.confirm('Are you sure you want to delete the scheduled message?')) {
			return;
		}

		try {
			setIsSaving(true);

			if (!messageToEdit) {
				throw new Error('Cannot delete message.');
			}

			await integratedCareService.deleteMessage(messageToEdit.patientOrderScheduledMessageGroupId).fetch();

			addFlag({
				variant: 'success',
				title: `${messageToEdit.patientOrderScheduledMessageTypeDescription} message deleted`,
				actions: [
					{
						title: 'Undo',
						onClick: () => {
							handleUndoButtonClick(messageToEdit);
						},
					},
				],
			});

			onSave(messageToEdit);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	}, [addFlag, handleError, handleUndoButtonClick, messageToEdit, onSave]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEntering={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>{messageToEdit ? 'Edit Scheduled Message' : 'Schedule Message'}</Modal.Title>
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
						<option value="" disabled>
							Select...
						</option>
						{messageTypes.map((messageType) => (
							<option
								key={messageType.patientOrderScheduledMessageTypeId}
								value={messageType.patientOrderScheduledMessageTypeId}
								disabled={messageType.disabled}
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
							<Button variant="danger" onClick={handleDeleteButtonClick} disabled={isSaving}>
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
