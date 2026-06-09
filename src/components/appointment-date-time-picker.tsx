import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import moment, { Moment } from 'moment';
import { Button } from 'react-bootstrap';

import DatePicker from '@/components/date-picker';
import Loader from '@/components/loader';
import SvgIcon from '@/components/svg-icon';
import TabBar from '@/components/tab-bar';
import useHandleError from '@/hooks/use-handle-error';
import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';
import {
	AppointmentModality,
	AvailabilityTimeSlot,
	ProviderAppointmentModalityId,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import { providerService } from '@/lib/services';

type TimeSlotGroup = {
	label: 'Morning' | 'Afternoon' | 'Evening';
	slots: AvailabilityTimeSlot[];
};

export interface AppointmentDateTimePickerProps {
	value: AppointmentDateTimePickerValue;
	onChange(value: AppointmentDateTimePickerValue): void;
	config?: AppointmentDateTimePickerConfig;
}

export interface AppointmentDateTimePickerValue {
	dateTime: Moment;
	appointmentModalityId?: ProviderAppointmentModalityId;
}

export interface AppointmentDateTimePickerConfig {
	featureId?: string;
	clinicId?: string;
	providerId?: string;
	providerSearchResultTypeId: ProviderSearchResultTypeId;
}

export const getDefaultAppointmentDateTimePickerValue = (): AppointmentDateTimePickerValue => {
	return {
		dateTime: moment(),
	};
};

const createAppointmentDateTime = (date: string | Date, timeSlot: AvailabilityTimeSlot) => {
	const dateKey = typeof date === 'string' ? date : moment(date).format('YYYY-MM-DD');

	return moment(`${dateKey} ${timeSlot.time}`, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD h:mmA']);
};

const formatDateKey = (date: Date) => moment(date).format('YYYY-MM-DD');
const isPastDate = (date: Date, minDate: Date) => moment(date).isBefore(minDate, 'day');

const getTimeSlotHour = (timeSlot: AvailabilityTimeSlot) =>
	moment(timeSlot.time, ['HH:mm:ss', 'HH:mm', 'h:mmA']).hour();

const buildTimeSlotGroups = (timeSlots: AvailabilityTimeSlot[]): TimeSlotGroup[] => {
	return [
		{ label: 'Morning', slots: timeSlots.filter((timeSlot) => getTimeSlotHour(timeSlot) < 12) },
		{
			label: 'Afternoon',
			slots: timeSlots.filter((timeSlot) => {
				const hour = getTimeSlotHour(timeSlot);

				return hour >= 12 && hour < 17;
			}),
		},
		{ label: 'Evening', slots: timeSlots.filter((timeSlot) => getTimeSlotHour(timeSlot) >= 17) },
	];
};

const getFirstAvailableAppointment = (appointmentModality?: AppointmentModality) => {
	const firstAvailability = appointmentModality?.availability[0];
	const firstTimeSlot = firstAvailability?.times[0];

	if (!firstAvailability || !firstTimeSlot) {
		return;
	}

	return {
		date: firstAvailability.date,
		timeSlot: firstTimeSlot,
		dateTime: createAppointmentDateTime(firstAvailability.date, firstTimeSlot),
	};
};

const isDateTimeInAvailability = (dateTime: Moment, appointmentModality?: AppointmentModality) => {
	const dateKey = dateTime.format('YYYY-MM-DD');
	const selectedDateAvailability = appointmentModality?.availability.find(
		(availability) => availability.date === dateKey
	);

	return !!selectedDateAvailability?.times.some((timeSlot) =>
		createAppointmentDateTime(dateKey, timeSlot).isSame(dateTime, 'minute')
	);
};

const useStyles = createUseThemedStyles((theme) => ({
	appointmentModalityTabs: {
		'& ul': {
			width: '100%',
		},
	},
	appointmentModalityTabsInner: {
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
		flex: 1,
		paddingLeft: 40,
		overflow: 'hidden',
	},
	loaderWrapper: {
		minHeight: 420,
		position: 'relative',
	},
}));

const AppointmentDateTimePicker = ({ value, onChange, config }: AppointmentDateTimePickerProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const minSelectableDate = moment().startOf('day').toDate();
	const [isLoading, setIsLoading] = useState(false);
	const [appointmentModalities, setAppointmentModalities] = useState<AppointmentModality[]>([]);
	const selectedAppointmentDateTime = value.dateTime;
	const selectedAppointmentModalityId = value.appointmentModalityId ?? '';

	const selectedAppointmentModality = useMemo(() => {
		return appointmentModalities.find(
			(appointmentModality) => appointmentModality.appointmentModalityId === selectedAppointmentModalityId
		);
	}, [appointmentModalities, selectedAppointmentModalityId]);

	const appointmentModalityTabs = useMemo(() => {
		return appointmentModalities.map((appointmentModality) => ({
			value: appointmentModality.appointmentModalityId,
			title: appointmentModality.description,
		}));
	}, [appointmentModalities]);

	const availableDateKeys = useMemo(() => {
		return new Set(
			selectedAppointmentModality?.availability
				.filter((availability) => availability.times.length > 0)
				.map((availability) => availability.date) ?? []
		);
	}, [selectedAppointmentModality]);
	const selectedDateAvailability = selectedAppointmentModality?.availability.find(
		(availability) => availability.date === selectedAppointmentDateTime.format('YYYY-MM-DD')
	);
	const timeSlotGroups = useMemo(
		() => buildTimeSlotGroups(selectedDateAvailability?.times ?? []),
		[selectedDateAvailability]
	);
	const selectedDateLabel = selectedAppointmentDateTime.format('MMMM D, YYYY');
	const firstAvailableAppointment = useMemo(
		() => getFirstAvailableAppointment(selectedAppointmentModality),
		[selectedAppointmentModality]
	);
	const firstAvailableAppointmentLabel = firstAvailableAppointment
		? `${firstAvailableAppointment.dateTime.format('ddd, MMM D')}, ${
				firstAvailableAppointment.timeSlot.timeDescription
		  }`
		: undefined;
	const isNoSlotDate = (date: Date) => !availableDateKeys.has(formatDateKey(date));

	const handleDateSelect = (date: Date | null) => {
		if (!date || isPastDate(date, minSelectableDate) || isNoSlotDate(date)) {
			return;
		}

		const selectedAvailability = selectedAppointmentModality?.availability.find(
			(availability) => availability.date === formatDateKey(date)
		);
		const firstTimeSlot = selectedAvailability?.times[0];

		if (firstTimeSlot) {
			onChange({
				...value,
				dateTime: createAppointmentDateTime(date, firstTimeSlot),
			});
		}
	};

	const handleTimeSelect = (timeSlot: AvailabilityTimeSlot) => {
		onChange({
			...value,
			dateTime: createAppointmentDateTime(selectedAppointmentDateTime.toDate(), timeSlot),
		});
	};

	const handleAppointmentModalitySelect = (appointmentModalityId: string) => {
		onChange({
			...value,
			appointmentModalityId: appointmentModalityId as ProviderAppointmentModalityId,
		});
	};

	const handleFirstAvailableSelect = () => {
		if (firstAvailableAppointment) {
			onChange({
				...value,
				dateTime: firstAvailableAppointment.dateTime.clone(),
			});
		}
	};

	useEffect(() => {
		let didCancel = false;

		const fetchAvailability = async () => {
			if (!config) {
				setAppointmentModalities([]);
				return;
			}

			setIsLoading(true);

			try {
				if (config.providerSearchResultTypeId === ProviderSearchResultTypeId.CLINIC) {
					if (!config.clinicId) {
						throw new Error('clinicId is required.');
					}

					const response = await providerService
						.getClinicAvailability(config.clinicId, { featureId: config.featureId ?? '' })
						.fetch();

					if (!didCancel) {
						setAppointmentModalities(response.clinicAvailability.appointmentModalities);
					}

					return;
				}

				if (config.providerSearchResultTypeId === ProviderSearchResultTypeId.PROVIDER) {
					if (!config.providerId) {
						throw new Error('providerId is required.');
					}

					const response = await providerService
						.getProviderAvailability(config.providerId, { featureId: config.featureId ?? '' })
						.fetch();

					if (!didCancel) {
						setAppointmentModalities(response.providerAvailability.appointmentModalities);
					}
				}
			} catch (error) {
				handleError(error);
			} finally {
				if (!didCancel) {
					setIsLoading(false);
				}
			}
		};

		fetchAvailability();

		return () => {
			didCancel = true;
		};
	}, [config, handleError]);

	useEffect(() => {
		const nextAppointmentModalityId = appointmentModalityTabs[0]?.value as
			| ProviderAppointmentModalityId
			| undefined;

		if (
			nextAppointmentModalityId &&
			!appointmentModalityTabs.some(
				(appointmentModalityTab) => appointmentModalityTab.value === selectedAppointmentModalityId
			)
		) {
			onChange({
				...value,
				appointmentModalityId: nextAppointmentModalityId,
			});
		}
	}, [appointmentModalityTabs, onChange, selectedAppointmentModalityId, value]);

	useEffect(() => {
		if (
			!selectedAppointmentModality ||
			isDateTimeInAvailability(selectedAppointmentDateTime, selectedAppointmentModality)
		) {
			return;
		}

		const firstAvailableAppointment = getFirstAvailableAppointment(selectedAppointmentModality);

		if (firstAvailableAppointment) {
			onChange({
				...value,
				dateTime: firstAvailableAppointment.dateTime.clone(),
			});
		}
	}, [onChange, selectedAppointmentDateTime, selectedAppointmentModality, value]);

	if (isLoading) {
		return (
			<div className={classes.loaderWrapper}>
				<Loader />
			</div>
		);
	}

	return (
		<>
			{appointmentModalityTabs.length > 0 && (
				<TabBar
					value={selectedAppointmentModalityId}
					tabs={appointmentModalityTabs}
					onTabClick={handleAppointmentModalitySelect}
					className={classes.appointmentModalityTabs}
					classNameInner={classes.appointmentModalityTabsInner}
				/>
			)}
			{firstAvailableAppointmentLabel && (
				<div className={classes.firstAvailableCallout}>
					<div className="d-flex align-items-center">
						<div className={classNames(classes.firstAvailableIconOuter, 'me-4')}>
							<SvgIcon kit="far" icon="calendar" size={16} className="text-primary" />
						</div>
						<p className="mb-0 fs-large fw-bold">
							First Available {'{'}
							{selectedAppointmentModality?.description}
							{'}'} Appointment:
						</p>
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
			)}
			<div className="d-flex py-8 px-6">
				<DatePicker
					inline
					selected={selectedAppointmentDateTime.toDate()}
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
								<div className="w-100 d-flex overflow-auto">
									{timeSlotGroup.slots.map((timeSlot, timeSlotIndex) => {
										const timeSlotDateTime = createAppointmentDateTime(
											selectedAppointmentDateTime.toDate(),
											timeSlot
										);
										const isSelected = timeSlotDateTime.isSame(
											selectedAppointmentDateTime,
											'minute'
										);

										const isLast = timeSlotIndex === timeSlotGroup.slots.length - 1;

										return (
											<Button
												className={classNames({ 'me-2': !isLast })}
												key={timeSlot.time}
												type="button"
												variant={isSelected ? 'primary' : 'outline-primary'}
												aria-pressed={isSelected}
												onClick={() => handleTimeSelect(timeSlot)}
											>
												{timeSlot.timeDescription}
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
