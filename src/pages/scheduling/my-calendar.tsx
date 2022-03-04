import Accordion from '@/components/accordion';
import useAccount from '@/hooks/use-account';
import colors from '@/jss/colors';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import classNames from 'classnames';
import moment, { Moment } from 'moment';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { ManageAvailabilityPanel } from './manage-availability-panel';
import { EditAvailabilityPanel } from './edit-availability-panel';
import { EditUnavailableTimeBlockPanel } from './edit-unavailable-time-block-panel';

import { useContainerStyles } from './use-scheduling-styles';
import { EditAppointmentPanel } from './edit-appointment-panel';
import { AppointmentDetailPanel } from './appointment-detail-panel';
import { FollowUpsListPanel } from './follow-ups-list-panel';
import { SelectedAvailabilityPanel } from './selected-availability-panel';
import { useProviderCalendar } from './use-provider-calendar';

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
	EditAppointment,
	ViewAppointment,
}

export const MyCalendarScheduling: FC = () => {
	const classes = useContainerStyles();
	const { account } = useAccount();

	const [accordionExpanded, setAccordionExpanded] = useState(false);
	const [activeSidebar, setActiveSidebar] = useState<CalendarSidebar | null>(null);
	const [followupPatientList, setFollowupPatientList] = useState<any[]>([]);
	const [appointmentIdToView, setAppointmentIdToView] = useState<string>();
	const [appointmentIdToEdit, setAppointmentIdToEdit] = useState<string>();

	const [logicalAvailabilityIdToView, setLogicalAvailabilityIdToView] = useState<string>();
	const [logicalAvailabilityIdToEdit, setLogicalAvailabilityIdToEdit] = useState<string>();

	const [currentMainCalendarView, setCurrentMainCalendarView] = useState<MainCalendarView>(MainCalendarView.Week);
	const [mainStartDate, setMainStartDate] = useState<string>();
	const [mainEndDate, setMainEndDate] = useState<string>();
	const [leftStartDate, setLeftStartDate] = useState<string>();
	const [leftEndDate, setLeftEndDate] = useState<string>();

	const [leftCalendarMoment, setLeftCalendarMoment] = useState<Moment>();
	const leftCalendarRef = useRef<FullCalendar>(null);
	const mainCalendarRef = useRef<FullCalendar>(null);

	const [draftEvent, setDraftEvent] = useState<any>();

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

		if (draftEvent) {
			formatted.push(draftEvent);
		}

		return formatted;
	}, [mainCalendarEvents, classes.blockedTimeslot, draftEvent]);

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
						events={renderedLeftCalendarEvents}
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
						variant="link"
						size="sm"
						className="p-0 mb-5 font-size-xs"
						onClick={() => {
							setActiveSidebar(CalendarSidebar.EditAppointment);
							setAppointmentIdToView(undefined);
							setAppointmentIdToEdit(undefined);
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
							setAppointmentIdToView(undefined);
							setAppointmentIdToEdit(undefined);
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
						if (clickInfo.event.allDay) {
							setFollowupPatientList(clickInfo.event.extendedProps.patients);
							return;
						} else if (
							clickInfo.event.extendedProps.isAvailability ||
							clickInfo.event.extendedProps.isBlockedTime
						) {
							setLogicalAvailabilityIdToView(clickInfo.event.extendedProps.logicalAvailabilityId);
							setActiveSidebar(CalendarSidebar.ViewAvailability);
							return;
						} else if (clickInfo.event.extendedProps.appointmentId) {
							setAppointmentIdToView(clickInfo.event.extendedProps.appointmentId);
							setActiveSidebar(CalendarSidebar.ViewAppointment);
						}
					}}
					eventsSet={(events, ...args) => {
						console.log('eventsSet', { events, args });
					}}
					// eventAdd={function(){}}
					// eventChange={function(){}}
					// eventRemove={function(){}}
					datesSet={({ start, end }) => {
						setMainStartDate(moment(start).format('YYYY-MM-DD'));
						setMainEndDate(moment(end).format('YYYY-MM-DD'));
					}}
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
									fetchMainData();
									fetchLeftData();
								}
							}}
						/>
					)}

					{activeSidebar === CalendarSidebar.EditTimeBlock && (
						<EditUnavailableTimeBlockPanel
							logicalAvailabilityId={logicalAvailabilityIdToEdit}
							onClose={(didUpdate) => {
								setLogicalAvailabilityIdToEdit(undefined);

								if (logicalAvailabilityIdToView) {
									setActiveSidebar(CalendarSidebar.ViewAvailability);
								} else {
									setActiveSidebar(CalendarSidebar.ManageAvailability);
								}

								if (didUpdate) {
									fetchMainData();
									fetchLeftData();
								}
							}}
						/>
					)}

					{activeSidebar === CalendarSidebar.ViewAvailability && (
						<SelectedAvailabilityPanel
							logicalAvailabilityId={logicalAvailabilityIdToView}
							onEditAvailability={() => {
								setLogicalAvailabilityIdToEdit(logicalAvailabilityIdToView);
								setActiveSidebar(CalendarSidebar.EditAvailability);
							}}
							onEditTimeBlock={() => {
								setLogicalAvailabilityIdToEdit(logicalAvailabilityIdToView);
								setActiveSidebar(CalendarSidebar.EditTimeBlock);
							}}
							onClose={() => {
								setLogicalAvailabilityIdToView(undefined);
								setActiveSidebar(null);
							}}
						/>
					)}

					{activeSidebar === CalendarSidebar.EditAppointment && (
						<EditAppointmentPanel
							appointmentId={appointmentIdToEdit}
							onClose={(didUpdate) => {
								setAppointmentIdToEdit(undefined);
								if (appointmentIdToView) {
									setActiveSidebar(CalendarSidebar.ViewAppointment);
								} else {
									setActiveSidebar(null);
								}

								if (didUpdate) {
									fetchMainData();
									fetchLeftData();
								}
							}}
						/>
					)}

					{activeSidebar === CalendarSidebar.ViewAppointment && (
						<AppointmentDetailPanel
							appointmentId={appointmentIdToView}
							onEdit={() => {
								setAppointmentIdToEdit(appointmentIdToView);
								setActiveSidebar(CalendarSidebar.EditAppointment);
							}}
							onAddAppointment={() => {
								setActiveSidebar(CalendarSidebar.EditAppointment);
							}}
							onClose={() => {
								setAppointmentIdToView(undefined);
								setActiveSidebar(null);
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
