import classNames from 'classnames';
import moment from 'moment';
import React, { useCallback, useRef, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import ReactQuill from 'react-quill';

import ConfirmDialog from '@/components/confirm-dialog';
import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import LoadingButton from '@/components/loading-button';
import TimeInputV2 from '@/components/time-input-v2';
import WysiwygBasic, { WysiwygDisplay, wysiwygIsValid } from '@/components/wysiwyg-basic';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import {
	CareEncounterScheduledMessageModel,
	CareEncounterScheduledMessageTypeId,
	CareEncounterScheduledMessageTypeModel,
} from '@/lib/models';
import {
	CareEncounterScheduledMessageRequestBody,
	CareEncounterScheduledMessagePreviewModel,
	careEncounterService,
} from '@/lib/services';

const useStyles = createUseThemedStyles((theme) => ({
	modal: {
		maxWidth: 680,
	},
	field: {
		flex: 1,
	},
	divider: {
		borderTop: `1px solid ${theme.colors.border}`,
	},
	preview: {
		overflowX: 'auto',
		'& p, & div': {
			marginBottom: 20,
		},
	},
}));

interface Props extends ModalProps {
	careEncounterId: string;
	messageToEdit?: CareEncounterScheduledMessageModel;
	onChanged(): Promise<void> | void;
}

interface FormValues {
	date?: Date;
	time: string;
	messageTypeId?: CareEncounterScheduledMessageTypeId;
	customEmailText: string;
}

type ModalPage = 'form' | 'preview';

const createDefaultFormValues = (): FormValues => ({
	date: new Date(),
	time: moment().format('h:mm A'),
	messageTypeId: undefined,
	customEmailText: '',
});

const formValuesForMessage = (message: CareEncounterScheduledMessageModel): FormValues => ({
	date: moment(message.scheduledAtDate, 'YYYY-MM-DD').toDate(),
	time: moment(message.scheduledAtTime, ['HH:mm:ss', 'HH:mm'], true).format('h:mm A'),
	messageTypeId: message.careEncounterScheduledMessageTypeId,
	customEmailText: message.customEmailText,
});

export const CareEncounterMessageModal = ({ careEncounterId, messageToEdit, onChanged, onHide, ...props }: Props) => {
	const classes = useStyles();
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const editorRef = useRef<ReactQuill>(null);
	const [messageTypes, setMessageTypes] = useState<CareEncounterScheduledMessageTypeModel[]>([]);
	const [formValues, setFormValues] = useState<FormValues>(createDefaultFormValues);
	const [page, setPage] = useState<ModalPage>('form');
	const [preview, setPreview] = useState<CareEncounterScheduledMessagePreviewModel>();
	const [validationMessage, setValidationMessage] = useState('');
	const [isLoadingTypes, setIsLoadingTypes] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

	const reset = useCallback(() => {
		setFormValues(messageToEdit ? formValuesForMessage(messageToEdit) : createDefaultFormValues());
		setPage('form');
		setPreview(undefined);
		setValidationMessage('');
		setShowDeleteConfirmation(false);
	}, [messageToEdit]);

	const loadMessageTypes = useCallback(async () => {
		setIsLoadingTypes(true);

		try {
			const response = await careEncounterService.getCareEncounterScheduledMessageTypes().fetch();
			setMessageTypes(response.careEncounterScheduledMessageTypes);
			setFormValues((current) => ({
				...current,
				messageTypeId:
					current.messageTypeId ??
					response.careEncounterScheduledMessageTypes[0]?.careEncounterScheduledMessageTypeId,
			}));
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoadingTypes(false);
		}
	}, [handleError]);

	const handleEntering = useCallback(() => {
		reset();
		void loadMessageTypes();
	}, [loadMessageTypes, reset]);

	const requestBody = useCallback((): CareEncounterScheduledMessageRequestBody | undefined => {
		setValidationMessage('');

		if (!formValues.date || !formValues.time || !formValues.messageTypeId) {
			setValidationMessage('Date, time, and message type are required.');
			return undefined;
		}

		const customEmailText = formValues.customEmailText
			.replace(/<[^>]*>/g, '')
			.replace(/&nbsp;/g, ' ')
			.trim();

		if (!customEmailText) {
			wysiwygIsValid(editorRef, { shouldFocus: true, shouldScroll: true });
			setValidationMessage('Custom email text is required.');
			return undefined;
		}

		const scheduledAt = moment(
			`${moment(formValues.date).format('YYYY-MM-DD')} ${formValues.time}`,
			'YYYY-MM-DD h:mm A',
			true
		);

		if (!scheduledAt.isValid()) {
			setValidationMessage('Enter a valid scheduled time.');
			return undefined;
		}

		return {
			careEncounterScheduledMessageTypeId: formValues.messageTypeId,
			scheduledAtDate: scheduledAt.format('YYYY-MM-DD'),
			scheduledAtTime: scheduledAt.format('HH:mm:ss'),
			customEmailText: formValues.customEmailText,
		};
	}, [formValues]);

	const handlePreview = useCallback(async () => {
		const data = requestBody();

		if (!data) {
			return;
		}

		setIsSaving(true);

		try {
			const response = await careEncounterService
				.previewCareEncounterScheduledMessage(careEncounterId, {
					careEncounterScheduledMessageTypeId: data.careEncounterScheduledMessageTypeId,
					customEmailText: data.customEmailText,
				})
				.fetch();
			setPreview(response.careEncounterScheduledMessagePreview);
			setPage('preview');
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	}, [careEncounterId, handleError, requestBody]);

	const handleSave = useCallback(async () => {
		const data = requestBody();

		if (!data) {
			return;
		}

		setIsSaving(true);

		try {
			const response = messageToEdit
				? await careEncounterService
						.updateCareEncounterScheduledMessage(
							careEncounterId,
							messageToEdit.careEncounterScheduledMessageId,
							data
						)
						.fetch()
				: await careEncounterService.createCareEncounterScheduledMessage(careEncounterId, data).fetch();

			onHide?.();
			addFlag({
				variant: 'success',
				title: messageToEdit ? 'Message Updated' : 'Message Scheduled',
				description: `Message is scheduled for ${response.careEncounterScheduledMessage.scheduledAtDescription}.`,
				actions: [],
			});
			await onChanged();
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	}, [addFlag, careEncounterId, handleError, messageToEdit, onChanged, onHide, requestBody]);

	const handleDelete = useCallback(async () => {
		if (!messageToEdit) {
			return;
		}

		setIsSaving(true);

		try {
			await careEncounterService
				.deleteCareEncounterScheduledMessage(careEncounterId, messageToEdit.careEncounterScheduledMessageId)
				.fetch();
			setShowDeleteConfirmation(false);
			onHide?.();
			addFlag({ variant: 'success', title: 'Message Deleted', actions: [] });
			await onChanged();
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	}, [addFlag, careEncounterId, handleError, messageToEdit, onChanged, onHide]);

	return (
		<>
			<Modal {...props} onHide={onHide} dialogClassName={classes.modal} centered onEntering={handleEntering}>
				<Modal.Header closeButton>
					<Modal.Title>
						{messageToEdit
							? 'Edit Schedule Message'
							: page === 'preview'
							? 'Preview Email'
							: 'Schedule Message'}
					</Modal.Title>
				</Modal.Header>

				{page === 'preview' && preview && !messageToEdit ? (
					<>
						<Modal.Body>
							<p className="mb-6 fw-bold fs-large">
								Below is the text that will be included in your follow-up message. Please review your
								email text before sending.
							</p>
							<WysiwygDisplay html={preview.emailBody} className={classes.preview} />
						</Modal.Body>
						<Modal.Footer className="d-flex justify-content-between">
							<Button
								variant="outline-primary"
								onClick={() => {
									setPage('form');
								}}
								disabled={isSaving}
							>
								Previous
							</Button>
							<LoadingButton isLoading={isSaving} onClick={handleSave}>
								Schedule Message
							</LoadingButton>
						</Modal.Footer>
					</>
				) : (
					<Form
						onSubmit={(event) => {
							event.preventDefault();
							void (messageToEdit ? handleSave() : handlePreview());
						}}
					>
						<Modal.Body>
							<div className="mb-4 d-flex align-items-start">
								<div className={classNames(classes.field, 'me-2')}>
									<DatePicker
										labelText="Date"
										selected={formValues.date}
										onChange={(date) => {
											setFormValues((current) => ({ ...current, date: date ?? undefined }));
										}}
										disabled={isSaving}
										required
									/>
								</div>
								<div className={classNames(classes.field, 'ms-2')}>
									<TimeInputV2
										id="care-encounter-message-time"
										label="Time"
										date={formValues.date}
										value={formValues.time}
										onChange={(time) => {
											setFormValues((current) => ({ ...current, time }));
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
								value={formValues.messageTypeId ?? ''}
								onChange={({ currentTarget }) => {
									setFormValues((current) => ({
										...current,
										messageTypeId: currentTarget.value as CareEncounterScheduledMessageTypeId,
									}));
								}}
								disabled={isSaving || isLoadingTypes}
								required
							>
								<option value="" disabled>
									Select...
								</option>
								{messageTypes.map((messageType) => (
									<option
										key={messageType.careEncounterScheduledMessageTypeId}
										value={messageType.careEncounterScheduledMessageTypeId}
									>
										{messageType.description}
									</option>
								))}
							</InputHelper>

							{messageToEdit && (
								<Form.Group className="mb-6">
									<Form.Label>Contact method:</Form.Label>
									<Form.Check
										id="care-encounter-message-email"
										label="Email"
										checked
										readOnly
										disabled
									/>
								</Form.Group>
							)}

							<hr className="mb-6" />

							<div>
								<Form.Label className="mb-4">Custom email text</Form.Label>
								<WysiwygBasic
									ref={editorRef}
									value={formValues.customEmailText}
									onChange={(customEmailText) => {
										setFormValues((current) => ({ ...current, customEmailText }));
									}}
									disabled={isSaving}
									height={320}
									toolbarPreset="care-encounter-message"
								/>
							</div>

							{validationMessage && (
								<p className="mb-0 mt-3 text-danger" role="alert">
									{validationMessage}
								</p>
							)}
						</Modal.Body>
						<Modal.Footer className="d-flex justify-content-between">
							<div>
								{messageToEdit && (
									<Button
										variant="danger"
										onClick={() => {
											setShowDeleteConfirmation(true);
										}}
										disabled={isSaving}
									>
										Delete
									</Button>
								)}
							</div>
							<div>
								<Button variant="outline-primary" className="me-2" onClick={onHide} disabled={isSaving}>
									Cancel
								</Button>
								<LoadingButton type="submit" isLoading={isSaving} disabled={isLoadingTypes}>
									{messageToEdit ? 'Save' : 'Next: Preview'}
								</LoadingButton>
							</div>
						</Modal.Footer>
					</Form>
				)}
			</Modal>

			<ConfirmDialog
				show={showDeleteConfirmation}
				onHide={() => {
					setShowDeleteConfirmation(false);
				}}
				titleText="Delete Scheduled Message"
				bodyText="Are you sure you want to delete this scheduled message?"
				dismissText="Cancel"
				confirmText="Delete"
				destructive
				isConfirming={isSaving}
				onConfirm={handleDelete}
			/>
		</>
	);
};
