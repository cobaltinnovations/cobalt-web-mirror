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

import { Provider, AvailabilityTimeSlot, Clinic } from '@/lib/models';
import { FindOptionsResponse, FindProvidersResponse } from '@/lib/services';
import { isEqual, sortBy } from 'lodash';
import { To, useSearchParams } from 'react-router-dom';
import { getRandomPlaceholderImage } from '@/hooks/use-random-placeholder-image';
import useAccount from '@/hooks/use-account';
import Cookies from 'js-cookie';

export enum BookingSource {
	ProviderSearch = 'PROVIDER_SEARCH',
	ProviderDetail = 'PROVIDER_DETAIL',
	ConnectWithSupportV2 = 'CONNECT_WITH_SUPPORT_V2',
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

export const isClinicResult = (result: Provider | Clinic): result is Clinic => {
	return typeof (result as Clinic).clinicId === 'string';
};

export const mapProviderToResult = (provider: Provider): ProviderSearchResult => ({
	id: provider.providerId,
	imageUrl: provider.imageUrl,
	type: 'provider',
	displayName: provider.name + (provider.license ? `, ${provider.license}` : ''),
	description: provider.supportRolesDescription,
});

export const mapClinicToResult = (clinic: Clinic): ProviderSearchResult => ({
	id: clinic.clinicId,
	type: 'clinic',
	imageUrl: getRandomPlaceholderImage() as any,
	displayName: clinic.description,
});

export interface ProviderSearchResult {
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
	selectedPatientOrderId?: string;
	setSelectedPatientOrderId: Dispatch<SetStateAction<string | undefined>>;
	formattedAvailabilityDate: string;

	getActiveFiltersState: (findOptions?: FindOptionsResponse) => Record<BookingFilters, boolean>;
	isEligible: boolean;
	setIsEligible: Dispatch<SetStateAction<boolean>>;
	getExitBookingLocation: (state: unknown) => To;
}

const BookingContext = createContext({} as BookingState);

const BookingProvider: FC<PropsWithChildren> = (props) => {
	const { account } = useAccount();
	const [appointmentTypes, setAppointmentTypes] = useState<FindProvidersResponse['appointmentTypes']>([]);
	const [specialties, setSpecialties] = useState<FindProvidersResponse['specialties']>([]);
	const [epicDepartments, setEpicDepartments] = useState<FindProvidersResponse['epicDepartments']>([]);
	const [availableSections, setAvailableSections] = useState<FindProvidersResponse['sections']>([]);

	const [searchParams] = useSearchParams();
	const [preservedFilterQueryString, setPreservedFilterQueryString] = useState('');

	const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] = useState<string>();
	const [selectedDate, setSelectedDate] = useState<string>();
	const [selectedProvider, setSelectedProvider] = useState<Provider>();
	const [selectedTimeSlot, setSelectedTimeSlot] = useState<AvailabilityTimeSlot>();
	const [selectedPatientOrderId, setSelectedPatientOrderId] = useState<string>();

	const [isEligible, setIsEligible] = useState(true);
	const [previousProviderId, setPreviousProviderId] = useState<string>();

	const formattedAvailabilityDate = useMemo(() => moment(selectedDate).format('YYYY-MM-DD'), [selectedDate]);

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

	useEffect(() => {
		if (selectedProvider?.providerId) {
			setPreviousProviderId(selectedProvider.providerId);
		}
	}, [selectedProvider?.providerId]);

	// reset booking context when accountId changes
	const accountId = account?.accountId;
	useEffect(() => {
		setAppointmentTypes([]);
		setSpecialties([]);
		setEpicDepartments([]);
		setAvailableSections([]);
		setPreservedFilterQueryString('');
		setSelectedAppointmentTypeId(undefined);
		setSelectedDate(undefined);
		setSelectedProvider(undefined);
		setSelectedTimeSlot(undefined);
		setIsEligible(true);
		setPreviousProviderId(undefined);

		Cookies.remove('bookingSource');
		Cookies.remove('exitUrl');
	}, [accountId]);

	const redirectProviderId = selectedProvider?.providerId || previousProviderId;
	const getExitBookingLocation = useCallback(
		(state?: unknown) => {
			const bookingSource = Cookies.get('bookingSource');

			if (bookingSource === BookingSource.ProviderDetail && redirectProviderId) {
				return {
					pathname: `/providers/${redirectProviderId}`,
					state,
				};
			}

			const exitUrl = Cookies.get('bookingExitUrl') ?? '/';

			return {
				pathname: exitUrl,
				search: preservedFilterQueryString,
				state,
			};
		},
		[preservedFilterQueryString, redirectProviderId]
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

				preservedFilterQueryString,
				setPreservedFilterQueryString,

				formattedAvailabilityDate,

				selectedAppointmentTypeId,
				setSelectedAppointmentTypeId,
				selectedDate,
				setSelectedDate,
				selectedProvider,
				setSelectedProvider,
				selectedTimeSlot,
				setSelectedTimeSlot,
				selectedPatientOrderId,
				setSelectedPatientOrderId,

				getActiveFiltersState,
				isEligible,
				setIsEligible,
				getExitBookingLocation,
			}}
		>
			{props.children}
		</BookingContext.Provider>
	);
};

export { BookingContext, BookingProvider };
