import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { CobaltThemeProvider } from '@/jss/theme';
import {
	ATTENDANCE_STATUS_ID,
	AppointmentTimeStatusId,
	CareEncounterCancellationReasonId,
	CareEncounterListModel,
	CareEncounterModel,
	CareEncounterNoteModel,
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
	screeningSessionId: 'screening-session-history-1',
	screeningSessionResult: {
		screeningSessionScreeningResults: [
			{
				screeningQuestionResults: [
					{
						screeningQuestionId: 'history-question-1',
						screeningQuestionText: 'Historical screening question?',
						screeningAnswerResults: [
							{
								screeningAnswerId: 'history-answer-1',
								answerOptionText: 'Historical screening answer',
							},
						],
					},
				],
			},
		],
	},
	localStartDate: '2026-08-10',
	localStartTime: '14:30:00',
	startTimeDescription: 'Aug 10, 2026 at 2:30 PM',
	durationInMinutesDescription: '30 min',
	canceled: true,
	canceledAtDescription: 'Aug 11, 2026 at 9:15 AM',
	canceledByAccountDisplayName: 'Navigator Name',
	cancellationReason: 'Patient unavailable',
	attendanceStatusId: ATTENDANCE_STATUS_ID.CANCELED,
	appointmentTimeStatusId: AppointmentTimeStatusId.PASSED,
} as CareEncounterModel['appointment'];

const careEncounterNote: CareEncounterNoteModel = {
	careEncounterNoteId: 'care-encounter-note-1',
	careEncounterId: 'care-encounter-1',
	note: 'First encounter note',
	createdByAccountId: 'care-navigator-1',
	createdByAccountDisplayName: 'First Navigator',
	lastUpdatedByAccountId: 'care-navigator-1',
	lastUpdatedByAccountDisplayName: 'First Navigator',
	created: '2026-08-20T15:04:00Z',
	createdDescription: 'Aug 20, 2026 at 11:04 AM',
	lastUpdated: '2026-08-20T15:04:00Z',
	lastUpdatedDescription: 'Aug 20, 2026 at 11:04 AM',
};

const careEncounter: CareEncounterModel = {
	careEncounterId: 'care-encounter-1',
	appointmentId: 'appointment-1',
	accountId: 'account-1',
	careNavigatorAccountId: 'care-navigator-1',
	careNavigatorDisplayName: 'First Navigator',
	careEncounterStatusId: CareEncounterStatusId.OPEN,
	careEncounterStatusDisplayLabel: 'Open',
	patientFullName: 'Avery Morgan',
	emailAddress: 'patient@example.com',
	appointmentDate: '2026-08-18',
	appointmentDateDescription: 'Backend Appointment Date',
	careEncounterNotes: [],
	notesEditable: true,
	careEncounterScheduledMessages: [],
	createdByAccountId: 'account-2',
	createdByAccountDisplayName: 'Avery Morgan (Patient — self-booked)',
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
		appointmentTimeStatusId: AppointmentTimeStatusId.SCHEDULED,
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
		appointmentTimeStatusId: AppointmentTimeStatusId.SCHEDULED,
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

const closedRelatedCareEncounter: CareEncounterListModel = {
	...careEncounterList,
	careEncounterId: 'care-encounter-3',
	createdDateDescription: 'Jun 1, 2026',
	closedAt: '2026-06-08T13:30:00Z',
	closedAtDescription: 'Jun 8, 2026 at 9:30 AM',
	careEncounterStatusId: CareEncounterStatusId.CLOSED,
	careEncounterStatusDisplayLabel: 'Closed',
};

const defaultResponse: GetCareEncountersResponseBody = {
	totalCount: 1,
	totalCountDescription: '1',
	careEncounters: [careEncounterList],
};

const defaultDetailResponse: GetCareEncounterResponseBody = {
	careEncounter,
	careEncounterHistory: [careEncounterList],
	careEncounterHistoryTotalCount: 1,
	careEncounterHistoryTotalCountDescription: '1',
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

const careEncounterAttendanceStatuses = [
	{
		attendanceStatusId: ATTENDANCE_STATUS_ID.ATTENDED,
		description: 'Attended',
	},
	{
		attendanceStatusId: ATTENDANCE_STATUS_ID.MISSED,
		description: 'Missed',
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
const getCareEncounterAttendanceStatusesSpy = jest.spyOn(careEncounterService, 'getCareEncounterAttendanceStatuses');
const cancelCareEncounterSpy = jest.spyOn(careEncounterService, 'cancelCareEncounter');
const cancelCareEncounterAppointmentSpy = jest.spyOn(careEncounterService, 'cancelCareEncounterAppointment');
const changeCareEncounterAppointmentAttendanceStatusSpy = jest.spyOn(
	careEncounterService,
	'changeCareEncounterAppointmentAttendanceStatus'
);
const updateCareEncounterSpy = jest.spyOn(careEncounterService, 'updateCareEncounter');
const createCareEncounterNoteSpy = jest.spyOn(careEncounterService, 'createCareEncounterNote');
const updateCareEncounterNoteSpy = jest.spyOn(careEncounterService, 'updateCareEncounterNote');

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
	getCareEncounterAttendanceStatusesSpy.mockImplementation(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({ attendanceStatuses: careEncounterAttendanceStatuses }),
			} as ReturnType<typeof careEncounterService.getCareEncounterAttendanceStatuses>)
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
	changeCareEncounterAppointmentAttendanceStatusSpy.mockImplementation(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					careEncounter: {
						...careEncounter,
						appointment: {
							...careEncounter.appointment,
							appointmentTimeStatusId: AppointmentTimeStatusId.IN_SESSION,
							attendanceStatusId: ATTENDANCE_STATUS_ID.ATTENDED,
						},
					},
				}),
			} as ReturnType<typeof careEncounterService.changeCareEncounterAppointmentAttendanceStatus>)
	);
	updateCareEncounterSpy.mockImplementation(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({ careEncounter }),
			} as ReturnType<typeof careEncounterService.updateCareEncounter>)
	);
	createCareEncounterNoteSpy.mockImplementation(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({ careEncounterNote }),
			} as ReturnType<typeof careEncounterService.createCareEncounterNote>)
	);
	updateCareEncounterNoteSpy.mockImplementation(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({ careEncounterNote }),
			} as ReturnType<typeof careEncounterService.updateCareEncounterNote>)
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

const findEditNoteDialog = async () => {
	const title = await screen.findByText('Edit Note');
	const dialog = title.closest('[role="dialog"]');

	if (!dialog) {
		throw new Error('Edit Note dialog not found.');
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
	expect(screen.getByText('First Navigator')).toBeInTheDocument();
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
	expect(screen.getByText('First Navigator')).toBeInTheDocument();
	expect(screen.getAllByText('Backend Created Date')).toHaveLength(3);
	expect(screen.getByText('Avery Morgan (Patient — self-booked)')).toBeInTheDocument();
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

it('counts only non-deleted scheduled messages in contact history', async () => {
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: {
						...careEncounter,
						careEncounterScheduledMessages: [
							{ careEncounterScheduledMessageId: 'visible-message', deleted: false },
							{ careEncounterScheduledMessageId: 'deleted-message', deleted: true },
						] as unknown as CareEncounterModel['careEncounterScheduledMessages'],
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);

	renderEncounters('/admin/encounters/care-encounter-1');

	expect(await screen.findByRole('button', { name: 'Contact History (1)' })).toBeInTheDocument();
});

it('renders the current appointment screening answers from the encounter response', async () => {
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
							screeningSessionId: 'screening-session-1',
							screeningSessionResult: {
								screeningSessionScreeningResults: [
									{
										screeningQuestionResults: [
											{
												screeningQuestionId: 'question-1',
												screeningQuestionText: 'Who are you seeking support for?',
												screeningAnswerResults: [
													{
														screeningAnswerId: 'answer-1',
														answerOptionText: 'Myself',
													},
												],
											},
											{
												screeningQuestionId: 'question-2',
												screeningQuestionText: 'Who is your current employer?',
												screeningAnswerResults: [
													{
														screeningAnswerId: 'answer-2',
														answerOptionText:
															'UPHS (University Pennsylvania Health System)',
													},
												],
											},
										],
									},
									{
										screeningQuestionResults: [
											{
												screeningQuestionId: 'question-3',
												screeningQuestionText:
													'What kind of support are you looking for today?',
												screeningAnswerResults: [
													{
														screeningAnswerId: 'answer-3',
														answerOptionText: 'Something else / I’m not sure',
														text: 'User input text here if available…',
													},
												],
											},
										],
									},
								],
							},
						},
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);

	renderEncounters('/admin/encounters/care-encounter-1');

	const screeningAnswersCard = (await screen.findByText('Appointment Screening Answers')).closest('.ic-card');
	if (!screeningAnswersCard) {
		throw new Error('Appointment card not found.');
	}
	const screeningAnswers = within(screeningAnswersCard as HTMLElement);

	expect(screeningAnswers.getByText('Appointment')).toBeInTheDocument();
	expect(screeningAnswers.getByText('1)')).toBeInTheDocument();
	expect(screeningAnswers.getByText('Who are you seeking support for?')).toBeInTheDocument();
	expect(screeningAnswers.getByText('Myself')).toBeInTheDocument();
	expect(screeningAnswers.getByText('2)')).toBeInTheDocument();
	expect(screeningAnswers.getByText('UPHS (University Pennsylvania Health System)')).toBeInTheDocument();
	expect(screeningAnswers.getByText('3)')).toBeInTheDocument();
	expect(screeningAnswers.getByText('Something else / I’m not sure')).toBeInTheDocument();
	expect(screeningAnswers.getByText('User input text here if available…')).toBeInTheDocument();
	expect(screeningAnswers.queryByRole('heading', { name: 'No Screening Answers' })).not.toBeInTheDocument();
});

it('does not load or render attendance controls for a scheduled appointment', async () => {
	renderEncounters('/admin/encounters/care-encounter-1');

	const appointmentCard = (await screen.findByText('Appointment')).closest('.ic-card');
	if (!appointmentCard) {
		throw new Error('Appointment card not found.');
	}
	const appointment = within(appointmentCard as HTMLElement);

	expect(appointment.queryByText('Appointment in session')).not.toBeInTheDocument();
	expect(appointment.queryByRole('combobox')).not.toBeInTheDocument();
	expect(appointment.getByRole('button', { name: 'Edit' })).toBeEnabled();
	expect(getCareEncounterAttendanceStatusesSpy).not.toHaveBeenCalled();
});

it('renders in-session attendance controls and saves the selected status', async () => {
	let resolveAttendanceUpdate: (response: { careEncounter: CareEncounterModel }) => void = () => undefined;
	const attendanceUpdatePromise = new Promise<{ careEncounter: CareEncounterModel }>((resolve) => {
		resolveAttendanceUpdate = resolve;
	});
	const inSessionCareEncounter: CareEncounterModel = {
		...careEncounter,
		appointment: {
			...careEncounter.appointment,
			appointmentTimeStatusId: AppointmentTimeStatusId.IN_SESSION,
			attendanceStatusId: ATTENDANCE_STATUS_ID.UNKNOWN,
		},
	};
	const missedCareEncounter: CareEncounterModel = {
		...inSessionCareEncounter,
		appointment: {
			...inSessionCareEncounter.appointment,
			attendanceStatusId: ATTENDANCE_STATUS_ID.MISSED,
		},
	};

	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: inSessionCareEncounter,
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);
	changeCareEncounterAppointmentAttendanceStatusSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockReturnValue(attendanceUpdatePromise),
			} as ReturnType<typeof careEncounterService.changeCareEncounterAppointmentAttendanceStatus>)
	);

	renderEncounters('/admin/encounters/care-encounter-1');

	const alert = await screen.findByText('Appointment in session');
	const appointmentCard = alert.closest('.ic-card');
	if (!appointmentCard) {
		throw new Error('Appointment card not found.');
	}
	const appointment = within(appointmentCard as HTMLElement);
	const attendanceSelect = await appointment.findByRole('combobox');

	await within(attendanceSelect).findByRole('option', { name: 'Attended' });
	await waitFor(() => expect(attendanceSelect).toBeEnabled());
	expect(appointment.getByRole('button', { name: 'Edit' })).toBeDisabled();
	expect(attendanceSelect).toBeRequired();
	expect(attendanceSelect).toHaveValue('');
	expect(within(attendanceSelect).getAllByRole('option')[0]).toBeDisabled();
	expect(within(attendanceSelect).getAllByRole('option')[0]).toHaveAttribute('label', 'Select...');
	expect(
		within(attendanceSelect)
			.getAllByRole('option')
			.slice(1)
			.map((option) => option.textContent)
	).toEqual(['Attended', 'Missed']);
	expect(getCareEncounterAttendanceStatusesSpy).toHaveBeenCalledTimes(1);

	fireEvent.change(attendanceSelect, { target: { value: ATTENDANCE_STATUS_ID.MISSED } });

	expect(changeCareEncounterAppointmentAttendanceStatusSpy).toHaveBeenCalledWith(
		'care-encounter-1',
		'appointment-1',
		{ attendanceStatusId: ATTENDANCE_STATUS_ID.MISSED }
	);
	expect(attendanceSelect).toBeDisabled();

	await act(async () => {
		resolveAttendanceUpdate({ careEncounter: missedCareEncounter });
	});

	await waitFor(() => expect(attendanceSelect).toHaveValue(ATTENDANCE_STATUS_ID.MISSED));
	expect(attendanceSelect).toBeEnabled();
	await waitFor(() => expect(getCareEncountersSpy).toHaveBeenCalledTimes(2));
	expect(mockAddFlag).toHaveBeenCalledWith({
		variant: 'success',
		title: 'Appointment Attendance Updated',
		actions: [],
	});
});

it('renders attendance controls without an alert for a passed appointment', async () => {
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
							appointmentTimeStatusId: AppointmentTimeStatusId.PASSED,
							attendanceStatusId: ATTENDANCE_STATUS_ID.ATTENDED,
						},
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);

	renderEncounters('/admin/encounters/care-encounter-1');

	const attendanceSelect = await screen.findByRole('combobox');
	await within(attendanceSelect).findByRole('option', { name: 'Attended' });
	await waitFor(() => expect(attendanceSelect).toBeEnabled());
	expect(attendanceSelect).toHaveValue(ATTENDANCE_STATUS_ID.ATTENDED);
	expect(screen.queryByText('Appointment in session')).not.toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
	expect(getCareEncounterAttendanceStatusesSpy).toHaveBeenCalledTimes(1);
});

it('reports attendance status loading failures', async () => {
	const statusesError = new Error('Unable to load attendance statuses');
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
							appointmentTimeStatusId: AppointmentTimeStatusId.PASSED,
							attendanceStatusId: ATTENDANCE_STATUS_ID.UNKNOWN,
						},
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);
	getCareEncounterAttendanceStatusesSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockRejectedValue(statusesError),
			} as ReturnType<typeof careEncounterService.getCareEncounterAttendanceStatuses>)
	);

	renderEncounters('/admin/encounters/care-encounter-1');
	await waitFor(() => expect(mockHandleError).toHaveBeenCalledWith(statusesError));
	expect(screen.getByRole('combobox')).toHaveValue('');
	expect(screen.getByRole('combobox')).toBeDisabled();
});

it('reports attendance saving failures without changing the selection', async () => {
	const updateError = new Error('Unable to update attendance');
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
							appointmentTimeStatusId: AppointmentTimeStatusId.PASSED,
							attendanceStatusId: ATTENDANCE_STATUS_ID.UNKNOWN,
						},
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);

	changeCareEncounterAppointmentAttendanceStatusSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockRejectedValue(updateError),
			} as ReturnType<typeof careEncounterService.changeCareEncounterAppointmentAttendanceStatus>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');
	const attendanceSelect = await screen.findByRole('combobox');
	await within(attendanceSelect).findByRole('option', { name: 'Attended' });
	await waitFor(() => expect(attendanceSelect).toBeEnabled());
	fireEvent.change(attendanceSelect, { target: { value: ATTENDANCE_STATUS_ID.ATTENDED } });

	await waitFor(() => expect(mockHandleError).toHaveBeenCalledWith(updateError));
	expect(attendanceSelect).toHaveValue('');
	expect(mockAddFlag).not.toHaveBeenCalled();
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
	expect(screen.getByRole('heading', { name: 'No Active Appointment' })).toBeInTheDocument();
	expect(screen.queryByText('Appointment Screening Answers')).not.toBeInTheDocument();
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

	expect(details.getByText('Original Appointment')).toBeInTheDocument();
	expect(details.getByText('Aug 10, 2026 • 2:30PM')).toBeInTheDocument();
	expect(details.getByText('Monday • 30 min')).toBeInTheDocument();
	expect(details.getByText('Canceled')).toBeInTheDocument();
	expect(details.getByText('Aug 11, 2026 • 9:15AM')).toBeInTheDocument();
	expect(details.getByText('By Navigator Name')).toBeInTheDocument();
	expect(details.getByText('Reason')).toBeInTheDocument();
	expect(details.getByText('Patient unavailable')).toBeInTheDocument();
	expect(details.getByRole('heading', { name: 'Appointment Screening Answers' })).toBeInTheDocument();
	expect(details.getByText('1)')).toBeInTheDocument();
	expect(details.getByText('Historical screening question?')).toBeInTheDocument();
	expect(details.getByText('Historical screening answer')).toBeInTheDocument();
	expect(details.queryByRole('heading', { name: 'No Screening Answers' })).not.toBeInTheDocument();

	await clickAndFlush(details.getByRole('button', { name: 'Close' }));
	await waitFor(() => expect(screen.queryByText('Appointment Details')).not.toBeInTheDocument());
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('renders an empty screening-answer state for a historical appointment without results', async () => {
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: {
						...careEncounter,
						appointmentHistory: [
							{
								...historicalAppointment,
								screeningSessionId: undefined,
								screeningSessionResult: undefined,
							},
						],
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');

	await clickAndFlush(
		await screen.findByRole('button', { name: 'View appointment details for Aug 10, 2026 at 2:30 PM' })
	);
	const title = await screen.findByText('Appointment Details');
	const dialog = title.closest('[role="dialog"]');
	if (!dialog) {
		throw new Error('Appointment Details dialog not found.');
	}

	expect(within(dialog as HTMLElement).getByRole('heading', { name: 'No Screening Answers' })).toBeInTheDocument();
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

it('renders the active and related encounters as route links', async () => {
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounterHistory: [careEncounterList, closedRelatedCareEncounter],
					careEncounterHistoryTotalCount: 2,
					careEncounterHistoryTotalCountDescription: '2',
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);
	const router = renderEncounters('/admin/encounters/care-encounter-1?status=OPEN');

	const encountersHeading = await screen.findByRole('heading', { name: 'Encounters (2)', level: 4 });
	const encountersSection = encountersHeading.closest('section');
	if (!encountersSection) {
		throw new Error('Encounters section not found.');
	}
	const encounters = within(encountersSection as HTMLElement);
	const items = encountersSection.querySelectorAll('li');

	expect(items).toHaveLength(2);
	expect(items[0]).toHaveTextContent('Backend Created Date');
	expect(items[0]).toHaveTextContent('Open');
	expect(items[1]).toHaveTextContent('Jun 1, 2026 - Jun 8, 2026 at 9:30 AM');
	expect(encounters.getByText('Open')).toHaveClass('text-success');
	expect(encounters.getByText('Closed')).toHaveClass('text-gray');
	expect(encounters.queryByRole('button')).not.toBeInTheDocument();
	expect(encounters.getAllByRole('link')).toHaveLength(2);
	expect(encounters.getByRole('link', { name: 'View encounter from Backend Created Date' })).toHaveAttribute(
		'aria-current',
		'page'
	);

	fireEvent.click(encounters.getByRole('link', { name: /View encounter from Jun 1, 2026/ }));
	await waitFor(() => expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-3'));
	expect(router.state.location.search).toBe('?status=OPEN');
	expect(getCareEncounterSpy).toHaveBeenCalledWith('care-encounter-3');
});

it('does not render the related encounters section when the response list is empty', async () => {
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: canceledCareEncounter,
					careEncounterHistory: [],
					careEncounterHistoryTotalCount: 0,
					careEncounterHistoryTotalCountDescription: '0',
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');

	expect(await screen.findByRole('heading', { name: 'Avery Morgan' })).toBeInTheDocument();
	expect(screen.queryByRole('heading', { name: /^Encounters/, level: 4 })).not.toBeInTheDocument();
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

it('renders an empty state and hides screening answers when there is no active appointment', async () => {
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

	expect(await screen.findByRole('heading', { name: 'No Active Appointment' })).toBeInTheDocument();
	expect(screen.queryByText('Appointment Screening Answers')).not.toBeInTheDocument();
	expect(screen.queryByText('Appointment')).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Join Video Call' })).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
});

it('updates the primary contact email and resets unsaved changes on entry', async () => {
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

	const updatedCareEncounter = { ...careEncounter, emailAddress: 'updated@example.com' };
	let resolveUpdateRequest!: (response: { careEncounter: CareEncounterModel }) => void;
	const updateRequest = new Promise<{ careEncounter: CareEncounterModel }>((resolve) => {
		resolveUpdateRequest = resolve;
	});
	updateCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockReturnValue(updateRequest),
			} as ReturnType<typeof careEncounterService.updateCareEncounter>)
	);

	fireEvent.change(emailInput, { target: { value: '  updated@example.com  ' } });
	const form = dialog.querySelector('form');
	if (!form) {
		throw new Error('Edit Primary Contact form not found.');
	}
	fireEvent.submit(form);

	await waitFor(() => expect(emailInput).toBeDisabled());
	expect(modal.getByRole('button', { name: 'Cancel' })).toBeDisabled();
	expect(modal.getByRole('button', { name: 'Save' })).toBeDisabled();
	expect(modal.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
	fireEvent.submit(form);
	expect(updateCareEncounterSpy).toHaveBeenCalledTimes(1);
	expect(updateCareEncounterSpy).toHaveBeenCalledWith('care-encounter-1', {
		emailAddress: 'updated@example.com',
	});

	await act(async () => {
		resolveUpdateRequest({ careEncounter: updatedCareEncounter });
	});

	await waitFor(() => expect(screen.queryByText('Edit Primary Contact')).not.toBeInTheDocument());
	expect(screen.getByText('updated@example.com')).toBeInTheDocument();
	await waitFor(() => expect(getCareEncountersSpy).toHaveBeenCalledTimes(2));
	expect(mockAddFlag).toHaveBeenCalledWith({
		variant: 'success',
		title: 'Primary Contact Updated',
		actions: [],
	});
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('allows clearing the primary contact email', async () => {
	updateCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					careEncounter: { ...careEncounter, emailAddress: undefined },
				}),
			} as ReturnType<typeof careEncounterService.updateCareEncounter>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');

	await clickAndFlush(await screen.findByRole('button', { name: 'Edit Contact' }));
	const dialog = await findEditContactDialog();
	const modal = within(dialog);
	fireEvent.change(modal.getByRole('textbox', { name: 'Email Address' }), { target: { value: '' } });
	await clickAndFlush(modal.getByRole('button', { name: 'Save' }));

	await waitFor(() => expect(updateCareEncounterSpy).toHaveBeenCalledWith('care-encounter-1', { emailAddress: '' }));
	const contactCard = screen.getByText('Contact').closest('.ic-card');
	if (!contactCard) {
		throw new Error('Contact card not found.');
	}
	expect(within(contactCard as HTMLElement).getByText('Unknown')).toBeInTheDocument();
});

it('keeps the contact modal open and reports errors when the email update fails', async () => {
	const error = new Error('Unable to update contact');
	updateCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockRejectedValue(error),
			} as ReturnType<typeof careEncounterService.updateCareEncounter>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');

	await clickAndFlush(await screen.findByRole('button', { name: 'Edit Contact' }));
	const dialog = await findEditContactDialog();
	const modal = within(dialog);
	const emailInput = modal.getByRole('textbox', { name: 'Email Address' });
	fireEvent.change(emailInput, { target: { value: 'failed@example.com' } });
	await clickAndFlush(modal.getByRole('button', { name: 'Save' }));

	await waitFor(() => expect(mockHandleError).toHaveBeenCalledWith(error));
	expect(emailInput).toHaveValue('failed@example.com');
	expect(emailInput).toBeEnabled();
	expect(modal.getByRole('button', { name: 'Save' })).toBeEnabled();
	expect(screen.getByText('patient@example.com')).toBeInTheDocument();
});

it('disables contact editing when the encounter is not open', async () => {
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: {
						...careEncounter,
						careEncounterStatusId: CareEncounterStatusId.CLOSED,
						careEncounterStatusDisplayLabel: 'Closed',
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');

	const editContactButton = await screen.findByRole('button', { name: 'Edit Contact' });
	expect(editContactButton).toBeDisabled();
	fireEvent.click(editContactButton);
	expect(screen.queryByText('Edit Primary Contact')).not.toBeInTheDocument();
	expect(updateCareEncounterSpy).not.toHaveBeenCalled();
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
						careNavigatorAccountId: undefined,
						careNavigatorDisplayName: undefined,
						emailAddress: undefined,
						createdByAccountDisplayName: undefined,
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

it('renders encounter notes in backend order and updates the notes tab count', async () => {
	const secondCareEncounterNote: CareEncounterNoteModel = {
		...careEncounterNote,
		careEncounterNoteId: 'care-encounter-note-2',
		note: 'Second encounter note',
		createdByAccountId: 'care-navigator-2',
		createdByAccountDisplayName: undefined,
		created: '2026-08-19T14:00:00Z',
		createdDescription: 'Aug 19, 2026 at 10:00 AM',
	};
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: {
						...careEncounter,
						careEncounterNotes: [careEncounterNote, secondCareEncounterNote],
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);

	renderEncounters('/admin/encounters/care-encounter-1');

	const notesTab = await screen.findByRole('button', { name: 'Notes (2)' });
	fireEvent.click(notesTab);

	expect(await screen.findByText('First encounter note')).toBeInTheDocument();
	expect(screen.getByText('Second encounter note')).toBeInTheDocument();
	expect(screen.getAllByText('First Navigator')).toHaveLength(2);
	expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0);
	expect(screen.getByText('Aug 20, 2026 at 11:04 AM')).toBeInTheDocument();
	expect(screen.getByText('Aug 19, 2026 at 10:00 AM')).toBeInTheDocument();
	expect(screen.getAllByRole('button', { name: 'Edit Note' })).toHaveLength(2);
	expect(screen.getByRole('textbox', { name: 'Your Note:' })).toBeInTheDocument();
	expectTabToBeActive('Notes (2)');
});

it('adds a trimmed encounter note, refreshes the table, and preserves the shelf route', async () => {
	const addedCareEncounterNote = {
		...careEncounterNote,
		note: 'A persisted note',
	};
	createCareEncounterNoteSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({ careEncounterNote: addedCareEncounterNote }),
			} as ReturnType<typeof careEncounterService.createCareEncounterNote>)
	);
	const router = renderEncounters('/admin/encounters/care-encounter-1?source=admin&status=OPEN');
	const notesTab = await screen.findByRole('button', { name: 'Notes (0)' });
	fireEvent.click(notesTab);

	const noteInput = screen.getByRole('textbox', { name: 'Your Note:' });
	const addNoteButton = screen.getByRole('button', { name: 'Add Note' });

	expect(addNoteButton).toBeDisabled();
	expect(noteInput).not.toHaveAttribute('minlength');
	expect(noteInput).not.toHaveAttribute('maxlength');
	fireEvent.change(noteInput, { target: { value: '  A persisted note  ' } });
	expect(addNoteButton).toBeEnabled();
	const tableRequestCount = getCareEncountersSpy.mock.calls.length;
	await clickAndFlush(addNoteButton);

	expect(createCareEncounterNoteSpy).toHaveBeenCalledWith('care-encounter-1', { note: 'A persisted note' });
	await waitFor(() => expect(noteInput).toHaveValue(''));
	expect(await screen.findByText('A persisted note')).toBeInTheDocument();
	expect(screen.queryByRole('heading', { name: 'No Notes' })).not.toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Notes (1)' })).toBeInTheDocument();
	expect(getCareEncountersSpy).toHaveBeenCalledTimes(tableRequestCount + 1);
	expect(mockAddFlag).toHaveBeenCalledWith({ variant: 'success', title: 'Note Added', actions: [] });
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('retains add-note input and reports the error when creation fails', async () => {
	const error = new Error('Unable to add note');
	createCareEncounterNoteSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockRejectedValue(error),
			} as ReturnType<typeof careEncounterService.createCareEncounterNote>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');
	fireEvent.click(await screen.findByRole('button', { name: 'Notes (0)' }));

	const noteInput = screen.getByRole('textbox', { name: 'Your Note:' });
	fireEvent.change(noteInput, { target: { value: 'Keep this note' } });
	await clickAndFlush(screen.getByRole('button', { name: 'Add Note' }));

	await waitFor(() => expect(mockHandleError).toHaveBeenCalledWith(error));
	expect(noteInput).toHaveValue('Keep this note');
	expect(screen.getByRole('button', { name: 'Add Note' })).toBeEnabled();
});

it('edits an encounter note without reordering notes', async () => {
	const secondCareEncounterNote: CareEncounterNoteModel = {
		...careEncounterNote,
		careEncounterNoteId: 'care-encounter-note-2',
		note: 'Older note',
	};
	const updatedCareEncounterNote = {
		...careEncounterNote,
		note: 'Updated first note',
		lastUpdatedDescription: 'Aug 21, 2026 at 9:00 AM',
	};
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: {
						...careEncounter,
						careEncounterNotes: [careEncounterNote, secondCareEncounterNote],
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);
	updateCareEncounterNoteSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({ careEncounterNote: updatedCareEncounterNote }),
			} as ReturnType<typeof careEncounterService.updateCareEncounterNote>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');
	fireEvent.click(await screen.findByRole('button', { name: 'Notes (2)' }));
	await clickAndFlush(screen.getAllByRole('button', { name: 'Edit Note' })[0]);

	const dialog = await findEditNoteDialog();
	const noteInput = within(dialog).getByRole('textbox', { name: 'Note' });
	expect(noteInput).toHaveValue('First encounter note');
	expect(noteInput).not.toHaveAttribute('minlength');
	expect(noteInput).not.toHaveAttribute('maxlength');
	fireEvent.change(noteInput, { target: { value: '  Updated first note  ' } });
	const tableRequestCount = getCareEncountersSpy.mock.calls.length;
	await clickAndFlush(within(dialog).getByRole('button', { name: 'Save' }));

	expect(updateCareEncounterNoteSpy).toHaveBeenCalledWith('care-encounter-1', 'care-encounter-note-1', {
		note: 'Updated first note',
	});
	await waitFor(() => expect(screen.queryByText('Edit Note')).not.toBeInTheDocument());
	const renderedNotes = screen.getAllByText(/Updated first note|Older note/);
	expect(renderedNotes[0]).toHaveTextContent('Updated first note');
	expect(renderedNotes[1]).toHaveTextContent('Older note');
	expect(screen.getByRole('button', { name: 'Notes (2)' })).toBeInTheDocument();
	expect(getCareEncountersSpy).toHaveBeenCalledTimes(tableRequestCount + 1);
	expect(mockAddFlag).toHaveBeenCalledWith({ variant: 'success', title: 'Note Updated', actions: [] });
});

it('keeps the Edit Note modal open when updating fails', async () => {
	const error = new Error('Unable to update note');
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: { ...careEncounter, careEncounterNotes: [careEncounterNote] },
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);
	updateCareEncounterNoteSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockRejectedValue(error),
			} as ReturnType<typeof careEncounterService.updateCareEncounterNote>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');
	fireEvent.click(await screen.findByRole('button', { name: 'Notes (1)' }));
	await clickAndFlush(screen.getByRole('button', { name: 'Edit Note' }));

	const dialog = await findEditNoteDialog();
	const noteInput = within(dialog).getByRole('textbox', { name: 'Note' });
	fireEvent.change(noteInput, { target: { value: 'Unsuccessful update' } });
	await clickAndFlush(within(dialog).getByRole('button', { name: 'Save' }));

	await waitFor(() => expect(mockHandleError).toHaveBeenCalledWith(error));
	expect(noteInput).toHaveValue('Unsuccessful update');
	expect(within(dialog).getByRole('button', { name: 'Save' })).toBeEnabled();
});

it('renders notes as read-only when the backend marks them noneditable', async () => {
	getCareEncounterSpy.mockImplementationOnce(
		() =>
			({
				abort: jest.fn(),
				fetch: jest.fn().mockResolvedValue({
					...defaultDetailResponse,
					careEncounter: {
						...careEncounter,
						notesEditable: false,
						careEncounterNotes: [careEncounterNote],
					},
				}),
			} as ReturnType<typeof careEncounterService.getCareEncounter>)
	);
	renderEncounters('/admin/encounters/care-encounter-1');
	fireEvent.click(await screen.findByRole('button', { name: 'Notes (1)' }));

	expect(screen.getByRole('button', { name: 'Edit Note' })).toBeDisabled();
	expect(screen.getByRole('textbox', { name: 'Your Note:' })).toBeDisabled();
	expect(screen.getByRole('button', { name: 'Add Note' })).toBeDisabled();
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

it('cancels an encounter, dismisses the shelf, and refreshes the table', async () => {
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
	expect(screen.queryByRole('heading', { name: 'Avery Morgan' })).not.toBeInTheDocument();
	expect(mockAddFlag).toHaveBeenCalledWith({
		variant: 'success',
		title: 'Encounter Closed',
		actions: [],
	});
	expect(router.state.location.pathname).toBe('/admin/encounters');
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
