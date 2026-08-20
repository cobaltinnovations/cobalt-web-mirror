import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { CobaltThemeProvider } from '@/jss/theme';
import {
	ATTENDANCE_STATUS_ID,
	CareEncounterCancellationReasonId,
	CareEncounterListModel,
	CareEncounterModel,
	CareEncounterSortColumnId,
	CareEncounterStatusId,
	SortDirectionId,
} from '@/lib/models';
import { GetCareEncounterResponseBody, GetCareEncountersResponseBody, careEncounterService } from '@/lib/services';
import { Component as EncounterShelf } from './encounter-shelf';
import { Component } from './encounters';

const mockAddFlag = jest.fn();
const mockHandleError = jest.fn();

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/hooks/use-handle-error', () => {
	return {
		__esModule: true,
		default: (handler?: (error: unknown) => boolean) => handler ?? mockHandleError,
	};
});

jest.mock('@/hooks/use-flags', () => ({
	__esModule: true,
	default: () => ({ addFlag: mockAddFlag }),
}));

const historicalAppointment = {
	appointmentId: 'appointment-history-1',
	accountId: 'account-1',
	startTimeDescription: 'Aug 10, 2026 at 2:30 PM',
	canceled: true,
	canceledAtDescription: 'Aug 11, 2026 at 9:15 AM',
	attendanceStatusId: ATTENDANCE_STATUS_ID.CANCELED,
} as CareEncounterModel['appointment'];

const careEncounter: CareEncounterModel = {
	careEncounterId: 'care-encounter-1',
	appointmentId: 'appointment-1',
	accountId: 'account-1',
	careEncounterStatusId: CareEncounterStatusId.OPEN,
	careEncounterStatusDisplayLabel: 'Open',
	patientFullName: 'Avery Morgan',
	appointmentDate: '2026-08-18',
	appointmentDateDescription: 'Backend Appointment Date',
	createdByAccountId: 'account-2',
	lastUpdatedByAccountId: 'account-2',
	created: '2026-07-28T14:00:00Z',
	createdDescription: 'Jul 28, 2026 at 10:00 AM',
	createdDate: '2026-07-28',
	createdDateDescription: 'Backend Created Date',
	lastUpdated: '2026-07-28T14:00:00Z',
	lastUpdatedDescription: 'Jul 28, 2026 at 10:00 AM',
	appointmentHistory: [historicalAppointment],
	appointment: {
		appointmentId: 'appointment-1',
		accountId: 'account-1',
		firstName: 'Avery',
		lastName: 'Morgan',
		startTimeDescription: 'Backend Appointment Start Time',
		localStartDate: '2026-08-18',
		localStartTime: '10:25:00',
		videoconferenceUrl: 'https://video.example.com/appointment-1',
		canceled: false,
		provider: {
			name: 'Navigator Name',
		},
		account: {
			emailAddress: 'patient@example.com',
		},
	} as CareEncounterModel['appointment'],
};

const careEncounterList: CareEncounterListModel = {
	...careEncounter,
	appointment: {
		appointmentId: 'appointment-1',
		providerId: 'provider-1',
		appointmentTypeId: 'appointment-type-1',
		attendanceStatusId: ATTENDANCE_STATUS_ID.UNKNOWN,
		title: 'Care Navigator Appointment',
		startTime: '2026-08-18T14:25:00Z',
		startTimeDescription: 'Backend Appointment Start Time',
		endTime: '2026-08-18T14:55:00Z',
		endTimeDescription: 'Backend Appointment End Time',
		timeZone: 'America/New_York',
		canceledForReschedule: false,
		canceled: false,
	},
};

const defaultResponse: GetCareEncountersResponseBody = {
	totalCount: 1,
	totalCountDescription: '1',
	careEncounters: [careEncounterList],
};

const defaultDetailResponse: GetCareEncounterResponseBody = {
	careEncounter,
	otherCareEncounters: [],
	otherCareEncountersTotalCount: 0,
	otherCareEncountersTotalCountDescription: '0',
};

const careEncounterCancellationReasons = [
	{
		careEncounterCancellationReasonId: CareEncounterCancellationReasonId.PATIENT_REQUESTED,
		description: 'Patient requested',
		displayOrder: 1,
		freeformTextRequired: false,
	},
	{
		careEncounterCancellationReasonId: CareEncounterCancellationReasonId.NO_LONGER_NEEDED,
		description: 'No longer needed',
		displayOrder: 2,
		freeformTextRequired: false,
	},
	{
		careEncounterCancellationReasonId: CareEncounterCancellationReasonId.UNABLE_TO_REACH_PATIENT,
		description: 'Unable to reach patient',
		displayOrder: 3,
		freeformTextRequired: false,
	},
	{
		careEncounterCancellationReasonId: CareEncounterCancellationReasonId.SCHEDULING_CONFLICT,
		description: 'Scheduling conflict',
		displayOrder: 4,
		freeformTextRequired: false,
	},
	{
		careEncounterCancellationReasonId: CareEncounterCancellationReasonId.DUPLICATE_BOOKING,
		description: 'Duplicate booking',
		displayOrder: 5,
		freeformTextRequired: false,
	},
	{
		careEncounterCancellationReasonId: CareEncounterCancellationReasonId.OTHER,
		description: 'Other',
		displayOrder: 6,
		freeformTextRequired: true,
	},
];

const canceledCareEncounter: CareEncounterModel = {
	...careEncounter,
	careEncounterStatusId: CareEncounterStatusId.CANCELED,
	careEncounterStatusDisplayLabel: 'Canceled',
	careEncounterCancellationReasonId: CareEncounterCancellationReasonId.PATIENT_REQUESTED,
};

const careEncounterWithCanceledAppointment: CareEncounterModel = {
	...careEncounter,
	appointment: {
		...careEncounter.appointment,
		canceled: true,
		canceledAtDescription: 'Aug 20, 2026 at 1:30 PM',
		cancellationReason: 'Patient unable to attend',
	},
};

const getCareEncountersSpy = jest.spyOn(careEncounterService, 'getCareEncounters');
const getCareEncounterSpy = jest.spyOn(careEncounterService, 'getCareEncounter');
const getCareEncounterCancellationReasonsSpy = jest.spyOn(careEncounterService, 'getCareEncounterCancellationReasons');
const cancelCareEncounterSpy = jest.spyOn(careEncounterService, 'cancelCareEncounter');
const cancelCareEncounterAppointmentSpy = jest.spyOn(careEncounterService, 'cancelCareEncounterAppointment');
const updateCareEncounterSpy = jest.spyOn(careEncounterService, 'updateCareEncounter');

beforeAll(() => {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => undefined,
			removeListener: () => undefined,
			addEventListener: () => undefined,
			removeEventListener: () => undefined,
			dispatchEvent: () => false,
		}),
	});
});

beforeEach(() => {
	getCareEncountersSpy.mockImplementation(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue(defaultResponse),
			} as ReturnType<typeof careEncounterService.getCareEncounters>)
	);
	getCareEncounterSpy.mockImplementation(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue(defaultDetailResponse),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);
	getCareEncounterCancellationReasonsSpy.mockImplementation(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({ careEncounterCancellationReasons }),
			} as ReturnType<typeof careEncounterService.getCareEncounterCancellationReasons>)
	);
	cancelCareEncounterSpy.mockImplementation(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({ careEncounter: canceledCareEncounter }),
			} as ReturnType<typeof careEncounterService.cancelCareEncounter>)
	);
	cancelCareEncounterAppointmentSpy.mockImplementation(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({ careEncounter: careEncounterWithCanceledAppointment }),
			} as ReturnType<typeof careEncounterService.cancelCareEncounterAppointment>)
	);
});

afterEach(() => {
	jest.clearAllMocks();
});

const renderEncounters = (initialEntry = '/admin/encounters') => {
	const router = createMemoryRouter(
		[
			{
				id: 'admin-encounters',
				path: '/admin/encounters',
				element: <Component />,
				children: [
					{
						path: ':encounterId',
						element: <EncounterShelf />,
					},
				],
			},
		],
		{ initialEntries: [initialEntry] }
	);

	render(
		<CobaltThemeProvider>
			<RouterProvider router={router} />
		</CobaltThemeProvider>
	);

	return router;
};

const expectTabToBeActive = (name: string) => {
	expect(screen.getByRole('button', { name }).parentElement).toHaveClass('active');
};

const findCloseEncounterDialog = async () => {
	const reasonLabel = await screen.findByText('Reason for Closure:');
	const dialog = reasonLabel.closest('[role="dialog"]');

	if (!dialog) {
		throw new Error('Close Encounter dialog not found.');
	}

	return dialog as HTMLElement;
};

const findEditContactDialog = async () => {
	const title = await screen.findByText('Edit Primary Contact');
	const dialog = title.closest('[role="dialog"]');

	if (!dialog) {
		throw new Error('Edit Primary Contact dialog not found.');
	}

	return dialog as HTMLElement;
};

const findCancelAppointmentDialog = async () => {
	const confirmation = await screen.findByText('Are you sure you want to cancel the appointment?');
	const dialog = confirmation.closest('[role="dialog"]');

	if (!dialog) {
		throw new Error('Cancel Appointment dialog not found.');
	}

	return dialog as HTMLElement;
};

const clickAndFlush = async (element: HTMLElement) => {
	await act(async () => {
		fireEvent.click(element);
	});
};

it('requests and renders the default open encounter table', async () => {
	renderEncounters();

	expect(await screen.findByRole('heading', { name: 'Encounters' })).toBeInTheDocument();
	expect(await screen.findByText('Avery Morgan')).toBeInTheDocument();
	expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Created' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Patient' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Appointment Date' })).toBeInTheDocument();
	expect(screen.getByText('Backend Created Date')).toBeInTheDocument();
	expect(screen.getByText('Backend Appointment Start Time')).toBeInTheDocument();
	expectTabToBeActive('Open');
	expect(getCareEncountersSpy).toHaveBeenCalledWith({
		pageNumber: 0,
		pageSize: 25,
		careEncounterStatusId: CareEncounterStatusId.OPEN,
		careEncounterSortColumnId: CareEncounterSortColumnId.APPOINTMENT_DATE,
		sortDirectionId: SortDirectionId.DESCENDING,
	});
});

it('passes URL parameters through when requesting encounters', async () => {
	renderEncounters(
		'/admin/encounters?status=CLOSED&pageNumber=7&careEncounterSortColumnId=STATUS&sortDirectionId=ASCENDING'
	);

	await screen.findByText('Avery Morgan');
	expectTabToBeActive('Closed');
	expect(getCareEncountersSpy).toHaveBeenCalledWith({
		pageNumber: 7,
		pageSize: 25,
		careEncounterStatusId: CareEncounterStatusId.CLOSED,
		careEncounterSortColumnId: CareEncounterSortColumnId.STATUS,
		sortDirectionId: SortDirectionId.ASCENDING,
	});
});

it('updates status in the URL, resets pagination, and refetches closed encounters', async () => {
	const router = renderEncounters('/admin/encounters?source=admin&status=OPEN&pageNumber=2');

	await screen.findByText('Avery Morgan');
	fireEvent.click(screen.getByRole('button', { name: 'Closed' }));

	await waitFor(() => expect(router.state.location.search).toBe('?source=admin&status=CLOSED'));
	expectTabToBeActive('Closed');
	expect(getCareEncountersSpy).toHaveBeenLastCalledWith({
		pageNumber: 0,
		pageSize: 25,
		careEncounterStatusId: CareEncounterStatusId.CLOSED,
		careEncounterSortColumnId: CareEncounterSortColumnId.APPOINTMENT_DATE,
		sortDirectionId: SortDirectionId.DESCENDING,
	});
});

it('aborts the current request before fetching updated parameters', async () => {
	const abort = jest.fn();
	getCareEncountersSpy.mockImplementationOnce(
		() =>
			({
				abort,
				fetch: jest.fn().mockReturnValue(new Promise(() => undefined)),
			} as ReturnType<typeof careEncounterService.getCareEncounters>)
	);
	const router = renderEncounters('/admin/encounters?status=OPEN');

	await screen.findByRole('heading', { name: 'Encounters' });
	fireEvent.click(screen.getByRole('button', { name: 'Closed' }));

	await waitFor(() => expect(router.state.location.search).toBe('?status=CLOSED'));
	await waitFor(() => expect(getCareEncountersSpy).toHaveBeenCalledTimes(2));
	expect(abort).toHaveBeenCalledTimes(1);
});

it('sorts every table header through the URL and resets pagination', async () => {
	const router = renderEncounters('/admin/encounters?source=admin&pageNumber=3');
	const expectSortParams = (sortColumnId: CareEncounterSortColumnId, directionId: SortDirectionId) => {
		const currentSearchParams = new URLSearchParams(router.state.location.search);

		expect(currentSearchParams.get('careEncounterSortColumnId')).toBe(sortColumnId);
		expect(currentSearchParams.get('sortDirectionId')).toBe(directionId);
	};

	await screen.findByText('Avery Morgan');

	fireEvent.click(screen.getByRole('button', { name: 'Created' }));
	await waitFor(() => expectSortParams(CareEncounterSortColumnId.CREATED, SortDirectionId.ASCENDING));
	expect(new URLSearchParams(router.state.location.search).has('pageNumber')).toBe(false);

	fireEvent.click(screen.getByRole('button', { name: 'Created' }));
	await waitFor(() => expectSortParams(CareEncounterSortColumnId.CREATED, SortDirectionId.DESCENDING));

	fireEvent.click(screen.getByRole('button', { name: 'Patient' }));
	await waitFor(() => expectSortParams(CareEncounterSortColumnId.PATIENT_NAME, SortDirectionId.ASCENDING));

	fireEvent.click(screen.getByRole('button', { name: 'Patient' }));
	await waitFor(() => expectSortParams(CareEncounterSortColumnId.PATIENT_NAME, SortDirectionId.DESCENDING));

	fireEvent.click(screen.getByRole('button', { name: 'Appointment Date' }));
	await waitFor(() => expectSortParams(CareEncounterSortColumnId.APPOINTMENT_DATE, SortDirectionId.ASCENDING));

	fireEvent.click(screen.getByRole('button', { name: 'Appointment Date' }));
	await waitFor(() => expectSortParams(CareEncounterSortColumnId.APPOINTMENT_DATE, SortDirectionId.DESCENDING));
	expect(getCareEncountersSpy).toHaveBeenLastCalledWith(
		expect.objectContaining({
			careEncounterSortColumnId: CareEncounterSortColumnId.APPOINTMENT_DATE,
			sortDirectionId: SortDirectionId.DESCENDING,
		})
	);
});

it('debounces and trims search, clears immediately, and follows browser navigation', async () => {
	const router = renderEncounters('/admin/encounters?source=admin&searchQuery=Initial&pageNumber=2');
	const searchInput = await screen.findByPlaceholderText('Search');

	expect(searchInput).toHaveValue('Initial');
	fireEvent.change(searchInput, { target: { value: '  Avery Morgan  ' } });
	expect(new URLSearchParams(router.state.location.search).get('searchQuery')).toBe('Initial');

	await waitFor(
		() => expect(new URLSearchParams(router.state.location.search).get('searchQuery')).toBe('Avery Morgan'),
		{ timeout: 1000 }
	);
	expect(new URLSearchParams(router.state.location.search).has('pageNumber')).toBe(false);
	expect(getCareEncountersSpy).toHaveBeenLastCalledWith(expect.objectContaining({ searchQuery: 'Avery Morgan' }));

	const clearButton = searchInput.parentElement?.querySelector('button');
	expect(clearButton).not.toBeNull();
	fireEvent.click(clearButton as HTMLButtonElement);

	await waitFor(() => expect(new URLSearchParams(router.state.location.search).has('searchQuery')).toBe(false));
	expect(searchInput).toHaveValue('');

	await act(async () => {
		await router.navigate('/admin/encounters?source=admin&searchQuery=Jordan');
	});

	await waitFor(() => expect(searchInput).toHaveValue('Jordan'));
	expect(getCareEncountersSpy).toHaveBeenLastCalledWith(expect.objectContaining({ searchQuery: 'Jordan' }));
});

it('updates zero-based pagination through the URL', async () => {
	getCareEncountersSpy.mockImplementation(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({ ...defaultResponse, totalCount: 51, totalCountDescription: '51' }),
			} as ReturnType<typeof careEncounterService.getCareEncounters>)
	);
	const router = renderEncounters('/admin/encounters?source=admin');

	await screen.findByText('Avery Morgan');
	fireEvent.click(within(screen.getByRole('group', { name: 'Pagination' })).getByRole('button', { name: '2' }));

	await waitFor(() => expect(new URLSearchParams(router.state.location.search).get('pageNumber')).toBe('1'));
	expect(new URLSearchParams(router.state.location.search).get('source')).toBe('admin');
	expect(getCareEncountersSpy).toHaveBeenLastCalledWith(expect.objectContaining({ pageNumber: 1, pageSize: 25 }));
});

it('shows the empty state after an empty request finishes', async () => {
	let resolveResponse: (response: GetCareEncountersResponseBody) => void = () => undefined;
	const responsePromise = new Promise<GetCareEncountersResponseBody>((resolve) => {
		resolveResponse = resolve;
	});

	getCareEncountersSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockReturnValue(responsePromise),
			} as ReturnType<typeof careEncounterService.getCareEncounters>)
	);
	renderEncounters();

	await screen.findByRole('heading', { name: 'Encounters' });
	expect(screen.queryByText('No Encounters')).not.toBeInTheDocument();

	await act(async () => {
		resolveResponse({ totalCount: 0, totalCountDescription: '0', careEncounters: [] });
	});

	expect(await screen.findByText('No Encounters')).toBeInTheDocument();
});

it('opens an encounter shelf from an API row and preserves list query parameters', async () => {
	const router = renderEncounters('/admin/encounters?source=admin&status=OPEN');

	fireEvent.click(await screen.findByRole('row', { name: /Avery Morgan/ }));

	await waitFor(() => expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1'));
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
	expect(await screen.findByRole('heading', { name: 'Avery Morgan' })).toBeInTheDocument();
	expect(screen.getByText('Care Navigator:')).toBeInTheDocument();
	expect(getCareEncounterSpy).toHaveBeenCalledWith('care-encounter-1');

	await act(async () => {
		await router.navigate(-1);
	});

	await waitFor(() => expect(router.state.location.pathname).toBe('/admin/encounters'));
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('renders encounter shelf details and switches shelf tabs without changing the URL', async () => {
	const router = renderEncounters('/admin/encounters/any-encounter-id?status=CLOSED');

	expect(await screen.findByRole('heading', { name: 'Avery Morgan' })).toBeInTheDocument();
	expect(screen.getByText('Navigator Name')).toBeInTheDocument();
	expect(screen.getAllByText('Backend Created Date')).toHaveLength(2);
	expect(screen.getByText('Unknown')).toBeInTheDocument();
	expect(screen.getByText('patient@example.com')).toBeInTheDocument();
	expect(screen.getByText('Navigator Appointment')).toBeInTheDocument();
	expect(screen.getByRole('heading', { name: 'No Screening Answers' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Close Encounter' })).toBeInTheDocument();
	expectTabToBeActive('Encounter Details');

	const shelfUrl = `${router.state.location.pathname}${router.state.location.search}`;
	fireEvent.click(screen.getByRole('button', { name: 'Contact History (0)' }));

	expect(await screen.findByRole('heading', { name: 'No Contact Attempts Logged' })).toBeInTheDocument();
	expectTabToBeActive('Contact History (0)');
	expect(`${router.state.location.pathname}${router.state.location.search}`).toBe(shelfUrl);

	fireEvent.click(screen.getByRole('button', { name: 'Notes (0)' }));

	expect(await screen.findByRole('heading', { name: 'No Notes' })).toBeInTheDocument();
	expect(screen.getByRole('textbox', { name: 'Your Note:' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Add Note' })).toBeDisabled();
	expectTabToBeActive('Notes (0)');
	expect(`${router.state.location.pathname}${router.state.location.search}`).toBe(shelfUrl);

	fireEvent.click(screen.getByRole('button', { name: 'Close encounter details' }));

	await waitFor(() => expect(router.state.location.pathname).toBe('/admin/encounters'));
	expect(router.state.location.search).toBe('?status=CLOSED');
});

it('cancels the current appointment and refreshes the shelf without changing the route', async () => {
	const router = renderEncounters('/admin/encounters/care-encounter-1?source=admin&status=OPEN');

	const appointmentCard = (await screen.findByText('Appointment')).closest('.ic-card');
	if (!appointmentCard) {
		throw new Error('Appointment card not found.');
	}
	const appointment = within(appointmentCard as HTMLElement);

	expect(appointment.getByText('Backend Appointment Start Time')).toBeInTheDocument();
	expect(appointment.getByRole('button', { name: 'Join Video Call' })).toHaveAttribute(
		'href',
		'https://video.example.com/appointment-1'
	);
	expect(appointment.getByRole('button', { name: 'Join Video Call' })).toHaveAttribute('target', '_blank');
	expect(appointment.getByRole('button', { name: 'Join Video Call' })).toHaveAttribute('rel', 'noopener noreferrer');

	await clickAndFlush(appointment.getByRole('button', { name: 'Edit' }));
	const cancelMenuItem = await screen.findByRole('button', { name: 'Cancel' });
	expect(screen.getAllByRole('button', { name: 'Cancel' })).toHaveLength(1);
	await clickAndFlush(cancelMenuItem);

	let dialog = await findCancelAppointmentDialog();
	let modal = within(dialog);
	let noteInput = modal.getByRole('textbox', { name: 'Note about cancellation' });
	let cancelAppointmentButton = modal.getByRole('button', { name: 'Cancel Appointment' });

	expect(modal.getByText('This note will appear in the cancellation email to the patient.')).toBeInTheDocument();
	expect(noteInput).toBeRequired();
	expect(noteInput).toHaveAttribute('maxlength', '2000');
	expect(cancelAppointmentButton).toBeDisabled();
	fireEvent.change(noteInput, { target: { value: 'Local-only cancellation note' } });
	expect(cancelAppointmentButton).toBeEnabled();

	await clickAndFlush(modal.getByRole('button', { name: 'Keep Appointment' }));
	await waitFor(() =>
		expect(screen.queryByText('Are you sure you want to cancel the appointment?')).not.toBeInTheDocument()
	);

	await clickAndFlush(appointment.getByRole('button', { name: 'Edit' }));
	await clickAndFlush(await screen.findByRole('button', { name: 'Cancel' }));
	dialog = await findCancelAppointmentDialog();
	modal = within(dialog);
	noteInput = modal.getByRole('textbox', { name: 'Note about cancellation' });
	expect(noteInput).toHaveValue('');

	fireEvent.change(noteInput, { target: { value: '  Patient unable to attend  ' } });
	cancelAppointmentButton = modal.getByRole('button', { name: 'Cancel Appointment' });
	await clickAndFlush(cancelAppointmentButton);

	await waitFor(() =>
		expect(screen.queryByText('Are you sure you want to cancel the appointment?')).not.toBeInTheDocument()
	);
	expect(cancelCareEncounterAppointmentSpy).toHaveBeenCalledWith('care-encounter-1', 'appointment-1', {
		cancellationReason: 'Patient unable to attend',
	});
	await waitFor(() => expect(getCareEncountersSpy).toHaveBeenCalledTimes(2));
	expect(screen.getByText('TODO: Cancelled Card')).toBeInTheDocument();
	expect(mockAddFlag).toHaveBeenCalledWith({
		variant: 'success',
		title: 'Appointment Canceled',
		actions: [],
	});
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('keeps the appointment cancellation modal open when cancellation fails', async () => {
	const error = new Error('Unable to cancel appointment');
	cancelCareEncounterAppointmentSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockRejectedValue(error),
			} as ReturnType<typeof careEncounterService.cancelCareEncounterAppointment>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');

	await clickAndFlush(await screen.findByRole('button', { name: 'Edit' }));
	await clickAndFlush(await screen.findByRole('button', { name: 'Cancel' }));
	const dialog = await findCancelAppointmentDialog();
	const modal = within(dialog);
	const noteInput = modal.getByRole('textbox', { name: 'Note about cancellation' });

	fireEvent.change(noteInput, { target: { value: 'Patient unavailable' } });
	await clickAndFlush(modal.getByRole('button', { name: 'Cancel Appointment' }));

	await waitFor(() => expect(mockHandleError).toHaveBeenCalledWith(error));
	expect(dialog).toBeInTheDocument();
	expect(noteInput).toHaveValue('Patient unavailable');
	expect(mockAddFlag).not.toHaveBeenCalled();
});

it('renders appointment history and opens read-only appointment details', async () => {
	const router = renderEncounters('/admin/encounters/care-encounter-1?source=admin&status=OPEN');
	const historyCard = (await screen.findByText('Appointment History')).closest('.ic-card');

	if (!historyCard) {
		throw new Error('Appointment History card not found.');
	}

	const history = within(historyCard as HTMLElement);
	expect(history.getByText('Aug 10, 2026 at 2:30 PM')).toBeInTheDocument();
	expect(history.getByText('Canceled')).toBeInTheDocument();

	await clickAndFlush(history.getByRole('button', { name: 'View appointment details for Aug 10, 2026 at 2:30 PM' }));

	const title = await screen.findByText('Appointment Details');
	const dialog = title.closest('[role="dialog"]');
	if (!dialog) {
		throw new Error('Appointment Details dialog not found.');
	}
	const details = within(dialog as HTMLElement);

	expect(details.getByText('Appointment Date')).toBeInTheDocument();
	expect(details.getByText('Aug 10, 2026 at 2:30 PM')).toBeInTheDocument();
	expect(details.getByText('Canceled Date')).toBeInTheDocument();
	expect(details.getByText('Aug 11, 2026 at 9:15 AM')).toBeInTheDocument();

	await clickAndFlush(details.getByRole('button', { name: 'Close' }));
	await waitFor(() => expect(screen.queryByText('Appointment Details')).not.toBeInTheDocument());
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('does not render appointment history when the response history is empty', async () => {
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: {
						...careEncounter,
						appointmentHistory: [],
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);

	renderEncounters('/admin/encounters/care-encounter-1');

	expect(await screen.findByText('Appointment')).toBeInTheDocument();
	expect(screen.queryByText('Appointment History')).not.toBeInTheDocument();
});

it('dismisses the cancellation modal without closing the encounter shelf', async () => {
	const router = renderEncounters('/admin/encounters/care-encounter-1?source=admin&status=OPEN');
	const openModal = async () => {
		await clickAndFlush(await screen.findByRole('button', { name: 'Edit' }));
		await clickAndFlush(await screen.findByRole('button', { name: 'Cancel' }));
		return findCancelAppointmentDialog();
	};

	let dialog = await openModal();
	await clickAndFlush(within(dialog).getByRole('button', { name: 'Close' }));
	await waitFor(() =>
		expect(screen.queryByText('Are you sure you want to cancel the appointment?')).not.toBeInTheDocument()
	);

	dialog = await openModal();
	await clickAndFlush(dialog);
	await waitFor(() =>
		expect(screen.queryByText('Are you sure you want to cancel the appointment?')).not.toBeInTheDocument()
	);

	await openModal();
	fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
	await waitFor(() =>
		expect(screen.queryByText('Are you sure you want to cancel the appointment?')).not.toBeInTheDocument()
	);

	expect(screen.getByRole('heading', { name: 'Avery Morgan' })).toBeInTheDocument();
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('renders the canceled appointment placeholder instead of appointment actions', async () => {
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: {
						...careEncounter,
						appointment: {
							...careEncounter.appointment,
							canceled: true,
						},
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);

	renderEncounters('/admin/encounters/care-encounter-1');

	expect(await screen.findByText('TODO: Cancelled Card')).toBeInTheDocument();
	expect(screen.queryByText('Appointment')).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Join Video Call' })).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
});

it('opens the edit contact modal with the shelf email and resets unsaved changes on entry', async () => {
	const router = renderEncounters('/admin/encounters/care-encounter-1?source=admin&status=OPEN');
	const editContactButton = await screen.findByRole('button', { name: 'Edit Contact' });

	await clickAndFlush(editContactButton);

	let dialog = await findEditContactDialog();
	let modal = within(dialog);
	let emailInput = modal.getByRole('textbox', { name: 'Email Address' });

	expect(emailInput).toHaveValue('patient@example.com');
	fireEvent.change(emailInput, { target: { value: 'edited@example.com' } });
	expect(emailInput).toHaveValue('edited@example.com');

	await clickAndFlush(modal.getByRole('button', { name: 'Cancel' }));
	await waitFor(() => expect(screen.queryByText('Edit Primary Contact')).not.toBeInTheDocument());
	expect(screen.getByText('patient@example.com')).toBeInTheDocument();

	await clickAndFlush(editContactButton);
	dialog = await findEditContactDialog();
	modal = within(dialog);
	emailInput = modal.getByRole('textbox', { name: 'Email Address' });
	expect(emailInput).toHaveValue('patient@example.com');

	fireEvent.change(emailInput, { target: { value: 'saved-nowhere@example.com' } });
	await clickAndFlush(modal.getByRole('button', { name: 'Save' }));

	await waitFor(() => expect(screen.queryByText('Edit Primary Contact')).not.toBeInTheDocument());
	expect(screen.getByText('patient@example.com')).toBeInTheDocument();
	expect(cancelCareEncounterSpy).not.toHaveBeenCalled();
	expect(mockAddFlag).not.toHaveBeenCalled();
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('dismisses the edit contact modal through X, backdrop, and Escape without closing the shelf', async () => {
	const router = renderEncounters('/admin/encounters/care-encounter-1?source=admin&status=OPEN');
	const editContactButton = await screen.findByRole('button', { name: 'Edit Contact' });

	await clickAndFlush(editContactButton);
	let dialog = await findEditContactDialog();
	await clickAndFlush(within(dialog).getByRole('button', { name: 'Close' }));
	await waitFor(() => expect(screen.queryByText('Edit Primary Contact')).not.toBeInTheDocument());

	await clickAndFlush(editContactButton);
	dialog = await findEditContactDialog();
	await clickAndFlush(dialog);
	await waitFor(() => expect(screen.queryByText('Edit Primary Contact')).not.toBeInTheDocument());

	await clickAndFlush(editContactButton);
	await findEditContactDialog();
	fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
	await waitFor(() => expect(screen.queryByText('Edit Primary Contact')).not.toBeInTheDocument());

	expect(screen.getByRole('heading', { name: 'Avery Morgan' })).toBeInTheDocument();
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('renders neutral fallbacks for unavailable encounter details', async () => {
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: {
						...careEncounter,
						appointment: {
							...careEncounter.appointment,
							provider: undefined,
							account: undefined,
						},
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);

	renderEncounters('/admin/encounters/care-encounter-1');

	expect(await screen.findByText('Unassigned')).toBeInTheDocument();
	expect(screen.getAllByText('Unknown')).toHaveLength(2);

	await clickAndFlush(screen.getByRole('button', { name: 'Edit Contact' }));
	const dialog = await findEditContactDialog();
	expect(within(dialog).getByRole('textbox', { name: 'Email Address' })).toHaveValue('');
});

it('renders an encounter note and updates the notes tab count', async () => {
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: {
						...careEncounter,
						notes: 'Read-only encounter note',
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);

	renderEncounters('/admin/encounters/care-encounter-1');

	const notesTab = await screen.findByRole('button', { name: 'Notes (1)' });
	fireEvent.click(notesTab);

	expect(await screen.findByText('Read-only encounter note')).toBeInTheDocument();
	expect(screen.getAllByText('Navigator Name')).toHaveLength(2);
	expect(screen.getByText('Jul 28, 2026 at 10:00 AM')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Edit Note' })).toBeInTheDocument();
	expect(screen.getByRole('textbox', { name: 'Your Note:' })).toBeInTheDocument();
	expectTabToBeActive('Notes (1)');
});

it('keeps the add-note form local without updating the encounter', async () => {
	const router = renderEncounters('/admin/encounters/care-encounter-1?source=admin&status=OPEN');
	const notesTab = await screen.findByRole('button', { name: 'Notes (0)' });
	fireEvent.click(notesTab);

	const noteInput = screen.getByRole('textbox', { name: 'Your Note:' });
	const addNoteButton = screen.getByRole('button', { name: 'Add Note' });

	expect(addNoteButton).toBeDisabled();
	fireEvent.change(noteInput, { target: { value: 'A local-only note' } });
	expect(addNoteButton).toBeEnabled();
	await clickAndFlush(addNoteButton);

	expect(noteInput).toHaveValue('A local-only note');
	expect(updateCareEncounterSpy).not.toHaveBeenCalled();
	expect(screen.getByRole('heading', { name: 'No Notes' })).toBeInTheDocument();
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('aborts the encounter detail request when the route ID changes', async () => {
	const abort = jest.fn();
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort,
				fetch: jest.fn().mockReturnValue(new Promise(() => undefined)),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);
	const router = renderEncounters('/admin/encounters/care-encounter-1');

	await waitFor(() => expect(getCareEncounterSpy).toHaveBeenCalledWith('care-encounter-1'));
	await act(async () => {
		await router.navigate('/admin/encounters/care-encounter-2');
	});

	await waitFor(() => expect(getCareEncounterSpy).toHaveBeenCalledWith('care-encounter-2'));
	expect(abort).toHaveBeenCalledTimes(1);
});

it('shows the shared async error state when the encounter detail request fails', async () => {
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockRejectedValue(new Error('Request failed')),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);

	renderEncounters('/admin/encounters/care-encounter-1');

	expect(await screen.findByRole('heading', { name: "We're sorry, an error occurred." })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
});

it('loads close encounter reasons on entry and resets its selection when reopened', async () => {
	const router = renderEncounters('/admin/encounters/care-encounter-1?status=OPEN');

	const openModalButton = await screen.findByRole('button', { name: 'Close Encounter' });
	expect(getCareEncounterCancellationReasonsSpy).not.toHaveBeenCalled();

	await clickAndFlush(openModalButton);

	let dialog = await findCloseEncounterDialog();
	let modal = within(dialog);
	const closeEncounterButton = modal.getByRole('button', { name: 'Close Encounter' });

	expect(modal.getAllByText('Close Encounter')).toHaveLength(2);
	expect(modal.getByText('Reason for Closure:')).toBeInTheDocument();
	expect(await modal.findByRole('radio', { name: 'Patient requested' })).toBeInTheDocument();
	expect(modal.getAllByRole('radio')).toHaveLength(6);
	expect(getCareEncounterCancellationReasonsSpy).toHaveBeenCalledTimes(1);
	expect(closeEncounterButton).toBeDisabled();

	fireEvent.click(modal.getByRole('radio', { name: 'Patient requested' }));
	expect(closeEncounterButton).toBeEnabled();

	fireEvent.click(modal.getByRole('button', { name: 'Cancel' }));
	await waitFor(() => expect(screen.queryByText('Reason for Closure:')).not.toBeInTheDocument());
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?status=OPEN');

	await clickAndFlush(openModalButton);
	dialog = await findCloseEncounterDialog();
	modal = within(dialog);
	await modal.findByRole('radio', { name: 'Patient requested' });
	expect(modal.getByRole('button', { name: 'Close Encounter' })).toBeDisabled();
	expect(modal.getAllByRole('radio').every((radio) => !(radio as HTMLInputElement).checked)).toBe(true);
	expect(getCareEncounterCancellationReasonsSpy).toHaveBeenCalledTimes(2);
});

it('cancels an encounter, updates the shelf, and refreshes the table without changing the route', async () => {
	const router = renderEncounters('/admin/encounters/care-encounter-1?source=admin&status=OPEN');

	const openModalButton = await screen.findByRole('button', { name: 'Close Encounter' });
	await clickAndFlush(openModalButton);

	let dialog = await findCloseEncounterDialog();
	fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
	await waitFor(() => expect(screen.queryByText('Reason for Closure:')).not.toBeInTheDocument());

	await clickAndFlush(openModalButton);
	dialog = await findCloseEncounterDialog();
	const modal = within(dialog);
	fireEvent.click(await modal.findByRole('radio', { name: 'Patient requested' }));
	await clickAndFlush(modal.getByRole('button', { name: 'Close Encounter' }));

	await waitFor(() => expect(screen.queryByText('Reason for Closure:')).not.toBeInTheDocument());
	expect(cancelCareEncounterSpy).toHaveBeenCalledWith('care-encounter-1', {
		careEncounterCancellationReasonId: CareEncounterCancellationReasonId.PATIENT_REQUESTED,
	});
	await waitFor(() => expect(getCareEncountersSpy).toHaveBeenCalledTimes(2));
	expect(screen.queryByRole('button', { name: 'Close Encounter' })).not.toBeInTheDocument();
	expect(mockAddFlag).toHaveBeenCalledWith({
		variant: 'success',
		title: 'Encounter Closed',
		actions: [],
	});
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('requires and trims freeform text for a cancellation reason that requires it', async () => {
	renderEncounters('/admin/encounters/care-encounter-1');

	await clickAndFlush(await screen.findByRole('button', { name: 'Close Encounter' }));
	const dialog = await findCloseEncounterDialog();
	const modal = within(dialog);
	fireEvent.click(await modal.findByRole('radio', { name: 'Other' }));

	const otherReasonInput = modal.getByRole('textbox', { name: 'Other reason' });
	const closeEncounterButton = modal.getByRole('button', { name: 'Close Encounter' });
	expect(otherReasonInput).toHaveAttribute('maxlength', '2000');
	expect(closeEncounterButton).toBeDisabled();

	fireEvent.change(otherReasonInput, { target: { value: '   ' } });
	expect(closeEncounterButton).toBeDisabled();

	fireEvent.change(otherReasonInput, { target: { value: '  A different reason  ' } });
	expect(closeEncounterButton).toBeEnabled();
	await clickAndFlush(closeEncounterButton);

	await waitFor(() =>
		expect(cancelCareEncounterSpy).toHaveBeenCalledWith('care-encounter-1', {
			careEncounterCancellationReasonId: CareEncounterCancellationReasonId.OTHER,
			careEncounterCancellationReasonOtherText: 'A different reason',
		})
	);
});

it('disables close encounter modal controls while loading reasons', async () => {
	getCareEncounterCancellationReasonsSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockReturnValue(new Promise(() => undefined)),
			} as ReturnType<typeof careEncounterService.getCareEncounterCancellationReasons>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');

	await clickAndFlush(await screen.findByRole('button', { name: 'Close Encounter' }));
	const dialog = await findCloseEncounterDialog();
	const modal = within(dialog);

	await waitFor(() => expect(modal.getByRole('button', { name: 'Cancel' })).toBeDisabled());
	expect(modal.getByRole('button', { name: 'Close Encounter' })).toBeDisabled();
});

it('disables close encounter modal controls and prevents duplicate submissions while saving', async () => {
	let resolveCancelRequest!: (response: { careEncounter: CareEncounterModel }) => void;
	const cancelRequest = new Promise<{ careEncounter: CareEncounterModel }>((resolve) => {
		resolveCancelRequest = resolve;
	});
	cancelCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockReturnValue(cancelRequest),
			} as ReturnType<typeof careEncounterService.cancelCareEncounter>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');

	await clickAndFlush(await screen.findByRole('button', { name: 'Close Encounter' }));
	const dialog = await findCloseEncounterDialog();
	const modal = within(dialog);
	const patientRequestedReason = await modal.findByRole('radio', { name: 'Patient requested' });
	const closeEncounterButton = modal.getByRole('button', { name: 'Close Encounter' });
	fireEvent.click(patientRequestedReason);
	fireEvent.click(closeEncounterButton);

	await waitFor(() => expect(modal.getByRole('button', { name: 'Cancel' })).toBeDisabled());
	expect(closeEncounterButton).toBeDisabled();
	expect(patientRequestedReason).toBeDisabled();
	fireEvent.click(closeEncounterButton);
	expect(cancelCareEncounterSpy).toHaveBeenCalledTimes(1);

	await act(async () => {
		resolveCancelRequest({ careEncounter: canceledCareEncounter });
	});
});

it('reports reason loading errors through the shared error handler', async () => {
	const error = new Error('Unable to load reasons');
	getCareEncounterCancellationReasonsSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockRejectedValue(error),
			} as ReturnType<typeof careEncounterService.getCareEncounterCancellationReasons>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');

	await clickAndFlush(await screen.findByRole('button', { name: 'Close Encounter' }));
	const dialog = await findCloseEncounterDialog();

	await waitFor(() => expect(mockHandleError).toHaveBeenCalledWith(error));
	expect(await within(dialog).findByText('No closure reasons found.')).toBeInTheDocument();
});

it('keeps the close encounter modal open when cancellation fails', async () => {
	const error = new Error('Unable to close encounter');
	cancelCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockRejectedValue(error),
			} as ReturnType<typeof careEncounterService.cancelCareEncounter>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');

	await clickAndFlush(await screen.findByRole('button', { name: 'Close Encounter' }));
	const dialog = await findCloseEncounterDialog();
	const modal = within(dialog);
	const patientRequestedReason = await modal.findByRole('radio', { name: 'Patient requested' });
	fireEvent.click(patientRequestedReason);
	await clickAndFlush(modal.getByRole('button', { name: 'Close Encounter' }));

	await waitFor(() => expect(mockHandleError).toHaveBeenCalledWith(error));
	expect(dialog).toBeInTheDocument();
	expect(patientRequestedReason).toBeChecked();
	expect(getCareEncountersSpy).toHaveBeenCalledTimes(1);
});

it('dismisses a directly linked shelf with Escape and preserves its query parameters', async () => {
	const router = renderEncounters('/admin/encounters/care-encounter-1?source=admin&status=OPEN');

	await screen.findByRole('heading', { name: 'Avery Morgan' });
	fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

	await waitFor(() => expect(router.state.location.pathname).toBe('/admin/encounters'));
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});
