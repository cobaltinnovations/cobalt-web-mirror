import { BookingExperienceId, FeatureId, Institution, InstitutionFeature } from '@/lib/models';
import { buildQueryParamUrl } from './url-utils';

export const ALL_INSTITUTION_LOCATIONS_ID = 'na';
export const BOOKING_V1_FALLBACK_URL_SEARCH_PARAM = 'bookingV1FallbackUrl';
export const LEGACY_BOOKING_EXPERIENCE_ID = BookingExperienceId.V1;
export const PROVIDER_BOOKING_EXPERIENCE_ID = BookingExperienceId.V2;

export const didBookingExperienceChange = (metadata?: Record<string, unknown>) =>
	metadata?.bookingExperienceChanged === true;

export const isAllInstitutionLocationsId = (institutionLocationId?: string) =>
	Boolean(institutionLocationId?.toLowerCase() === ALL_INSTITUTION_LOCATIONS_ID);

export const getPersistedInstitutionLocationId = (institutionLocationId: string) =>
	isAllInstitutionLocationsId(institutionLocationId) ? '' : institutionLocationId;

export const shouldFetchInstitutionLocation = (institutionLocationId?: string) =>
	Boolean(institutionLocationId && !isAllInstitutionLocationsId(institutionLocationId));

export const getBookingExperienceId = (bookingV2Enabled: boolean) =>
	bookingV2Enabled ? BookingExperienceId.V2 : BookingExperienceId.V1;

export const getEffectiveBookingV2Enabled = ({
	bookingV2Enabled,
	integratedCareEnabled,
}: Pick<Institution, 'bookingV2Enabled' | 'integratedCareEnabled'>) => bookingV2Enabled && !integratedCareEnabled;

export const getGeneralNavigationFeatures = ({
	features,
	bookingV2Enabled,
}: Pick<Institution, 'features' | 'bookingV2Enabled'>): InstitutionFeature[] => {
	if (!bookingV2Enabled) {
		return features;
	}

	return features.flatMap((feature) => {
		if (feature.supportRoleIds.length === 0) {
			return [feature];
		}

		if (feature.featureId !== FeatureId.MENTAL_HEALTH_PROVIDERS) {
			return [];
		}

		return [
			{
				...feature,
				urlName: '/providers',
			},
		];
	});
};

export const getEffectiveProviderSearchFeatureId = (featureId?: string | null) =>
	featureId || FeatureId.MENTAL_HEALTH_PROVIDERS;

export const getSafeBookingV1FallbackUrl = (fallbackUrl?: string) => {
	if (!fallbackUrl?.startsWith('/')) {
		return undefined;
	}

	try {
		const validationOrigin = 'https://cobalt.invalid';
		const parsedFallbackUrl = new URL(fallbackUrl, validationOrigin);

		if (parsedFallbackUrl.origin !== validationOrigin) {
			return undefined;
		}

		return `${parsedFallbackUrl.pathname}${parsedFallbackUrl.search}${parsedFallbackUrl.hash}`;
	} catch {
		return undefined;
	}
};

export const getBookingV1FallbackUrlFromSearchParams = (searchParams: URLSearchParams) =>
	getSafeBookingV1FallbackUrl(searchParams.get(BOOKING_V1_FALLBACK_URL_SEARCH_PARAM) ?? undefined);

export const buildBookingV2UrlWithV1Fallback = (bookingV2Url: string, bookingV1FallbackUrl?: string) => {
	const safeBookingV1FallbackUrl = getSafeBookingV1FallbackUrl(bookingV1FallbackUrl);

	return safeBookingV1FallbackUrl
		? buildQueryParamUrl(bookingV2Url, {
				[BOOKING_V1_FALLBACK_URL_SEARCH_PARAM]: safeBookingV1FallbackUrl,
		  })
		: bookingV2Url;
};

export const getFeatureIdForLegacyCareUrlName = (urlName?: string) => {
	const normalizedFeatureId = urlName
		?.split('?')[0]
		.replace(/^\/+|\/+$/g, '')
		.split('/')
		.pop()
		?.replace(/-/g, '_')
		.toUpperCase() as FeatureId | undefined;

	return normalizedFeatureId && Object.values(FeatureId).includes(normalizedFeatureId)
		? normalizedFeatureId
		: undefined;
};

export const getBookingV2DisabledFallbackUrl = ({
	features,
	featureId,
	institutionLocationId,
	bookingV1FallbackUrl,
}: {
	features: InstitutionFeature[];
	featureId?: string;
	institutionLocationId?: string;
	bookingV1FallbackUrl?: string;
}) => {
	const safeBookingV1FallbackUrl = getSafeBookingV1FallbackUrl(bookingV1FallbackUrl);

	if (safeBookingV1FallbackUrl) {
		return safeBookingV1FallbackUrl;
	}

	const normalizedFeatureId = getFeatureIdForLegacyCareUrlName(featureId);
	const legacyPath = features.find((feature) => feature.featureId === normalizedFeatureId)?.urlName;

	if (!legacyPath || legacyPath.startsWith('/providers')) {
		return '/';
	}

	return buildQueryParamUrl(legacyPath, {
		institutionLocationId: isAllInstitutionLocationsId(institutionLocationId) ? undefined : institutionLocationId,
	});
};
