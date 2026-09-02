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

it('offers eligibility screening for referral-backed providers without showing unavailable scheduling', () => {
	const onScheduleAppointmentButtonClick = jest.fn();

	render(
		<ProviderScheduleCard
			isReferralBooking
			scheduleAppointmentDescription=""
			scheduleTypeId={ProviderAppointmentSelectionTypeId.APPOINTMENT_UNDETERMINED}
			onScheduleAppointmentButtonClick={onScheduleAppointmentButtonClick}
			onViewAppointmentsButtonClick={jest.fn()}
		/>
	);

	const screeningButton = screen.getByRole('button', { name: 'Check Eligibility & Schedule Online' });
	expect(
		screen.getByText('Complete a brief eligibility screening to continue to online scheduling.')
	).toBeInTheDocument();
	expect(screen.queryByText('No appointments are currently available.')).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'View more appointments' })).not.toBeInTheDocument();

	fireEvent.click(screeningButton);
	expect(onScheduleAppointmentButtonClick).toHaveBeenCalledTimes(1);
});
