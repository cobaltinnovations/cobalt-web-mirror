import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AccountModel, AppointmentModel } from '@/lib/models';
import { accountService } from '@/lib/services';
import { AppointmentDetailPanel } from './appointment-detail-panel';

jest.mock('@/lib/services', () => ({
	accountService: {
		getAppointmentDetailsForAccount: jest.fn(),
	},
	appointmentService: {
		cancelAppointment: jest.fn(),
		getAppointment: jest.fn(),
		updateAppointmentAttendanceStatus: jest.fn(),
	},
}));

jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => jest.fn(),
}));

jest.mock('@/jss/theme', () => ({
	createUseThemedStyles: () => () =>
		new Proxy(
			{},
			{
				get: (_target, property) => String(property),
			}
		),
}));

jest.mock('./use-scheduling-styles', () => ({
	useSchedulingStyles: () => ({ roundBtn: 'roundBtn', roundBtnSolid: 'roundBtnSolid' }),
}));

jest.mock('./use-scroll-calendar', () => ({
	useScrollCalendar: jest.fn(),
}));

jest.mock('@/components/confirm-dialog', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('./appointment-type-item', () => ({
	AppointmentTypeItem: () => null,
}));

jest.mock('./copy-to-clipboard-button', () => ({
	CopyToClipboardButton: () => null,
}));

it('shows appointment-scoped contact details and screening responses', async () => {
	const request = {
		abort: jest.fn(),
		fetch: jest.fn().mockResolvedValue({
			account: {
				accountId: 'patient-account-id',
				firstName: undefined,
				lastName: undefined,
				emailAddress: undefined,
				phoneNumber: undefined,
			} as AccountModel,
			appointment: {
				appointmentId: 'appointment-id',
				accountId: 'patient-account-id',
				firstName: 'Mark',
				lastName: 'Allen',
				emailAddress: 'mark@example.com',
				contactPhoneNumber: '+12155551212',
				contactPhoneNumberDescription: '(215) 555-1212',
				startTimeDescription: 'September 3, 2026, 9:00 AM',
				videoconferenceUrl: 'https://example.com/join',
				screeningSessionResult: {
					screeningSessionScreeningResults: [
						{
							screeningId: 'care-navigation-intake',
							screeningQuestionResults: [
								{
									screeningQuestionId: 'support-question',
									screeningQuestionText: 'What kind of support would be helpful?',
									screeningAnswerResults: [
										{
											screeningAnswerId: 'support-answer',
											answerOptionText: "Something else / I'm not sure",
											text: 'I need an evening appointment.',
										},
									],
								},
							],
						},
					],
				},
			} as AppointmentModel,
			appointments: [],
		}),
	};
	jest.mocked(accountService.getAppointmentDetailsForAccount).mockReturnValue(request as never);

	render(
		<MemoryRouter initialEntries={['/scheduling/appointments/appointment-id']}>
			<Routes>
				<Route
					path="/scheduling/appointments/:appointmentId"
					element={
						<AppointmentDetailPanel
							accountId="patient-account-id"
							focusDateOnLoad={false}
							onAddAppointment={jest.fn()}
							onClose={jest.fn()}
							setCalendarDate={jest.fn()}
						/>
					}
				/>
			</Routes>
		</MemoryRouter>
	);

	expect(await screen.findByRole('heading', { name: 'Mark Allen' })).toBeInTheDocument();
	expect(screen.getByText('(215) 555-1212')).toBeInTheDocument();
	expect(screen.getByText('mark@example.com')).toBeInTheDocument();
	expect(screen.getByText('Screening Responses')).toBeInTheDocument();
	expect(screen.getByText('What kind of support would be helpful?')).toBeInTheDocument();
	expect(screen.getByText("Something else / I'm not sure")).toBeInTheDocument();
	expect(screen.getByText('I need an evening appointment.')).toBeInTheDocument();
	expect(screen.getByTestId('appointmentDetailJoinButton')).toHaveClass('text-white');
	expect(screen.getByTestId('appointmentDetailJoinButton')).toHaveAttribute('href', 'https://example.com/join');
});
