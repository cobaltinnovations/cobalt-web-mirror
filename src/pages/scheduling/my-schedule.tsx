import useAccount from '@/hooks/use-account';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { ManageAvailabilityPanel } from './manage-availability-panel';
import { EditAvailabilityPanel } from './edit-availability-panel';

import { useContainerStyles } from './use-scheduling-styles';
import { EditAppointmentPanel } from './edit-appointment-panel';
import {
	addDays,
	endOfDay,
	endOfMonth,
	endOfWeek,
	format,
	formatISO,
	getDay,
	getWeek,
	startOfDay,
	startOfMonth,
	startOfWeek,
} from 'date-fns';
import { AppointmentDetailPanel } from './appointment-detail-panel';
import { FollowUpsListPanel } from './follow-ups-list-panel';
import { SelectedAvailabilityPanel } from './selected-availability-panel';
import { useProviderCalendar } from './use-provider-calendar';
import { Link, Outlet, Route, useNavigate } from 'react-router-dom';
import { useCobaltTheme } from '@/jss/theme';
import SentryRoutes from '@/components/sentry-routes';

enum MainCalendarView {
	Day = 'timeGridDay',
	Week = 'timeGridWeek',
	Month = 'dayGridMonth',
}

export const MySchedule: FC = () => {
	const theme = useCobaltTheme();
	const classes = useContainerStyles();
	const { account } = useAccount();
	const navigate = useNavigate();

	const [followupPatientList, setFollowupPatientList] = useState<any[]>([]);

	const [currentMainCalendarView, setCurrentMainCalendarView] = useState<MainCalendarView>(MainCalendarView.Week);
	const [focusDateOnLoad, setFocusDateOnLoad] = useState(true);
	const [accountIdForDetailsPanel, setAccountIdForDetailsPanel] = useState('');
	const [managingAvailabilties, setManagingAvailabilties] = useState(false);
	const [mainStartDate, setMainStartDate] = useState<string>();
	const [mainEndDate, setMainEndDate] = useState<string>();
	const [leftStartDate, setLeftStartDate] = useState<string>();
	const [leftEndDate, setLeftEndDate] = useState<string>();

	const [leftCalendarDate, setLeftCalendarDate] = useState<Date>();
	const leftCalendarRef = useRef<FullCalendar>(null);
	const mainCalendarRef = useRef<FullCalendar>(null);

	const providerId = account?.providerId ?? '';
	const { fetchData: fetchMainData, calendarEvents: mainCalendarEvents } = useProviderCalendar({
		providerId,
		startDate: mainStartDate,
		endDate: mainEndDate,
	});
	const { calendarEvents: leftCalendarEvents } = useProviderCalendar({
		providerId,
		startDate: leftStartDate,
		endDate: leftEndDate,
	});

	const renderedMainCalendarEvents = useMemo(() => {
		const formatted = mainCalendarEvents.map((e) => {
			const classNames = [];

			if (e.extendedProps?.isBlockedTime) {
				classNames.push(classes.blockedTimeslot);
			}

			return {
				...e,
				classNames,
			};
		});

		return formatted;
	}, [mainCalendarEvents, classes.blockedTimeslot]);

	const renderedLeftCalendarEvents = useMemo(() => {
		let currentDate = leftCalendarDate || new Date();
		let start;
		let end;

		switch (currentMainCalendarView) {
			case MainCalendarView.Day:
				start = startOfDay(currentDate);
				end = endOfDay(currentDate);
				break;
			case MainCalendarView.Month:
				start = startOfMonth(currentDate);
				end = addDays(endOfMonth(currentDate), 1);
				break;
			case MainCalendarView.Week:
			default:
				start = startOfWeek(currentDate);
				end = addDays(endOfWeek(currentDate), 1);
				break;
		}

		return [
			...leftCalendarEvents,
			{
				id: 'current-view-select',
				display: 'background',
				allDay: true,
				backgroundColor: theme.colors.a500,
				start,
				end,
			},
		];
	}, [currentMainCalendarView, leftCalendarEvents, leftCalendarDate, theme.colors.a500]);

	useEffect(() => {
		if (!mainCalendarRef.current) {
			return;
		}

		const mainCalendarApi = mainCalendarRef.current?.getApi();

		if (mainCalendarApi.view.type !== currentMainCalendarView) {
			mainCalendarApi.changeView(currentMainCalendarView);
		}
	}, [currentMainCalendarView]);

	const setCalendarDate = useCallback((date: Date, scrollTime?: string) => {
		mainCalendarRef.current?.getApi().gotoDate(date);
		leftCalendarRef.current?.getApi().gotoDate(date);
		setLeftCalendarDate(date);

		if (scrollTime) {
			setTimeout(() => {
				mainCalendarRef.current?.getApi().scrollToTime(scrollTime);
			});
		}
	}, []);

	const renderedEditAppointmentPanel = useMemo(() => {
		return (
			<div className={classNames('px-5 h-100', classes.sideBar)}>
				<EditAppointmentPanel
					focusDateOnLoad={focusDateOnLoad}
					setCalendarDate={setCalendarDate}
					onClose={(updatedAppointmentId) => {
						setFocusDateOnLoad(false);
						if (updatedAppointmentId) {
							navigate(`appointments/${updatedAppointmentId}`);
						} else {
							navigate(``);
						}
					}}
				/>
			</div>
		);
	}, [classes.sideBar, focusDateOnLoad, navigate, setCalendarDate]);

	const renderedAvailabilityPanel = useMemo(() => {
		return (
			<div className={classNames('px-5 h-100', classes.sideBar)}>
				<EditAvailabilityPanel
					onClose={(logicalAvailabilityId) => {
						if (managingAvailabilties) {
							navigate(`availabilities`);
						} else if (logicalAvailabilityId) {
							navigate(`availabilities/${logicalAvailabilityId}`);
						} else {
							navigate(``);
						}
					}}
				/>
			</div>
		);
	}, [classes.sideBar, managingAvailabilties, navigate]);

	return (
		<div className={classes.wrapper}>
			<div className={classNames('h-100 px-5', classes.sideBar)}>
				<h4 className="my-6">My Calendar</h4>

				<div className={classNames('mb-9', classes.leftCalendar)}>
					<FullCalendar
						ref={leftCalendarRef}
						height="auto"
						plugins={[dayGridPlugin, interactionPlugin]}
						initialView={MainCalendarView.Month}
						events={renderedLeftCalendarEvents}
						headerToolbar={{
							left: 'title',
							right: 'today prev next',
						}}
						dateClick={(clickInfo) => {
							if (!mainCalendarRef.current) {
								return;
							}

							const mainCalendarApi = mainCalendarRef.current.getApi();
							const mainCalendarDate = mainCalendarApi?.getDate();
							const clickedDate = clickInfo.date;

							setCalendarDate(clickedDate);

							if (currentMainCalendarView === MainCalendarView.Week) {
								getWeek(mainCalendarDate) === getWeek(clickedDate) && fetchMainData();
							} else if (currentMainCalendarView === MainCalendarView.Day) {
								getDay(mainCalendarDate) === getDay(clickedDate) && fetchMainData();
							}
						}}
						datesSet={({ start, end }) => {
							setLeftStartDate(formatISO(start, { representation: 'date' }));
							setLeftEndDate(formatISO(end, { representation: 'date' }));
						}}
					/>
				</div>

				<h5 className="mb-2">view by</h5>
				<div className="mb-9 d-flex">
					<Form.Check
						type="radio"
						id="calendarView-day"
						label="day"
						checked={currentMainCalendarView === MainCalendarView.Day}
						onChange={() => {
							setCurrentMainCalendarView(MainCalendarView.Day);
						}}
					/>
					<Form.Check
						type="radio"
						id="calendarView-week"
						label="week"
						className="ms-2"
						checked={currentMainCalendarView === MainCalendarView.Week}
						onChange={() => {
							setCurrentMainCalendarView(MainCalendarView.Week);
						}}
					/>
					<Form.Check
						type="radio"
						id="calendarView-month"
						label="month"
						className="ms-2"
						checked={currentMainCalendarView === MainCalendarView.Month}
						onChange={() => {
							setCurrentMainCalendarView(MainCalendarView.Month);
						}}
					/>
				</div>

				<h5 className=" mb-5">actions</h5>
				<div className="d-flex flex-column align-items-start">
					<Link to={`appointments/new-appointment`}>
						<Button variant="link" size="sm" className="p-0 mb-5 fs-default">
							New Appointment
						</Button>
					</Link>

					<Link to={`availabilities`}>
						<Button
							variant="link"
							size="sm"
							className="p-0 mb-5 fs-default"
							onClick={() => {
								setManagingAvailabilties(true);
							}}
						>
							Manage Availability
						</Button>
					</Link>
				</div>
			</div>

			<div className={classes.mainCalendar}>
				<FullCalendar
					ref={mainCalendarRef}
					height="100%"
					plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
					headerToolbar={false}
					initialView={currentMainCalendarView}
					nowIndicator
					events={renderedMainCalendarEvents}
					eventContent={(evtInfo) => {
						if (evtInfo.event.display === 'background') {
							return;
						}

						const startTime = evtInfo.event.allDay
							? null
							: evtInfo.event.start && format(evtInfo.event.start, 'h:mmaaa');

						return (
							<div>
								<p className={classes.eventText}>
									<strong>{evtInfo.event.title}</strong>
								</p>
								<p className={classes.eventText}>{startTime}</p>
							</div>
						);
					}}
					eventClick={(clickInfo) => {
						if (clickInfo.event.allDay) {
							setFollowupPatientList(clickInfo.event.extendedProps.patients);
							return;
						} else if (
							clickInfo.event.extendedProps.isAvailability ||
							clickInfo.event.extendedProps.isBlockedTime
						) {
							setManagingAvailabilties(false);
							navigate(`availabilities/${clickInfo.event.extendedProps.logicalAvailabilityId}`);
							return;
						} else if (clickInfo.event.extendedProps.appointmentId) {
							setFocusDateOnLoad(false);
							setAccountIdForDetailsPanel(clickInfo.event.extendedProps.accountId);
							navigate(`appointments/${clickInfo.event.extendedProps.appointmentId}`);
						}
					}}
					datesSet={({ start, end }) => {
						setMainStartDate(formatISO(start, { representation: 'date' }));
						setMainEndDate(formatISO(end, { representation: 'date' }));
					}}
				/>
			</div>

			<SentryRoutes>
				<Route element={<Outlet />}>
					<Route path="appointments/new-appointment" element={renderedEditAppointmentPanel} />
					<Route path="appointments/:appointmentId/edit" element={renderedEditAppointmentPanel} />

					<Route
						path="appointments/:appointmentId"
						element={
							<div className={classNames('px-5 h-100', classes.sideBar)}>
								<AppointmentDetailPanel
									focusDateOnLoad={focusDateOnLoad}
									setCalendarDate={setCalendarDate}
									onAddAppointment={() => {
										navigate(`appointments/new-appointment`);
									}}
									onClose={() => {
										setFocusDateOnLoad(true);
										navigate(``);
									}}
									accountId={accountIdForDetailsPanel}
								/>
							</div>
						}
					/>

					<Route
						path={`availabilities`}
						element={
							<div className={classNames('px-5 h-100', classes.sideBar)}>
								<ManageAvailabilityPanel
									onClose={() => {
										setManagingAvailabilties(false);
										navigate(``);
									}}
								/>
							</div>
						}
					/>

					<Route path="availabilities/new-availability" element={renderedAvailabilityPanel} />
					<Route path="availabilities/new-blocked-time" element={renderedAvailabilityPanel} />
					<Route path="availabilities/:logicalAvailabilityId/edit" element={renderedAvailabilityPanel} />

					<Route
						path={`availabilities/:logicalAvailabilityId`}
						element={
							<div className={classNames('px-5 h-100', classes.sideBar)}>
								<SelectedAvailabilityPanel
									onClose={() => {
										navigate(``);
									}}
								/>
							</div>
						}
					/>
				</Route>
			</SentryRoutes>

			{/* {followupPatientList.length > 0 ? (
						<FollowUpsListPanel
							onClose={() => {
								setFollowupPatientList([]);
							}}
						/>
					) : null} */}
		</div>
	);
};

export default MySchedule;
