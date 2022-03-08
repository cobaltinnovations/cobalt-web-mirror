import moment, { Moment } from 'moment';
import React, { Dispatch, SetStateAction, createContext, FC, useState, useMemo, useCallback } from 'react';
import { LocationDescriptor } from 'history';
import { FilterDays } from '@/components/filter-days-modal';
import { PaymentType, Provider, SupportRoleId, AvailabilityTimeSlot, AppointmentType } from '@/lib/models';
import { FindOptionsResponse, FindProvidersResponse } from '@/lib/services';
import { isEqual, padStart } from 'lodash';

type Range = { min: number; max: number };

export enum BookingSource {
	ProviderSearch,
	ProviderDetail,
}

interface DateFilter {
	from: Moment;
	to: Moment;
	days: FilterDays;
}

export enum BookingFilters {
	Date,
	Days,
	Time,
	Provider,
	Availability,
	Payment,
	Specialty,
}

export interface SearchResult {
	id: string;
	type: 'provider' | 'clinic';
	imageUrl: string;
	displayName: string;
	description?: string;
}

interface BookingState {
	appointmentTypes: FindProvidersResponse['appointmentTypes'];
	setAppointmentTypes: Dispatch<SetStateAction<FindProvidersResponse['appointmentTypes']>>;
	specialties: FindProvidersResponse['specialties'];
	setSpecialties: Dispatch<SetStateAction<FindProvidersResponse['specialties']>>;
	epicDepartments: FindProvidersResponse['epicDepartments'];
	setEpicDepartments: Dispatch<SetStateAction<FindProvidersResponse['epicDepartments']>>;
	availableSections: FindProvidersResponse['sections'];
	setAvailableSections: Dispatch<SetStateAction<FindProvidersResponse['sections']>>;

	selectedSearchResult: SearchResult[];
	setSelectedSearchResult: Dispatch<SetStateAction<SearchResult[]>>;
	dateFilter: DateFilter;
	setDateFilter: Dispatch<SetStateAction<DateFilter>>;
	timeFilter: Range;
	setTimeFilter: Dispatch<SetStateAction<Range>>;
	providerTypeFilter: SupportRoleId[];
	setProviderTypeFilter: Dispatch<SetStateAction<SupportRoleId[]>>;
	availabilityFilter: string;
	setAvailabilityFilter: Dispatch<SetStateAction<string>>;
	visitTypeIdsFilter: string[];
	setVisitTypeIdsFilter: Dispatch<SetStateAction<string[]>>;
	paymentTypeFilter: PaymentType['paymentTypeId'][];
	setPaymentTypeFilter: Dispatch<SetStateAction<PaymentType['paymentTypeId'][]>>;
	clinicsFilter: string[];
	setClinicsFilter: Dispatch<SetStateAction<string[]>>;
	providerFilter: string | undefined;
	setProviderFilter: Dispatch<SetStateAction<string | undefined>>;
	specialtyFilter: string[];
	setSpecialtyFilter: Dispatch<SetStateAction<string[]>>;

	selectedAppointmentTypeId?: string;
	setSelectedAppointmentTypeId: Dispatch<SetStateAction<string | undefined>>;
	selectedDate?: string;
	setSelectedDate: Dispatch<SetStateAction<string | undefined>>;
	selectedProvider?: Provider;
	setSelectedProvider: Dispatch<SetStateAction<Provider | undefined>>;
	selectedTimeSlot?: AvailabilityTimeSlot;
	setSelectedTimeSlot: Dispatch<SetStateAction<AvailabilityTimeSlot | undefined>>;
	timeSlotEndTime?: string;
	formattedAvailabilityDate: string;
	formattedModalDate: string;
	formattedTimeFilter: { startTime: string; endTime: string };

	promptForEmail: boolean;
	setPromptForEmail: Dispatch<SetStateAction<boolean>>;
	promptForPhoneNumber: boolean;
	setPromptForPhoneNumber: Dispatch<SetStateAction<boolean>>;

	setBookingSource: Dispatch<SetStateAction<BookingSource>>;
	bookingSource: BookingSource;
	getActiveFiltersState: (findOptions?: FindOptionsResponse) => Record<BookingFilters, boolean>;
	isEligible: boolean;
	setIsEligible: Dispatch<SetStateAction<boolean>>;
	preserveFilters: boolean;
	setPreserveFilters: Dispatch<SetStateAction<boolean>>;
	getFiltersQueryString: () => string;
	selectedAppointmentType?: AppointmentType;
	getExitBookingLocation: (state: unknown) => LocationDescriptor;
}

const BookingContext = createContext({} as BookingState);

const BookingProvider: FC = (props) => {
	const [appointmentTypes, setAppointmentTypes] = useState<FindProvidersResponse['appointmentTypes']>([]);
	const [specialties, setSpecialties] = useState<FindProvidersResponse['specialties']>([]);
	const [epicDepartments, setEpicDepartments] = useState<FindProvidersResponse['epicDepartments']>([]);
	const [availableSections, setAvailableSections] = useState<FindProvidersResponse['sections']>([]);

	const [selectedSearchResult, setSelectedSearchResult] = useState<SearchResult[]>([]);
	const [dateFilter, setDateFilter] = useState({
		from: moment(),
		to: moment(),
		days: {} as FilterDays,
	});
	const [timeFilter, setTimeFilter] = useState<Range>({ min: 8, max: 18 });
	const [providerTypeFilter, setProviderTypeFilter] = useState<SupportRoleId[]>([]);
	const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');
	const [visitTypeIdsFilter, setVisitTypeIdsFilter] = useState<string[]>([]);
	const [paymentTypeFilter, setPaymentTypeFilter] = useState<PaymentType['paymentTypeId'][]>([]);
	const [clinicsFilter, setClinicsFilter] = useState<string[]>([]);
	const [providerFilter, setProviderFilter] = useState<string>();
	const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([]);

	const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] = useState<string>();
	const [selectedDate, setSelectedDate] = useState<string>();
	const [selectedProvider, setSelectedProvider] = useState<Provider>();
	const [selectedTimeSlot, setSelectedTimeSlot] = useState<AvailabilityTimeSlot>();

	const [promptForEmail, setPromptForEmail] = useState(false);
	const [promptForPhoneNumber, setPromptForPhoneNumber] = useState(false);

	const [isEligible, setIsEligible] = useState(true);
	const [preserveFilters, setPreserveFilters] = useState(false);
	const [bookingSource, setBookingSource] = useState<BookingSource>(BookingSource.ProviderSearch);

	const timeSlotEndTime = useMemo(() => {
		if (!selectedTimeSlot || !appointmentTypes.length || !selectedAppointmentTypeId) {
			return;
		}

		const apptType = appointmentTypes.find((type) => type.appointmentTypeId === selectedAppointmentTypeId);

		if (!apptType) {
			return;
		}

		const tempMoment = moment();
		const [hours, minutes] = selectedTimeSlot.time
			.replace('am', '')
			.replace('pm', '')
			.split(':')
			.map((value) => parseInt(value, 10));

		tempMoment.set('hours', hours);
		tempMoment.set('minutes', minutes);
		tempMoment.add(apptType.durationInMinutes, 'minutes');

		return tempMoment.format('h:mma');
	}, [selectedTimeSlot, appointmentTypes, selectedAppointmentTypeId]);

	const getFiltersQueryString = useCallback(() => {
		const params = new URLSearchParams({
			startDate: dateFilter.from.format('YYYY-MM-DD'),
			endDate: dateFilter.to.format('YYYY-MM-DD'),
		});

		for (const supportRoleId of providerTypeFilter) {
			params.append('supportRoleId', supportRoleId);
		}

		for (const clinicId of clinicsFilter) {
			params.append('clinicId', clinicId);
		}

		return params.toString();
	}, [clinicsFilter, dateFilter.from, dateFilter.to, providerTypeFilter]);

	const formattedAvailabilityDate = useMemo(() => moment(selectedDate).format('YYYY-MM-DD'), [selectedDate]);

	const formattedTimeFilter = useMemo(() => {
		const startTime = padStart(timeFilter.min.toString(), 2, '0') + ':00';
		const endTime = timeFilter.max === 24 ? '23:59' : padStart(timeFilter.max.toString(), 2, '0') + ':00';

		return { startTime, endTime };
	}, [timeFilter.max, timeFilter.min]);

	const formattedModalDate = useMemo(() => moment(selectedDate).format('dddd, MMMM Do'), [selectedDate]);

	const getActiveFiltersState = useCallback(
		(findOptions?: FindOptionsResponse) => {
			return {
				[BookingFilters.Date]:
					moment(dateFilter.from).format('YYYY-MM-DD') !==
						moment(findOptions?.defaultStartDate).format('YYYY-MM-DD') ||
					moment(dateFilter.to).format('YYYY-MM-DD') !==
						moment(findOptions?.defaultEndDate).format('YYYY-MM-DD'),
				[BookingFilters.Time]:
					formattedTimeFilter.startTime !== findOptions?.defaultStartTime ||
					formattedTimeFilter.endTime !== findOptions?.defaultEndTime,
				[BookingFilters.Provider]: !isEqual(providerTypeFilter, findOptions?.defaultSupportRoleIds),
				[BookingFilters.Availability]: availabilityFilter !== findOptions?.defaultAvailability,
				[BookingFilters.Payment]: !!paymentTypeFilter.length,
				[BookingFilters.Days]: Object.values(dateFilter.days).filter((day) => !day).length > 0,
				[BookingFilters.Specialty]: !!specialtyFilter.length,
			};
		},
		[
			availabilityFilter,
			dateFilter.from,
			dateFilter.to,
			dateFilter.days,
			formattedTimeFilter.endTime,
			formattedTimeFilter.startTime,
			paymentTypeFilter.length,
			providerTypeFilter,
			specialtyFilter.length,
		]
	);

	const selectedAppointmentType = useMemo(() => {
		if (!selectedAppointmentTypeId) {
			return;
		}

		return appointmentTypes.find((aT) => aT.appointmentTypeId === selectedAppointmentTypeId);
	}, [appointmentTypes, selectedAppointmentTypeId]);

	const getExitBookingLocation = useCallback(
		(state?: unknown) => {
			return bookingSource === BookingSource.ProviderSearch
				? {
						pathname: '/connect-with-support',
						search: getFiltersQueryString(),
						state,
				  }
				: {
						pathname: `/providers/${selectedProvider?.providerId}`,
						state,
				  };
		},
		[bookingSource, getFiltersQueryString, selectedProvider?.providerId]
	);

	return (
		<BookingContext.Provider
			value={{
				specialties,
				setSpecialties,
				appointmentTypes,
				setAppointmentTypes,
				epicDepartments,
				setEpicDepartments,
				availableSections,
				setAvailableSections,

				selectedSearchResult,
				setSelectedSearchResult,
				dateFilter,
				setDateFilter,
				timeFilter,
				setTimeFilter,
				providerTypeFilter,
				setProviderTypeFilter,
				availabilityFilter,
				setAvailabilityFilter,
				visitTypeIdsFilter,
				setVisitTypeIdsFilter,
				paymentTypeFilter,
				setPaymentTypeFilter,
				clinicsFilter,
				setClinicsFilter,
				providerFilter,
				setProviderFilter,
				specialtyFilter,
				setSpecialtyFilter,

				timeSlotEndTime,
				formattedAvailabilityDate,
				formattedModalDate,
				formattedTimeFilter,

				selectedAppointmentTypeId,
				setSelectedAppointmentTypeId,
				selectedDate,
				setSelectedDate,
				selectedProvider,
				setSelectedProvider,
				selectedTimeSlot,
				setSelectedTimeSlot,

				promptForEmail,
				setPromptForEmail,
				promptForPhoneNumber,
				setPromptForPhoneNumber,

				bookingSource,
				setBookingSource,
				getActiveFiltersState,
				isEligible,
				setIsEligible,
				preserveFilters,
				setPreserveFilters,
				getFiltersQueryString,
				selectedAppointmentType,
				getExitBookingLocation,
			}}
		>
			{props.children}
		</BookingContext.Provider>
	);
};

export { BookingContext, BookingProvider };
