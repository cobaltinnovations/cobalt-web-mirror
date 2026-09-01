import {
	ALL_INSTITUTION_LOCATIONS_ID,
	getPersistedInstitutionLocationId,
	isAllInstitutionLocationsId,
	shouldFetchInstitutionLocation,
	getBookingExperienceId,
	getEffectiveBookingV2Enabled,
	getEffectiveProviderSearchFeatureId,
	getGeneralNavigationFeatures,
	getFeatureIdForLegacyCareUrlName,
	getBookingV2DisabledFallbackUrl,
	BOOKING_V1_FALLBACK_URL_SEARCH_PARAM,
	LEGACY_BOOKING_EXPERIENCE_ID,
	PROVIDER_BOOKING_EXPERIENCE_ID,
	buildBookingV2UrlWithV1Fallback,
	didBookingExperienceChange,
	getSafeBookingV1FallbackUrl,
} from './provider-booking-utils';
import { BookingExperienceId, FeatureId, InstitutionFeature, SupportRoleId } from '@/lib/models';

describe('provider booking institution locations', () => {
	it('recognizes the synthetic all-locations option case-insensitively', () => {
		expect(isAllInstitutionLocationsId(ALL_INSTITUTION_LOCATIONS_ID)).toBe(true);
		expect(isAllInstitutionLocationsId('NA')).toBe(true);
		expect(isAllInstitutionLocationsId('location-id')).toBe(false);
	});

	it('does not persist or fetch the synthetic all-locations option as a database ID', () => {
		expect(getPersistedInstitutionLocationId(ALL_INSTITUTION_LOCATIONS_ID)).toBe('');
		expect(getPersistedInstitutionLocationId('location-id')).toBe('location-id');
		expect(shouldFetchInstitutionLocation(ALL_INSTITUTION_LOCATIONS_ID)).toBe(false);
		expect(shouldFetchInstitutionLocation('location-id')).toBe(true);
		expect(shouldFetchInstitutionLocation()).toBe(false);
	});
});

describe('provider booking experience', () => {
	const providerFeature = ({
		featureId,
		urlName,
		supportRoleIds,
	}: Pick<InstitutionFeature, 'featureId' | 'urlName' | 'supportRoleIds'>) =>
		({
			featureId,
			urlName,
			supportRoleIds,
		} as InstitutionFeature);

	it.each([
		{ bookingV2Enabled: false, integratedCareEnabled: false, expected: false },
		{ bookingV2Enabled: true, integratedCareEnabled: false, expected: true },
		{ bookingV2Enabled: false, integratedCareEnabled: true, expected: false },
		{ bookingV2Enabled: true, integratedCareEnabled: true, expected: false },
	])(
		'uses the effective booking v2 flag for bookingV2Enabled=$bookingV2Enabled and integratedCareEnabled=$integratedCareEnabled',
		({ bookingV2Enabled, integratedCareEnabled, expected }) => {
			expect(getEffectiveBookingV2Enabled({ bookingV2Enabled, integratedCareEnabled })).toBe(expected);
		}
	);

	it('maps the institution toggle to the API booking experience identifier', () => {
		expect(getBookingExperienceId(false)).toBe(BookingExperienceId.V1);
		expect(getBookingExperienceId(true)).toBe(BookingExperienceId.V2);
	});

	it('preserves institution navigation features when booking V2 is enabled', () => {
		const therapy = providerFeature({
			featureId: FeatureId.THERAPY,
			urlName: '/providers?featureId=THERAPY',
			supportRoleIds: [SupportRoleId.Clinician],
		});
		const medicationPrescriber = providerFeature({
			featureId: FeatureId.MEDICATION_PRESCRIBER,
			urlName: '/providers?featureId=MEDICATION_PRESCRIBER',
			supportRoleIds: [SupportRoleId.Psychiatrist],
		});
		const psychiatrist = providerFeature({
			featureId: FeatureId.PSYCHIATRIST,
			urlName: '/providers?featureId=PSYCHIATRIST',
			supportRoleIds: [SupportRoleId.Psychiatrist],
		});
		const mentalHealthProviders = providerFeature({
			featureId: FeatureId.MENTAL_HEALTH_PROVIDERS,
			urlName: '/providers?featureId=MENTAL_HEALTH_PROVIDERS',
			supportRoleIds: [SupportRoleId.Clinician],
		});
		const coaching = providerFeature({
			featureId: FeatureId.COACHING,
			urlName: '/providers?featureId=COACHING',
			supportRoleIds: [SupportRoleId.Coach],
		});
		const spiritualSupport = providerFeature({
			featureId: FeatureId.SPIRITUAL_SUPPORT,
			urlName: '/providers?featureId=SPIRITUAL_SUPPORT',
			supportRoleIds: [SupportRoleId.Chaplain],
		});
		const groupSessions = providerFeature({
			featureId: FeatureId.GROUP_SESSIONS,
			urlName: '/group-sessions',
			supportRoleIds: [],
		});
		const features = [
			therapy,
			medicationPrescriber,
			groupSessions,
			psychiatrist,
			mentalHealthProviders,
			coaching,
			spiritualSupport,
		];

		expect(getGeneralNavigationFeatures({ features, bookingV2Enabled: false })).toBe(features);
		expect(getGeneralNavigationFeatures({ features, bookingV2Enabled: true })).toBe(features);
		expect(mentalHealthProviders.urlName).toBe('/providers?featureId=MENTAL_HEALTH_PROVIDERS');
	});

	it('defaults the canonical provider route to Mental Health Providers without overriding explicit filters', () => {
		expect(getEffectiveProviderSearchFeatureId()).toBe(FeatureId.MENTAL_HEALTH_PROVIDERS);
		expect(getEffectiveProviderSearchFeatureId(null)).toBe(FeatureId.MENTAL_HEALTH_PROVIDERS);
		expect(getEffectiveProviderSearchFeatureId('')).toBe(FeatureId.MENTAL_HEALTH_PROVIDERS);
		expect(getEffectiveProviderSearchFeatureId(FeatureId.THERAPY)).toBe(FeatureId.THERAPY);
	});

	it('pins each version-specific booking flow to its own experience', () => {
		expect(LEGACY_BOOKING_EXPERIENCE_ID).toBe(BookingExperienceId.V1);
		expect(PROVIDER_BOOKING_EXPERIENCE_ID).toBe(BookingExperienceId.V2);
		expect(didBookingExperienceChange({ bookingExperienceChanged: true })).toBe(true);
		expect(didBookingExperienceChange({ bookingExperienceChanged: false })).toBe(false);
	});

	it('maps legacy care slugs to feature identifiers when possible', () => {
		expect(getFeatureIdForLegacyCareUrlName('therapy')).toBe(FeatureId.THERAPY);
		expect(getFeatureIdForLegacyCareUrlName('/connect-with-support/spiritual-support')).toBe(
			FeatureId.SPIRITUAL_SUPPORT
		);
		expect(getFeatureIdForLegacyCareUrlName('unknown-care-type')).toBeUndefined();
	});

	it('uses a feature legacy URL when a v2 route is opened after the toggle is disabled', () => {
		const features = [
			{
				featureId: FeatureId.THERAPY,
				urlName: '/connect-with-support/therapy?source=booking',
			},
		] as InstitutionFeature[];

		expect(
			getBookingV2DisabledFallbackUrl({
				features,
				featureId: FeatureId.THERAPY,
				institutionLocationId: 'location-id',
			})
		).toBe('/connect-with-support/therapy?source=booking&institutionLocationId=location-id');
		expect(getBookingV2DisabledFallbackUrl({ features, featureId: 'UNKNOWN' })).toBe('/');
		expect(getBookingV2DisabledFallbackUrl({ features })).toBe('/');
		expect(
			getBookingV2DisabledFallbackUrl({
				features,
				featureId: FeatureId.THERAPY,
				institutionLocationId: ALL_INSTITUTION_LOCATIONS_ID,
			})
		).toBe('/connect-with-support/therapy?source=booking');
	});

	it('carries and prefers an exact safe referrer fallback, including its query and fragment', () => {
		const bookingV1FallbackUrl =
			'/connect-with-support/therapy?providerId=provider-id&clinicId=clinic-id#appointments';
		const bookingV2Url = buildBookingV2UrlWithV1Fallback(
			'/provider-confirm-appointment-time?featureId=THERAPY',
			bookingV1FallbackUrl
		);
		const carriedFallbackUrl = new URL(bookingV2Url, 'https://cobalt.invalid').searchParams.get(
			BOOKING_V1_FALLBACK_URL_SEARCH_PARAM
		);

		expect(carriedFallbackUrl).toBe(bookingV1FallbackUrl);
		expect(
			getBookingV2DisabledFallbackUrl({
				features: [],
				bookingV1FallbackUrl: carriedFallbackUrl ?? undefined,
			})
		).toBe(bookingV1FallbackUrl);
	});

	it('rejects unsafe fallback redirects and uses the generic feature fallback instead', () => {
		const features = [
			{
				featureId: FeatureId.THERAPY,
				urlName: '/connect-with-support/therapy',
			},
		] as InstitutionFeature[];

		expect(getSafeBookingV1FallbackUrl('https://example.com/steal')).toBeUndefined();
		expect(getSafeBookingV1FallbackUrl('//example.com/steal')).toBeUndefined();
		expect(getSafeBookingV1FallbackUrl('/\\example.com/steal')).toBeUndefined();
		expect(buildBookingV2UrlWithV1Fallback('/providers?featureId=THERAPY', 'https://example.com/steal')).toBe(
			'/providers?featureId=THERAPY'
		);
		expect(
			getBookingV2DisabledFallbackUrl({
				features,
				featureId: FeatureId.THERAPY,
				bookingV1FallbackUrl: 'https://example.com/steal',
			})
		).toBe('/connect-with-support/therapy');
	});
});
