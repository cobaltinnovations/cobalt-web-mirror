import { BookingExperienceId } from '@/lib/models';

export interface ProviderBookingAnalyticsData {
	featureId?: string | null;
	institutionLocationId?: string | null;
	providerSearchResultId?: string | null;
	providerSearchResultTypeId?: string | null;
	providerId?: string | null;
	clinicId?: string | null;
	providerIdToSchedule?: string | null;
	appointmentSelectionTypeId?: string | null;
	appointmentTypeId?: string | null;
	appointmentModalityId?: string | null;
	screeningFlowId?: string | null;
	screeningSessionId?: string | null;
}

const providerBookingSearchParameterNames = [
	'featureId',
	'institutionLocationId',
	'providerSearchResultId',
	'providerSearchResultTypeId',
	'providerId',
	'clinicId',
	'providerIdToSchedule',
	'appointmentSelectionTypeId',
	'appointmentTypeId',
	'appointmentModalityId',
	'screeningFlowId',
	'screeningSessionId',
] as const;

export const buildProviderBookingAnalyticsData = (data: ProviderBookingAnalyticsData = {}) => {
	const compactData = Object.fromEntries(
		Object.entries(data).filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
	);

	return {
		bookingExperienceId: BookingExperienceId.V2,
		...compactData,
	};
};

export const getProviderBookingAnalyticsDataFromSearchParams = (searchParams: URLSearchParams) =>
	buildProviderBookingAnalyticsData(
		providerBookingSearchParameterNames.reduce<ProviderBookingAnalyticsData>((data, parameterName) => {
			data[parameterName] = searchParams.get(parameterName);
			return data;
		}, {})
	);
