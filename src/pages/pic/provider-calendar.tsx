import React, { FC, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import moment from 'moment';
import InputMask from 'react-input-mask';
import { Formik } from 'formik';

import { ReactComponent as ChevronDownIcon } from '@/assets/icons/icon-chevron-down.svg';
import { ReactComponent as ChevronLeftIcon } from '@/assets/icons/icon-chevron-left.svg';
import { ReactComponent as GearIcon } from '@/assets/icons/icon-gear.svg';
import { ReactComponent as HistoryIcon } from '@/assets/icons/icon-history.svg';
import { ReactComponent as XCircleIcon } from '@/assets/icons/icon-x-circle.svg';

import useHandleError from '@/hooks/use-handle-error';
import useHeaderTitle from '@/hooks/use-header-title';
import useQuery from '@/hooks/use-query';
import colors from '@/jss/colors';
import fonts from '@/jss/fonts';
import { appointmentService, providerService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import InputHelper from '@/components/input-helper';
import Select from '@/components/select';
import {
	AppointmentType,
	LogicalAvailability,
	AvailabilityTimeSlot,
	AppointmentModel,
	AppointmentReason,
	FollowupModel,
	AccountModel,
} from '@/lib/models';
import DatePicker from '@/components/date-picker';
import { ERROR_CODES } from '@/lib/http-client';
import ScheduleOnCalendar, { ColoredAppointmentReason } from './schedule-on-calendar';
import PatientDetailView from '@/pages/pic/mhic-dashboard/patient-detail-view';
import Loader from '@/components/loader';
import { useGetPatientDispositionByCobaltId } from '@/hooks/pic-hooks';
import { FormattedDisposition, formatDisposition } from './utils';

const useStyles = createUseStyles({
	calendarTable: {
		maxWidth: 240,
		'& th': {
			...fonts.xxxs,
		},
		'& td': {
			padding: 2,
		},
	},
	selectedWeekTable: {
		maxWidth: 240,
		'& th:first-of-type, td:first-of-type': {
			paddingLeft: 0,
		},
		'& th:last-of-type, td:last-of-type': {
			paddingRight: 0,
		},
		'& td': {
			padding: 2,
		},
	},
	dayCell: {
		margin: 'auto',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'pointer',
		height: 32,
		width: 32,
	},
	selectedDayCell: {
		color: colors.white,
		backgroundColor: colors.secondary,
		borderRadius: '100%',
	},
	availabilityCard: {
		borderRadius: 16,
	},
	availabilityBadge: {
		borderRadius: '100%',
		minWidth: 8,
		height: 8,
	},
	meridianToggleWrapper: {
		display: 'flex',
		height: '100%',
		borderRadius: 50,
		overflow: 'hidden',
		border: `1px solid ${colors.gray300}`,
	},
	meridianButton: {
		flex: 1,
		backgroundColor: 'transparent',
		border: 'none',
		outline: 'none !important',
		...fonts.xxs,
	},
	meridianSelectedButton: {
		backgroundColor: colors.secondary,
		color: colors.white,
	},
	slotTime: {
		position: 'absolute',
		transform: `translateY(-50%)`,
		borderRadius: 50,
	},
	slotCard: {
		cursor: 'pointer',
		backgroundColor: colors.white,
	},
	selectedSlotCard: {
		border: `1px solid ${colors.primary}`,
	},
	availableSlotCard: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: 54,
		border: `1px dashed ${colors.black}`,
	},
});

const CalendarSlotCard: FC<{
	selected?: boolean;
	available?: boolean;
	patientName?: string;
	time?: string;
	reason?: AppointmentReason;
	onClick: () => void;
	onCancel: () => void;
}> = ({ selected, available, patientName, time, reason, onClick, onCancel }) => {
	const classes = useStyles();

	return (
		<div
			onClick={onClick}
			className={classNames('mb-4 p-2 overflow-hidden', {
				[classes.selectedSlotCard]: !available && selected,
				[classes.slotCard]: !available,
				[classes.availableSlotCard]: !!available,
			})}
		>
			{!!available && <p className="mb-0 text-center">Available</p>}
			<div className="d-flex justify-content-between">
				<p className="font-karla-bold my-1">{patientName}</p>
				{!available && (
					<Button
						className="text-secondary"
						variant="icon"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							if (!window.confirm(`Cancel appointment?`)) {
								return;
							}

							onCancel();
						}}
					>
						<XCircleIcon height={20} width={20} />
					</Button>
				)}
			</div>
			{time && <p className="mb-2">{time}</p>}
			{reason && <ColoredAppointmentReason reason={reason} />}
		</div>
	);
};

const AppointmentList = forwardRef<
	{ fetchSchedule: () => void },
	{
		selectedDay?: moment.Moment;
		selectedSlotId?: string;
		onSelectSlot: (id?: string) => void;
		onSelectPatient: (patientAccount: AccountModel) => void;
	}
>(({ selectedDay, selectedSlotId, onSelectSlot, onSelectPatient }, ref) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { account } = useAccount();

	const [followups, setFollowups] = useState<FollowupModel[]>([]);
	const [slots, setSlots] = useState<({ appointment?: AppointmentModel } & AvailabilityTimeSlot)[]>([]);

	const selectedDate = selectedDay?.format('YYYY-MM-DD') ?? '';
	const providerId = account?.providerId;

	const fetchSchedule = useCallback(() => {
		if (!providerId || !selectedDate) {
			return;
		}

		const request = providerService.listProviderSchedule({
			providerId,
			startDate: selectedDate,
			endDate: selectedDate,
		});

		request
			.fetch()
			.then((response) => {
				setFollowups(response.followups || []);

				const activeAppointments = response.appointments?.filter((a) => !a.canceled);
				const mappedSlots =
					response.sections[0]?.providers[0]?.times?.map((time) => {
						return {
							...time,
							appointment: activeAppointments?.find((a) => a.localStartTime === time.time),
						};
					}) ?? [];
				setSlots(mappedSlots);
			})
			.catch((e) => {
				if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return request;
	}, [handleError, providerId, selectedDate]);

	useEffect(() => {
		const request = fetchSchedule();

		if (request) {
			return () => {
				request.abort();
			};
		}
	}, [fetchSchedule, handleError, providerId, selectedDate]);

	useImperativeHandle(ref, () => {
		return {
			fetchSchedule,
		};
	});

	if (!selectedDay) {
		return <Loader />;
	}

	return (
		<div className="my-4 mx-6">
			<h5 className="mb-4">Follow-up</h5>

			<div className="py-2">
				{followups.length === 0 && <p>No scheduled follow-ups</p>}
				{followups.map((followup) => {
					return (
						<CalendarSlotCard
							key={followup.followupId}
							selected={followup.followupId === selectedSlotId}
							onClick={() => {
								onSelectSlot(followup.followupId);
								onSelectPatient(followup.account);
							}}
							onCancel={() => {
								appointmentService
									.cancelFollowup(followup.followupId)
									.fetch()
									.then(() => {
										fetchSchedule();
									})
									.catch(handleError);
							}}
							patientName={followup.account?.displayName}
							reason={followup.appointmentReason}
						/>
					);
				})}
			</div>

			<div className="py-2">
				{slots.map((timeslot) => {
					const timeSlotMoment = moment(timeslot.time, 'H:mm');
					const appointmentStartMoment = moment(timeslot.appointment?.startTime);
					const appointmentEndMoment = moment(timeslot.appointment?.endTime);

					return (
						<div key={timeslot.time} className="py-2">
							<div
								className={classNames(
									'd-inline-block bg-secondary text-white px-3 py-1',
									classes.slotTime
								)}
							>
								{timeSlotMoment.format('h:mma')}
							</div>

							<div className="mx-2">
								<CalendarSlotCard
									selected={
										timeslot.appointment && timeslot.appointment.appointmentId === selectedSlotId
									}
									onClick={() => {
										if (!!timeslot.appointment?.account) {
											onSelectSlot(timeslot.appointment.appointmentId);
											onSelectPatient(timeslot.appointment.account);
										}
									}}
									onCancel={() => {
										if (!timeslot.appointment) {
											return;
										}

										appointmentService
											.cancelAppointment(timeslot.appointment?.appointmentId)
											.fetch()
											.then(() => {
												fetchSchedule();
											})
											.catch(handleError);
									}}
									available={!timeslot.appointment}
									patientName={timeslot.appointment?.account?.displayName}
									time={
										timeslot.appointment
											? `${appointmentStartMoment.format(
													'H:mma'
											  )} - ${appointmentEndMoment.format('H:mma')}`
											: ''
									}
									reason={timeslot.appointment?.appointmentReason}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
});

const CalendarWeekDayLabels: FC<{ header?: string }> = ({ header }) => {
	return useMemo(() => {
		return (
			<thead>
				{header && (
					<tr>
						<th colSpan={7}>
							<h5>{header}</h5>
						</th>
					</tr>
				)}

				<tr>
					{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => {
						return (
							<th
								key={label}
								className={classNames('karla-font-bold', {
									'text-muted': true,
								})}
							>
								{label}
							</th>
						);
					})}
				</tr>
			</thead>
		);
	}, [header]);
};

function getMonthWeeks(monthMoment: moment.Moment) {
	const startDay = monthMoment.clone().startOf('week');
	const endDay = monthMoment.clone().endOf('month').endOf('week');
	const weeks: moment.Moment[][] = [];

	const date = startDay.clone().subtract(1, 'day');
	while (date.isBefore(endDay, 'day')) {
		const week = Array(7)
			.fill(null)
			.map(() => date.add(1, 'day').clone());
		weeks.push(week);
	}

	return weeks;
}

function getDayWeek(dayMoment: moment.Moment) {
	const startDay = dayMoment.clone().startOf('week');
	const endDay = startDay.clone().endOf('week');
	const week: moment.Moment[] = [];

	const date = startDay.clone().subtract(1, 'day');
	while (date.isBefore(endDay, 'day')) {
		week.push(date.add(1, 'day').clone());
	}

	return week;
}

const CalendarDayCell: FC<{
	showDate: boolean;
	day: moment.Moment;
	isSelected?: boolean;
	onSelect: (dayMoment: moment.Moment) => void;
}> = ({ showDate, day, isSelected, onSelect }) => {
	const classes = useStyles();

	return (
		<td>
			<div
				className={classNames({
					[classes.dayCell]: showDate,
					[classes.selectedDayCell]: showDate && isSelected,
				})}
				onClick={() => {
					if (!showDate) {
						return;
					}

					onSelect(day.clone());
				}}
			>
				{showDate ? day.date() : ''}
			</div>
		</td>
	);
};

const CalendarMonthView: FC<{
	month?: moment.Moment;
	selectedDay: moment.Moment;
	onDaySelect: (selectedDay: moment.Moment) => void;
}> = ({ month = moment().startOf('month'), selectedDay, onDaySelect }) => {
	const classes = useStyles();
	const [header, weeks] = useMemo(() => {
		return [month.format('MMMM YYYY'), getMonthWeeks(month)];
	}, [month]);

	return (
		<Table borderless className={classNames('text-center', classes.calendarTable)}>
			<CalendarWeekDayLabels header={header} />
			<tbody>
				{weeks.map((week, weekIndex) => {
					return (
						<tr key={weekIndex}>
							{week.map((day, dayIndex) => {
								const showDate = day.month() === month.month();
								const isSelected = selectedDay?.isSame(day);

								return (
									<CalendarDayCell
										key={dayIndex}
										onSelect={onDaySelect}
										{...{ showDate, day, isSelected }}
									/>
								);
							})}
						</tr>
					);
				})}
			</tbody>
		</Table>
	);
};

const CalendarDaySelect: FC<{ selectedDay?: moment.Moment; onDaySelect: (dayMoment: moment.Moment) => void }> = ({
	selectedDay,
	onDaySelect,
}) => {
	const [thisMonth, nextMonth] = useMemo(() => {
		const currentMonth = moment().startOf('month');
		const nextMonth = currentMonth.clone().add(1, 'month');

		return [currentMonth, nextMonth];
	}, []);

	if (!selectedDay) {
		return <Loader />;
	}

	return (
		<div className="my-2 mx-4">
			<CalendarMonthView month={thisMonth} selectedDay={selectedDay} onDaySelect={onDaySelect} />
			<CalendarMonthView month={nextMonth} selectedDay={selectedDay} onDaySelect={onDaySelect} />
		</div>
	);
};

const SelectedWeek: FC<{ day?: moment.Moment; onDaySelect: (dayMoment: moment.Moment) => void }> = ({
	day,
	onDaySelect,
}) => {
	const classes = useStyles();
	const week = useMemo(() => {
		if (!day) {
			return [];
		}

		return getDayWeek(day);
	}, [day]);

	if (!day) {
		return <Loader />;
	}

	return (
		<Table borderless className={classNames('text-center', classes.selectedWeekTable)}>
			<CalendarWeekDayLabels />

			<tbody>
				<tr>
					{week.map((weekDay, dayIndex) => {
						const isSelected = weekDay.isSame(day);

						return (
							<CalendarDayCell
								key={dayIndex}
								showDate
								onSelect={onDaySelect}
								{...{ day: weekDay, isSelected }}
							/>
						);
					})}
				</tr>
			</tbody>
		</Table>
	);
};

const SelectedWeekHeader: FC<{
	day?: moment.Moment;
	onDaySelect: (dayMoment: moment.Moment) => void;
	onMonthClick: () => void;
	onGearClick: () => void;
}> = ({ day, onDaySelect, onMonthClick, onGearClick }) => {
	if (!day) {
		return <Loader />;
	}

	return (
		<div className="w-100 mb-2 d-flex">
			<Button className="mr-4 p-0" variant="clear" size="sm" onClick={onMonthClick}>
				{day.format('MMMM yyyy')}
				<ChevronDownIcon className="ml-2" />
			</Button>

			<Button
				className="ml-auto"
				variant="outline-primary"
				//@ts-expect-error size type
				size="xsm"
				onClick={() => {
					onDaySelect(moment());
				}}
			>
				today
			</Button>

			<Button className="ml-2 text-primary" variant="icon" onClick={onGearClick}>
				<GearIcon />
			</Button>
		</div>
	);
};

const AvailabilityCard: FC<{ availability: LogicalAvailability; onDelete: (id: string) => void }> = ({
	availability,
	onDelete,
}) => {
	const classes = useStyles();
	const startTime = useMemo(() => {
		const startMoment = moment(availability.startDateTime);
		return startMoment.minutes() ? startMoment.format('h:ma') : startMoment.format('ha').slice(0, -1);
	}, [availability.startDateTime]);

	const endTime = useMemo(() => {
		const endMoment = moment(`${availability.endDate}T${availability.endTime}`);
		return endMoment.minutes() ? endMoment.format('h:ma') : endMoment.format('ha').slice(0, -1);
	}, [availability.endDate, availability.endTime]);

	const appointmentTypes = useMemo(() => {
		return availability.appointmentTypes.map((aT) => aT.name).join(',');
	}, [availability.appointmentTypes]);

	return (
		<div className={classNames('bg-white mt-2 py-1 px-2', classes.availabilityCard)}>
			<div className="mt-1 d-flex align-items-center">
				<p className="mb-0">
					{startTime}-{endTime}
				</p>

				<HistoryIcon className="ml-auto" fill={colors.gray600} height={24} width={24} />

				<Button
					className="text-secondary"
					variant="icon"
					onClick={() => {
						onDelete(availability.logicalAvailabilityId);
					}}
				>
					<XCircleIcon height={24} width={24} />
				</Button>
			</div>

			<div className="mt-1 d-flex">
				<div
					className={classNames('mt-1 mr-1', classes.availabilityBadge, {
						'bg-danger': true,
						'bg-success': false,
					})}
				/>
				<div>
					<p className="text-muted">
						<small>{appointmentTypes}</small>
					</p>
					<p className="text-muted">{/* <small>{availabilitiy.}</small> */}</p>
				</div>
			</div>
		</div>
	);
};

const CalendarAvailabilities: FC<{
	selectedDay?: moment.Moment;
	onBack: () => void;
	onAdd: () => void;
}> = ({ selectedDay, onBack, onAdd }) => {
	const { account } = useAccount();
	const handleError = useHandleError();

	const [availabilities, setAvailabilities] = useState<LogicalAvailability[]>([]);

	const selectedDayDate = useMemo(() => {
		return selectedDay?.format('YYYY-MM-DD') ?? '';
	}, [selectedDay]);

	useEffect(() => {
		if (!account || !account.providerId || !selectedDayDate) {
			return;
		}

		const request = providerService.listLogicalAvailabilities({
			providerId: account.providerId,
			startDate: selectedDayDate,
			endDate: selectedDayDate,
		});

		request
			.fetch()
			.then((response) => {
				setAvailabilities(response.logicalAvailabilities);
			})
			.catch((e) => {
				if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return () => {
			request.abort();
		};
	}, [account, handleError, selectedDayDate]);

	return (
		<>
			<div className="mt-4 mb-2 d-flex justify-content-between">
				<Button className="p-0" variant="link" size="sm" onClick={onBack}>
					<ChevronLeftIcon fill={colors.primary} className="mr-1" />
					back
				</Button>

				<Button className="p-0" variant="link" size="sm" onClick={onAdd}>
					new availability
				</Button>
			</div>

			{availabilities.length === 0 && <p>No availabilities added</p>}

			{availabilities.map((a) => (
				<AvailabilityCard
					key={a.logicalAvailabilityId}
					availability={a}
					onDelete={(availabilityId) => {
						if (!window.confirm('Delete Availability?')) {
							return;
						}

						providerService
							.deleteLogicalAvailability(availabilityId)
							.fetch()
							.then(() => {
								setAvailabilities(
									availabilities.filter((a) => a.logicalAvailabilityId !== availabilityId)
								);
							})
							.catch((e) => {
								if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
									handleError(e);
								}
							});
					}}
				/>
			))}
		</>
	);
};

const MeridianSwitch: FC<{
	selected: string;
	onChange: (newSelected: 'am' | 'pm') => void;
}> = ({ selected, onChange }) => {
	const classes = useStyles();

	return (
		<div className={classes.meridianToggleWrapper}>
			<button
				type="button"
				className={classNames(classes.meridianButton, {
					[classes.meridianSelectedButton]: selected === 'am',
				})}
				onClick={() => {
					if (selected !== 'am') {
						onChange('am');
					}
				}}
			>
				AM
			</button>
			<button
				type="button"
				className={classNames(classes.meridianButton, {
					[classes.meridianSelectedButton]: selected === 'pm',
				})}
				onClick={() => {
					if (selected !== 'pm') {
						onChange('pm');
					}
				}}
			>
				PM
			</button>
		</div>
	);
};

const AddCalendarAvailability: FC<{
	selectedDay?: moment.Moment;
	onBack: () => void;
	onSuccess: () => void;
}> = ({ selectedDay, onBack, onSuccess }) => {
	const { account } = useAccount();
	const handleError = useHandleError();

	const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
	const { initialDate, startDate, endDate } = useMemo(() => {
		if (!selectedDay) {
			return {};
		}

		const week = getDayWeek(selectedDay);
		return {
			initialDate: selectedDay.format('YYYY-MM-DD'),
			startDate: week[0].format('YYYY-MM-DD'),
			endDate: week[6].format('YYYY-MM-DD'),
		};
	}, [selectedDay]);

	useEffect(() => {
		if (!account || !account.providerId) {
			return;
		}

		const request = providerService.listProviderAppointmentTypes(account.providerId);

		request
			.fetch()
			.then((response) => {
				setAppointmentTypes(response.appointmentTypes);
			})
			.catch((e) => {
				if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return () => {
			request.abort();
		};
	}, [account, endDate, handleError, startDate]);

	return (
		<div className="mb-4">
			<div className="mt-4 mb-2 d-flex justify-content-between">
				<Button className="p-0" variant="link" size="sm" onClick={onBack}>
					<ChevronLeftIcon fill={colors.primary} className="mr-1" />
					back
				</Button>
			</div>

			<Formik
				initialValues={{
					appointmentType: '',
					date: initialDate,
					startTime: '',
					startTimeMeridian: '',
					endTime: '',
					endTimeMeridian: '',
				}}
				enableReinitialize
				onSubmit={(values) => {
					if (!account || !account.providerId) {
						return;
					}

					const dateTime = moment(values.date).startOf('day');

					const startTimeMoment = moment(`${values.startTime} ${values.startTimeMeridian}`, 'hh:mm a');

					const startDateTime = dateTime.clone().set({
						hours: startTimeMoment.hours(),
						minutes: startTimeMoment.minutes(),
						seconds: startTimeMoment.seconds(),
					});

					const endTimeMoment = moment(`${values.endTime} ${values.endTimeMeridian}`, 'hh:mm a');

					const endDateTime = dateTime.clone().set({
						hours: endTimeMoment.hours(),
						minutes: endTimeMoment.minutes(),
						seconds: endTimeMoment.seconds(),
					});

					const request = providerService.createLogicalAvailability({
						providerId: account.providerId,
						startDateTime: startDateTime.format('YYYY-MM-DDTHH:mm:ss'),
						endDateTime: endDateTime.format('YYYY-MM-DDTHH:mm:ss'),
						appointmentTypeIds: [values.appointmentType],
					});

					request
						.fetch()
						.then(() => {
							onSuccess();
						})
						.catch((e) => {
							if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
								handleError(e);
							}
						});
				}}
			>
				{(formikBag) => {
					const { values, setFieldValue, handleChange, handleSubmit } = formikBag;
					const isValid =
						!!values.appointmentType &&
						!!values.startTime &&
						!!values.startTimeMeridian &&
						!!values.endTime &&
						!!values.endTimeMeridian;
					return (
						<Form onSubmit={handleSubmit}>
							<Form.Group controlId="appointmentType" className="mb-3">
								<Select name="appointmentType" onChange={handleChange} value={values.appointmentType}>
									<option value="">Appointment Type(s)</option>
									{appointmentTypes.map((aT) => {
										return (
											<option key={aT.appointmentTypeId} value={aT.appointmentTypeId}>
												{aT.name}
											</option>
										);
									})}
								</Select>
							</Form.Group>

							<Form.Group controlId="date">
								<DatePicker
									showYearDropdown
									showMonthDropdown
									dropdownMode="select"
									selected={values.date ? moment(values.date).toDate() : undefined}
									onChange={(date) => {
										setFieldValue('date', date ? moment(date).format('YYYY-MM-DD') : '');
									}}
								/>
							</Form.Group>

							<Form.Group controlId="startTime">
								<Form.Row>
									<Col xs={12} md={7}>
										<InputHelper
											as={InputMask}
											//@ts-expect-error InputHelper `as` type forwarding
											mask="99:99"
											maskChar="_"
											name="startTime"
											label="Start Time"
											value={values.startTime}
											onChange={handleChange}
										/>
									</Col>
									<Col>
										<MeridianSwitch
											selected={values.startTimeMeridian}
											onChange={(newStartMeridian) => {
												setFieldValue('startTimeMeridian', newStartMeridian);
											}}
										/>
									</Col>
								</Form.Row>
							</Form.Group>

							<Form.Group controlId="endTime">
								<Form.Row>
									<Col xs={12} md={7}>
										<InputHelper
											as={InputMask}
											//@ts-expect-error InputHelper `as` type forwarding
											mask="99:99"
											maskChar="_"
											name="endTime"
											label="End Time"
											value={values.endTime}
											onChange={handleChange}
										/>
									</Col>
									<Col>
										<MeridianSwitch
											selected={values.endTimeMeridian}
											onChange={(newEndMeridian) => {
												setFieldValue('endTimeMeridian', newEndMeridian);
											}}
										/>
									</Col>
								</Form.Row>
							</Form.Group>

							<div className="mb-6 d-flex flex-row justify-content-between">
								<Button
									variant="outline-primary"
									onClick={() => {
										onBack();
									}}
								>
									back
								</Button>
								<Button variant="primary" type="submit" disabled={!isValid}>
									save
								</Button>
							</div>
						</Form>
					);
				}}
			</Formik>
		</div>
	);
};

export enum CalendarViews {
	Day = 'day',
	DaySelect = 'day-select',
	Availability = 'availability',
	AddAvailability = 'add-availability',
	CreateAppointment = 'create-appointment',
}

const PicProviderCalendar: FC = () => {
	useHeaderTitle('my calendar');
	const history = useHistory<{ successBooking: boolean }>();
	const query = useQuery();
	const queryDate = query.get('date') || '';
	const activeView = query.get('view') || CalendarViews.Day;
	const picPatientId = query.get('picPatientId') || '';

	const apptListCtrlRef = useRef<{ fetchSchedule: () => void }>(null);
	const [selectedDayMoment, setSelectedDayMoment] = useState<moment.Moment>();
	const [selectedSlotId, setSelectedSlotId] = useState<string>();
	const [selectedPatient, setSelectedPatient] = useState<AccountModel>();
	const [patientDisposition, setPatientDisposition] = useState<FormattedDisposition>();

	useGetPatientDispositionByCobaltId(selectedPatient?.accountId ?? '', (data) => {
		if (!data.id) {
			return;
		}

		const formatted = formatDisposition(data);
		setPatientDisposition(formatted);
	});

	const handleDaySelect = useCallback(
		(dayMoment) => {
			const params = new URLSearchParams(history.location.search);

			params.set('date', dayMoment.format('YYYY-MM-DD'));

			history.replace({
				...history.location,
				search: `?${params.toString()}`,
			});
		},
		[history]
	);

	const setActiveView = useCallback(
		(newView: CalendarViews, dayMoment?: moment.Moment) => {
			const params = new URLSearchParams(history.location.search);

			const date = moment.isMoment(dayMoment) && dayMoment.isValid() ? dayMoment.format('YYYY-MM-DD') : queryDate;
			params.set('date', date);
			params.set('view', newView);

			if (newView !== CalendarViews.CreateAppointment) {
				params.delete('picPatientId');
			}

			history.push({
				...history.location,
				search: `?${params.toString()}`,
			});
		},
		[history, queryDate]
	);

	// select today if invalid/no  date param passed
	useEffect(() => {
		const parsed = moment(queryDate);
		if (!parsed.isValid()) {
			handleDaySelect(moment());
			return;
		}

		setSelectedDayMoment(parsed);
	}, [handleDaySelect, queryDate]);

	return (
		<Container fluid>
			<Row className="bg-white" style={{ minHeight: 80 }}>
				{(activeView === CalendarViews.Day || activeView === CalendarViews.CreateAppointment) && (
					<>
						<Col xs={8} md={4}>
							<div className="my-2 mx-3 d-flex flex-column align-items-center">
								<SelectedWeekHeader
									day={selectedDayMoment}
									onDaySelect={handleDaySelect}
									onMonthClick={() => {
										setActiveView(CalendarViews.DaySelect);
									}}
									onGearClick={() => {
										setActiveView(CalendarViews.Availability);
									}}
								/>

								<SelectedWeek day={selectedDayMoment} onDaySelect={handleDaySelect} />
							</div>
						</Col>
						{activeView !== CalendarViews.CreateAppointment && (
							<Col xs={4} md={8} className="text-right">
								<Button
									size="sm"
									className="my-2 mx-3"
									onClick={() => setActiveView(CalendarViews.CreateAppointment)}
								>
									Schedule
								</Button>
							</Col>
						)}
					</>
				)}

				{activeView === CalendarViews.DaySelect && (
					<Col xs={12} md={4}>
						<h4 className="my-2 mx-4">Select a day</h4>
					</Col>
				)}

				{activeView === CalendarViews.Availability && (
					<Col xs={12} md={4}>
						<h4 className="my-2 mx-4">Manage my availability</h4>
					</Col>
				)}

				{activeView === CalendarViews.AddAvailability && (
					<Col xs={12} md={4}>
						<h4 className="my-2 mx-4">Add availability</h4>
					</Col>
				)}
			</Row>

			<Row>
				{(activeView === CalendarViews.Day || activeView === CalendarViews.CreateAppointment) && (
					<>
						<Col xs={12} md={4}>
							<AppointmentList
								onSelectPatient={(patient) => {
									setSelectedPatient(patient);
									setActiveView(CalendarViews.Day);
								}}
								onSelectSlot={(id) => setSelectedSlotId(id)}
								selectedDay={selectedDayMoment}
								selectedSlotId={selectedSlotId}
								ref={apptListCtrlRef}
							/>
						</Col>
						<Col xs={12} md={8}>
							{activeView === CalendarViews.Day &&
								selectedPatient &&
								patientDisposition &&
								!!patientDisposition.id && (
									<div className="my-6 mx-6 py-6">
										<PatientDetailView
											selectedDispositionId={selectedPatient?.accountId}
											disposition={patientDisposition}
											onCloseClick={() => {
												setSelectedPatient(undefined);
												setPatientDisposition(undefined);
												setSelectedSlotId('');
											}}
											onScheduleChange={() => {
												if (apptListCtrlRef.current) {
													apptListCtrlRef.current.fetchSchedule();
												}
											}}
										/>
									</div>
								)}

							{activeView === CalendarViews.CreateAppointment && (
								<ScheduleOnCalendar
									picPatientId={picPatientId}
									initialDate={selectedDayMoment?.format('YYYY-MM-DD')}
									onSuccess={(scheduledDate) => {
										if (apptListCtrlRef.current) {
											apptListCtrlRef.current.fetchSchedule();
										}

										setActiveView(CalendarViews.Day, moment(scheduledDate));
									}}
									onCancel={() => {
										setActiveView(CalendarViews.Day);
									}}
								/>
							)}
						</Col>
					</>
				)}

				{activeView === CalendarViews.DaySelect && (
					<Col xs={12} md={6}>
						<CalendarDaySelect
							selectedDay={selectedDayMoment}
							onDaySelect={(selected) => {
								setActiveView(CalendarViews.Day, selected);
							}}
						/>
					</Col>
				)}

				{activeView === CalendarViews.Availability && (
					<Col xs={12} md={6}>
						<div className="my-2 mx-4" style={{ maxWidth: 360 }}>
							<CalendarAvailabilities
								selectedDay={selectedDayMoment}
								onBack={() => {
									setActiveView(CalendarViews.Day);
								}}
								onAdd={() => {
									setActiveView(CalendarViews.AddAvailability);
								}}
							/>
						</div>
					</Col>
				)}

				{activeView === CalendarViews.AddAvailability && (
					<Col xs={12} md={6}>
						<div className="my-2 mx-4" style={{ maxWidth: 320 }}>
							<AddCalendarAvailability
								selectedDay={selectedDayMoment}
								onBack={() => {
									setActiveView(CalendarViews.Availability);
								}}
								onSuccess={() => {
									setActiveView(CalendarViews.Availability);
								}}
							/>
						</div>
					</Col>
				)}
			</Row>
		</Container>
	);
};

export default PicProviderCalendar;
