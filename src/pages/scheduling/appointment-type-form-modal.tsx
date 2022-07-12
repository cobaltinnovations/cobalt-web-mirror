import { cloneDeep } from 'lodash';
import React, { useCallback, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientIntakeQuestion, SchedulingAppointmentType, IntakeScreeningQuestion } from '@/lib/models';
import { schedulingService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import Select from '@/components/select';
import { useCobaltTheme } from '@/jss/theme';

enum QUESTION_CONTENT_HINT_IDS {
	FIRST_NAME = 'FIRST_NAME',
	LAST_NAME = 'LAST_NAME',
	// EMAIL_ADDRESS = 'EMAIL_ADDRESS',
	PHONE_NUMBER = 'PHONE_NUMBER',
}

interface PatientIntakeCheckbox {
	label: string;
	question: string;
	fontSizeId: 'DEFAULT';
	questionContentHintId: QUESTION_CONTENT_HINT_IDS;
	disabled: boolean;
}

const PatientIntakeCheckboxes: Record<QUESTION_CONTENT_HINT_IDS, PatientIntakeCheckbox> = {
	[QUESTION_CONTENT_HINT_IDS.FIRST_NAME]: {
		label: 'First name',
		question: 'What is your first name?',
		fontSizeId: 'DEFAULT',
		questionContentHintId: QUESTION_CONTENT_HINT_IDS.FIRST_NAME,
		disabled: false,
	},
	[QUESTION_CONTENT_HINT_IDS.LAST_NAME]: {
		label: 'Last name',
		question: 'What is your last name?',
		fontSizeId: 'DEFAULT',
		questionContentHintId: QUESTION_CONTENT_HINT_IDS.LAST_NAME,
		disabled: false,
	},
	// [QUESTION_CONTENT_HINT_IDS.EMAIL_ADDRESS]: {
	// 	label: 'Email (Required by Cobalt)',
	// 	question: 'What is your email address?',
	// 	fontSizeId: 'DEFAULT',
	// 	questionContentHintId: QUESTION_CONTENT_HINT_IDS.EMAIL_ADDRESS,
	// 	disabled: true,
	// },
	[QUESTION_CONTENT_HINT_IDS.PHONE_NUMBER]: {
		label: 'Phone number',
		question: 'What is your phone number?',
		fontSizeId: 'DEFAULT',
		questionContentHintId: QUESTION_CONTENT_HINT_IDS.PHONE_NUMBER,
		disabled: false,
	},
};

const useModalStyles = createUseStyles({
	removeButton: {
		top: 0,
		right: 0,
		zIndex: 1,
		position: 'absolute',
		padding: '8px !important',
		transform: 'translate(40%, -40%)',
	},
});

type VisitType = 'INITIAL' | 'FOLLOWUP' | 'OTHER';
const VISIT_TYPE_IDS = [
	{
		visitTypeId: 'INITIAL' as VisitType,
		label: 'Initial Visit',
	},
	{
		visitTypeId: 'FOLLOWUP' as VisitType,
		label: 'Followup Visit',
	},
	{
		visitTypeId: 'OTHER' as VisitType,
		label: 'Other',
	},
];

interface AppointmentTypeFormModalProps extends ModalProps {
	appointmentTypeId?: string;
	onSave(appointmentType: SchedulingAppointmentType): void;
	onDelete(appointmentType: SchedulingAppointmentType): void;
}

export const AppointmentTypeFormModal = ({
	appointmentTypeId,
	onSave,
	onDelete,
	...modalProps
}: AppointmentTypeFormModalProps) => {
	const theme = useCobaltTheme();
	const { account } = useAccount();
	const classes = useModalStyles();
	const handleError = useHandleError();

	const [title, setTitle] = useState('');
	const [color, setColor] = useState(theme.colors.p500);
	const [duration, setDuration] = useState('');
	const [durationInMinutes, setDurationInMinutes] = useState<number>();
	const [visitTypeId, setVisitTypeId] = useState<VisitType>('INITIAL');
	const [patientIntakeQuestions, setPatientIntakeQuestions] = useState<PatientIntakeQuestion[]>([]);
	const [screeningQuestions, setScreeningQuestions] = useState<IntakeScreeningQuestion[]>([]);

	const handleOnEnter = useCallback(async () => {
		if (!appointmentTypeId) {
			return;
		}

		try {
			const { appointmentType } = await schedulingService.getAppointmentType(appointmentTypeId).fetch();

			setTitle(appointmentType.name);
			setColor(appointmentType.hexColor);

			if (
				appointmentType.durationInMinutes === 30 ||
				appointmentType.durationInMinutes === 45 ||
				appointmentType.durationInMinutes === 60
			) {
				setDuration(String(appointmentType.durationInMinutes));
				setDurationInMinutes(undefined);
			} else {
				setDuration('other');
				setDurationInMinutes(appointmentType.durationInMinutes);
			}

			setPatientIntakeQuestions(appointmentType.patientIntakeQuestions);
			setScreeningQuestions(appointmentType.screeningQuestions);
		} catch (error) {
			handleError(error);
		}
	}, [appointmentTypeId, handleError]);

	const handleOnExited = useCallback(() => {
		setTitle('');
		setColor(theme.colors.p500);
		setDuration('');
		setDurationInMinutes(undefined);
		setPatientIntakeQuestions([]);
		setScreeningQuestions([]);
	}, [theme.colors.p500]);

	const handleSaveButtonClick = useCallback(async () => {
		try {
			if (!account || !account.providerId) {
				throw new Error('account.providerId is undeinfed');
			}

			const requestBody = {
				providerId: account.providerId,
				name: title,
				description: title,
				schedulingSystemId: 'COBALT',
				visitTypeId,
				durationInMinutes: duration === 'other' ? durationInMinutes || 0 : parseInt(duration, 10),
				hexColor: color,
				patientIntakeQuestions,
				screeningQuestions,
			};
			let response;

			if (appointmentTypeId) {
				response = await schedulingService.updateAppointmentType(appointmentTypeId, requestBody).fetch();
			} else {
				response = await schedulingService.postAppointmentType(requestBody).fetch();
			}

			onSave(response.appointmentType);
		} catch (error) {
			handleError(error);
		}
	}, [
		account,
		appointmentTypeId,
		color,
		duration,
		durationInMinutes,
		handleError,
		onSave,
		patientIntakeQuestions,
		screeningQuestions,
		title,
		visitTypeId,
	]);

	const handleDeleteButtonClick = useCallback(async () => {
		if (!window.confirm('Are you sure you want to delete this appointment type?')) {
			return;
		}

		try {
			if (!appointmentTypeId) {
				throw new Error('appointmentTypeId is undefined');
			}

			const response = await schedulingService.deleteAppointmentType(appointmentTypeId).fetch();

			onDelete(response.appointmentType);
		} catch (error) {
			handleError(error);
		}
	}, [appointmentTypeId, handleError, onDelete]);

	return (
		<Modal centered size="lg" onEnter={handleOnEnter} onExited={handleOnExited} {...modalProps}>
			<Modal.Header closeButton>
				<Modal.Title>{appointmentTypeId ? 'Edit appointment type' : 'New appointment type'}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<h3 className="mb-4">Setup</h3>

				<InputHelper
					className="mb-4"
					type="text"
					label="Title (how this appears to clients)"
					value={title}
					onChange={({ currentTarget }) => {
						setTitle(currentTarget.value);
					}}
					required
				/>

				<Form.Group className="mb-5">
					<Form.Label className="d-block" style={{ ...theme.fonts.default }}>
						Color:
					</Form.Label>
					<input
						type="color"
						value={color}
						onChange={({ currentTarget }) => {
							setColor(currentTarget.value);
						}}
					/>
				</Form.Group>

				<Form.Group className="mb-5">
					<Form.Label style={{ ...theme.fonts.default }}>Visit Type:</Form.Label>
					<InputHelper
						label="Visit Type"
						value={visitTypeId}
						as="select"
						onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
							setVisitTypeId(event.target.value as VisitType)
						}
					>
						{VISIT_TYPE_IDS.map((visitTypeOption) => {
							return (
								<option key={visitTypeOption.visitTypeId} value={visitTypeOption.visitTypeId}>
									{visitTypeOption.label}
								</option>
							);
						})}
					</InputHelper>
				</Form.Group>

				<Form.Group className="mb-5">
					<Form.Label className="m-0" style={{ ...theme.fonts.default }}>
						Duration:
					</Form.Label>
					<div className="d-flex align-items-center">
						<Form.Check
							className="me-6"
							id="duration-30"
							type="radio"
							name="duration"
							label="30m"
							checked={duration === '30'}
							onChange={() => {
								setDuration('30');
							}}
						/>
						<Form.Check
							className="me-6"
							id="duration-45"
							type="radio"
							name="duration"
							label="45m"
							checked={duration === '45'}
							onChange={() => {
								setDuration('45');
							}}
						/>
						<Form.Check
							className="me-6"
							id="duration-60"
							type="radio"
							name="duration"
							label="60m"
							checked={duration === '60'}
							onChange={() => {
								setDuration('60');
							}}
						/>
						<Form.Check
							className="me-6"
							id="duration-other"
							type="radio"
							name="duration"
							label={
								<InputHelper
									type="number"
									label="other (minutes)"
									value={durationInMinutes}
									onChange={({ currentTarget }) => {
										setDurationInMinutes(parseInt(currentTarget.value, 10));
									}}
								/>
							}
							checked={duration === 'other'}
							onChange={() => {
								setDuration('other');
							}}
						/>
					</div>
				</Form.Group>

				<h3 className="mb-4">Client Information</h3>

				<Form.Group className="mb-5">
					<Form.Label style={{ ...theme.fonts.default }}>Collect:</Form.Label>
					<div className="d-flex align-items-center">
						{Object.values(PatientIntakeCheckboxes).map(
							({ label, question, fontSizeId, questionContentHintId, disabled }) => {
								const isChecked = !!(patientIntakeQuestions || []).find(
									(patientIntakeQuestion) =>
										patientIntakeQuestion.questionContentHintId === questionContentHintId
								);

								return (
									<Form.Check
										id={`collect-${questionContentHintId}`}
										key={questionContentHintId}
										type="checkbox"
										name={`collect-${questionContentHintId}`}
										className="me-6"
										label={label}
										checked={isChecked}
										disabled={disabled}
										onChange={({ currentTarget }) => {
											const patientIntakeQuestionsClone = cloneDeep(patientIntakeQuestions || []);

											if (currentTarget.checked) {
												patientIntakeQuestionsClone.push({
													question,
													fontSizeId,
													questionContentHintId,
												});
											} else {
												const indexToRemove = patientIntakeQuestionsClone.findIndex(
													(patientIntakeQuestion) =>
														patientIntakeQuestion.questionContentHintId ===
														questionContentHintId
												);
												patientIntakeQuestionsClone.splice(indexToRemove, 1);
											}

											setPatientIntakeQuestions(patientIntakeQuestionsClone);
										}}
									/>
								);
							}
						)}
					</div>
				</Form.Group>

				<h3 className="mb-4">Screening Questions</h3>

				{(screeningQuestions || []).map((screeningQuestion, index) => {
					return (
						<div key={index} className="position-relative">
							<Button
								size="sm"
								className={classes.removeButton}
								variant="danger"
								onClick={() => {
									const screeningQuestionsClone = cloneDeep(screeningQuestions || []);
									screeningQuestionsClone.splice(index, 1);

									setScreeningQuestions(screeningQuestionsClone);
								}}
							>
								<CloseIcon height={24} width={24} />
							</Button>
							<InputHelper
								className="mb-3"
								label={`Screening Question #${index + 1}`}
								name="screeningQuestion"
								value={screeningQuestion.question}
								as="textarea"
								onChange={(event) => {
									const screeningQuestionsClone = cloneDeep(screeningQuestions || []);
									screeningQuestionsClone[index].question = event.currentTarget.value;

									setScreeningQuestions(screeningQuestionsClone);
								}}
								helperText="An attendee must first answer “Yes” to this question before being allowed to reserve a seat."
							/>
							<div className="mb-5">
								<Form.Check
									id={`screening-question-toggle--${index}`}
									label="Reduce text size"
									value="SMALL"
									checked={screeningQuestion.fontSizeId === 'SMALL'}
									onChange={(event) => {
										const screeningQuestionsClone = cloneDeep(screeningQuestions || []);

										if (event.currentTarget.checked) {
											screeningQuestionsClone[index].fontSizeId = 'SMALL';
										} else {
											screeningQuestionsClone[index].fontSizeId = 'DEFAULT';
										}

										setScreeningQuestions(screeningQuestionsClone);
									}}
								/>
							</div>
						</div>
					);
				})}
				<div className="text-end">
					<Button
						size="sm"
						onClick={() => {
							const screeningQuestionsClone = cloneDeep(screeningQuestions || []);
							screeningQuestionsClone.push({
								fontSizeId: 'DEFAULT',
								question: '',
							});

							setScreeningQuestions(screeningQuestionsClone);
						}}
					>
						add question
					</Button>
				</div>
			</Modal.Body>

			<Modal.Footer>
				<div className="d-flex align-items-center justify-content-between">
					<div>
						{appointmentTypeId && (
							<Button variant="link" className="text-danger" onClick={handleDeleteButtonClick}>
								delete
							</Button>
						)}
					</div>
					<div>
						<Button
							variant="outline-primary"
							onClick={() => {
								if (modalProps?.onHide) {
									modalProps.onHide();
								}
							}}
						>
							cancel
						</Button>
						<Button className="ms-2" variant="outline" onClick={handleSaveButtonClick}>
							save
						</Button>
					</div>
				</div>
			</Modal.Footer>
		</Modal>
	);
};
