import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { CobaltThemeProvider } from '@/jss/theme';
import { ProviderAppointmentModalityId } from '@/lib/models';
import AppointmentDateTimePicker, { getDefaultAppointmentDateTimePickerValue } from './appointment-date-time-picker';

const mockHandleError = jest.fn();

jest.mock('@/components/date-picker', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('@/components/loader', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => mockHandleError,
}));

const modalityDescriptions: Record<ProviderAppointmentModalityId, string> = {
	[ProviderAppointmentModalityId.IN_PERSON]: 'In Person',
	[ProviderAppointmentModalityId.PHONE]: 'Phone',
	[ProviderAppointmentModalityId.VIRTUAL]: 'Virtual',
};

const renderPicker = (modalityIds: ProviderAppointmentModalityId[]) => {
	const onChange = jest.fn();
	const fetchData = jest.fn().mockResolvedValue({
		availability: {
			appointmentTypes: [],
			appointmentModalities: modalityIds.map((appointmentModalityId) => ({
				appointmentModalityId,
				description: modalityDescriptions[appointmentModalityId],
				availability: [],
			})),
			startDate: '2026-08-25',
			endDate: '2026-09-25',
		},
	});

	render(
		<CobaltThemeProvider>
			<AppointmentDateTimePicker
				value={getDefaultAppointmentDateTimePickerValue()}
				onChange={onChange}
				fetchData={fetchData}
			/>
		</CobaltThemeProvider>
	);

	return onChange;
};

it('hides the appointment modality tab bar when only one modality is available', async () => {
	const onChange = renderPicker([ProviderAppointmentModalityId.VIRTUAL]);

	await waitFor(() =>
		expect(onChange).toHaveBeenCalledWith(
			expect.objectContaining({ appointmentModalityId: ProviderAppointmentModalityId.VIRTUAL })
		)
	);

	expect(screen.queryByRole('button', { name: 'Virtual' })).not.toBeInTheDocument();
});

it('shows the appointment modality tab bar when multiple modalities are available', async () => {
	renderPicker([ProviderAppointmentModalityId.IN_PERSON, ProviderAppointmentModalityId.VIRTUAL]);

	expect(await screen.findByRole('button', { name: 'In Person' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Virtual' })).toBeInTheDocument();
});
