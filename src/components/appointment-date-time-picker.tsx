import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import moment, { Moment } from 'moment';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

import DatePicker from '@/components/date-picker';
import Loader from '@/components/loader';
import SvgIcon from '@/components/svg-icon';
import TabBar from '@/components/tab-bar';
import InputHelper from '@/components/input-helper';
import useHandleError from '@/hooks/use-handle-error';
import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';
import {
	AppointmentModality,
	AppointmentTypeSummary,
	AvailabilityTimeSlot,
	ProviderAppointmentModalityId,
	ProviderAppointmentSelectionTypeId,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import { AvailabilityModel, providerService } from '@/lib/services';
import { shouldFetchInstitutionLocation } from '@/lib/utils';

type TimeSlotGroup = {
	label: 'Morning' | 'Afternoon' | 'Evening';
	slots: AvailabilityTimeSlot[];
};

export const getDefaultAppointmentDateTimePickerValue = (): AppointmentDateTimePickerValue => {
	return {
		dateTime: moment.utc(moment().format('YYYY-MM-DD HH:mm:ss'), 'YYYY-MM-DD HH:mm:ss'),
	};
};

const createAppointmentDateTime = (date: string | Date, timeSlot: AvailabilityTimeSlot) => {
	const dateKey = typeof date === 'string' ? date : moment(date).format('YYYY-MM-DD');

	return moment.utc(`${dateKey} ${timeSlot.time}`, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD h:mmA']);
};

const formatDateKey = (date: Date) => moment(date).format('YYYY-MM-DD');
const isPastDate = (date: Date, minDate: Date) => moment(date).isBefore(minDate, 'day');

const getTimeSlotHour = (timeSlot: AvailabilityTimeSlot) =>
	moment.utc(timeSlot.time, ['HH:mm:ss', 'HH:mm', 'h:mmA']).hour();

const getCalendarDate = (dateTime: Moment) =>
	moment(dateTime.format('YYYY-MM-DD'), 'YYYY-MM-DD', true).hour(12).toDate();

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

const getTimeSlotForDateTime = (dateTime: Moment, appointmentModality?: AppointmentModality, providerId?: string) => {
	const dateKey = dateTime.format('YYYY-MM-DD');
	const selectedDateAvailability = appointmentModality?.availability.find(
		(availability) => availability.date === dateKey
	);
	const matchingTimeSlots = selectedDateAvailability?.times.filter((timeSlot) =>
		createAppointmentDateTime(dateKey, timeSlot).isSame(dateTime, 'minute')
	);

	return matchingTimeSlots?.find((timeSlot) => timeSlot.providerId === providerId) ?? matchingTimeSlots?.[0];
};

const getAppointmentTypeIdForTimeSlot = (timeSlot: AvailabilityTimeSlot, currentAppointmentTypeId?: string) => {
	if (timeSlot.appointmentTypeIds.length === 1) {
		return timeSlot.appointmentTypeIds[0];
	}

	return currentAppointmentTypeId && timeSlot.appointmentTypeIds.includes(currentAppointmentTypeId)
		? currentAppointmentTypeId
		: undefined;
};

const getValueForTimeSlot = (
	value: AppointmentDateTimePickerValue,
	date: string | Date,
	timeSlot: AvailabilityTimeSlot
): AppointmentDateTimePickerValue => {
	const appointmentTypeId = getAppointmentTypeIdForTimeSlot(timeSlot, value.appointmentTypeId);
	const preserveSelectedAppointmentTypeDescription =
		timeSlot.appointmentTypeIds.length > 1 && appointmentTypeId === value.appointmentTypeId;

	return {
		...value,
		dateTime: createAppointmentDateTime(date, timeSlot),
		appointmentTypeIds: [...timeSlot.appointmentTypeIds],
		appointmentTypeId,
		appointmentTypeDescription: preserveSelectedAppointmentTypeDescription
			? value.appointmentTypeDescription
			: timeSlot.appointmentTypeDescription,
		epicDepartmentId: timeSlot.epicDepartmentId,
		epicAppointmentFhirId: timeSlot.epicAppointmentFhirId,
		providerId: timeSlot.providerId,
	};
};

const haveSameStringValues = (left?: string[], right?: string[]) =>
	(left ?? []).length === (right ?? []).length && (left ?? []).every((value, index) => value === right?.[index]);

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
		alignItems: 'center',
		justifyContent: 'center',
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

export interface AppointmentDateTimePickerValue {
	dateTime: Moment;
	appointmentModalityId?: ProviderAppointmentModalityId;
	appointmentTypeIds?: string[];
	appointmentTypeId?: string;
	appointmentTypeDescription?: string;
	epicDepartmentId?: string;
	epicAppointmentFhirId?: string;
	providerId?: string;
}

export interface AppointmentDateTimePickerConfig {
	featureId?: string;
	institutionLocationId?: string;
	clinicId?: string;
	providerId?: string;
	providerSearchResultTypeId: ProviderSearchResultTypeId;
	appointmentSelectionTypeId?: ProviderAppointmentSelectionTypeId;
}

type AppointmentDateTimePickerFetchData = {
	[x: string]: AvailabilityModel;
};

export interface AppointmentDateTimePickerProps {
	value: AppointmentDateTimePickerValue;
	onChange(value: AppointmentDateTimePickerValue): void;
	config?: AppointmentDateTimePickerConfig;
	fetchData?(): Promise<AppointmentDateTimePickerFetchData>;
}

const getAppointmentModalitiesFromFetchData = (data: AppointmentDateTimePickerFetchData) =>
	Object.values(data).flatMap((availability) => availability.appointmentModalities);

const getAppointmentTypesFromFetchData = (data: AppointmentDateTimePickerFetchData) => {
	const appointmentTypesById = new Map<string, AppointmentTypeSummary>();

	for (const appointmentType of Object.values(data).flatMap((availability) => availability.appointmentTypes)) {
		appointmentTypesById.set(appointmentType.appointmentTypeId, appointmentType);
	}

	return Array.from(appointmentTypesById.values());
};

const AppointmentDateTimePicker = ({ value, onChange, config, fetchData }: AppointmentDateTimePickerProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const minSelectableDate = moment().startOf('day').toDate();
	const [isLoading, setIsLoading] = useState(false);
	const [appointmentModalities, setAppointmentModalities] = useState<AppointmentModality[]>([]);
	const [appointmentTypes, setAppointmentTypes] = useState<AppointmentTypeSummary[]>([]);
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
	const selectedAppointmentTypes = useMemo(
		() =>
			(value.appointmentTypeIds ?? []).map(
				(appointmentTypeId) =>
					appointmentTypes.find(
						(appointmentType) => appointmentType.appointmentTypeId === appointmentTypeId
					) ?? {
						appointmentTypeId,
					}
			),
		[appointmentTypes, value.appointmentTypeIds]
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
			onChange(getValueForTimeSlot(value, date, firstTimeSlot));
		}
	};

	const handleTimeSelect = (timeSlot: AvailabilityTimeSlot) => {
		onChange(getValueForTimeSlot(value, selectedAppointmentDateTime.format('YYYY-MM-DD'), timeSlot));
	};

	const handleAppointmentModalitySelect = (appointmentModalityId: string) => {
		onChange({
			...value,
			appointmentModalityId: appointmentModalityId as ProviderAppointmentModalityId,
			appointmentTypeIds: undefined,
			appointmentTypeId: undefined,
			appointmentTypeDescription: undefined,
			epicDepartmentId: undefined,
			epicAppointmentFhirId: undefined,
			providerId: undefined,
		});
	};

	const handleAppointmentTypeSelect = ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
		const appointmentTypeId = currentTarget.value || undefined;
		const appointmentType = appointmentTypes.find(
			(candidateAppointmentType) => candidateAppointmentType.appointmentTypeId === appointmentTypeId
		);

		onChange({
			...value,
			appointmentTypeId,
			appointmentTypeDescription: appointmentType?.description ?? appointmentType?.name,
		});
	};

	const handleFirstAvailableSelect = () => {
		if (firstAvailableAppointment) {
			onChange(getValueForTimeSlot(value, firstAvailableAppointment.date, firstAvailableAppointment.timeSlot));
		}
	};

	useEffect(() => {
		let didCancel = false;

		const fetchAvailability = async () => {
			if (!fetchData && !config) {
				setAppointmentModalities([]);
				setAppointmentTypes([]);
				return;
			}

			setIsLoading(true);

			try {
				if (fetchData) {
					const response = await fetchData();

					if (!didCancel) {
						setAppointmentModalities(getAppointmentModalitiesFromFetchData(response));
						setAppointmentTypes(getAppointmentTypesFromFetchData(response));
					}

					return;
				}

				if (!config) {
					setAppointmentModalities([]);
					setAppointmentTypes([]);
					return;
				}

				if (config.providerSearchResultTypeId === ProviderSearchResultTypeId.CLINIC) {
					if (!config.clinicId) {
						throw new Error('clinicId is required.');
					}

					const response = await providerService
						.getClinicAvailability(config.clinicId, {
							featureId: config.featureId ?? '',
							...(shouldFetchInstitutionLocation(config.institutionLocationId) && {
								institutionLocationId: config.institutionLocationId,
							}),
						})
						.fetch();

					if (!didCancel) {
						setAppointmentModalities(response.clinicAvailability.appointmentModalities);
						setAppointmentTypes(response.clinicAvailability.appointmentTypes);
					}

					return;
				}

				if (config.providerSearchResultTypeId === ProviderSearchResultTypeId.PROVIDER) {
					if (!config.providerId) {
						throw new Error('providerId is required.');
					}

					const response = await providerService
						.getProviderAvailability(config.providerId, {
							featureId: config.featureId ?? '',
							...(shouldFetchInstitutionLocation(config.institutionLocationId) && {
								institutionLocationId: config.institutionLocationId,
							}),
						})
						.fetch();

					if (!didCancel) {
						setAppointmentModalities(response.providerAvailability.appointmentModalities);
						setAppointmentTypes(response.providerAvailability.appointmentTypes);
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
	}, [config, fetchData, handleError]);

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
		if (!selectedAppointmentModality) {
			return;
		}

		const selectedTimeSlot = getTimeSlotForDateTime(
			selectedAppointmentDateTime,
			selectedAppointmentModality,
			value.providerId
		);

		if (selectedTimeSlot) {
			const nextValue = getValueForTimeSlot(
				value,
				selectedAppointmentDateTime.format('YYYY-MM-DD'),
				selectedTimeSlot
			);

			if (
				!haveSameStringValues(value.appointmentTypeIds, nextValue.appointmentTypeIds) ||
				value.appointmentTypeId !== nextValue.appointmentTypeId ||
				value.appointmentTypeDescription !== nextValue.appointmentTypeDescription ||
				value.epicDepartmentId !== nextValue.epicDepartmentId ||
				value.epicAppointmentFhirId !== nextValue.epicAppointmentFhirId ||
				value.providerId !== nextValue.providerId
			) {
				onChange(nextValue);
			}

			return;
		}

		const firstAvailableAppointment = getFirstAvailableAppointment(selectedAppointmentModality);

		if (firstAvailableAppointment) {
			onChange(getValueForTimeSlot(value, firstAvailableAppointment.date, firstAvailableAppointment.timeSlot));
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
			{appointmentModalityTabs.length > 1 && (
				<TabBar
					value={selectedAppointmentModalityId}
					tabs={appointmentModalityTabs}
					onTabClick={handleAppointmentModalitySelect}
					className={classes.appointmentModalityTabs}
					classNameInner={classes.appointmentModalityTabsInner}
				/>
			)}
			{selectedAppointmentTypes.length > 1 && (
				<div className="pt-6 px-6">
					<InputHelper
						required
						as="select"
						label="Appointment Type"
						value={value.appointmentTypeId ?? ''}
						onChange={handleAppointmentTypeSelect}
					>
						<option value="" disabled>
							Select an appointment type...
						</option>
						{selectedAppointmentTypes.map((appointmentType) => (
							<option key={appointmentType.appointmentTypeId} value={appointmentType.appointmentTypeId}>
								{appointmentType.description ??
									appointmentType.name ??
									appointmentType.appointmentTypeId}
							</option>
						))}
					</InputHelper>
				</div>
			)}
			{firstAvailableAppointmentLabel && (
				<div className={classes.firstAvailableCallout}>
					<div className="d-flex align-items-center">
						<div className={classNames(classes.firstAvailableIconOuter, 'me-4')}>
							<SvgIcon kit="far" icon="calendar" size={16} className="text-primary" />
						</div>
						<p className="mb-0 fs-large fw-bold">
							First Available {selectedAppointmentModality?.description} Appointment:
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
					selected={getCalendarDate(selectedAppointmentDateTime)}
					onChange={handleDateSelect}
					minDate={minSelectableDate}
					filterDate={(date) => !isNoSlotDate(date)}
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
						const dayContent = <span className={classes.datePickerDayInner}>{dayOfMonth}</span>;

						if (!hasNoSlots) {
							return dayContent;
						}

						return (
							<OverlayTrigger
								placement="top"
								popperConfig={{ strategy: 'fixed' }}
								overlay={<Tooltip>There are no timeslots available for this day</Tooltip>}
							>
								{dayContent}
							</OverlayTrigger>
						);
					}}
				/>

				<div className={classes.slotPanel}>
					<h4 className="mb-4">{selectedDateLabel}</h4>
					{timeSlotGroups.map((timeSlotGroup, timeSlotGroupIndex) => (
						<div
							key={timeSlotGroup.label}
							className={classNames({
								'mb-6': timeSlotGroupIndex < timeSlotGroups.length - 1,
							})}
						>
							<p className="mb-2">{timeSlotGroup.label}</p>
							{timeSlotGroup.slots.length === 0 ? (
								<p className="text-muted">No Appointment Slots</p>
							) : (
								<div className="w-100 d-flex overflow-auto">
									{timeSlotGroup.slots.map((timeSlot, timeSlotIndex) => {
										const timeSlotDateTime = createAppointmentDateTime(
											selectedAppointmentDateTime.format('YYYY-MM-DD'),
											timeSlot
										);
										const isSelected =
											timeSlotDateTime.isSame(selectedAppointmentDateTime, 'minute') &&
											(!value.providerId ||
												!timeSlot.providerId ||
												timeSlot.providerId === value.providerId);

										const isLast = timeSlotIndex === timeSlotGroup.slots.length - 1;

										return (
											<Button
												className={classNames({ 'me-2': !isLast })}
												key={`${timeSlot.providerId ?? ''}-${timeSlot.time}`}
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
