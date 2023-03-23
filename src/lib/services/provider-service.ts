import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	Provider,
	SupportRoleId,
	SupportRole,
	ProviderAvailability,
	LogicalAvailability,
	PaymentType,
	AssessmentScore,
	AppointmentType,
	EpicDepartment,
	Clinic,
	AppointmentReason,
	AppointmentReasonType,
	AppointmentModel,
	FollowupModel,
	Specialty,
	ProviderVisitType,
} from '@/lib/models';
import { OrchestratedRequest } from '@/lib/http-client';

export enum FIND_OPTIONS_FILTER_IDS {
	DATE = 'DATE',
	TIME_OF_DAY = 'TIME_OF_DAY',
	LOCATION = 'LOCATION',
}

export interface FindOptionsFilter {
	filterId: FIND_OPTIONS_FILTER_IDS;
	name: string;
}

export interface FindOptionsAppointmentTime {
	appointmentTimeId: string;
	description: string;
	endTime: string;
	name: string;
	startTime: string;
}

export interface FindOptionsFeature {
	description: string;
	featureId: string;
	name: string;
}

export interface FindOptionsResponse {
	appointmentTimes: FindOptionsAppointmentTime[];
	availabilities: ProviderAvailability[];
	defaultAvailability: string;
	defaultClinicIds: string[];
	defaultEndDate: string;
	defaultEndTime: string;
	defaultStartDate: string;
	defaultStartTime: string;
	defaultSupportRoleIds: SupportRoleId[];
	defaultVisitTypeIds: string[];
	feature?: FindOptionsFeature;
	filters?: FindOptionsFilter[];
	paymentTypes: PaymentType[];
	recommendation: string;
	recommendationHtml: string;
	recommendedSupportRoleIds: SupportRoleId[];
	scores?: AssessmentScore;
	specialties: Specialty[];
	supportRoles: SupportRole[];
	visitTypes: ProviderVisitType[];
}

export interface FindFilters {
	providerId?: string;
	startDate?: string;
	endDate?: string;
	daysOfWeek?: string[];
	startTime?: string;
	endTime?: string;
	availability?: ProviderAvailability['availability'];
	visitTypeIds?: string[];
	supportRoleIds?: SupportRoleId[];
	clinicIds?: string[];
	paymentTypeIds?: PaymentType['paymentTypeId'][];
	licenseTypes?: string[];
	systemAffinityId?: string;
	specialtyIds?: string[];
}

export interface FindProvidersResponse {
	appointmentTypes: AppointmentType[];
	epicDepartments: EpicDepartment[];
	sections: ProviderSection[];
	provider?: Provider;
	clinics?: Clinic[];
	appointments?: AppointmentModel[];
	followups?: FollowupModel[];
	specialties?: Specialty[];
	showSpecialties: boolean;
}

export interface ProviderSection {
	fullyBooked: boolean;
	date: string;
	dateDescription: string;
	providers: Provider[];
}

interface ProvidersRepsonse {
	providers: Provider[];
}

interface LogicalAvailabilitiesResponse {
	logicalAvailabilities: LogicalAvailability[];
}

interface LogicalAvailabilityResponse {
	logicalAvailability: LogicalAvailability;
}

interface AutocompleteResponse {
	providers: Provider[];
	clinics: Clinic[];
}

interface LogicalAvailabilitiesFilters {
	providerId: string;
	startDate: string;
	endDate: string;
}

interface LogicalAvailabilityData {
	providerId: string;
	startDateTime: string;
	endDateTime: string;
	appointmentTypeIds: string[];
}

interface AppointmentReasonsFilter {
	providerId: string;
	appointmentReasonTypeId: AppointmentReasonType;
}

interface AppointmentReasonsResponse {
	appointmentReasons: AppointmentReason[];
}

interface ListProviderScheduleData {
	providerId: string;
	startDate: string;
	endDate: string;
}

interface GetProviderByIdResponse {
	provider: Provider;
}

export const providerService = {
	fetchFindOptions({
		supportRoleIds,
		startDate,
		endDate,
		clinicIds,
		providerId,
		institutionId,
	}: {
		supportRoleIds?: string[];
		startDate?: string;
		endDate?: string;
		clinicIds?: string[];
		providerId?: string;
		institutionId: string;
	}): OrchestratedRequest<FindOptionsResponse> {
		let url = '/providers/find-options';
		const params = new URLSearchParams();

		if (supportRoleIds?.length) {
			for (const supportRoleId of supportRoleIds) {
				params.append('supportRoleId', supportRoleId);
			}
		}

		if (startDate) {
			params.set('startDate', startDate);
		}

		if (endDate) {
			params.set('endDate', endDate);
		}

		if (clinicIds?.length) {
			for (const clinicId of clinicIds) {
				params.append('clinicId', clinicId);
			}
		}

		if (providerId) {
			params.append('providerId', providerId);
		}

		params.set('institutionId', institutionId);

		url += `?${params.toString()}`;

		return httpSingleton.orchestrateRequest<FindOptionsResponse>({
			method: 'get',
			url,
		});
	},

	findProviders(filters: FindFilters): OrchestratedRequest<FindProvidersResponse> {
		return httpSingleton.orchestrateRequest<FindProvidersResponse>({
			method: 'post',
			url: '/providers/find',
			data: filters,
		});
	},

	fetchRecentProviders(): OrchestratedRequest<ProvidersRepsonse> {
		return httpSingleton.orchestrateRequest<ProvidersRepsonse>({
			method: 'get',
			url: '/providers/recent',
		});
	},

	searchEntities(query: string): OrchestratedRequest<AutocompleteResponse> {
		const params = new URLSearchParams({ query });

		return httpSingleton.orchestrateRequest<AutocompleteResponse>({
			method: 'get',
			url: `/providers/autocomplete?${params.toString()}`,
		});
	},

	listProviderAppointmentTypes(providerId: string): OrchestratedRequest<{ appointmentTypes: AppointmentType[] }> {
		const params = new URLSearchParams({ providerId });

		return httpSingleton.orchestrateRequest<{ appointmentTypes: AppointmentType[] }>({
			method: 'get',
			url: `/appointment-types?${params.toString()}`,
		});
	},

	listLogicalAvailabilities(
		filters: LogicalAvailabilitiesFilters
	): OrchestratedRequest<LogicalAvailabilitiesResponse> {
		const params = new URLSearchParams({ ...filters });

		return httpSingleton.orchestrateRequest<LogicalAvailabilitiesResponse>({
			method: 'get',
			url: `/logical-availabilities?${params.toString()}`,
		});
	},

	createLogicalAvailability(data: LogicalAvailabilityData): OrchestratedRequest<LogicalAvailabilityResponse> {
		return httpSingleton.orchestrateRequest<LogicalAvailabilityResponse>({
			method: 'post',
			url: '/logical-availabilities',
			data,
		});
	},

	deleteLogicalAvailability(availabilityId: string): OrchestratedRequest<unknown> {
		return httpSingleton.orchestrateRequest<unknown>({
			method: 'delete',
			url: `/logical-availabilities/${availabilityId}`,
		});
	},

	listProviderSchedule(data: ListProviderScheduleData): OrchestratedRequest<FindProvidersResponse> {
		return httpSingleton.orchestrateRequest<FindProvidersResponse>({
			method: 'post',
			url: '/providers/find',
			data: {
				...data,
				supplements: ['APPOINTMENTS', 'FOLLOWUPS'],
			},
		});
	},

	listAppointmentReasons(filters: AppointmentReasonsFilter): OrchestratedRequest<AppointmentReasonsResponse> {
		const params = new URLSearchParams({ ...filters });

		return httpSingleton.orchestrateRequest<AppointmentReasonsResponse>({
			method: 'get',
			url: `/appointment-reasons?${params.toString()}`,
		});
	},

	getProviderById(providerId: string): OrchestratedRequest<GetProviderByIdResponse> {
		return httpSingleton.orchestrateRequest<GetProviderByIdResponse>({
			method: 'get',
			url: `/providers/${providerId}`,
		});
	},
};
