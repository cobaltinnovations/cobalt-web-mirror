import React, { useState } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { Modal, Button, ModalProps } from 'react-bootstrap';

import DatePicker from '@/components/date-picker';
import InlineAlert from '@/components/inline-alert';
import SvgIcon from '@/components/svg-icon';
import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';

type TimeSlotGroup = {
	label: 'Morning' | 'Afternoon' | 'Evening';
	slots: string[];
};

const appointmentTitle = 'UPHS Employee Assistance Program';
const appointmentSubtitle = '30 minute intake phone call';
const defaultSelectedDate = moment('2026-05-04', 'YYYY-MM-DD').toDate();
const defaultSelectedTime = '2:00PM';

const noSlotDateKeys = new Set(['2026-05-14', '2026-05-20', '2026-05-21', '2026-05-30']);

const timeSlotGroups: TimeSlotGroup[] = [
	{ label: 'Morning', slots: [] },
	{ label: 'Afternoon', slots: ['2:00PM', '2:30PM', '3:00PM'] },
	{ label: 'Evening', slots: ['5:00PM', '5:30PM', '6:00PM'] },
];

const formatDateKey = (date: Date) => moment(date).format('YYYY-MM-DD');
const formatDateLabel = (date: Date) => moment(date).format('MMMM D, YYYY');
const isNoSlotDate = (date: Date) => noSlotDateKeys.has(formatDateKey(date));
const isPastDate = (date: Date, minDate: Date) => moment(date).isBefore(minDate, 'day');
const getNextSelectableDate = (date: Date) => {
	const nextSelectableDate = moment(date).startOf('day');

	while (isNoSlotDate(nextSelectableDate.toDate())) {
		nextSelectableDate.add(1, 'day');
	}

	return nextSelectableDate.toDate();
};

const getInitialSelectedDate = () => {
	const today = moment().startOf('day');
	const initialDate = moment(defaultSelectedDate).startOf('day');

	if (!initialDate.isBefore(today, 'day') && !isNoSlotDate(initialDate.toDate())) {
		return initialDate.toDate();
	}

	return getNextSelectableDate(today.toDate());
};

const useStyles = createUseThemedStyles((theme) => ({
	providerScheduleModal: {
		maxWidth: 760,
		'& .cobalt-modal__body': {
			padding: 0,
		},
	},
	imagePlaceholder: {
		width: 56,
		height: 56,
		flexShrink: 0,
		marginRight: 16,
		backgroundColor: theme.colors.n500,
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

interface ProviderScheduleModalProps extends ModalProps {}

const ProviderScheduleModal = ({ ...props }: ProviderScheduleModalProps) => {
	const classes = useStyles();
	const minSelectableDate = moment().startOf('day').toDate();
	const [selectedDate, setSelectedDate] = useState(getInitialSelectedDate);
	const [selectedTime, setSelectedTime] = useState(defaultSelectedTime);

	const selectedDateLabel = formatDateLabel(selectedDate);

	const handleDateSelect = (date: Date | null) => {
		if (!date || isPastDate(date, minSelectableDate) || isNoSlotDate(date)) {
			return;
		}

		setSelectedDate(moment(date).startOf('day').toDate());
		setSelectedTime(defaultSelectedTime);
	};

	return (
		<Modal {...props} dialogClassName={classes.providerScheduleModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Schedule Appointment</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="d-flex border-bottom py-8 px-6">
					<div className={classes.imagePlaceholder} aria-hidden="true" />
					<div>
						<h4 className="mb-2">{appointmentTitle}</h4>
						<h4 className="mb-0">{appointmentSubtitle}</h4>
					</div>
				</div>
				<div className="d-flex py-8 px-6">
					<DatePicker
						inline
						selected={selectedDate}
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
													onClick={() => setSelectedTime(slot)}
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
				<div className="pb-8 px-6">
					<InlineAlert
						variant="warning"
						title="Insurance Warning"
						description="Description would go here if needed"
					/>
				</div>
			</Modal.Body>
			<Modal.Footer className="d-flex align-items-center justify-content-between">
				<p className="mb-0 fs-large">
					Appointment Selected:{' '}
					<strong>
						{selectedDateLabel} at {selectedTime}
					</strong>
				</p>
				<Button variant="primary" onClick={props.onHide}>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ProviderScheduleModal;
