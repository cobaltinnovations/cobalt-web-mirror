import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { Provider, ProviderAppointmentModalityId } from '@/lib/models';
import { providerService } from '@/lib/services';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import ProviderInfoDetail from './provider-info-detail';

jest.mock('@/jss/theme', () => ({
	createUseThemedStyles: () => () =>
		new Proxy(
			{},
			{
				get: (_target, property) => String(property),
			}
		),
}));

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
	providerService: {
		getProviderById: jest.fn(),
		getProviderAvailability: jest.fn(),
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
const mockUseScreeningFlow = useScreeningFlow as jest.MockedFunction<typeof useScreeningFlow>;

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
		<MemoryRouter>
			<ProviderInfoDetail providerId={provider.providerId} />
		</MemoryRouter>
	);

	const screeningButton = await screen.findByRole('button', {
		name: 'Check Eligibility & Schedule Online',
	});
	expect(screen.getByText('In-person')).toBeInTheDocument();
	expect(screen.queryByRole('heading', { name: 'Contact' })).not.toBeInTheDocument();
	expect(mockGetProviderAvailability).not.toHaveBeenCalled();
	expect(mockUseScreeningFlow).toHaveBeenCalledWith(
		expect.objectContaining({
			screeningFlowId: 'team-clinic-screening-flow-id',
			instantiateOnLoad: false,
		})
	);

	fireEvent.click(screeningButton);
	await waitFor(() => expect(startScreeningFlow).toHaveBeenCalledWith());
});
