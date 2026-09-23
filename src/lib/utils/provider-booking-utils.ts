import { AccountModel, BookingExperienceId, FeatureId, Institution, InstitutionFeature } from '@/lib/models';
import { buildQueryParamUrl } from './url-utils';

export const ALL_INSTITUTION_LOCATIONS_ID = 'na';
export const BOOKING_V1_FALLBACK_URL_SEARCH_PARAM = 'bookingV1FallbackUrl';
export const PROVIDER_BOOKING_RETURN_TO_SEARCH_PARAM = 'returnTo';
export const LEGACY_BOOKING_EXPERIENCE_ID = BookingExperienceId.V1;
export const PROVIDER_BOOKING_EXPERIENCE_ID = BookingExperienceId.V2;

const confirmedProviderBookingContextKeys = [
	'accountId',
	'providerSearchResultTypeId',
	'providerId',
	'appointmentTypeId',
	'appointmentModalityId',
	'date',
	'time',
] as const;

export const didBookingExperienceChange = (metadata?: Record<string, unknown>) =>
	metadata?.bookingExperienceChanged === true;

export const isAllInstitutionLocationsId = (institutionLocationId?: string) =>
	Boolean(institutionLocationId?.toLowerCase() === ALL_INSTITUTION_LOCATIONS_ID);

export const getPersistedInstitutionLocationId = (institutionLocationId: string) =>
	isAllInstitutionLocationsId(institutionLocationId) ? '' : institutionLocationId;

export const getProviderSearchInstitutionLocationIdForAccount = (
	account?: Pick<AccountModel, 'institutionLocationId' | 'promptedForInstitutionLocation'>
) =>
	account?.institutionLocationId ||
	(account?.promptedForInstitutionLocation ? ALL_INSTITUTION_LOCATIONS_ID : undefined);

export const getProviderListUrlFromSearchParams = (searchParams: URLSearchParams) => {
	const providerListSearchParams = new URLSearchParams();
	const featureId = searchParams.get('featureId');
	const institutionLocationId = searchParams.get('institutionLocationId');

	if (featureId) {
		providerListSearchParams.set('featureId', featureId);
	}

	if (institutionLocationId) {
		providerListSearchParams.set('institutionLocationId', institutionLocationId);
	}

	const queryString = providerListSearchParams.toString();
	return queryString ? `/providers?${queryString}` : '/providers';
};

export const getProviderBookingReturnUrl = ({
	pathname,
	searchParams,
}: {
	pathname: string;
	searchParams: URLSearchParams;
}) => {
	if (pathname.startsWith('/provider-info/')) {
		const queryString = searchParams.toString();
		return queryString ? `${pathname}?${queryString}` : pathname;
	}

	return getProviderListUrlFromSearchParams(searchParams);
};

export const getProviderBookingReturnUrlFromSearchParams = (searchParams: URLSearchParams) =>
	getSafeBookingV1FallbackUrl(searchParams.get(PROVIDER_BOOKING_RETURN_TO_SEARCH_PARAM) ?? undefined) ??
	getProviderListUrlFromSearchParams(searchParams);

export const getProviderBookingScreeningSearchParams = (searchParams: URLSearchParams, returnTo?: string) => {
	const screeningSearchParams = new URLSearchParams(searchParams);
	const safeReturnTo =
		getSafeBookingV1FallbackUrl(screeningSearchParams.get(PROVIDER_BOOKING_RETURN_TO_SEARCH_PARAM) ?? undefined) ??
		getSafeBookingV1FallbackUrl(returnTo);
	screeningSearchParams.set(
		PROVIDER_BOOKING_RETURN_TO_SEARCH_PARAM,
		safeReturnTo ?? getProviderListUrlFromSearchParams(searchParams)
	);

	return screeningSearchParams.toString();
};

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
}: Pick<Institution, 'features' | 'bookingV2Enabled'>): InstitutionFeature[] => features;

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

export const getProviderBookingPathForScreeningDestination = (context: Record<string, unknown>) => {
	// Context created by the booking-requirements endpoint includes the account and
	// the exact selected slot. Screenings launched before slot selection do not.
	const appointmentTimeWasConfirmed = confirmedProviderBookingContextKeys.every((key) => {
		const value = context[key];

		return typeof value === 'string' && value.trim().length > 0;
	});

	return appointmentTimeWasConfirmed ? '/provider-book-appointment' : '/provider-confirm-appointment-time';
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
