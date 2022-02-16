import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientIntakeQuestion, SchedulingAppointmentType, ScreeningQuestion } from '@/lib/models';
import { schedulingService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';

import colors from '@/jss/colors';
import fonts from '@/jss/fonts';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';

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

interface AppointmentTypeFormModalProps extends ModalProps {
	appointmentTypeId?: string;
	onSave(appointmentType: SchedulingAppointmentType): void;
}

export const AppointmentTypeFormModal = ({
	appointmentTypeId,
	onSave,
	...modalProps
}: AppointmentTypeFormModalProps) => {
	const classes = useModalStyles();
	const handleError = useHandleError();

	const [title, setTitle] = useState('');
	const [color, setColor] = useState(colors.primary);
	const [nickname, setNickname] = useState('');
	const [duration, setDuration] = useState('');
	const [durationInMinutes, setDurationInMinutes] = useState<number>();
	const [patientIntakeQuestions, setPatientIntakeQuestions] = useState<PatientIntakeQuestion[]>([
		{
			question: 'What is your email address?',
			fontSizeId: 'DEFAULT',
			questionContentHintId: 'EMAIL_ADDRESS',
		},
	]);
	const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([]);

	useEffect(() => {
		// TODO: Fetch by ID, or is it passed down from parent?
	}, []);

	const handleSaveButtonClick = useCallback(async () => {
		modalProps.onHide();

		try {
			const response = await schedulingService
				.postApointmentType({
					name: title,
					description: nickname,
					schedulingSystemId: 'COBALT',
					visitTypeId: 'INITIAL',
					durationInMinutes: duration === 'other' ? durationInMinutes || 0 : parseInt(duration, 10),
					hexColor: color,
					patientIntakeQuestions,
					screeningQuestions,
				})
				.fetch();

			onSave(response.appointmentType);
		} catch (error) {
			handleError(error);
		}
	}, [
		color,
		duration,
		durationInMinutes,
		handleError,
		modalProps,
		nickname,
		onSave,
		patientIntakeQuestions,
		screeningQuestions,
		title,
	]);

	return (
		<Modal centered size="lg" {...modalProps}>
			<Modal.Header closeButton>
				<Modal.Title>{appointmentTypeId ? `Edit ${'title'}` : 'New appointment type'}</Modal.Title>
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

				<Form.Group>
					<Form.Label className="d-block" style={{ ...fonts.xs }}>
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

				<InputHelper
					className="mb-4"
					type="text"
					label="Nickname (how this appears on your calendar)"
					value={nickname}
					onChange={({ currentTarget }) => {
						setNickname(currentTarget.value);
					}}
					required
				/>

				<Form.Group>
					<Form.Label className="m-0" style={{ ...fonts.xs }}>
						Duration:
					</Form.Label>
					<div className="d-flex align-items-center">
						<Form.Check
							className="mr-6"
							id="duration-30"
							type="radio"
							bsPrefix="cobalt-modal-form__check"
							name="duration"
							label="30m"
							checked={duration === '30'}
							onChange={() => {
								setDuration('30');
							}}
						/>
						<Form.Check
							className="mr-6"
							id="duration-45"
							type="radio"
							bsPrefix="cobalt-modal-form__check"
							name="duration"
							label="45m"
							checked={duration === '45'}
							onChange={() => {
								setDuration('45');
							}}
						/>
						<Form.Check
							className="mr-6"
							id="duration-60"
							type="radio"
							bsPrefix="cobalt-modal-form__check"
							name="duration"
							label="60m"
							checked={duration === '60'}
							onChange={() => {
								setDuration('60');
							}}
						/>
						<Form.Check
							className="mr-6"
							id="duration-other"
							type="radio"
							bsPrefix="cobalt-modal-form__check"
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

				<Form.Group>
					<Form.Label style={{ ...fonts.xs }}>Collect:</Form.Label>
					<div className="d-flex align-items-center">
						{[
							{
								label: 'First name',
								question: 'What is your first name?',
								questionContentHintId: 'FIRST_NAME',
							},
							{
								label: 'Last name',
								question: 'What is your last name?',
								questionContentHintId: 'LAST_NAME',
							},
							{
								label: 'Email (required by Cobalt)',
								question: 'What is your email address?',
								questionContentHintId: 'EMAIL_ADDRESS',
								disabled: true,
							},
							{
								label: 'Phone number',
								question: 'What is your phone number?',
								questionContentHintId: 'PHONE_NUMBER',
							},
						].map(({ label, question, questionContentHintId, disabled }) => {
							const isChecked = !!patientIntakeQuestions.find(
								(patientIntakeQuestion) =>
									patientIntakeQuestion.questionContentHintId === questionContentHintId
							);

							return (
								<Form.Check
									id={`collect-${questionContentHintId}`}
									key={questionContentHintId}
									bsPrefix="cobalt-modal-form__check"
									type="checkbox"
									name={`collect-${questionContentHintId}`}
									className="mr-6"
									label={label}
									checked={isChecked}
									disabled={disabled}
									onChange={({ currentTarget }) => {
										const patientIntakeQuestionsClone = cloneDeep(patientIntakeQuestions || []);

										if (currentTarget.checked) {
											patientIntakeQuestionsClone.push({
												question,
												fontSizeId: 'DEFAULT',
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
						})}
					</div>
				</Form.Group>

				<h3 className="mb-4">Screening Questions</h3>

				{screeningQuestions.map((screeningQuestion, index) => {
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
									type="switch"
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
				<div className="text-right">
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

			<Modal.Footer className="border-top pt-5">
				<Button size="sm" variant="link">
					delete
				</Button>

				<div>
					<Button
						className="mr-2"
						size="sm"
						variant="outline-primary"
						onClick={() => {
							modalProps.onHide();
						}}
					>
						cancel
					</Button>
					<Button size="sm" variant="outline" onClick={handleSaveButtonClick}>
						save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};
