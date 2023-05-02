import useAccount from '@/hooks/use-account';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import classNames from 'classnames';
import moment, { Moment } from 'moment';
import React, { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useContainerStyles } from './use-scheduling-styles';
// import { FollowUpsListPanel } from './follow-ups-list-panel';
import { FetchProviderCalendarConfig, useProviderCalendar } from './use-provider-calendar';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useCobaltTheme } from '@/jss/theme';

enum MainCalendarView {
	Day = 'timeGridDay',
	Week = 'timeGridWeek',
	Month = 'dayGridMonth',
}

export interface MyScheduleOutletContext {
	focusDateOnLoad: boolean;
	setFocusDateOnLoad: Dispatch<SetStateAction<boolean>>;
	managingAvailabilities: boolean;
	setManagingAvailabilties: Dispatch<SetStateAction<boolean>>;
	fetchMainData: (config?: FetchProviderCalendarConfig) => Promise<void>;
	fetchLeftData: (config?: FetchProviderCalendarConfig) => Promise<void>;
	accountIdForDetailsPanel: string;
	setCalendarDate: (date: Date, scrollTime?: string) => void;
}

export const MySchedule: FC = () => {
	const theme = useCobaltTheme();
	const classes = useContainerStyles();
	const { account } = useAccount();
	const navigate = useNavigate();

	// const [followupPatientList, setFollowupPatientList] = useState<any[]>([]);

	const [currentMainCalendarView, setCurrentMainCalendarView] = useState<MainCalendarView>(MainCalendarView.Week);
	const [focusDateOnLoad, setFocusDateOnLoad] = useState(true);
	const [accountIdForDetailsPanel, setAccountIdForDetailsPanel] = useState('');
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
			const classNames = [...e.classNames];

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
		let currentMoment = leftCalendarMoment || moment();
		let start;
		let end;

		switch (currentMainCalendarView) {
			case MainCalendarView.Day:
				start = currentMoment.clone().startOf('day');
				end = currentMoment.clone().endOf('day');
				break;
			case MainCalendarView.Month:
				start = currentMoment.clone().startOf('month');
				end = currentMoment.clone().endOf('month').add(1, 'day');
				break;
			case MainCalendarView.Week:
			default:
				start = currentMoment.clone().weekday(0);
				end = currentMoment.clone().weekday(7);
				break;
		}

		return [
			...leftCalendarEvents,
			{
				id: 'current-view-select',
				display: 'background',
				allDay: true,
				backgroundColor: theme.colors.a500,
				start: start.toDate(),
				end: end.toDate(),
			},
		];
	}, [currentMainCalendarView, leftCalendarEvents, leftCalendarMoment, theme.colors.a500]);

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

				<div data-testid="schedulingLeftCalendar" className={classNames('mb-9', classes.leftCalendar)}>
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
					{/* <Link to={`appointments/new-appointment`}>
						<Button
							data-testid="schedulingNewAppointmentButton"
							variant="link"
							size="sm"
							className="p-0 mb-5 fs-default"
						>
							New Appointment
						</Button>
					</Link> */}

					<Link to={`availabilities`}>
						<Button
							data-testid="schedulingManageAvailabilityButton"
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

			<div data-testid="schedulingMainCalendar" className={classes.mainCalendar}>
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
					events={[...renderedMainCalendarEvents]}
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
							// setFollowupPatientList(clickInfo.event.extendedProps.patients);
							return;
						} else if (
							clickInfo.event.extendedProps.isAvailability ||
							clickInfo.event.extendedProps.isBlockedTime
						) {
							setManagingAvailabilties(false);
							navigate(
								`/scheduling/availabilities/${clickInfo.event.extendedProps.logicalAvailabilityId}`
							);
							return;
						} else if (clickInfo.event.extendedProps.appointmentId) {
							setFocusDateOnLoad(false);
							setAccountIdForDetailsPanel(clickInfo.event.extendedProps.accountId);
							navigate(`/scheduling/appointments/${clickInfo.event.extendedProps.appointmentId}`);
						}
					}}
					datesSet={({ start, end }) => {
						setMainStartDate(moment(start).format('YYYY-MM-DD'));
						setMainEndDate(moment(end).format('YYYY-MM-DD'));
					}}
				/>
			</div>

			<Outlet
				context={{
					focusDateOnLoad,
					setFocusDateOnLoad,
					setCalendarDate,
					fetchMainData,
					fetchLeftData,
					accountIdForDetailsPanel,
					managingAvailabilties,
					setManagingAvailabilties,
				}}
			/>

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
