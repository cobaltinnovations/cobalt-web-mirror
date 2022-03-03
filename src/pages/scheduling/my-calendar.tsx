import Accordion from '@/components/accordion';
import DatePicker from '@/components/date-picker';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import colors from '@/jss/colors';
import fonts from '@/jss/fonts';
import { AppointmentType } from '@/lib/models';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import classNames from 'classnames';
import { Formik } from 'formik';
import moment, { Moment } from 'moment';
import React, { FC, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Dropdown, Form } from 'react-bootstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { createUseStyles } from 'react-jss';
import TimeInput from '@/components/time-input';

import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as UnfoldIcon } from '@/assets/icons/icon-unfold.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/copy.svg';

import { ManageAvailabilityPanel } from './manage-availability-panel';
import { AppointmentTypeItem } from './appointment-type-item';
import { EditAvailabilityPanel } from './edit-availability-panel';
import { EditUnavailableTimeBlockPanel } from './edit-unavailable-time-block-panel';
import { schedulingService } from '@/lib/services';
import Color from 'color';
import { ERROR_CODES } from '@/lib/http-client';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';

const useSchedulingStyles = createUseStyles({
	roundBtn: {
		width: 36,
		height: 36,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 100,
		border: `2px solid ${colors.primary}`,
		backgroundColor: 'transparent',
		'& path': {
			fill: colors.primary,
		},
	},
	typeahead: {
		'& .rbt input': {
			height: 56,
		},
		'& .rbt .rbt-menu': {
			border: `1px solid ${colors.border}`,
			padding: 8,
			...fonts.xs,
		},
		'& .dropdown-item': {
			textDecoration: 'none',
		},
	},
});

const useContainerStyles = createUseStyles({
	wrapper: {
		display: 'flex',
		height: 'calc(100vh - 60px)', // subtracting header + footer height
	},
	sideBar: {
		width: 440,
		flexShrink: 0,
		backgroundColor: colors.white,
		overflowX: 'scroll',
	},
	blockedTimeslot: {
		background: `repeating-linear-gradient(
			-45deg,
			transparent,
			transparent 9px,
			${colors.black} 10px,
			${colors.black} 11px
		) !important;`,
	},
	blockedAvailabilityTimeslot: {
		background: `repeating-linear-gradient(
			-45deg,
			#6C7978,
			#6C7978 9px,
			${colors.black} 10px,
			${colors.black} 11px
		) !important;`,
	},
	leftCalendar: {
		'& .fc .fc-toolbar.fc-header-toolbar': {
			marginBottom: 12,
			'& .fc-toolbar-chunk': {
				display: 'flex',
				alignItems: 'center',
				'& .fc-toolbar-title': {
					...fonts.m,
				},
				'& button.fc-prev-button, & button.fc-next-button': {
					margin: 0,
					border: 0,
					width: 32,
					height: 32,
					padding: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: 'transparent',
					'& .fc-icon': {
						color: colors.dark,
					},
				},
				'& button.fc-prev-button': {
					marginLeft: 8,
				},
				'& button.fc-today-button': {
					...fonts.xs,
					borderRadius: 500,
					padding: '4px 12px',
					color: colors.primary,
					backgroundColor: 'transparent',
					border: `1px solid ${colors.gray200}`,
				},
			},
		},
		'& .fc-theme-standard .fc-scrollgrid': {
			border: 0,
		},
		'& .fc-theme-standard td, .fc-theme-standard th': {
			border: 0,
			'& a:not([href])': {
				...fonts.xs,
				color: colors.gray600,
			},
		},
		'& .fc .fc-daygrid-day-bg .fc-bg-event': {
			borderRadius: 50,
		},
		'& .fc .fc-daygrid-day': {
			'& .fc-daygrid-day-frame': {
				width: 45,
				height: 45,
				display: 'flex',
				borderRadius: '50%',
				alignItems: 'center',
				flexDirection: 'column',
				justifyContent: 'center',
				margin: '0 auto',
			},
			'& .fc-daygrid-day-number': {
				padding: 0,
				marginTop: -4,
				color: colors.dark,
			},
			'& .fc-daygrid-day-events': {
				width: 6,
				height: 6,
				margin: 0,
				minHeight: 0,
				flexShrink: 0,
				borderRadius: '50%',
				position: 'relative',
				border: `1px solid ${colors.gray600}`,
				'& .fc-daygrid-event-harness': {
					width: 6,
					height: 6,
					top: -1,
					left: -1,
					borderRadius: '50%',
					position: 'relative',
					backgroundColor: colors.primary,
					'& .fc-daygrid-event': {
						display: 'none',
					},
				},
				'& .fc-daygrid-event-harness:not(:first-of-type)': {
					display: 'none',
				},
			},
			'&.fc-day-today': {
				backgroundColor: 'transparent',
				'& .fc-daygrid-day-frame': {
					backgroundColor: colors.secondary,
				},
				'& .fc-daygrid-day-number': {
					color: colors.white,
				},
				'& .fc-daygrid-day-events': {
					border: `1px solid ${colors.white}`,
					'& .fc-daygrid-event-harness': {
						backgroundColor: colors.white,
					},
				},
			},
		},
	},
	mainCalendar: {
		flex: 1,
		height: '100%',
		'& .fc': {
			'& .fc-col-header-cell-cushion': {
				...fonts.s,
				color: colors.dark,
				padding: '9px 7px',
			},
			'& .fc-daygrid-day-events': {
				margin: 0,
			},
			'& .fc-daygrid-body-natural .fc-daygrid-day-events': {
				margin: 0,
			},
			'& .fc-daygrid-event-harness > a': {
				margin: 0,
				borderRadius: 0,
				padding: '6px 7px',
			},
			'& .fc-daygrid-day.fc-day-today, & .fc-timegrid-col.fc-day-today': {
				backgroundColor: '#F1E7DF',
			},
			'& .fc-timegrid-divider': {
				padding: 0,
				borderColor: colors.dark,
			},
			'& .fc-timegrid-slot': {
				height: 48,
			},
			'& .fc-timegrid-slot-label': {
				verticalAlign: 'top',
			},
			'& .fc-timegrid-slot-label-cushion': {
				...fonts.xxxs,
				color: colors.gray600,
				padding: '4px 4px 0 0',
			},
			'& .fc-bg-event': {
				// backgroundColor: colors.white,
			},
			'& .fc-timegrid-now-indicator-arrow': {
				display: 'none',
			},
			'& .fc-timegrid-now-indicator-line': {
				borderColor: colors.primary,
				'&:before': {
					top: -4,
					left: 0,
					width: 7,
					height: 7,
					content: '""',
					borderRadius: '50%',
					position: 'absolute',
					backgroundColor: colors.primary,
				},
			},
			'& .fc-timegrid-event, .fc-timegrid-more-link': {
				borderRadius: 0,
			},
			'& .fc-timegrid-event .fc-event-main': {
				padding: '7px 11px',
			},
			'& .fc-timegrid-event-harness-inset .fc-timegrid-event': {
				boxShadow: 'none',
			},
		},
	},
});

const MOCK_MONDAY = moment().startOf('week').weekday(1);

const MOCK_APPT_TYPES = [
	{
		appointmentTypeId: 'apptType1',
		nickname: '1 hour virtual session',
		color: '#19C59F',
	},
	{
		appointmentTypeId: 'apptType2',
		nickname: '30 minute follow-up',
		color: '#EE8C4E',
	},
	{
		appointmentTypeId: 'apptType3',
		nickname: 'Collaborative care consultation',
		color: '#F2B500',
	},
	{
		appointmentTypeId: 'apptType4',
		nickname: 'All appointment types',
		color: '#979797',
		invertedColor: true,
	},
];

const MOCK_AVAILABILITIES = [
	{
		availabilityId: 'availability1',
		title: 'Weekdays, 9am - 12pm',
		appointmentTypes: [MOCK_APPT_TYPES[3]],
	},
	{
		availabilityId: 'availability2',
		title: 'Monday, Wednesday, Friday, 1pm - 4pm',
		appointmentTypes: [MOCK_APPT_TYPES[3]],
	},
	{
		availabilityId: 'availability3',
		title: 'Tuesday, 1pm - 3pm',
		appointmentTypes: [MOCK_APPT_TYPES[0], MOCK_APPT_TYPES[1]],
	},
	{
		availabilityId: 'availability4',
		title: 'Friday, 1pm - 2:30pm',
		appointmentTypes: [MOCK_APPT_TYPES[1]],
	},
];

enum MainCalendarView {
	Day = 'timeGridDay',
	Week = 'timeGridWeek',
	Month = 'dayGridMonth',
}

enum CalendarSidebar {
	ManageAvailability,
	EditAvailability,
	EditTimeBlock,
	ViewAvailability,
	NewAppointment,
	ViewAppointment,
}

export const MyCalendarScheduling: FC = () => {
	const handleError = useHandleError();
	const classes = useContainerStyles();
	const { account } = useAccount();

	const [accordionExpanded, setAccordionExpanded] = useState(false);
	const [activeSidebar, setActiveSidebar] = useState<CalendarSidebar | null>(null);
	const [followupPatientList, setFollowupPatientList] = useState<any[]>([]);
	const [selectedAppointment, setSelectedAppointment] = useState<any>();

	const [logicalAvailabilityIdToView, setLogicalAvailabilityIdToView] = useState<string>();
	const [logicalAvailabilityIdToEdit, setLogicalAvailabilityIdToEdit] = useState<string>();

	const [currentMainCalendarView, setCurrentMainCalendarView] = useState<MainCalendarView>(MainCalendarView.Week);
	const [activeStartDate, setActiveStartDate] = useState<string>();
	const [activeEndDate, setActiveEndDate] = useState<string>();

	const [leftCalendarMoment, setLeftCalendarMoment] = useState<Moment>();
	const leftCalendarRef = useRef<FullCalendar>(null);
	const mainCalendarRef = useRef<FullCalendar>(null);
	const inFlightRequest = useRef<ReturnType<typeof schedulingService['getCalendar']>>();

	const [draftEvent, setDraftEvent] = useState<any>();

	const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

	const fetchData = useCallback(async () => {
		try {
			if (!mainCalendarRef.current) {
				throw new Error('mainCalendarRef.current is undefined');
			}

			if (!account || !account.providerId || !activeStartDate || !activeEndDate) {
				throw new Error('missing Calendar parameters');
			}

			inFlightRequest.current = schedulingService.getCalendar(account.providerId, {
				startDate: activeStartDate,
				endDate: activeEndDate,
			});

			const { providerCalendar } = await inFlightRequest.current.fetch();

			const formattedAvailabilities = providerCalendar.availabilities.map((availability, index) => {
				return {
					id: `availability${index}`,
					start: availability.startDateTime,
					end: availability.endDateTime,
					display: 'background',
					extendedProps: {
						logicalAvailabilityId: availability.logicalAvailabilityId,
						isAvailability: true,
					},
				};
			});

			const formattedBlockedTimes = providerCalendar.blocks.map((availability, index) => {
				return {
					id: `blockedTime${index}`,
					start: availability.startDateTime,
					end: availability.endDateTime,
					display: 'background',
					extendedProps: {
						isBlockedTime: true,
					},
				};
			});

			const formattedAppointments = providerCalendar.appointments.map((appointment, index) => {
				return {
					id: `appointment${index}`,
					title: appointment.account?.displayName || 'Anonymous',
					start: moment(appointment.startTime).toDate(),
					end: moment(appointment.endTime).toDate(),
					backgroundColor: Color(appointment.appointmentType.hexColor).lighten(0.7).hex(),
					borderColor: appointment.appointmentType.hexColor,
					textColor: '#21312A',
				};
			});

			// [TODO]: MAKE THIS REAL
			const formattedFollowUps = providerCalendar.followups.map((followup, index) => {
				return {
					id: `followups${index}`,
					allDay: true,
					title: 'X followups',
					start: MOCK_MONDAY.clone().toDate(),
					extendedProps: {
						patients: [
							{
								id: 'f1p1',
								name: 'Patient 1',
								phone: '(333) 333-3333',
							},
							{
								id: 'f1p2',
								name: 'Patient 2',
								phone: '(333) 333-3333',
							},
							{
								id: 'f1p3',
								name: 'Patient 3',
								phone: '(333) 333-3333',
							},
						],
					},
				};
			});

			const allCalendarEvents = [
				...formattedFollowUps,
				...formattedAppointments,
				...formattedAvailabilities,
				...formattedBlockedTimes,
			];

			setCalendarEvents(allCalendarEvents);
		} catch (error) {
			if ((error as AxiosError).code !== ERROR_CODES.REQUEST_ABORTED) {
				handleError(error);
			}
		}
	}, [account, activeEndDate, activeStartDate, handleError]);

	const formattedCalendarEvents = useMemo(() => {
		const formatted = calendarEvents.map((e) => {
			const classNames = [];
			if (e.extendedProps?.isBlockedTime && e.extendedProps?.isAvailability) {
				classNames.push(classes.blockedAvailabilityTimeslot);
			} else if (e.extendedProps?.isBlockedTime) {
				classNames.push(classes.blockedTimeslot);
			}

			return {
				...e,
				classNames,
			};
		});
		if (draftEvent) {
			formatted.push(draftEvent);
		}

		return formatted;
	}, [calendarEvents, classes.blockedAvailabilityTimeslot, classes.blockedTimeslot, draftEvent]);

	const leftCalendarEvents = useMemo(() => {
		const start = (leftCalendarMoment || moment()).clone().startOf('week').weekday(0);
		const end = start.clone().weekday(7);

		return [
			...formattedCalendarEvents,
			{
				id: 'current-week',
				start: start.toDate(),
				end: end.toDate(),
				display: 'background',
				allDay: true,
				backgroundColor: colors.secondary,
			},
		];
	}, [formattedCalendarEvents, leftCalendarMoment]);

	useEffect(() => {
		fetchData();

		return () => {
			inFlightRequest.current?.abort();
		};
	}, [fetchData]);

	const sidebarToggled = followupPatientList.length > 0;

	useEffect(() => {
		if (!mainCalendarRef.current) {
			return;
		}

		const mainCalendarApi = mainCalendarRef.current?.getApi();

		if (mainCalendarApi.view.type !== currentMainCalendarView) {
			mainCalendarApi.changeView(currentMainCalendarView);
		}
	}, [currentMainCalendarView]);

	return (
		<div className={classes.wrapper}>
			<div className={classNames('h-100 px-5', classes.sideBar)}>
				<div className="mb-6">
					<Accordion
						open={accordionExpanded}
						onToggle={() => {
							setAccordionExpanded(!accordionExpanded);
						}}
						title="My Calendar"
					>
						<div className="mb-4">
							<Form.Check
								type="radio"
								bsPrefix="cobalt-modal-form__check"
								id="cal1"
								label="Owner"
								checked={true}
								onChange={() => {
									//
								}}
							/>

							<Form.Check
								type="radio"
								bsPrefix="cobalt-modal-form__check"
								id="cal2"
								label="Editor"
								checked={false}
								onChange={() => {
									//
								}}
							/>

							<Form.Check
								type="radio"
								bsPrefix="cobalt-modal-form__check"
								id="cal3"
								label="Viewer"
								checked={false}
								onChange={() => {
									//
								}}
							/>
						</div>
					</Accordion>
				</div>

				<div className={classNames('mb-9', classes.leftCalendar)}>
					<FullCalendar
						ref={leftCalendarRef}
						height="auto"
						plugins={[dayGridPlugin, interactionPlugin]}
						initialView={MainCalendarView.Month}
						events={leftCalendarEvents}
						headerToolbar={{
							left: 'title prev next',
							right: 'today',
						}}
						dateClick={(clickInfo) => {
							const clickedDate = clickInfo.date;

							setLeftCalendarMoment(moment(clickedDate));

							mainCalendarRef.current?.getApi().gotoDate(clickedDate);
							leftCalendarRef.current?.getApi().gotoDate(clickedDate);
						}}
						datesSet={({ start, end }) => {
							setActiveStartDate(moment(start).format('YYYY-MM-DD'));
							setActiveEndDate(moment(end).format('YYYY-MM-DD'));
						}}
					/>
				</div>

				<h5 className="mb-2">view by</h5>
				<div className="mb-9 d-flex">
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						id="calendarView-day"
						label="day"
						checked={currentMainCalendarView === MainCalendarView.Day}
						onChange={() => {
							setCurrentMainCalendarView(MainCalendarView.Day);
						}}
					/>
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						id="calendarView-week"
						label="week"
						className="ml-2"
						checked={currentMainCalendarView === MainCalendarView.Week}
						onChange={() => {
							setCurrentMainCalendarView(MainCalendarView.Week);
						}}
					/>
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						id="calendarView-month"
						label="month"
						className="ml-2"
						checked={currentMainCalendarView === MainCalendarView.Month}
						onChange={() => {
							setCurrentMainCalendarView(MainCalendarView.Month);
						}}
					/>
				</div>

				<h5 className=" mb-5">actions</h5>
				<div className="d-flex flex-column align-items-start">
					<Button
						variant="link"
						size="sm"
						className="p-0 mb-5 font-size-xs"
						onClick={() => {
							setActiveSidebar(CalendarSidebar.NewAppointment);
						}}
					>
						new appointment
					</Button>

					<Button
						variant="link"
						size="sm"
						className="p-0 mb-5 font-size-xs"
						onClick={() => {
							setActiveSidebar(CalendarSidebar.ManageAvailability);
						}}
					>
						manage availability
					</Button>
				</div>
			</div>

			<div className={classes.mainCalendar}>
				<FullCalendar
					ref={mainCalendarRef}
					height="100%"
					plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
					headerToolbar={false}
					initialView={currentMainCalendarView}
					// editable={true}
					// selectable={true}
					// selectMirror={true}
					// dayMaxEvents={true}
					// weekends={weekendsVisible}
					// allDayContent={(...args) => {
					// 	console.log({args})
					// }}
					nowIndicator
					events={formattedCalendarEvents}
					eventContent={(evtInfo) => {
						if (evtInfo.event.display === 'background') {
							return;
						}

						const startTime = evtInfo.event.allDay ? null : moment(evtInfo.event.start).format('h:mma');

						return (
							<div>
								<p className="mb-0">
									<strong>{evtInfo.event.title}</strong>
								</p>
								<p className="mb-0">{startTime}</p>
							</div>
						);
					}}
					// initialEvents={[]} // alternatively, use the `events` setting to fetch from a feed
					// select={(selectInfo) => {
					// 	const title = prompt('Please enter a new title for your event');
					// 	const calendarApi = selectInfo.view.calendar;

					// 	calendarApi.unselect(); // clear date selection

					// 	if (title) {
					// 		calendarApi.addEvent({
					// 			id: Math.random() + 'a',
					// 			title,
					// 			start: selectInfo.startStr,
					// 			end: selectInfo.endStr,
					// 			allDay: selectInfo.allDay,
					// 		});
					// 	}
					// }}
					eventClick={(clickInfo, ...args) => {
						console.log({ clickInfo, args });
						if (clickInfo.event.allDay) {
							setFollowupPatientList(clickInfo.event.extendedProps.patients);
							return;
						} else if (clickInfo.event.extendedProps.isAvailability) {
							setLogicalAvailabilityIdToView(clickInfo.event.extendedProps.logicalAvailabilityId);
							setActiveSidebar(CalendarSidebar.ViewAvailability);
							return;
						} else if (clickInfo.event.extendedProps.isBlockedTime) {
							return;
						}

						setSelectedAppointment(true);

						// if (
						// 	window.confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)
						// ) {
						// 	clickInfo.event.remove();
						// }
					}}
					eventsSet={(events, ...args) => {
						console.log('eventsSet', { events, args });
					}}
					// eventAdd={function(){}}
					// eventChange={function(){}}
					// eventRemove={function(){}}
				/>
			</div>

			{(sidebarToggled || activeSidebar !== null) && (
				<div className={classNames('px-5 h-100', classes.sideBar)}>
					{activeSidebar === CalendarSidebar.ManageAvailability && (
						<ManageAvailabilityPanel
							onEditAvailability={(logicalAvailabilityId) => {
								if (logicalAvailabilityId) {
									setLogicalAvailabilityIdToEdit(logicalAvailabilityId);
								}
								setActiveSidebar(CalendarSidebar.EditAvailability);
							}}
							onEditTimeBlock={(logicalAvailabilityId) => {
								if (logicalAvailabilityId) {
									setLogicalAvailabilityIdToEdit(logicalAvailabilityId);
								}
								setActiveSidebar(CalendarSidebar.EditTimeBlock);
							}}
							onClose={() => {
								setActiveSidebar(null);
							}}
						/>
					)}

					{activeSidebar === CalendarSidebar.EditAvailability && (
						<EditAvailabilityPanel
							logicalAvailabilityId={logicalAvailabilityIdToEdit}
							onClose={(didUpdate) => {
								setLogicalAvailabilityIdToEdit(undefined);

								if (logicalAvailabilityIdToView) {
									setActiveSidebar(CalendarSidebar.ViewAvailability);
								} else {
									setActiveSidebar(CalendarSidebar.ManageAvailability);
								}

								if (didUpdate) {
									fetchData();
								}
							}}
						/>
					)}

					{activeSidebar === CalendarSidebar.EditTimeBlock && (
						<EditUnavailableTimeBlockPanel
							logicalAvailabilityId={logicalAvailabilityIdToEdit}
							onClose={(didUpdate) => {
								setLogicalAvailabilityIdToEdit(undefined);
								setActiveSidebar(CalendarSidebar.ManageAvailability);

								if (didUpdate) {
									fetchData();
								}
							}}
						/>
					)}

					{activeSidebar === CalendarSidebar.ViewAvailability && (
						<SelectedAvailabilityPanel
							onEditAvailability={() => {
								setLogicalAvailabilityIdToEdit(logicalAvailabilityIdToView);
								setActiveSidebar(CalendarSidebar.EditAvailability);
							}}
							onClose={() => {
								setLogicalAvailabilityIdToView(undefined);
								setActiveSidebar(null);
							}}
						/>
					)}

					{activeSidebar === CalendarSidebar.NewAppointment && (
						<AddAppointmentPanel
							onClose={() => {
								setActiveSidebar(null);
							}}
						/>
					)}

					{activeSidebar === CalendarSidebar.ViewAppointment && (
						<SelectedAppointmentPanel
							onAddAppointment={() => {
								setActiveSidebar(CalendarSidebar.NewAppointment);
							}}
							onClose={() => {
								setSelectedAppointment(null);
								fetchData();
							}}
						/>
					)}

					{followupPatientList.length > 0 ? (
						<FollowUpsListPanel
							onClose={() => {
								setFollowupPatientList([]);
							}}
						/>
					) : null}
				</div>
			)}
		</div>
	);
};

export default MyCalendarScheduling;

interface AddAppointmentPanelProps {
	onClose: () => void;
}

const AddAppointmentPanel = ({ onClose }: AddAppointmentPanelProps) => {
	const { account } = useAccount();
	const relativeUrl = `/connect-with-support?&immediateAccess=true&providerId=${account?.providerId}`;
	const fullUrl = `${window.location.protocol}//${window.location.host}${relativeUrl}`;

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>New appointment</h4>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<CloseIcon />
				</Button>
			</div>

			<p>Patients can use this URL to book with you:</p>

			<div className="border d-flex align-items-center p-2">
				<Link to={relativeUrl} target="_blank">
					{fullUrl}
				</Link>

				{navigator?.clipboard ? (
					<Button
						variant="primary"
						size="sm"
						className="px-2 ml-2"
						onClick={() => {
							navigator.clipboard.writeText(fullUrl);
							return;
						}}
					>
						<CopyIcon />
					</Button>
				) : null}
			</div>

			{/* <AddAppointmentForm
				onBack={() => {
					onClose();
				}}
				onSuccess={() => {
					onClose();
				}}
			/> */}
		</div>
	);
};

const AddAppointmentForm: FC<{
	onBack: () => void;
	onSuccess: () => void;
}> = ({ onBack, onSuccess }) => {
	const { account } = useAccount();
	const schedulingClasses = useSchedulingStyles();

	const handleError = useHandleError();

	return (
		<Formik
			initialValues={{
				date: '',
				startTime: '',
				startTimeMeridian: '',
				appointmentTypeId: '',
				patientId: '',
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
			}}
		>
			{(formikBag) => {
				const { values, setFieldValue, handleChange, handleSubmit } = formikBag;
				const isValid = !!values.startTime && !!values.startTimeMeridian;

				return (
					<Form onSubmit={handleSubmit}>
						<Form.Group controlId="date">
							<DatePicker
								showYearDropdown
								showMonthDropdown
								dropdownMode="select"
								labelText={'Date'}
								selected={values.date ? moment(values.date).toDate() : undefined}
								onChange={(date) => {
									setFieldValue('date', date ? moment(date).format('YYYY-MM-DD') : '');
								}}
							/>
						</Form.Group>

						<Form.Group controlId="startTime">
							<Form.Row>
								<Col>
									<TimeInput
										name="startTime"
										label="Start Time"
										time={values.startTime}
										onTimeChange={handleChange}
										meridian={values.startTimeMeridian}
										onMeridianChange={(newStartMeridian) => {
											setFieldValue('startTimeMeridian', newStartMeridian);
										}}
									/>
								</Col>
							</Form.Row>
						</Form.Group>

						<Form.Group controlId="patientId">
							<div className={classNames('border', schedulingClasses.typeahead)}>
								<AsyncTypeahead
									placeholder="Patient name"
									isLoading={false}
									onSearch={(q) => {
										// setIsSearching(true);
									}}
									// labelKey={(patient) => {
									// 	return `${patient.preferredFirstName} ${patient.preferredLastName}`;
									// }}
									id="patient-accountId-search"
									options={[]}
									selected={[]}
									onChange={(selected) => {
										//
									}}
								/>
							</div>
						</Form.Group>

						<AppointmentTypeDropdown
							initial={MOCK_APPT_TYPES[0] as any}
							onChange={(apptType) => {
								setFieldValue('appointmentTypeId', apptType?.appointmentTypeId);
							}}
						/>

						<div className="mt-4 d-flex flex-row justify-content-between">
							<Button
								variant="outline-primary"
								size="sm"
								onClick={() => {
									onBack();
								}}
							>
								cancel
							</Button>
							<Button variant="primary" size="sm" type="submit" disabled={!isValid}>
								save
							</Button>
						</div>
					</Form>
				);
			}}
		</Formik>
	);
};

interface SelectedAvailabilityPanelProps {
	onClose: () => void;
	onEditAvailability: () => void;
}

const SelectedAvailabilityPanel = ({ onClose, onEditAvailability }: SelectedAvailabilityPanelProps) => {
	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>Open availability</h4>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<CloseIcon />
				</Button>
			</div>

			<div className="border p-2">
				<div className="d-flex justify-content-between align-items-center">
					<p className="mb-0">
						<strong>Weekdays, 9am - 12pm</strong>
					</p>

					<Button variant="link" size="sm" className="p-0" onClick={() => onEditAvailability()}>
						edit
					</Button>
				</div>
				<AppointmentTypeItem color={MOCK_APPT_TYPES[0].color} nickname={MOCK_APPT_TYPES[0].nickname} />
				<AppointmentTypeItem color={MOCK_APPT_TYPES[1].color} nickname={MOCK_APPT_TYPES[1].nickname} />
			</div>
		</div>
	);
};

interface FollowUpsListPanelProps {
	onClose: () => void;
}

const FollowUpsListPanel = ({ onClose }: FollowUpsListPanelProps) => {
	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>2 / 3 follow ups</h4>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<CloseIcon />
				</Button>
			</div>

			{[
				{
					name: 'Patient 1',
					phoneNumber: '321-765-4321',
					isDone: true,
				},
				{
					name: 'Patient 2',
					phoneNumber: '321-765-4321',
					isDone: false,
				},
				{
					name: 'Patient 3',
					phoneNumber: '321-765-4321',
					isDone: false,
				},
			].map((followup, idx) => {
				return (
					<div key={idx} className="border-bottom mb-4">
						<div className="d-flex justify-content-between align-items-center">
							<p className="mb-0">
								<strong>{followup.name}</strong>, {followup.phoneNumber}
							</p>

							{followup.isDone ? (
								<p className="text-success">done</p>
							) : (
								<Button
									variant="outline-primary"
									size="sm"
									className="p-1"
									onClick={() => {
										//
									}}
								>
									mark done
								</Button>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
};

interface SelectedAppointmentPanelProps {
	onClose: () => void;
	onAddAppointment: () => void;
}

const SelectedAppointmentPanel = ({ onClose, onAddAppointment }: SelectedAppointmentPanelProps) => {
	const schedulingClasses = useSchedulingStyles();

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>Jane Thompson</h4>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<CloseIcon />
				</Button>
			</div>

			<div className="mb-4">
				<Button
					variant="primary"
					size="sm"
					className="mr-1"
					onClick={() => {
						//
					}}
				>
					join now
				</Button>

				<Button
					variant="primary"
					size="sm"
					className="px-2 mr-1"
					onClick={() => {
						return;
					}}
				>
					<CopyIcon />
				</Button>

				<Button
					variant="primary"
					size="sm"
					className="px-2"
					onClick={() => {
						return;
					}}
				>
					<EditIcon />
				</Button>
			</div>

			<div className="border p-2 my-2">
				<div className="d-flex justify-content-between align-items-center">
					<p className="mb-0">
						<strong>contact information</strong>
					</p>

					<Button
						variant="link"
						size="sm"
						className="p-0"
						onClick={() => {
							return;
						}}
					>
						<EditIcon />
					</Button>
				</div>
			</div>

			<div className="border p-2 my-2">
				<div className="d-flex mb-1 justify-content-between align-items-center">
					<p className="mb-0">
						<strong>assessments completed</strong>
					</p>
				</div>

				<div className="d-flex mb-1 justify-content-between align-items-center">
					<p className="mb-0">
						<strong>PH-9</strong> Mon 7/28/20
					</p>

					<Button
						variant="link"
						size="sm"
						className="p-0"
						onClick={() => {
							alert('TODO: Show assessment results');
						}}
					>
						view
					</Button>
				</div>

				<div className="d-flex mb-1 justify-content-between align-items-center">
					<p className="mb-0">
						<strong>PH-9</strong> Wed 8/5/20
					</p>

					<Button
						variant="link"
						size="sm"
						className="p-0"
						onClick={() => {
							alert('TODO: Show assessment results');
						}}
					>
						view
					</Button>
				</div>
			</div>

			<div className="border p-2 my-2">
				<div className="d-flex justify-content-between align-items-center">
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
			</div>
		</div>
	);
};

interface AppointmentTypeDropdownToggleProps {
	selectedAppointmentType?: AppointmentType;
}

const AppointmentTypeDropdownToggle = forwardRef<HTMLButtonElement, AppointmentTypeDropdownToggleProps>(
	({ selectedAppointmentType, ...props }, ref) => {
		return (
			<button
				type="button"
				ref={ref}
				{...props}
				className="border d-flex align-items-center px-3"
				style={{ backgroundColor: 'transparent', width: '100%', height: 56 }}
			>
				<div className="d-flex flex-column w-100">
					<p className="mb-0 text-left" style={{ marginTop: -4 }}>
						Appointment type
					</p>

					{selectedAppointmentType && (
						<AppointmentTypeItem
							//@ts-expect-error type
							color={selectedAppointmentType.color}
							//@ts-expect-error type
							nickname={selectedAppointmentType.nickname}
						/>
					)}
				</div>

				<UnfoldIcon className="ml-auto" />
			</button>
		);
	}
);

interface AppointmentTypeDropdownProps {
	initial?: AppointmentType;
	onChange?: (apptType?: AppointmentType) => void;
}

const AppointmentTypeDropdown = ({ initial, onChange }: AppointmentTypeDropdownProps) => {
	const [selectedType, setSelectedType] = useState(initial);

	return (
		<Dropdown drop="down">
			<Dropdown.Toggle as={AppointmentTypeDropdownToggle} id="reasons" selectedAppointmentType={selectedType} />
			<Dropdown.Menu className="w-100">
				{MOCK_APPT_TYPES.map((apptType, index) => {
					return (
						<Dropdown.Item
							key={index}
							onClick={() => {
								setSelectedType((apptType as unknown) as any);
								onChange && onChange((apptType as unknown) as any);
							}}
							className="text-decoration-none"
						>
							<AppointmentTypeItem color={apptType.color} nickname={apptType.nickname} />
						</Dropdown.Item>
					);
				})}
			</Dropdown.Menu>
		</Dropdown>
	);
};
