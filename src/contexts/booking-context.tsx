import moment from 'moment';
import React, {
	Dispatch,
	SetStateAction,
	createContext,
	FC,
	useState,
	useMemo,
	useCallback,
	useEffect,
	PropsWithChildren,
} from 'react';

import { Provider, AvailabilityTimeSlot, AppointmentType } from '@/lib/models';
import { FindOptionsResponse, FindProvidersResponse } from '@/lib/services';
import { isEqual, sortBy } from 'lodash';
import { To, useSearchParams } from 'react-router-dom';

export enum BookingSource {
	ProviderSearch,
	ProviderDetail,
}

export const FILTER_DAYS = [
	{
		label: 'Mon.',
		key: 'MONDAY',
	},
	{
		label: 'Tue.',
		key: 'TUESDAY',
	},
	{
		label: 'Wed.',
		key: 'WEDNESDAY',
	},
	{
		label: 'Thu.',
		key: 'THURSDAY',
	},
	{
		label: 'Fri.',
		key: 'FRIDAY',
	},
	{
		label: 'Sat.',
		key: 'SATURDAY',
	},
	{
		label: 'Sun.',
		key: 'SUNDAY',
	},
] as const;

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
	preservedFilterQueryString: string;
	setPreservedFilterQueryString: Dispatch<SetStateAction<string>>;

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

	promptForEmail: boolean;
	setPromptForEmail: Dispatch<SetStateAction<boolean>>;
	promptForPhoneNumber: boolean;
	setPromptForPhoneNumber: Dispatch<SetStateAction<boolean>>;

	setBookingSource: Dispatch<SetStateAction<BookingSource>>;
	bookingSource: BookingSource;
	getActiveFiltersState: (findOptions?: FindOptionsResponse) => Record<BookingFilters, boolean>;
	isEligible: boolean;
	setIsEligible: Dispatch<SetStateAction<boolean>>;
	selectedAppointmentType?: AppointmentType;
	getExitBookingLocation: (state: unknown) => To;
}

const BookingContext = createContext({} as BookingState);

const BookingProvider: FC<PropsWithChildren> = (props) => {
	const [appointmentTypes, setAppointmentTypes] = useState<FindProvidersResponse['appointmentTypes']>([]);
	const [specialties, setSpecialties] = useState<FindProvidersResponse['specialties']>([]);
	const [epicDepartments, setEpicDepartments] = useState<FindProvidersResponse['epicDepartments']>([]);
	const [availableSections, setAvailableSections] = useState<FindProvidersResponse['sections']>([]);

	const [selectedSearchResult, setSelectedSearchResult] = useState<SearchResult[]>([]);
	const [searchParams] = useSearchParams();
	const [preservedFilterQueryString, setPreservedFilterQueryString] = useState('');

	const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] = useState<string>();
	const [selectedDate, setSelectedDate] = useState<string>();
	const [selectedProvider, setSelectedProvider] = useState<Provider>();
	const [selectedTimeSlot, setSelectedTimeSlot] = useState<AvailabilityTimeSlot>();

	const [promptForEmail, setPromptForEmail] = useState(false);
	const [promptForPhoneNumber, setPromptForPhoneNumber] = useState(false);

	const [isEligible, setIsEligible] = useState(true);
	const [bookingSource, setBookingSource] = useState<BookingSource>(BookingSource.ProviderSearch);
	const [previousProviderId, setPreviousProviderId] = useState<string>();

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

	const formattedAvailabilityDate = useMemo(() => moment(selectedDate).format('YYYY-MM-DD'), [selectedDate]);

	const formattedModalDate = useMemo(() => moment(selectedDate).format('dddd, MMMM Do'), [selectedDate]);

	const getActiveFiltersState = useCallback(
		(findOptions?: FindOptionsResponse) => {
			const startDate = searchParams.get('startDate');
			const endDate = searchParams.get('endDate');
			const daysOfWeek = searchParams.getAll('dayOfWeek');
			const startTime = searchParams.get('startTime');
			const endTime = searchParams.get('endTime');
			const supportRoleIds = searchParams.getAll('supportRoleId');
			const availability = searchParams.get('availability');
			const visitTypeIds = searchParams.getAll('visitTypeId');
			const paymentTypeIds = searchParams.getAll('paymentTypeId');
			const specialtyIds = searchParams.getAll('specialtyId');

			// a filter is "active" when:
			return {
				[BookingFilters.Date]:
					// startDate exists and not equal to default
					(startDate !== null && startDate !== findOptions?.defaultStartDate) ||
					// or endDate exists and not equal to default
					(endDate !== null && endDate !== findOptions?.defaultEndDate),

				[BookingFilters.Time]:
					// startTime exists and not equal to default
					(startTime !== null && startTime !== findOptions?.defaultStartTime) ||
					// or endTime exists and not equal to default
					(endTime !== null && endTime !== findOptions?.defaultEndTime),

				[BookingFilters.Provider]:
					// selected supportRoles and not the same as defaults
					supportRoleIds.length > 0 &&
					!isEqual(sortBy(supportRoleIds), sortBy(findOptions?.defaultSupportRoleIds ?? [])),

				[BookingFilters.Availability]:
					// availability exists and not equal to default
					(availability !== null && availability !== findOptions?.defaultAvailability) ||
					// or selected visitTypeIds and not the same as defaults
					(visitTypeIds.length > 0 &&
						!isEqual(sortBy(visitTypeIds), sortBy(findOptions?.defaultVisitTypeIds ?? []))),

				[BookingFilters.Payment]:
					// selected paymentTypeIds
					paymentTypeIds.length > 0,

				[BookingFilters.Days]:
					// selected Days of week
					daysOfWeek.length > 0 &&
					// and not 7 days (ui default)
					daysOfWeek.length < 7,

				[BookingFilters.Specialty]:
					// selected specialtyIds
					specialtyIds.length > 0,
			};
		},
		[searchParams]
	);

	const selectedAppointmentType = useMemo(() => {
		if (!selectedAppointmentTypeId) {
			return;
		}

		return appointmentTypes.find((aT) => aT.appointmentTypeId === selectedAppointmentTypeId);
	}, [appointmentTypes, selectedAppointmentTypeId]);

	useEffect(() => {
		if (selectedProvider?.providerId) {
			setPreviousProviderId(selectedProvider.providerId);
		}
	}, [selectedProvider?.providerId]);

	const redirectProviderId = selectedProvider?.providerId || previousProviderId;
	const getExitBookingLocation = useCallback(
		(state?: unknown) => {
			if (bookingSource === BookingSource.ProviderDetail && redirectProviderId) {
				return {
					pathname: `/providers/${redirectProviderId}`,
					state,
				};
			}

			return {
				pathname: '/connect-with-support',
				search: preservedFilterQueryString,
				state,
			};
		},
		[bookingSource, preservedFilterQueryString, redirectProviderId]
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
				preservedFilterQueryString,
				setPreservedFilterQueryString,

				timeSlotEndTime,
				formattedAvailabilityDate,
				formattedModalDate,

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
				selectedAppointmentType,
				getExitBookingLocation,
			}}
		>
			{props.children}
		</BookingContext.Provider>
	);
};

export { BookingContext, BookingProvider };
