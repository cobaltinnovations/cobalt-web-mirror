import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as ChevronLeftIcon } from '@/assets/icons/icon-chevron-left.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as UnfoldIcon } from '@/assets/icons/icon-unfold.svg';
import { ReactComponent as WarningTriangleIcon } from '@/assets/icons/icon-warning-triangle.svg';
import Accordion from '@/components/accordion';
import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import colors from '@/jss/colors';
import fonts from '@/jss/fonts';
import { ERROR_CODES } from '@/lib/http-client';
import { AppointmentType } from '@/lib/models';
import { providerService } from '@/lib/services';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import classNames from 'classnames';
import { Formik } from 'formik';
import moment from 'moment';
import React, { FC, forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Container, Dropdown, Form, Modal, ModalProps, Row } from 'react-bootstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import InputMask from 'react-input-mask';
import { createUseStyles } from 'react-jss';

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
	appointmentTypeColorCircle: {
		width: 12,
		height: 12,
		borderRadius: 100,
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
		height: 'calc(100vh - 6px)', // subtracting footer height
	},
	sideBar: {
		backgroundColor: colors.white,
		overflowX: 'scroll',
	},
	blockedTimeslot: {
		background: `repeating-linear-gradient(
			-45deg,
			transparent,
			transparent 9px,
			${colors.border} 10px,
			${colors.border} 11px
		) !important;`,
	},
	blockedAvailabilityTimeslot: {
		background: `repeating-linear-gradient(
			-45deg,
			#6C7978,
			#6C7978 9px,
			${colors.border} 10px,
			${colors.border} 11px
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
		height: '100%',
		'& .fc': {
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
				backgroundColor: colors.white,
			},
			'& .fc-timegrid-now-indicator-arrow': {
				display: 'none',
			},
			'& .fc-timegrid-now-indicator-line': {
				borderColor: colors.primary,
				'&:before': {
					top: -3,
					left: 0,
					width: 6,
					height: 6,
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
		},
	},
});

const MOCK_MONDAY = moment().startOf('week').weekday(1);

const MOCK_FOLLOWUPS = [
	{
		id: 'followups1',
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
	},
	{
		id: 'followups2',
		allDay: true,
		title: 'X followups',
		start: MOCK_MONDAY.clone().weekday(2).toDate(),
		extendedProps: {
			patients: [
				{
					id: 'f2p1',
					name: 'Patient 1',
					phone: '(333) 333-3333',
				},
				{
					id: 'f2p2',
					name: 'Patient 2',
					phone: '(333) 333-3333',
				},
				{
					id: 'f2p3',
					name: 'Patient 3',
					phone: '(333) 333-3333',
				},
			],
		},
	},
];

const MOCK_APPTS = [
	{
		id: 'appt1',
		title: 'Patient Name',
		start: MOCK_MONDAY.clone().hours(9).toDate(),
	},
	{
		id: 'appt2',
		title: 'Patient Name',
		start: MOCK_MONDAY.clone().hours(15).toDate(),
	},
];

const MOCK_AVAILABILITY_EVENTS = [
	{
		id: 'avail1',
		start: MOCK_MONDAY.clone().hours(9).toDate(),
		end: MOCK_MONDAY.clone().hours(12).toDate(),
		display: 'background',
		extendedProps: {
			isAvailability: true,
		},
	},
	{
		id: 'avail2',
		start: MOCK_MONDAY.clone().hours(13).toDate(),
		end: MOCK_MONDAY.clone().hours(17).toDate(),
		display: 'background',
		extendedProps: {
			isAvailability: true,
		},
	},
	{
		id: 'avail3',
		start: MOCK_MONDAY.clone().weekday(2).hours(9).toDate(),
		end: MOCK_MONDAY.clone().weekday(2).hours(12).toDate(),
		display: 'background',
		extendedProps: {
			isAvailability: true,
		},
	},
	{
		id: 'avail4',
		start: MOCK_MONDAY.clone().weekday(2).hours(13).toDate(),
		end: MOCK_MONDAY.clone().weekday(2).hours(17).toDate(),
		display: 'background',
		extendedProps: {
			isAvailability: true,
		},
	},
	{
		id: 'avail5',
		start: MOCK_MONDAY.clone().weekday(3).hours(9).toDate(),
		end: MOCK_MONDAY.clone().weekday(3).hours(12).toDate(),
		display: 'background',
		extendedProps: {
			isAvailability: true,
		},
	},
	{
		id: 'avail6',
		start: MOCK_MONDAY.clone().weekday(3).hours(13).toDate(),
		end: MOCK_MONDAY.clone().weekday(3).hours(17).toDate(),
		display: 'background',
		extendedProps: {
			isAvailability: true,
		},
	},
	{
		id: 'avail7',
		start: MOCK_MONDAY.clone().weekday(4).hours(9).toDate(),
		end: MOCK_MONDAY.clone().weekday(4).hours(12).toDate(),
		display: 'background',
		extendedProps: {
			isAvailability: true,
		},
	},
	{
		id: 'avail8',
		start: MOCK_MONDAY.clone().weekday(4).hours(13).toDate(),
		end: MOCK_MONDAY.clone().weekday(4).hours(17).toDate(),
		display: 'background',
		extendedProps: {
			isAvailability: true,
		},
	},
	{
		id: 'avail9',
		start: MOCK_MONDAY.clone().weekday(5).hours(9).toDate(),
		end: MOCK_MONDAY.clone().weekday(5).hours(12).toDate(),
		display: 'background',
		extendedProps: {
			isAvailability: true,
		},
	},
	{
		id: 'avail10',
		start: MOCK_MONDAY.clone().weekday(5).hours(13).toDate(),
		end: MOCK_MONDAY.clone().weekday(5).hours(14).minutes(30).toDate(),
		display: 'background',
		extendedProps: {
			isAvailability: true,
			isBlockedTime: true,
		},
	},
];

const MOCK_BLOCKED_TIMES = [
	{
		id: 'blockedTime1',
		start: MOCK_MONDAY.clone().weekday(5).hours(13).toDate(),
		end: MOCK_MONDAY.clone().weekday(5).hours(17).toDate(),
		display: 'background',
		extendedProps: {
			isBlockedTime: true,
		},
	},
];

const MOCK_INIT_EVENTS = [...MOCK_FOLLOWUPS, ...MOCK_APPTS, ...MOCK_AVAILABILITY_EVENTS, ...MOCK_BLOCKED_TIMES];

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

export const MyCalendarScheduling: FC = () => {
	const classes = useContainerStyles();
	const [accordionExpanded, setAccordionExpanded] = useState(false);
	const [managingAvailability, setManagingAvailability] = useState(false);
	const [editingAvailability, setEditingAvailability] = useState(false);
	const [editingTimeBlock, setEditingTimeBlock] = useState(false);
	const [addingAppointment, setAddingAppointment] = useState(false);
	const [selectedAvailability, setSelectedAvailability] = useState<typeof MOCK_AVAILABILITIES>();
	const [followupPatientList, setFollowupPatientList] = useState<any[]>([]);
	const [selectedAppointment, setSelectedAppointment] = useState<any>();

	const [currentMainCalendarView, setCurrentMainCalendarView] = useState<MainCalendarView>(MainCalendarView.Week);

	const leftCalendarRef = useRef<FullCalendar>(null);
	const mainCalendarRef = useRef<FullCalendar>(null);

	const [draftEvent, setDraftEvent] = useState<any>();

	const calendarEvents = useMemo(() => {
		const mapped = MOCK_INIT_EVENTS.map((e: any) => {
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
			mapped.push(draftEvent);
		}

		return mapped;
	}, [classes.blockedAvailabilityTimeslot, classes.blockedTimeslot, draftEvent]);

	const sidebarToggled =
		managingAvailability ||
		editingAvailability ||
		editingTimeBlock ||
		addingAppointment ||
		selectedAvailability ||
		selectedAppointment ||
		followupPatientList.length > 0;

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
		<Container fluid>
			<Row className={classNames('no-gutters', classes.wrapper)}>
				<Col xs={3} className={classNames('h-100 px-5', classes.sideBar)}>
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
							events={calendarEvents}
							headerToolbar={{
								left: 'title prev next',
								right: 'today',
							}}
							dateClick={(clickInfo) => {
								if (mainCalendarRef.current) {
									mainCalendarRef.current.getApi().gotoDate(clickInfo.date);
								}
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
								setAddingAppointment(true);
							}}
						>
							new appointment
						</Button>

						<Button
							variant="link"
							size="sm"
							className="p-0 mb-5 font-size-xs"
							onClick={() => {
								setManagingAvailability(true);
							}}
						>
							manage availability
						</Button>

						<Button
							variant="link"
							size="sm"
							className="p-0 text-left font-size-xs"
							onClick={() => {
								setManagingAvailability(true);
							}}
						>
							add unavailable time block
						</Button>
					</div>
				</Col>

				<Col>
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
							events={calendarEvents}
							eventContent={(evtInfo) => {
								if (evtInfo.event.display === 'background') {
									return;
								}

								const startTime = evtInfo.event.allDay
									? null
									: moment(evtInfo.event.start).format('h:mma');

								return (
									<>
										<b>{evtInfo.event.title}</b> {startTime}
									</>
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
									setSelectedAvailability(true as any);
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
				</Col>

				{sidebarToggled && (
					<Col xs={3} className={classNames('px-5 h-100', classes.sideBar)}>
						{editingAvailability ? (
							<EditAvailabilityPanel
								onClose={() => {
									setEditingAvailability(false);
								}}
							/>
						) : selectedAvailability ? (
							<SelectedAvailabilityPanel
								onEditAvailability={() => {
									setEditingAvailability(true);
								}}
								onClose={() => {
									setSelectedAvailability(false as any);
								}}
							/>
						) : editingTimeBlock ? (
							<EditTimeBlockPanel
								onClose={() => {
									setEditingTimeBlock(false);
								}}
							/>
						) : addingAppointment ? (
							<AddAppointmentPanel
								onClose={() => {
									setAddingAppointment(false);
								}}
							/>
						) : managingAvailability ? (
							<ManageAvailabilityPanel
								onEditAvailability={() => {
									setEditingAvailability(true);
								}}
								onEditTimeBlock={() => {
									setEditingTimeBlock(true);
								}}
								onClose={() => {
									setManagingAvailability(false);
								}}
							/>
						) : followupPatientList.length > 0 ? (
							<FollowUpsListPanel
								onClose={() => {
									setFollowupPatientList([]);
								}}
							/>
						) : selectedAppointment ? (
							<SelectedAppointmentPanel
								onAddAppointment={() => {
									setAddingAppointment(true);
								}}
								onClose={() => {
									setSelectedAppointment(null);
								}}
							/>
						) : null}
					</Col>
				)}
			</Row>
		</Container>
	);
};

export default MyCalendarScheduling;

//

interface AppointmentTypeFormModalProps extends ModalProps {
	appointmentTypeId?: string;
}

const useModalStyles = createUseStyles({
	clearQuestionBtn: {
		position: 'absolute',
		top: -22,
		right: -22,
		width: 44,
		height: 44,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 100,
		border: 'none',
		backgroundColor: colors.danger,
	},
});

const AppointmentTypeFormModal = (props: AppointmentTypeFormModalProps) => {
	const { appointmentTypeId, ...modalProps } = props;
	const classes = useModalStyles();

	const [formDataModel, setFormDataModel] = useState({
		title: '',
		color: '',
		nickname: '',
		duration: '',
		collectedClientInfo: {
			firstName: false,
			lastName: false,
			email: true,
			phoneNumber: false,
		},
		screeningQuestions: {
			q1: true,
			q2: true,
			q3: false,
		},
	});

	const [otherDuration, setOtherDuration] = useState('');
	const [newQuestionText, setNewQuestionText] = useState('');

	const MOCK_DURATIONS = [
		{
			label: '30m',
			value: '30',
		},
		{
			label: '45m',
			value: '45',
		},
		{
			label: '60m',
			value: '60',
		},
	];

	const [screeningQuestions, setScreeningQuestions] = useState([
		{
			questionId: 'q1',
			questionText: 'Will this be your first time meeting with this provider?',
			questionHint: '(Screens for new patients)',
		},
		{
			questionId: 'q2',
			questionText: 'Have you met with this provider within the last year?',
			questionHint: '(Screens for returning patients)',
			questionWarning:
				'Usually, this question is not used if “Will this be your first time meeting with this provider?” is enabled',
		},
		{
			questionId: 'q3',
			questionText: 'Are you a legal resident of Pennsylvania?',
			questionHint: '(Screens for PA residents)',
		},
	]);

	useEffect(() => {
		// TODO: Fetch by ID, or is it passed down from parent?
	}, []);

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
					value={''}
					onChange={(event) => {
						// setName(event.currentTarget.value);
					}}
					required
				/>

				<Form.Group>
					<Form.Label style={{ ...fonts.xs }}>Color</Form.Label>
					<div className="d-flex">
						<div>c1</div>
						<div>c2</div>
						<div>c3</div>
						<div>c4</div>
						<div>c5</div>
					</div>
				</Form.Group>

				<InputHelper
					className="mb-4"
					type="text"
					label="Nickname (how this appears on your calendar)"
					value={''}
					onChange={(event) => {
						// setName(event.currentTarget.value);
					}}
					required
				/>

				<Form.Group>
					<Form.Label style={{ ...fonts.xs }}>Duration</Form.Label>
					<div className="d-flex align-items-center">
						{MOCK_DURATIONS.map((duration, idx) => {
							return (
								<Form.Check
									className="mr-6"
									id={`duration-${idx}`}
									key={idx}
									type="radio"
									bsPrefix="cobalt-modal-form__check"
									name="duration"
									label={duration.label}
									checked={formDataModel.duration === duration.value}
									onChange={() => {
										setFormDataModel({
											...formDataModel,
											duration: duration.value,
										});
									}}
								/>
							);
						})}
						<Form.Check
							id="duration-other"
							type="radio"
							bsPrefix="cobalt-modal-form__check"
							name="duration"
							label={
								<InputHelper
									// className="mb-4"
									type="number"
									label="other"
									value={otherDuration}
									onChange={(event) => {
										setOtherDuration(event.target.value);
									}}
								/>
							}
							checked={formDataModel.duration === 'other'}
							onChange={() => {
								setFormDataModel({
									...formDataModel,
									duration: 'other',
								});
							}}
						/>
					</div>
				</Form.Group>

				<h3 className="mb-4">Client Information</h3>

				<Form.Group>
					<Form.Label style={{ ...fonts.xs }}>Collect:</Form.Label>
					<div className="d-flex align-items-center">
						{[
							{ label: 'First name', key: 'firstName' },
							{ label: 'Last name', key: 'lastName' },
							{ label: 'Email (required by Cobalt)', key: 'email', disabled: true },
							{ label: 'Phone number', key: 'phoneNumber' },
						].map(({ key, label, disabled }) => {
							//@ts-expect-error key type
							const isChecked = formDataModel.collectedClientInfo[key];

							return (
								<Form.Check
									id={`collect-${key}`}
									key={key}
									bsPrefix="cobalt-modal-form__check"
									type="checkbox"
									name={`collect-${key}`}
									className="mr-6"
									label={label}
									checked={isChecked}
									disabled={disabled}
									onChange={() => {
										setFormDataModel({
											...formDataModel,
											collectedClientInfo: {
												...formDataModel.collectedClientInfo,
												[key]: !isChecked,
											},
										});
									}}
								/>
							);
						})}
					</div>
				</Form.Group>

				<h3 className="mb-4">Screening Questions</h3>

				{screeningQuestions.map((question, idx) => {
					const hint = question.questionHint ? (
						<small className="d-inline">{question.questionHint}</small>
					) : null;

					const warning = question.questionWarning ? (
						<p className="mb-0 text-secondary font-size-xxs">
							<WarningTriangleIcon /> {question.questionWarning}
						</p>
					) : null;

					return (
						<div key={question.questionId} className="py-3 border-bottom">
							<div className="d-flex align-items-center">
								<p className="mb-0">
									{question.questionText} {hint}
								</p>

								<Form.Check
									className="ml-auto"
									type="switch"
									id={question.questionId}
									// label="Check this switch"
								/>
							</div>

							{warning}
						</div>
					);
				})}

				<div className="mt-5" style={{ position: 'relative' }}>
					<button className={classes.clearQuestionBtn} onClick={() => setNewQuestionText('')}>
						<CloseIcon height={15} width={15} />
					</button>

					<textarea
						name="new-question"
						value={newQuestionText}
						className="w-100 p-1 border text-dark h-100"
						onChange={(e) => {
							setNewQuestionText(e.target.value);
						}}
						rows={5}
					/>

					<Button
						className="mt-2"
						size="sm"
						onClick={() => {
							const newId = `q${screeningQuestions.length + 1}`;

							setFormDataModel({
								...formDataModel,
								screeningQuestions: {
									...formDataModel.screeningQuestions,
									[newId]: false,
								},
							});

							setScreeningQuestions([
								...screeningQuestions,
								{
									questionId: newId,
									questionText: newQuestionText,
									questionHint: '',
									questionWarning: '',
								},
							]);

							setNewQuestionText('');
						}}
					>
						<PlusIcon /> add question
					</Button>
				</div>
			</Modal.Body>

			<Modal.Footer className="border-top pt-5">
				<Button size="sm" variant="link">
					delete
				</Button>

				<div>
					<Button className="mr-2" size="sm" variant="outline-primary">
						cancel
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={() => {
							modalProps.onHide();
						}}
					>
						save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

//

interface ManageAvailabilityPanelProps {
	onClose: () => void;
	onEditAvailability: () => void;
	onEditTimeBlock: () => void;
}

const ManageAvailabilityPanel = ({ onEditAvailability, onEditTimeBlock, onClose }: ManageAvailabilityPanelProps) => {
	const schedulingClasses = useSchedulingStyles();
	const [appointmentTypeModalOpen, setAppointmentTypeModalOpen] = useState(false);

	return (
		<>
			<AppointmentTypeFormModal
				show={appointmentTypeModalOpen}
				onHide={() => {
					setAppointmentTypeModalOpen(false);
				}}
			/>

			<div>
				<div className="d-flex align-items-center justify-content-between py-4">
					<h3>Manage availability</h3>

					<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
						<CloseIcon />
					</Button>
				</div>

				<div className="d-flex align-items-center justify-content-between mb-2">
					<h4>appointment types</h4>

					<button className={schedulingClasses.roundBtn} onClick={() => setAppointmentTypeModalOpen(true)}>
						<PlusIcon />
					</button>
				</div>

				{MOCK_APPT_TYPES.map((apptType) => {
					return (
						<AppointmentTypeItem
							key={apptType.appointmentTypeId}
							color={apptType.color}
							nickname={apptType.nickname}
							onEdit={() => {
								setAppointmentTypeModalOpen(true);
							}}
						/>
					);
				})}

				<div className="d-flex align-items-center justify-content-between mt-4">
					<h4>regular hours</h4>

					<button className={schedulingClasses.roundBtn} onClick={() => onEditAvailability()}>
						<PlusIcon />
					</button>
				</div>

				<div className="d-flex flex-column mt-2">
					{MOCK_AVAILABILITIES.map((availability) => {
						return (
							<div key={availability.availabilityId} className="mb-2 border p-2">
								<div className="d-flex align-items-center justify-content-between">
									<p className="m-0">{availability.title}</p>
									<Button
										variant="link"
										size="sm"
										className="p-0"
										onClick={() => {
											onEditAvailability();
										}}
									>
										<EditIcon height={24} width={24} />
									</Button>
								</div>

								{availability.appointmentTypes.map((apptType) => {
									return (
										<AppointmentTypeItem
											key={apptType.appointmentTypeId}
											color={apptType.color}
											nickname={apptType.nickname}
										/>
									);
								})}
							</div>
						);
					})}
				</div>

				<div className="d-flex align-items-center justify-content-between mt-4">
					<h4>unavailable time block</h4>

					<button className={schedulingClasses.roundBtn} onClick={() => onEditTimeBlock()}>
						<PlusIcon />
					</button>
				</div>

				<div className="d-flex flex-column mt-2">
					<div className="mb-2 border p-2">
						<div className="d-flex align-items-center justify-content-between">
							<p className="m-0">Friday 8/14, 1pm - 4pm</p>

							<Button
								variant="link"
								size="sm"
								className="p-0"
								onClick={() => {
									onEditTimeBlock();
								}}
							>
								<EditIcon height={24} width={24} />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

interface EditAvailabilityPanelProps {
	onClose: () => void;
}

const EditAvailabilityPanel = ({ onClose }: EditAvailabilityPanelProps) => {
	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<ChevronLeftIcon fill={colors.primary} className="mr-1" />
					back
				</Button>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<CloseIcon />
				</Button>
			</div>

			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>Edit availability</h4>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					delete
				</Button>
			</div>

			<AvailabilityForm
				onBack={() => {
					onClose();
				}}
				onSuccess={() => {
					onClose();
				}}
			/>
		</div>
	);
};

interface EditTimeBlockPanelProps {
	onClose: () => void;
}

const EditTimeBlockPanel = ({ onClose }: EditTimeBlockPanelProps) => {
	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<ChevronLeftIcon fill={colors.primary} className="mr-1" />
					back
				</Button>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<CloseIcon />
				</Button>
			</div>

			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>Edit time block</h4>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					delete
				</Button>
			</div>

			<BlockTimeForm
				onBack={() => {
					onClose();
				}}
				onSuccess={() => {
					onClose();
				}}
			/>
		</div>
	);
};

interface AddAppointmentPanelProps {
	onClose: () => void;
}

const AddAppointmentPanel = ({ onClose }: AddAppointmentPanelProps) => {
	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>Add appointment</h4>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<CloseIcon />
				</Button>
			</div>

			<AddAppointmentForm
				onBack={() => {
					onClose();
				}}
				onSuccess={() => {
					onClose();
				}}
			/>
		</div>
	);
};

interface AppointmentTypeItemProps {
	color: string;
	nickname: string;
	onEdit?: () => void;
	invertedColor?: boolean;
}

const AppointmentTypeItem = ({ color, nickname, onEdit, invertedColor }: AppointmentTypeItemProps) => {
	const schedulingClasses = useSchedulingStyles();

	const colorStyle = invertedColor
		? {
				backgroundColor: 'transparent',
				border: `1px solid ${color}`,
		  }
		: {
				backgroundColor: color,
		  };

	return (
		<div className="d-flex align-items-center justify-content-between py-1">
			<div className="d-flex align-items-center">
				<div className={schedulingClasses.appointmentTypeColorCircle} style={colorStyle} />

				<p className="ml-1 mb-0">{nickname}</p>
			</div>

			{onEdit && (
				<Button variant="link" size="sm" className="p-0" onClick={() => onEdit()}>
					<EditIcon />
				</Button>
			)}
		</div>
	);
};

const AvailabilityForm: FC<{
	onBack: () => void;
	onSuccess: () => void;
}> = ({ onBack, onSuccess }) => {
	const { account } = useAccount();
	const handleError = useHandleError();
	console.log({ account });
	const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);

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
	}, [account, handleError]);

	return (
		<Formik
			initialValues={{
				appointmentTypes: [],
				date: '',
				startTime: '',
				startTimeMeridian: '',
				endTime: '',
				endTimeMeridian: '',
				typesAccepted: 'all',
				recurring: false,
				occurance: {
					S: false,
					M: false,
					T: false,
					W: false,
					Th: false,
					F: false,
					Sa: false,
				},
				endDate: '',
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
					appointmentTypeIds: values.appointmentTypes,
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
					!!values.appointmentTypes.length &&
					!!values.startTime &&
					!!values.startTimeMeridian &&
					!!values.endTime &&
					!!values.endTimeMeridian;

				console.log({ values });
				return (
					<Form onSubmit={handleSubmit}>
						<Form.Group controlId="date">
							<DatePicker
								showYearDropdown
								showMonthDropdown
								dropdownMode="select"
								labelText={values.recurring ? 'Start Date' : 'Date'}
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

						<Form.Group controlId="recurring">
							<Form.Check
								id="recurring"
								className="ml-auto"
								type="switch"
								label="Recurring"
								onChange={handleChange}
							/>
						</Form.Group>

						{values.recurring && (
							<>
								<Form.Group>
									<Form.Label style={{ ...fonts.xs }}>Occurs on...</Form.Label>
									<div className="d-flex align-items-center flex-wrap">
										{(['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'] as const).map((dayOfWeek, idx) => {
											return (
												<Form.Check
													className="mr-4"
													key={idx}
													id={`occurance.${dayOfWeek}`}
													bsPrefix="cobalt-modal-form__check"
													type="checkbox"
													label={dayOfWeek}
													checked={values.occurance[dayOfWeek]}
													onChange={() => {
														setFieldValue(
															`occurance.${dayOfWeek}`,
															!values.occurance[dayOfWeek]
														);
													}}
												/>
											);
										})}
									</div>
								</Form.Group>

								<Form.Group controlId="endDate">
									<DatePicker
										showYearDropdown
										showMonthDropdown
										dropdownMode="select"
										labelText="End Date"
										selected={values.endDate ? moment(values.endDate).toDate() : undefined}
										onChange={(date) => {
											setFieldValue('endDate', date ? moment(date).format('YYYY-MM-DD') : '');
										}}
									/>
								</Form.Group>
							</>
						)}

						<Form.Group controlId="typesAccepted">
							<Form.Label style={{ ...fonts.xs }}>Appointment types accepted:</Form.Label>
							<div>
								<Form.Check
									name="typesAccepted"
									id="all"
									className="d-inline-block mr-4"
									bsPrefix="cobalt-modal-form__check"
									type="radio"
									label="all"
									value="all"
									onChange={handleChange}
								/>
								<Form.Check
									name="typesAccepted"
									id="limited"
									className="d-inline-block"
									bsPrefix="cobalt-modal-form__check"
									type="radio"
									label="limit to..."
									value="limited"
									onChange={handleChange}
								/>
							</div>
						</Form.Group>

						{values.typesAccepted === 'limited' && (
							<Form.Group controlId="appointmentTypes">
								{MOCK_APPT_TYPES.map((apptType, idx) => {
									return (
										<Form.Check
											key={idx}
											id={`apptType-${idx}`}
											bsPrefix="cobalt-modal-form__check"
											type="checkbox"
											name="appointmentTypes"
											value={apptType.appointmentTypeId}
											label={
												<AppointmentTypeItem
													color={apptType.color}
													nickname={apptType.nickname}
												/>
											}
										/>
									);
								})}
							</Form.Group>
						)}

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

const BlockTimeForm: FC<{
	onBack: () => void;
	onSuccess: () => void;
}> = ({ onBack, onSuccess }) => {
	const { account } = useAccount();
	const handleError = useHandleError();

	return (
		<Formik
			initialValues={{
				date: '',
				startTime: '',
				startTimeMeridian: '',
				endTime: '',
				endTimeMeridian: '',
				recurring: false,
				occurance: {
					S: false,
					M: false,
					T: false,
					W: false,
					Th: false,
					F: false,
					Sa: false,
				},
				endDate: '',
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

				// const request = providerService.createLogicalAvailability({
				// 	providerId: account.providerId,
				// 	startDateTime: startDateTime.format('YYYY-MM-DDTHH:mm:ss'),
				// 	endDateTime: endDateTime.format('YYYY-MM-DDTHH:mm:ss'),
				// });

				// request
				// 	.fetch()
				// 	.then(() => {
				// 		onSuccess();
				// 	})
				// 	.catch((e) => {
				// 		if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
				// 			handleError(e);
				// 		}
				// 	});
			}}
		>
			{(formikBag) => {
				const { values, setFieldValue, handleChange, handleSubmit } = formikBag;
				const isValid =
					!!values.startTime && !!values.startTimeMeridian && !!values.endTime && !!values.endTimeMeridian;

				return (
					<Form onSubmit={handleSubmit}>
						<Form.Group controlId="date">
							<DatePicker
								showYearDropdown
								showMonthDropdown
								dropdownMode="select"
								labelText={values.recurring ? 'Start Date' : 'Date'}
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

						<Form.Group controlId="recurring">
							<Form.Check
								id="recurring"
								className="ml-auto"
								type="switch"
								label="Recurring"
								onChange={handleChange}
							/>
						</Form.Group>

						{values.recurring && (
							<>
								<Form.Group>
									<Form.Label style={{ ...fonts.xs }}>Occurs on...</Form.Label>
									<div className="d-flex align-items-center flex-wrap">
										{(['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'] as const).map((dayOfWeek, idx) => {
											return (
												<Form.Check
													className="mr-4"
													key={idx}
													id={`occurance.${dayOfWeek}`}
													bsPrefix="cobalt-modal-form__check"
													type="checkbox"
													label={dayOfWeek}
													checked={values.occurance[dayOfWeek]}
													onChange={() => {
														setFieldValue(
															`occurance.${dayOfWeek}`,
															!values.occurance[dayOfWeek]
														);
													}}
												/>
											);
										})}
									</div>
								</Form.Group>

								<Form.Group controlId="endDate">
									<DatePicker
										showYearDropdown
										showMonthDropdown
										dropdownMode="select"
										labelText="End Date"
										selected={values.endDate ? moment(values.endDate).toDate() : undefined}
										onChange={(date) => {
											setFieldValue('endDate', date ? moment(date).format('YYYY-MM-DD') : '');
										}}
									/>
								</Form.Group>
							</>
						)}

						<div className="mb-6 d-flex flex-row justify-content-between">
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
					className="p-1 mr-1"
					onClick={() => {
						//
					}}
				>
					join now
				</Button>

				<Button
					variant="primary"
					size="sm"
					className="p-1 mr-1"
					onClick={() => {
						//
					}}
				>
					copy
				</Button>

				<Button
					variant="primary"
					size="sm"
					className="p-1"
					onClick={() => {
						//
					}}
				>
					edit
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
							//
						}}
					>
						edit
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
						edit
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
						edit
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

const useMeridianSwitchStyles = createUseStyles({
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
});

const MeridianSwitch: FC<{
	selected: string;
	onChange: (newSelected: 'am' | 'pm') => void;
}> = ({ selected, onChange }) => {
	const classes = useMeridianSwitchStyles();

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
