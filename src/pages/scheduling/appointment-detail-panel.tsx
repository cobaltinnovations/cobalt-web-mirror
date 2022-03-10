import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import {
	AccountModel,
	AppointmentModel,
	ATTENDANCE_STATUS_ID,
	PersonalizationAnswer,
	PersonalizationDetails,
} from '@/lib/models';

import useHandleError from '@/hooks/use-handle-error';

import { ERROR_CODES } from '@/lib/http-client';
import { accountService, appointmentService } from '@/lib/services';

import { AppointmentTypeItem } from './appointment-type-item';
import { CopyToClipboardButton } from './copy-to-clipboard-button';

import { useSchedulingStyles } from './use-scheduling-styles';
import colors from '@/jss/colors';

import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as CheckIcon } from '@/assets/icons/check.svg';
import { ReactComponent as XIcon } from '@/assets/icons/icon-x.svg';
import { cloneDeep } from 'lodash';
import { Link, useParams, useRouteMatch, Redirect } from 'react-router-dom';
import { useScrollCalendar } from './use-scroll-calendar';

const useStyles = createUseStyles({
	appointmentsList: {
		padding: 0,
		margin: 0,
		'& li': {
			padding: '10px 15px',
		},
		'& li:nth-child(odd)': {
			backgroundColor: colors.gray200,
		},
	},
	attendedButton: {
		color: colors.success,
		borderColor: colors.success,
		'& path, & polygon#Shape': {
			fill: 'currentColor',
		},
		'&:focus': {
			outline: 'none',
		},
	},
	noShowButton: {
		color: colors.danger,
		borderColor: colors.danger,
		'& path, & polygon#Shape': {
			fill: 'currentColor',
		},
		'&:focus': {
			outline: 'none',
		},
	},
	attendedButtonSolid: {
		border: 0,
		color: colors.white,
		backgroundColor: colors.success,
		'& path, & polygon#Shape': {
			fill: 'currentColor',
		},
		'&:focus': {
			outline: 'none',
		},
	},
	noShowButtonSolid: {
		border: 0,
		color: colors.white,
		backgroundColor: colors.danger,
		'& path, & polygon#Shape': {
			fill: 'currentColor',
		},
		'&:focus': {
			outline: 'none',
		},
	},
});

interface AppointmentDetailPanelProps {
	setCalendarDate: (date: Date, time?: string) => void;
	onClose: () => void;
	onAddAppointment: () => void;
	focusDateOnLoad: boolean;
}

export const AppointmentDetailPanel = ({
	setCalendarDate,
	onClose,
	onAddAppointment,
	focusDateOnLoad,
}: AppointmentDetailPanelProps) => {
	const routeMatch = useRouteMatch();
	const { appointmentId } = useParams<{ appointmentId: string }>();
	const classes = useStyles();
	const schedulingClasses = useSchedulingStyles();
	const handleError = useHandleError();
	const [patient, setPatient] = useState<AccountModel>();
	const [appointment, setAppointment] = useState<AppointmentModel>();
	const [assessment, setAssessment] = useState<PersonalizationDetails>();
	const [allAppointments, setAllAppointments] = useState<AppointmentModel[]>([]);

	useScrollCalendar(setCalendarDate, focusDateOnLoad, appointment);

	useEffect(() => {
		const request = appointmentService.getAppointment(appointmentId);

		request
			.fetch()
			.then((response) => {
				setAppointment(response.appointment);

				return accountService
					.getAppointmentDetailsForAccount(response.appointment.accountId, response.appointment.appointmentId)
					.fetch();
			})
			.then((accountDetailsResponse) => {
				setPatient(accountDetailsResponse.account);
				setAssessment(accountDetailsResponse.assessment);
				setAllAppointments(accountDetailsResponse.appointments);
			})
			.catch((e) => {
				if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return () => {
			request.abort();
		};
	}, [appointmentId, handleError]);

	const updateAttendanceStatus = useCallback(
		async (appointmentId: string, attendanceStatusId: ATTENDANCE_STATUS_ID) => {
			try {
				const response = await appointmentService
					.updateAppointmentAttendanceStatus(appointmentId, attendanceStatusId)
					.fetch();

				const allAppointmentsClone = cloneDeep(allAppointments);
				const indexToReplace = allAppointmentsClone.findIndex(
					(appointment) => appointment.appointmentId === appointmentId
				);

				if (indexToReplace > -1) {
					allAppointmentsClone[indexToReplace] = response.appointment;
					setAllAppointments(allAppointmentsClone);
				}
			} catch (error) {
				handleError(error);
			}
		},
		[allAppointments, handleError]
	);

	if (appointment?.rescheduledAppointmentId) {
		return <Redirect to={`/scheduling/appointments/${appointment?.rescheduledAppointmentId}`} />;
	}

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>
					{patient?.firstName || patient?.lastName
						? `${patient?.firstName} ${patient?.lastName}`
						: 'Anonymous'}
				</h4>
				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<CloseIcon />
				</Button>
			</div>

			<div className="mb-4">
				<Button
					as="a"
					variant="primary"
					size="sm"
					className="mr-1"
					href={appointment?.videoconferenceUrl}
					target="_blank"
				>
					join now
				</Button>

				<CopyToClipboardButton className="mr-1" text={appointment?.videoconferenceUrl} />

				<Button as={Link} to={`${routeMatch.url}/edit`} variant="primary" size="sm" className="px-2">
					<EditIcon />
				</Button>
			</div>

			<div className="border py-2 px-3 mb-2">
				<div className="mb-2 d-flex justify-content-between align-items-center">
					<p className="mb-0">
						<strong>contact information</strong>
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
					<strong>phone</strong>
				</p>
				<p>{patient?.phoneNumber || 'Not available'}</p>

				<p className="mb-0">
					<strong>email</strong>
				</p>
				<p>{patient?.emailAddress || 'Not available'}</p>
			</div>

			<div className="border py-2 px-3 mb-2">
				<div className="d-flex mb-1 justify-content-between align-items-center">
					<p className="mb-0">
						<strong>assessments completed</strong>
					</p>
				</div>

				{!!assessment && Array.isArray(assessment.assessmentQuestions) && (
					<div className="mb-1 justify-content-between align-items-center">
						{assessment.assessmentQuestions.map((question) => {
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
				)}
			</div>

			<div className="border">
				<div className="py-2 px-3 d-flex justify-content-between align-items-center">
					<p className="mb-0">
						<strong>all appointments</strong>
					</p>

					<button
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
										<AppointmentTypeItem appointmentType={appointment.appointmentType} />
									</div>
									<div className="d-flex align-items-center">
										{appointment.attendanceStatusId === 'UNKNOWN' && (
											<>
												<button
													className={classNames(
														schedulingClasses.roundBtn,
														classes.attendedButton
													)}
													onClick={() => {
														updateAttendanceStatus(
															appointment.appointmentId,
															ATTENDANCE_STATUS_ID.ATTENDED
														);
													}}
												>
													<CheckIcon />
												</button>
												<button
													className={classNames(
														schedulingClasses.roundBtn,
														classes.noShowButton,
														'ml-2'
													)}
													onClick={() => {
														updateAttendanceStatus(
															appointment.appointmentId,
															ATTENDANCE_STATUS_ID.MISSED
														);
													}}
												>
													<XIcon />
												</button>
											</>
										)}

										{appointment.attendanceStatusId === 'ATTENDED' && (
											<button
												className={classNames(
													schedulingClasses.roundBtnSolid,
													classes.attendedButtonSolid
												)}
												onClick={() => {
													updateAttendanceStatus(
														appointment.appointmentId,
														ATTENDANCE_STATUS_ID.UNKNOWN
													);
												}}
											>
												<CheckIcon />
											</button>
										)}

										{appointment.attendanceStatusId === 'CANCELED' ||
											(appointment.attendanceStatusId === 'MISSED' && (
												<button
													className={classNames(
														schedulingClasses.roundBtnSolid,
														classes.noShowButtonSolid
													)}
													onClick={() => {
														updateAttendanceStatus(
															appointment.appointmentId,
															ATTENDANCE_STATUS_ID.UNKNOWN
														);
													}}
												>
													<XIcon />
												</button>
											))}
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</div>
	);
};
