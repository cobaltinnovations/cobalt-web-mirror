import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	Provider,
	SupportRoleId,
	RecommendationLevel,
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
} from '@/lib/models';
import { getSubdomain } from '@/hooks/use-subdomain';
import { OrchestratedRequest } from '@/lib/http-client';

export interface FindOptionsResponse {
	availabilities: ProviderAvailability[];
	defaultVisitTypeIds: string[];
	defaultAvailability: string;
	defaultEndDate: string;
	defaultEndTime: string;
	defaultStartDate: string;
	defaultStartTime: string;
	defaultSupportRoleIds: SupportRoleId[];
	defaultClinicIds: string[];
	paymentTypes: PaymentType[];
	recommendation: string;
	recommendationHtml: string;
	recommendationLevel: RecommendationLevel;
	scores: AssessmentScore;
	supportRoles: SupportRole[];
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
	sections: {
		fullyBooked: boolean;
		date: string;
		dateDescription: string;
		providers: Provider[];
	}[];
	provider?: Provider;
	clinics?: Clinic[];
	appointments?: AppointmentModel[];
	followups?: FollowupModel[];
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
		const subdomain = getSubdomain();

		if (!filters.systemAffinityId) {
			if (subdomain === 'pic') {
				filters.systemAffinityId = 'PIC';
			}
		}

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

	listLogicalAvailabilities(filters: LogicalAvailabilitiesFilters): OrchestratedRequest<LogicalAvailabilitiesResponse> {
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
