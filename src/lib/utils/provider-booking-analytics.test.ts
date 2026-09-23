import { BookingExperienceId } from '@/lib/models';
import {
	buildProviderBookingAnalyticsData,
	getProviderBookingAnalyticsDataFromSearchParams,
} from './provider-booking-analytics';

describe('provider booking analytics data', () => {
	it('adds the V2 experience and removes empty values', () => {
		expect(
			buildProviderBookingAnalyticsData({
				featureId: 'THERAPY',
				providerId: '',
				clinicId: null,
			})
		).toEqual({
			bookingExperienceId: BookingExperienceId.V2,
			featureId: 'THERAPY',
		});
	});

	it('extracts only the allowlisted booking context from search parameters', () => {
		const searchParams = new URLSearchParams({
			featureId: 'THERAPY',
			providerSearchResultTypeId: 'CLINIC',
			clinicId: 'clinic-id',
			providerIdToSchedule: 'provider-id',
			appointmentTypeId: 'appointment-type-id',
			date: '2026-09-24',
			emailAddress: 'do-not-record@example.com',
		});

		expect(getProviderBookingAnalyticsDataFromSearchParams(searchParams)).toEqual({
			bookingExperienceId: BookingExperienceId.V2,
			featureId: 'THERAPY',
			providerSearchResultTypeId: 'CLINIC',
			clinicId: 'clinic-id',
			providerIdToSchedule: 'provider-id',
			appointmentTypeId: 'appointment-type-id',
		});
	});
});
