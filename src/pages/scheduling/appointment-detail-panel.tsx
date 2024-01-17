import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import {
	AccountModel,
	AppointmentModel,
	ATTENDANCE_STATUS_ID,
	PersonalizationAnswer,
	PersonalizationDetails,
} from '@/lib/models';

import useHandleError from '@/hooks/use-handle-error';

import { accountService, appointmentService } from '@/lib/services';

import { AppointmentTypeItem } from './appointment-type-item';
import { CopyToClipboardButton } from './copy-to-clipboard-button';

import { useSchedulingStyles } from './use-scheduling-styles';

import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as CheckIcon } from '@/assets/icons/icon-check.svg';
import { ReactComponent as XIcon } from '@/assets/icons/icon-x.svg';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useScrollCalendar } from './use-scroll-calendar';
import { createUseThemedStyles } from '@/jss/theme';
import ConfirmDialog from '@/components/confirm-dialog';

const useStyles = createUseThemedStyles((theme) => ({
	appointmentsList: {
		padding: 0,
		margin: 0,
		'& li': {
			padding: '10px 15px',
		},
		'& li:nth-child(odd)': {
			backgroundColor: theme.colors.n75,
		},
	},
	attendedButton: {
		color: theme.colors.s500,
		borderColor: theme.colors.s500,
		'& path, & polygon#Shape': {
			fill: 'currentColor',
		},
		'&:focus': {
			outline: 'none',
		},
	},
	noShowButton: {
		color: theme.colors.d500,
		borderColor: theme.colors.d500,
		'& path, & polygon#Shape': {
			fill: 'currentColor',
		},
		'&:focus': {
			outline: 'none',
		},
	},
	attendedButtonSolid: {
		border: 0,
		color: theme.colors.n0,
		backgroundColor: theme.colors.s500,
		'& path, & polygon#Shape': {
			fill: 'currentColor',
		},
		'&:focus': {
			outline: 'none',
		},
	},
	noShowButtonSolid: {
		border: 0,
		color: theme.colors.n0,
		backgroundColor: theme.colors.d500,
		'& path, & polygon#Shape': {
			fill: 'currentColor',
		},
		'&:focus': {
			outline: 'none',
		},
	},
}));

interface AppointmentDetailPanelProps {
	setCalendarDate: (date: Date, time?: string) => void;
	onClose: () => void;
	onAddAppointment: () => void;
	focusDateOnLoad: boolean;
	accountId?: string;
}

export const AppointmentDetailPanel = ({
	setCalendarDate,
	onClose,
	onAddAppointment,
	focusDateOnLoad,
	accountId,
}: AppointmentDetailPanelProps) => {
	const { appointmentId } = useParams<{ appointmentId: string }>();
	const classes = useStyles();
	const schedulingClasses = useSchedulingStyles();
	const navigate = useNavigate();
	const handleError = useHandleError();
	const [patient, setPatient] = useState<AccountModel>();
	const [appointment, setAppointment] = useState<AppointmentModel>();
	const [assessment, setAssessment] = useState<PersonalizationDetails>();
	const [allAppointments, setAllAppointments] = useState<AppointmentModel[]>([]);
	const [confirmDialogIsShowing, setConfirmDialogIsShowing] = useState(false);

	useScrollCalendar(setCalendarDate, focusDateOnLoad, appointment);

	useEffect(() => {
		if (!appointmentId) {
			return;
		}

		function fetchDetails(patientAccountId: string) {
			const request = accountService.getAppointmentDetailsForAccount(patientAccountId, appointmentId!);

			request
				.fetch()
				.then((response) => {
					setPatient(response.account);
					setAppointment(response.appointment);
					setAssessment(response.assessment);
					setAllAppointments(response.appointments);
				})
				.catch((e) => {
					handleError(e);
				});

			return request;
		}

		if (accountId) {
			const request = fetchDetails(accountId);

			return () => {
				request.abort();
			};
		} else {
			let request = appointmentService.getAppointment(appointmentId);

			request.fetch().then((response) => {
				request = fetchDetails(response.appointment.accountId);
			});

			return () => {
				request.abort();
			};
		}
	}, [accountId, appointmentId, handleError]);

	useEffect(() => {
		if (appointment?.canceledForReschedule && appointment?.rescheduledAppointmentId) {
			navigate(`/scheduling/appointments/${appointment?.rescheduledAppointmentId}`);
		}
	}, [appointment?.canceledForReschedule, appointment?.rescheduledAppointmentId, navigate]);

	const showIntakeResponses =
		!!assessment && Array.isArray(assessment.assessmentQuestions) && assessment.assessmentQuestions.length > 0;

	const handleCancelAppointmentButtonClick = useCallback(async () => {
		setConfirmDialogIsShowing(true);
	}, []);

	const handleCancelAppointmentConfirm = useCallback(async () => {
		try {
			if (!appointment) {
				throw new Error('appointment is undefined.');
			}

			await appointmentService.cancelAppointment(appointment.appointmentId).fetch();
			setConfirmDialogIsShowing(false);
			onClose();
		} catch (error) {
			handleError(error);
		}
	}, [appointment, handleError, onClose]);

	return (
		<>
			<ConfirmDialog
				show={confirmDialogIsShowing}
				onHide={() => {
					setConfirmDialogIsShowing(false);
				}}
				titleText="Cancel Appointment"
				bodyText={`Are you sure you want to cancel this appointment? An email will be sent to ${patient?.emailAddress} letting them know the appointment has been canceled.`}
				dismissText="Do Not Cancel"
				confirmText="Cancel Appointment"
				onConfirm={handleCancelAppointmentConfirm}
				displayButtonsBlock
			/>

			<div>
				<div className="d-flex align-items-center justify-content-between py-4">
					<div>
						<h4>
							{patient?.firstName || patient?.lastName
								? `${patient?.firstName} ${patient?.lastName}`
								: 'Anonymous'}
						</h4>

						<p className="mb-0">{appointment?.startTimeDescription}</p>
						{appointment?.appointmentType && (
							<AppointmentTypeItem appointmentType={appointment.appointmentType} />
						)}
					</div>

					<Button
						data-testid="appointmentDetailClodeButton"
						variant="link"
						size="sm"
						className="p-0"
						onClick={() => onClose()}
					>
						<CloseIcon />
					</Button>
				</div>

				<div className="mb-4">
					<Button
						data-testid="appointmentDetailJoinButton"
						as="a"
						variant="primary"
						size="sm"
						className="py-2 me-1 text-decoration-none"
						href={appointment?.videoconferenceUrl}
						target="_blank"
					>
						Join Now
					</Button>

					<Button
						data-testid="apppointmentDetailCancelButton"
						variant="danger"
						size="sm"
						className="me-1"
						onClick={handleCancelAppointmentButtonClick}
					>
						Cancel Appointment
					</Button>

					<CopyToClipboardButton
						data-testid="appointmentDetailCopyVideoUrlButton"
						className="me-1"
						text={appointment?.videoconferenceUrl}
						iconSize={18}
					/>

					<Link to={'edit'}>
						<Button
							data-testid="appointmentDetailDeleteButton"
							variant="primary"
							size="sm"
							className="px-2"
						>
							<EditIcon width={18} height={18} />
						</Button>
					</Link>
				</div>

				<div className="border py-2 px-3">
					<div className="mb-2 d-flex justify-content-between align-items-center">
						<p className="mb-0">
							<strong>Contact Information</strong>
						</p>
						{/* <Button
						variant="link"
						size="sm"
						className="p-0"
						onClick={() => {
							alert('TODO: Show edit patient form');
						}}
					>
						<EditIcon />
					</Button> */}
					</div>

					<p className="mb-0">
						<strong>Phone</strong>
					</p>
					<p>{patient?.phoneNumber || 'Not available'}</p>

					<p className="mb-0">
						<strong>Email</strong>
					</p>
					<p>{patient?.emailAddress || 'Not available'}</p>
				</div>

				{showIntakeResponses && (
					<div className="border py-2 px-3 mt-2">
						<div className="d-flex mb-1 justify-content-between align-items-center">
							<p className="mb-0">
								<strong>Intake Responses</strong>
							</p>
						</div>

						<div className="mb-1 justify-content-between align-items-center">
							{assessment?.assessmentQuestions.map((question) => {
								const answersMap = question.answers.reduce((acc, answer) => {
									acc[answer.answerId] = answer;

									return acc;
								}, {} as Record<string, PersonalizationAnswer>);

								return (
									<React.Fragment key={question.questionId}>
										<p className="mb-0">
											<strong>{question.label}</strong>
										</p>
										{question.selectedAnswers.map((answer) => {
											const answerText =
												question.questionType === 'TEXT'
													? answer.answerText
													: answersMap[answer.answerId].label;

											return <p>{answerText}</p>;
										})}
									</React.Fragment>
								);
							})}
						</div>
					</div>
				)}

				<div className="border mt-2">
					<div className="py-2 px-3 d-flex justify-content-between align-items-center">
						<p className="mb-0">
							<strong>All Appointments</strong>
						</p>

						<button
							data-testid="appointmentDetailAddNewButton"
							className={schedulingClasses.roundBtn}
							onClick={() => {
								onAddAppointment();
							}}
						>
							<PlusIcon />
						</button>
					</div>
					{allAppointments.length > 0 && (
						<ul className={classes.appointmentsList}>
							{allAppointments.map((appointment) => {
								return (
									<li
										key={appointment.appointmentId}
										className="d-flex align-items-center justify-content-between"
									>
										<div>
											<p className="mb-0">
												<strong>{appointment.startTimeDescription}</strong>
											</p>
											{appointment.appointmentType && (
												<AppointmentTypeItem appointmentType={appointment.appointmentType} />
											)}
										</div>

										{/* <AppointmentAttendance
										appointment={appointment}
										onUpdate={(updatedAppointment) => {
											const allAppointmentsClone = cloneDeep(allAppointments);
											const indexToReplace = allAppointmentsClone.findIndex(
												(appointment) => appointment.appointmentId === appointmentId
											);

											if (indexToReplace > -1) {
												allAppointmentsClone[indexToReplace] = updatedAppointment;
												setAllAppointments(allAppointmentsClone);
											}
										}}
									/> */}
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</div>
		</>
	);
};

const AppointmentAttendance = ({
	appointment,
	onUpdate,
}: {
	appointment: AppointmentModel;
	onUpdate: (updatedAppointment: AppointmentModel) => void;
}) => {
	const handleError = useHandleError();
	const classes = useStyles();
	const schedulingClasses = useSchedulingStyles();
	const updateAttendanceStatus = useCallback(
		async (appointmentId: string, attendanceStatusId: ATTENDANCE_STATUS_ID) => {
			try {
				const response = await appointmentService
					.updateAppointmentAttendanceStatus(appointmentId, attendanceStatusId)
					.fetch();

				onUpdate(response.appointment);
			} catch (error) {
				handleError(error);
			}
		},
		[handleError, onUpdate]
	);

	return (
		<div className="d-flex align-items-center">
			{appointment.attendanceStatusId === 'UNKNOWN' && (
				<>
					<button
						className={classNames(schedulingClasses.roundBtn, classes.attendedButton)}
						onClick={() => {
							updateAttendanceStatus(appointment.appointmentId, ATTENDANCE_STATUS_ID.ATTENDED);
						}}
					>
						<CheckIcon />
					</button>
					<button
						className={classNames(schedulingClasses.roundBtn, classes.noShowButton, 'ms-2')}
						onClick={() => {
							updateAttendanceStatus(appointment.appointmentId, ATTENDANCE_STATUS_ID.MISSED);
						}}
					>
						<XIcon />
					</button>
				</>
			)}

			{appointment.attendanceStatusId === 'ATTENDED' && (
				<button
					className={classNames(schedulingClasses.roundBtnSolid, classes.attendedButtonSolid)}
					onClick={() => {
						updateAttendanceStatus(appointment.appointmentId, ATTENDANCE_STATUS_ID.UNKNOWN);
					}}
				>
					<CheckIcon />
				</button>
			)}

			{(appointment.attendanceStatusId === 'CANCELED' || appointment.attendanceStatusId === 'MISSED') && (
				<button
					className={classNames(schedulingClasses.roundBtnSolid, classes.noShowButtonSolid)}
					onClick={() => {
						updateAttendanceStatus(appointment.appointmentId, ATTENDANCE_STATUS_ID.UNKNOWN);
					}}
				>
					<XIcon />
				</button>
			)}
		</div>
	);
};
