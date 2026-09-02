import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { ProviderAppointmentSelectionTypeId } from '@/lib/models';
import ProviderScheduleCard from './provider-schedule-card';

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

const defaultProps = {
	scheduleAppointmentDescription: '1:1 With CuraLinc',
	onViewAppointmentsButtonClick: jest.fn(),
	onScheduleAppointmentButtonClick: jest.fn(),
};

it('offers eligibility screening for referral-backed providers without showing unavailable scheduling', () => {
	const onScheduleAppointmentButtonClick = jest.fn();

	render(
		<ProviderScheduleCard
			isReferralBooking
			scheduleAppointmentDescription=""
			scheduleTypeId={ProviderAppointmentSelectionTypeId.APPOINTMENT_UNDETERMINED}
			showMoreAppointmentsButton
			onScheduleAppointmentButtonClick={onScheduleAppointmentButtonClick}
			onViewAppointmentsButtonClick={jest.fn()}
		/>
	);

	const screeningButton = screen.getByRole('button', { name: 'Check Eligibility & Schedule Online' });
	expect(
		screen.getByText('Complete a brief eligibility screening to continue to online scheduling.')
	).toBeInTheDocument();
	expect(screen.queryByText('No appointments are currently available.')).not.toBeInTheDocument();
	expect(screen.queryByText('Scheduling contact information is currently unavailable.')).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Schedule Appointment' })).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'View more appointments' })).not.toBeInTheDocument();

	fireEvent.click(screeningButton);
	expect(onScheduleAppointmentButtonClick).toHaveBeenCalledTimes(1);
});

it('shows online phone availability when appointment selection is predetermined', () => {
	render(
		<ProviderScheduleCard
			{...defaultProps}
			scheduleTypeId={ProviderAppointmentSelectionTypeId.APPOINTMENT_PREDETERMINED}
			firstAvailableAppointment={{
				providerId: '1e85daa7-888a-45be-a621-214ecdb29050',
				date: '2026-09-07',
				time: '10:00',
				dateTime: '2026-09-07T10:00',
				timeDescription: '10:00 am',
				appointmentTypeId: '5b3cb43d-e394-456a-95ca-6f40d7a8b0f7',
			}}
			showMoreAppointmentsButton
		/>
	);

	expect(screen.getByText('First Available Appointment:')).toBeInTheDocument();
	expect(screen.getByText(/September 7, 2026/)).toHaveTextContent('September 7, 2026 10:00 am');
	expect(screen.getByRole('button', { name: 'View more appointments' })).toBeInTheDocument();
	expect(screen.queryByText('No appointments are currently available.')).not.toBeInTheDocument();
});

it('does not contradict a phone-booking result that has no contact number', () => {
	render(
		<ProviderScheduleCard
			{...defaultProps}
			scheduleTypeId={ProviderAppointmentSelectionTypeId.APPOINTMENT_BY_PHONE}
			firstAvailableAppointment={{
				date: '2026-09-07',
				time: '10:00',
				dateTime: '2026-09-07T10:00',
				timeDescription: '10:00 am',
			}}
			showMoreAppointmentsButton
		/>
	);

	expect(screen.getByText('Scheduling contact information is currently unavailable.')).toBeInTheDocument();
	expect(screen.queryByText('No appointments are currently available.')).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'View more appointments' })).not.toBeInTheDocument();
});

it('does not offer online appointment selection for call-to-schedule results', () => {
	render(
		<ProviderScheduleCard
			{...defaultProps}
			scheduleTypeId={ProviderAppointmentSelectionTypeId.APPOINTMENT_BY_PHONE}
			phoneNumber="+12155551000"
			phoneNumberDescription="(215) 555-1000"
			showMoreAppointmentsButton
		/>
	);

	expect(screen.getByText('Call (215) 555-1000 to schedule')).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'View more appointments' })).not.toBeInTheDocument();
});
