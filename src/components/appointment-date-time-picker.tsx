import React, { useState } from 'react';
import classNames from 'classnames';
import moment, { Moment } from 'moment';
import { Button } from 'react-bootstrap';

import DatePicker from '@/components/date-picker';
import SvgIcon from '@/components/svg-icon';
import TabBar from '@/components/tab-bar';
import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';

type TimeSlotGroup = {
	label: 'Morning' | 'Afternoon' | 'Evening';
	slots: string[];
};

export interface AppointmentDateTimePickerProps {
	value: Moment;
	onChange(value: Moment): void;
}

const defaultSelectedTime = '2:00PM';
const seededFirstAvailableDateTime = moment('2026-05-04 2:00PM', 'YYYY-MM-DD h:mmA');
const defaultAppointmentType = 'PHONE';

const noSlotDateKeys = new Set(['2026-05-14', '2026-05-20', '2026-05-21', '2026-05-30']);

const appointmentTypeTabs = [
	{ value: 'IN_PERSON', title: 'In-Person Appointments' },
	{ value: 'ONLINE', title: 'Online Appointments' },
	{ value: 'PHONE', title: 'Phone Appointments' },
];

const timeSlotGroups: TimeSlotGroup[] = [
	{ label: 'Morning', slots: [] },
	{ label: 'Afternoon', slots: ['2:00PM', '2:30PM', '3:00PM'] },
	{ label: 'Evening', slots: ['5:00PM', '5:30PM', '6:00PM'] },
];

export const getDefaultAppointmentDateTime = () => {
	return getFirstAvailableAppointmentDateTime();
};

const createAppointmentDateTime = (date: Date, time: string) => {
	const timeMoment = moment(time, 'h:mmA');

	return moment(date).startOf('day').set({
		hour: timeMoment.hour(),
		minute: timeMoment.minute(),
		second: 0,
		millisecond: 0,
	});
};

const formatDateKey = (date: Date) => moment(date).format('YYYY-MM-DD');
const isNoSlotDate = (date: Date) => noSlotDateKeys.has(formatDateKey(date));
const isPastDate = (date: Date, minDate: Date) => moment(date).isBefore(minDate, 'day');
const getNextSelectableDate = (date: Date) => {
	const nextSelectableDate = moment(date).startOf('day');

	while (isNoSlotDate(nextSelectableDate.toDate())) {
		nextSelectableDate.add(1, 'day');
	}

	return nextSelectableDate.toDate();
};

const getFirstAvailableAppointmentDateTime = () => {
	const now = moment();
	let nextAvailableDateTime = seededFirstAvailableDateTime.clone();

	if (nextAvailableDateTime.isBefore(now) || isNoSlotDate(nextAvailableDateTime.toDate())) {
		nextAvailableDateTime = createAppointmentDateTime(getNextSelectableDate(now.toDate()), defaultSelectedTime);
	}

	while (nextAvailableDateTime.isBefore(now) || isNoSlotDate(nextAvailableDateTime.toDate())) {
		nextAvailableDateTime = createAppointmentDateTime(
			nextAvailableDateTime.clone().add(1, 'day').toDate(),
			defaultSelectedTime
		);
	}

	return nextAvailableDateTime;
};

const useStyles = createUseThemedStyles((theme) => ({
	appointmentTypeTabs: {
		'& ul': {
			width: '100%',
		},
	},
	appointmentTypeTabsInner: {
		'& li': {
			flex: 1,
			textAlign: 'center',
		},
		'& li button': {
			width: '100%',
		},
	},
	firstAvailableCallout: {
		gap: 16,
		display: 'flex',
		margin: '32px 24px 0',
		padding: '20px 24px',
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'space-between',
		border: `1px solid ${theme.colors.border}`,
		[mediaQueries.sm]: {
			alignItems: 'stretch',
			flexDirection: 'column',
		},
	},
	firstAvailableIconOuter: {
		width: 36,
		height: 36,
		display: 'flex',
		flexShrink: 0,
		borderRadius: 500,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.p50,
	},
	firstAvailableButton: {
		flexShrink: 0,
	},
	inlineCalendar: {
		padding: 16,
		'& .react-datepicker__header': {
			backgroundColor: 'transparent',
		},
		'& .react-datepicker__day-name': {
			color: theme.colors.n500,
		},
	},
	calendarHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	monthNavButton: {
		width: 36,
		height: 36,
		padding: 0,
		minHeight: 36,
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: theme.colors.n900,
	},
	datePickerDayNoSlots: {
		color: `${theme.colors.n500} !important`,
		cursor: 'default',
	},
	datePickerDayInner: {
		width: '100%',
		height: '100%',
		display: 'flex',
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
		'&:hover $dayTooltip, &:focus-within $dayTooltip': {
			opacity: 1,
		},
	},
	dayTooltip: {
		left: '50%',
		top: '25%',
		zIndex: 2,
		width: 152,
		opacity: 0,
		padding: '10px 14px',
		position: 'absolute',
		marginTop: -4,
		borderRadius: 8,
		pointerEvents: 'none',
		textAlign: 'center',
		color: theme.colors.n0,
		transform: 'translateX(-50%)',
		backgroundColor: theme.colors.n700,
		boxShadow: theme.elevation.e200,
		...theme.fonts.default,
		transition: 'opacity 160ms ease',
		[mediaQueries.sm]: {
			width: 190,
			...theme.fonts.default,
		},
	},
	slotPanel: {
		paddingLeft: 40,
	},
}));

const AppointmentDateTimePicker = ({ value, onChange }: AppointmentDateTimePickerProps) => {
	const classes = useStyles();
	const minSelectableDate = moment().startOf('day').toDate();
	const [selectedAppointmentType, setSelectedAppointmentType] = useState(defaultAppointmentType);

	const selectedDateLabel = value.format('MMMM D, YYYY');
	const selectedTime = value.format('h:mmA');
	const firstAvailableDateTime = getFirstAvailableAppointmentDateTime();
	const firstAvailableAppointmentLabel = `${firstAvailableDateTime.format(
		'ddd, MMM D'
	)}, ${firstAvailableDateTime.format('h:mmA')}`;

	const handleDateSelect = (date: Date | null) => {
		if (!date || isPastDate(date, minSelectableDate) || isNoSlotDate(date)) {
			return;
		}

		onChange(createAppointmentDateTime(date, defaultSelectedTime));
	};

	const handleTimeSelect = (slot: string) => {
		onChange(createAppointmentDateTime(value.toDate(), slot));
	};

	const handleFirstAvailableSelect = () => {
		onChange(firstAvailableDateTime.clone());
	};

	return (
		<>
			<TabBar
				value={selectedAppointmentType}
				tabs={appointmentTypeTabs}
				onTabClick={setSelectedAppointmentType}
				className={classes.appointmentTypeTabs}
				classNameInner={classes.appointmentTypeTabsInner}
			/>
			<div className={classes.firstAvailableCallout}>
				<div className="d-flex align-items-center">
					<div className={classNames(classes.firstAvailableIconOuter, 'me-4')}>
						<SvgIcon kit="far" icon="calendar" size={16} className="text-primary" />
					</div>
					<p className="mb-0 fs-large fw-bold">First Available {'{In-Person}'} Appointment:</p>
				</div>
				<Button
					type="button"
					variant="primary"
					className={classes.firstAvailableButton}
					onClick={handleFirstAvailableSelect}
				>
					{firstAvailableAppointmentLabel}
				</Button>
			</div>
			<div className="d-flex py-8 px-6">
				<DatePicker
					inline
					selected={value.toDate()}
					onChange={handleDateSelect}
					minDate={minSelectableDate}
					calendarClassName={classes.inlineCalendar}
					dayClassName={(date) =>
						classNames({
							[classes.datePickerDayNoSlots]: isNoSlotDate(date),
						})
					}
					renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled }) => (
						<div className={classNames(classes.calendarHeader)}>
							<Button
								type="button"
								variant="transparent-secondary"
								className={classes.monthNavButton}
								aria-label="Previous month"
								disabled={prevMonthButtonDisabled}
								onClick={decreaseMonth}
							>
								<SvgIcon kit="far" icon="chevron-left" size={18} />
							</Button>
							<h5 className="mb-0">{moment(date).format('MMMM YYYY')}</h5>
							<Button
								type="button"
								variant="transparent-secondary"
								className={classes.monthNavButton}
								aria-label="Next month"
								onClick={increaseMonth}
							>
								<SvgIcon kit="far" icon="chevron-right" size={18} />
							</Button>
						</div>
					)}
					renderDayContents={(dayOfMonth, date) => {
						const hasNoSlots = date ? isNoSlotDate(date) : false;

						return (
							<span className={classes.datePickerDayInner}>
								{dayOfMonth}
								{hasNoSlots && (
									<span className={classes.dayTooltip} role="tooltip">
										There are no timeslots available for this day
									</span>
								)}
							</span>
						);
					}}
				/>
				<div className={classes.slotPanel}>
					<h3 className="mb-5">{selectedDateLabel}</h3>
					{timeSlotGroups.map((timeSlotGroup, timeSlotGroupIndex) => (
						<div
							key={timeSlotGroup.label}
							className={classNames({
								'mb-6': timeSlotGroupIndex < timeSlotGroups.length - 1,
							})}
						>
							<p className={'mb-2'}>{timeSlotGroup.label}</p>
							{timeSlotGroup.slots.length === 0 ? (
								<p className="text-muted">No Appointment Slots</p>
							) : (
								<div className="d-flex">
									{timeSlotGroup.slots.map((slot) => {
										const isSelected = slot === selectedTime;

										return (
											<Button
												key={slot}
												type="button"
												variant={isSelected ? 'primary' : 'outline-primary'}
												aria-pressed={isSelected}
												onClick={() => handleTimeSelect(slot)}
											>
												{slot}
											</Button>
										);
									})}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</>
	);
};

export default AppointmentDateTimePicker;
