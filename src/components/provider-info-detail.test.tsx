import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { CobaltThemeProvider } from '@/jss/theme';
import {
	AnalyticsNativeEventProviderSearchResultActionId,
	AnalyticsNativeEventProviderSearchResultSourceId,
	AnalyticsNativeEventTypeId,
	Clinic,
	Provider,
	ProviderAppointmentModalityId,
	ProviderAppointmentSelectionTypeId,
} from '@/lib/models';
import { analyticsService, clinicService, providerService } from '@/lib/services';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import ProviderInfoDetail from './provider-info-detail';

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('./provider-schedule-modal', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('@/components/ineligible-booking-modal', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/hooks/use-handle-error', () => {
	const handleError = jest.fn();
	return {
		__esModule: true,
		default: () => handleError,
	};
});

jest.mock('@/lib/services', () => ({
	analyticsService: {
		persistEvent: jest.fn(),
	},
	providerService: {
		getProviderById: jest.fn(),
		getProviderAvailability: jest.fn(),
		getClinicAvailability: jest.fn(),
	},
	clinicService: {
		getClinicByClinicId: jest.fn(),
	},
}));

jest.mock('@/pages/screening/screening.hooks', () => ({
	useScreeningFlow: jest.fn(),
}));

const mockGetProviderById = providerService.getProviderById as jest.MockedFunction<
	typeof providerService.getProviderById
>;
const mockGetProviderAvailability = providerService.getProviderAvailability as jest.MockedFunction<
	typeof providerService.getProviderAvailability
>;
const mockGetClinicAvailability = providerService.getClinicAvailability as jest.MockedFunction<
	typeof providerService.getClinicAvailability
>;
const mockGetClinicByClinicId = clinicService.getClinicByClinicId as jest.MockedFunction<
	typeof clinicService.getClinicByClinicId
>;
const mockUseScreeningFlow = useScreeningFlow as jest.MockedFunction<typeof useScreeningFlow>;

const LocationProbe = () => {
	const location = useLocation();

	return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

beforeEach(() => {
	jest.clearAllMocks();
});

it('starts the referrer screening flow and does not fetch provider availability', async () => {
	const startScreeningFlow = jest.fn();
	const provider = {
		providerId: 'team-clinic-provider-id',
		name: 'TEAM Clinic',
		detailsHtml: '<h2>About</h2><p>TEAM Clinic details</p>',
		locations: [],
		websiteUrl: '',
		imageUrl: '',
		supportedAppointmentModalities: [
			{
				appointmentModalityId: ProviderAppointmentModalityId.IN_PERSON,
				description: 'In-person',
			},
		],
		referralBooking: {
			institutionReferrerId: 'team-clinic-referrer-id',
			urlName: 'team-clinic-pilot',
			intakeScreeningFlowId: 'team-clinic-screening-flow-id',
		},
	} as Provider;

	mockGetProviderById.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ provider }),
	} as ReturnType<typeof providerService.getProviderById>);
	mockUseScreeningFlow.mockReturnValue({
		startScreeningFlow,
	} as ReturnType<typeof useScreeningFlow>);

	render(
		<CobaltThemeProvider>
			<MemoryRouter
				initialEntries={['/providers?featureId=MEDICATION_PRESCRIBER&institutionLocationId=location-id']}
			>
				<ProviderInfoDetail providerId={provider.providerId} />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

	const screeningButton = await screen.findByRole('button', {
		name: 'Schedule Online',
	});
	expect(screen.getByText('In-person')).toBeInTheDocument();
	expect(
		screen.getByText('Complete a brief eligibility screening to continue to online scheduling.')
	).toBeInTheDocument();
	expect(screen.queryByRole('heading', { name: 'Contact' })).not.toBeInTheDocument();
	expect(mockGetProviderAvailability).not.toHaveBeenCalled();
	expect(mockUseScreeningFlow).toHaveBeenCalledWith(
		expect.objectContaining({
			screeningFlowId: 'team-clinic-screening-flow-id',
			instantiateOnLoad: false,
			screeningQuestionPathPrefix: '/screening-questions-fullscreen',
			screeningQuestionSearch:
				'featureId=MEDICATION_PRESCRIBER&institutionLocationId=location-id&returnTo=%2Fproviders%3FfeatureId%3DMEDICATION_PRESCRIBER%26institutionLocationId%3Dlocation-id',
		})
	);

	fireEvent.click(screeningButton);
	await waitFor(() => expect(startScreeningFlow).toHaveBeenCalledWith());
	expect(analyticsService.persistEvent).toHaveBeenCalledWith(
		AnalyticsNativeEventTypeId.CLICKTHROUGH_PROVIDER_SEARCH_RESULT,
		expect.objectContaining({
			action: AnalyticsNativeEventProviderSearchResultActionId.CHECK_ELIGIBILITY,
			source: AnalyticsNativeEventProviderSearchResultSourceId.DETAIL,
			providerId: 'team-clinic-provider-id',
		})
	);
});

it('selects an appointment time before launching a provider intake screening from details', async () => {
	const provider = {
		providerId: 'provider-id',
		name: 'University of Pennsylvania Employee Assistance Program',
		detailsHtml: '<p>EAP details</p>',
		locations: [],
		websiteUrl: '',
		imageUrl: '',
		supportedAppointmentModalities: [
			{
				appointmentModalityId: ProviderAppointmentModalityId.PHONE,
				description: 'Phone',
			},
		],
	} as Provider;

	mockGetProviderById.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ provider }),
	} as ReturnType<typeof providerService.getProviderById>);
	mockGetProviderAvailability.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({
			providerAvailability: {
				appointmentModalities: [
					{
						appointmentModalityId: ProviderAppointmentModalityId.PHONE,
						description: 'Phone',
						availability: [
							{
								date: '2026-09-18',
								times: [
									{
										time: '16:00:00',
										providerId: 'provider-id',
										appointmentTypeIds: ['appointment-type-id'],
									},
								],
							},
						],
					},
				],
				appointmentTypes: [],
				appointmentSelectionTypeId: ProviderAppointmentSelectionTypeId.APPOINTMENT_PREDETERMINED,
				firstAvailableAppointment: {
					providerId: 'provider-id',
					date: '2026-09-18',
					time: '16:00:00',
					dateTimeDescription: 'September 18 at 4:00 PM',
					appointmentTypeId: 'appointment-type-id',
				},
				screeningRequirement: {
					screeningRequired: true,
					screeningSatisfied: false,
					screeningFlowId: 'screening-flow-id',
				},
			},
		}),
	} as ReturnType<typeof providerService.getProviderAvailability>);

	render(
		<CobaltThemeProvider>
			<MemoryRouter initialEntries={['/providers?featureId=THERAPY&institutionLocationId=location-id']}>
				<ProviderInfoDetail providerId={provider.providerId} />
				<LocationProbe />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

	fireEvent.click(await screen.findByRole('button', { name: 'Schedule Appointment' }));

	await waitFor(() => {
		expect(screen.getByTestId('location')).toHaveTextContent('/provider-confirm-appointment-time?');
	});
	expect(screen.getByTestId('location')).toHaveTextContent('providerId=provider-id');
	expect(screen.getByTestId('location')).toHaveTextContent('appointmentTypeId=appointment-type-id');
	expect(mockUseScreeningFlow).not.toHaveBeenCalled();
	expect(analyticsService.persistEvent).toHaveBeenCalledWith(
		AnalyticsNativeEventTypeId.CLICKTHROUGH_PROVIDER_SEARCH_RESULT,
		expect.objectContaining({
			action: AnalyticsNativeEventProviderSearchResultActionId.SCHEDULE_APPOINTMENT,
			source: AnalyticsNativeEventProviderSearchResultSourceId.DETAIL,
			providerId: 'provider-id',
		})
	);
});

it('renders the provider header as a tinted, full-width hero', async () => {
	const provider = {
		providerId: 'provider-id',
		name: 'Provider Name',
		detailsHtml: '<h2>About</h2>',
		locations: [],
		websiteUrl: '',
		imageUrl: '',
		supportedAppointmentModalities: [],
		referralBooking: {
			institutionReferrerId: 'referrer-id',
			urlName: 'referrer',
			intakeScreeningFlowId: 'screening-flow-id',
		},
	} as Provider;

	mockGetProviderById.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ provider }),
	} as ReturnType<typeof providerService.getProviderById>);
	mockUseScreeningFlow.mockReturnValue({
		startScreeningFlow: jest.fn(),
	} as ReturnType<typeof useScreeningFlow>);

	const { container } = render(
		<CobaltThemeProvider>
			<MemoryRouter>
				<ProviderInfoDetail providerId="provider-id" flushHeader />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

	await screen.findByText('Provider Name');

	const providerContainers = container.querySelectorAll('.container');
	expect(providerContainers).toHaveLength(2);

	const header = providerContainers[0].parentElement;
	const body = providerContainers[1];
	expect(header).toHaveStyle({
		backgroundColor: '#F5F0EC',
		paddingTop: '40px',
		paddingBottom: '40px',
		marginTop: '-32px',
		marginLeft: '-40px',
		marginRight: '-40px',
	});
	expect(body).toHaveStyle({
		paddingTop: '32px',
		paddingBottom: '64px',
	});
});

it('falls back to the provider description when details HTML is empty', async () => {
	const provider = {
		providerId: 'provider-id',
		name: 'Dr. Steven Fetrow-Keihl',
		description: '<p>Provider description</p>',
		detailsHtml: '',
		locations: [],
		websiteUrl: '',
		imageUrl: '',
		supportedAppointmentModalities: [],
		referralBooking: {
			institutionReferrerId: 'referrer-id',
			urlName: 'referrer',
			intakeScreeningFlowId: 'screening-flow-id',
		},
	} as Provider;

	mockGetProviderById.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ provider }),
	} as ReturnType<typeof providerService.getProviderById>);
	mockUseScreeningFlow.mockReturnValue({
		startScreeningFlow: jest.fn(),
	} as ReturnType<typeof useScreeningFlow>);

	render(
		<CobaltThemeProvider>
			<MemoryRouter>
				<ProviderInfoDetail providerId={provider.providerId} />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

	expect(await screen.findByText('Provider description')).toBeInTheDocument();
});

it('renders a clinic image and falls back to its treatment description when details HTML is empty', async () => {
	const clinic = {
		clinicId: 'eap-clinic-id',
		description: 'EAP Clinician',
		treatmentDescription:
			'Specifically for UPHS employees, the Employee Assistance Program (EAP) offers confidential counseling.',
		detailsHtml: '',
		imageUrl: 'https://example.com/eap-clinician.png',
		locations: [],
		websiteUrl: '',
	} as Clinic;

	mockGetClinicByClinicId.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ clinic }),
	} as ReturnType<typeof clinicService.getClinicByClinicId>);
	mockGetClinicAvailability.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({
			clinicAvailability: {
				appointmentModalities: [],
				appointmentTypes: [],
			},
		}),
	} as ReturnType<typeof providerService.getClinicAvailability>);
	mockUseScreeningFlow.mockReturnValue({
		startScreeningFlow: jest.fn(),
	} as ReturnType<typeof useScreeningFlow>);

	const { container } = render(
		<CobaltThemeProvider>
			<MemoryRouter>
				<ProviderInfoDetail clinicId={clinic.clinicId} />
			</MemoryRouter>
		</CobaltThemeProvider>
	);

	const description = await screen.findByText(clinic.treatmentDescription ?? '');

	expect(description).toBeInTheDocument();
	expect(description.closest('.col-12')).toHaveClass('mb-6', 'mb-xl-0');
	expect(container.querySelector('[style*="background-image"]')).toHaveStyle({
		backgroundImage: `url(${clinic.imageUrl})`,
	});
});
