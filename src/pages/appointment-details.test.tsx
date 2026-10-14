import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
import { AppointmentModel, VideoconferencePlatformId } from '@/lib/models';
import { appointmentService } from '@/lib/services';
import AppointmentDetails from './appointment-details';

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('@/lib/services', () => ({
	appointmentService: { getAppointment: jest.fn() },
}));
jest.mock('@/components/hero-container', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('@/components/async-page', () => {
	const React = require('react');

	return {
		__esModule: true,
		default: ({ children, fetchData }: { children: React.ReactNode; fetchData(): Promise<unknown> }) => {
			const [loaded, setLoaded] = React.useState(false);
			React.useEffect(() => {
				Promise.resolve(fetchData()).then(() => setLoaded(true));
			}, [fetchData]);
			return loaded ? children : null;
		},
	};
});

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;

beforeEach(() => {
	mockUseAccount.mockReturnValue({ institution: { platformName: 'Cobalt' } } as ReturnType<typeof useAccount>);
});

function renderAppointment(appointment: Partial<AppointmentModel>) {
	jest.mocked(appointmentService.getAppointment).mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ appointment }),
	} as never);

	render(
		<MemoryRouter initialEntries={['/appointments/appointment-id']}>
			<Routes>
				<Route path="/appointments/:appointmentId" element={<AppointmentDetails />} />
			</Routes>
		</MemoryRouter>
	);
}

it('shows the video link for a Care Navigator appointment', async () => {
	renderAppointment({
		careEncounterId: 'care-encounter-id',
		timeDescription: 'Thursday, October 1 at 11:15 AM',
		videoconferenceUrl: 'https://teams.example/join/appointment-id',
		canceled: false,
	});

	expect(await screen.findByText(/Your appointment is scheduled/)).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Join Now' })).toHaveAttribute(
		'href',
		'https://teams.example/join/appointment-id'
	);
});

it('keeps the call instructions for telephone appointments', async () => {
	renderAppointment({
		timeDescription: 'Thursday, October 1 at 11:15 AM',
		videoconferencePlatformId: VideoconferencePlatformId.TELEPHONE,
		canceled: false,
	});

	expect(await screen.findByText(/Your telephone consultation is scheduled/)).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Join Now' })).not.toBeInTheDocument();
});

it('does not offer a join link after cancellation', async () => {
	renderAppointment({
		careEncounterId: 'care-encounter-id',
		videoconferenceUrl: 'https://teams.example/join/appointment-id',
		canceled: true,
	});

	expect(await screen.findByText('Your appointment was canceled.')).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Join Now' })).not.toBeInTheDocument();
});

it('shows the video link for other provider appointments too', async () => {
	renderAppointment({
		timeDescription: 'Thursday, October 1 at 11:15 AM',
		videoconferenceUrl: 'https://teams.example/join/another-appointment',
		canceled: false,
	});

	expect(await screen.findByText(/Your appointment is scheduled/)).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Join Now' })).toHaveAttribute(
		'href',
		'https://teams.example/join/another-appointment'
	);
});

it('shows appointment details without a join button when there is no video link', async () => {
	renderAppointment({
		timeDescription: 'Thursday, October 1 at 11:15 AM',
		canceled: false,
	});

	expect(await screen.findByText(/Your appointment is scheduled/)).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Join Now' })).not.toBeInTheDocument();
});
