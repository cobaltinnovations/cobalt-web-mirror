import useAccount from '@/hooks/use-account';
import colors from '@/jss/colors';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import classNames from 'classnames';
import moment, { Moment } from 'moment';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { ManageAvailabilityPanel } from './manage-availability-panel';
import { EditAvailabilityPanel } from './edit-availability-panel';

import { useContainerStyles } from './use-scheduling-styles';
import { EditAppointmentPanel } from './edit-appointment-panel';
import { AppointmentDetailPanel } from './appointment-detail-panel';
import { FollowUpsListPanel } from './follow-ups-list-panel';
import { SelectedAvailabilityPanel } from './selected-availability-panel';
import { useProviderCalendar } from './use-provider-calendar';
import { Link, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import useHeaderTitle from '@/hooks/use-header-title';

enum MainCalendarView {
	Day = 'timeGridDay',
	Week = 'timeGridWeek',
	Month = 'dayGridMonth',
}

export const MySchedule: FC = () => {
	useHeaderTitle('my schedule');
	const classes = useContainerStyles();
	const { account } = useAccount();
	const routeMatch = useRouteMatch();
	const history = useHistory();

	const [followupPatientList, setFollowupPatientList] = useState<any[]>([]);

	const [currentMainCalendarView, setCurrentMainCalendarView] = useState<MainCalendarView>(MainCalendarView.Week);
	const [focusDateOnLoad, setFocusDateOnLoad] = useState(true);
	const [managingAvailabilties, setManagingAvailabilties] = useState(false);
	const [mainStartDate, setMainStartDate] = useState<string>();
	const [mainEndDate, setMainEndDate] = useState<string>();
	const [leftStartDate, setLeftStartDate] = useState<string>();
	const [leftEndDate, setLeftEndDate] = useState<string>();

	const [leftCalendarMoment, setLeftCalendarMoment] = useState<Moment>();
	const leftCalendarRef = useRef<FullCalendar>(null);
	const mainCalendarRef = useRef<FullCalendar>(null);

	const providerId = account?.providerId ?? '';
	const { fetchData: fetchMainData, calendarEvents: mainCalendarEvents } = useProviderCalendar({
		providerId,
		startDate: mainStartDate,
		endDate: mainEndDate,
	});
	const { fetchData: fetchLeftData, calendarEvents: leftCalendarEvents } = useProviderCalendar({
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
		const start = (leftCalendarMoment || moment()).clone().startOf('week').weekday(0);
		const end = start.clone().weekday(7);

		return [
			...leftCalendarEvents,
			{
				id: 'current-week',
				start: start.toDate(),
				end: end.toDate(),
				display: 'background',
				allDay: true,
				backgroundColor: colors.secondary,
			},
		];
	}, [leftCalendarEvents, leftCalendarMoment]);

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
		const nextMoment = moment(date);

		mainCalendarRef.current?.getApi().gotoDate(date);
		leftCalendarRef.current?.getApi().gotoDate(date);
		setLeftCalendarMoment(nextMoment);

		if (scrollTime) {
			setTimeout(() => {
				mainCalendarRef.current?.getApi().scrollToTime(scrollTime);
			});
		}
	}, []);

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
							left: 'title prev next',
							right: 'today',
						}}
						dateClick={(clickInfo) => {
							const mainCalendarApi = mainCalendarRef.current?.getApi();
							const mainMoment = moment(mainCalendarApi?.getDate());
							const clickedDate = clickInfo.date;
							const clickedMoment = moment(clickedDate);

							setCalendarDate(clickedDate);

							if (currentMainCalendarView === MainCalendarView.Week) {
								clickedMoment.week() === mainMoment.week() && fetchMainData();
							} else if (currentMainCalendarView === MainCalendarView.Day) {
								clickedMoment.day() === mainMoment.day() && fetchMainData();
							}
						}}
						datesSet={({ start, end }) => {
							setLeftStartDate(moment(start).format('YYYY-MM-DD'));
							setLeftEndDate(moment(end).format('YYYY-MM-DD'));
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
						as={Link}
						to={`${routeMatch.path}/appointments/new-appointment`}
						variant="link"
						size="sm"
						className="p-0 mb-5 font-size-xs"
					>
						new appointment
					</Button>

					<Button
						as={Link}
						to={`${routeMatch.path}/availabilities`}
						variant="link"
						size="sm"
						className="p-0 mb-5 font-size-xs"
						onClick={() => {
							setManagingAvailabilties(true);
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
					events={renderedMainCalendarEvents}
					eventContent={(evtInfo) => {
						if (evtInfo.event.display === 'background') {
							return;
						}

						const startTime = evtInfo.event.allDay ? null : moment(evtInfo.event.start).format('h:mma');

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
							history.push(
								`${routeMatch.path}/availabilities/${clickInfo.event.extendedProps.logicalAvailabilityId}`
							);
							return;
						} else if (clickInfo.event.extendedProps.appointmentId) {
							setFocusDateOnLoad(false);
							history.push(
								`${routeMatch.path}/appointments/${clickInfo.event.extendedProps.appointmentId}`
							);
						}
					}}
					datesSet={({ start, end }) => {
						setMainStartDate(moment(start).format('YYYY-MM-DD'));
						setMainEndDate(moment(end).format('YYYY-MM-DD'));
					}}
				/>
			</div>

			<Switch>
				<Route
					exact
					path={[
						`${routeMatch.path}/appointments/new-appointment`,
						`${routeMatch.path}/appointments/:appointmentId/edit`,
					]}
				>
					<div className={classNames('px-5 h-100', classes.sideBar)}>
						<EditAppointmentPanel
							focusDateOnLoad={focusDateOnLoad}
							setCalendarDate={setCalendarDate}
							onClose={(updatedAppointmentId) => {
								setFocusDateOnLoad(false);
								history.push(`${routeMatch.path}/appointments/${updatedAppointmentId}`);

								fetchMainData();
								fetchLeftData();
							}}
						/>
					</div>
				</Route>

				<Route exact path={`${routeMatch.path}/appointments/:appointmentId`}>
					<div className={classNames('px-5 h-100', classes.sideBar)}>
						<AppointmentDetailPanel
							focusDateOnLoad={focusDateOnLoad}
							setCalendarDate={setCalendarDate}
							onAddAppointment={() => {
								history.push(`${routeMatch.path}/appointments/new-appointment`);
							}}
							onClose={() => {
								setFocusDateOnLoad(true);
								history.push(`${routeMatch.path}`);
							}}
						/>
					</div>
				</Route>

				<Route exact path={`${routeMatch.path}/availabilities`}>
					<div className={classNames('px-5 h-100', classes.sideBar)}>
						<ManageAvailabilityPanel
							onClose={() => {
								setManagingAvailabilties(false);
								history.push(`${routeMatch.path}`);
							}}
						/>
					</div>
				</Route>

				<Route
					exact
					path={[
						`${routeMatch.path}/availabilities/new-availability`,
						`${routeMatch.path}/availabilities/new-blocked-time`,
						`${routeMatch.path}/availabilities/:logicalAvailabilityId/edit`,
					]}
				>
					<div className={classNames('px-5 h-100', classes.sideBar)}>
						<EditAvailabilityPanel
							onClose={(logicalAvailabilityId) => {
								if (managingAvailabilties) {
									history.push(`${routeMatch.path}/availabilities`);
								} else if (logicalAvailabilityId) {
									history.push(`${routeMatch.path}/availabilities/${logicalAvailabilityId}`);
								} else {
									history.push(`${routeMatch.path}`);
								}

								fetchMainData();
								fetchLeftData();
							}}
						/>
					</div>
				</Route>

				<Route exact path={`${routeMatch.path}/availabilities/:logicalAvailabilityId`}>
					<div className={classNames('px-5 h-100', classes.sideBar)}>
						<SelectedAvailabilityPanel
							onClose={() => {
								history.push(`${routeMatch.path}`);
							}}
						/>
					</div>
				</Route>
			</Switch>

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
