import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { CobaltThemeProvider } from '@/jss/theme';
import { CareEncounterModel, CareEncounterSortColumnId, CareEncounterStatusId, SortDirectionId } from '@/lib/models';
import { GetCareEncountersResponseBody, careEncounterService } from '@/lib/services';
import { Component as EncounterShelf } from './encounter-shelf';
import { Component } from './encounters';

jest.mock('@/components/svg-icon', () => ({
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
	appointment: {
		appointmentId: 'appointment-1',
		accountId: 'account-1',
		firstName: 'Avery',
		lastName: 'Morgan',
		startTimeDescription: 'Backend Appointment Start Time',
		localStartDate: '2026-08-18',
		localStartTime: '10:25:00',
	} as CareEncounterModel['appointment'],
};

const defaultResponse: GetCareEncountersResponseBody = {
	totalCount: 1,
	totalCountDescription: '1',
	careEncounters: [careEncounter],
};

const getCareEncountersSpy = jest.spyOn(careEncounterService, 'getCareEncounters');

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

it('requests and renders the default open encounter table', async () => {
	renderEncounters();

	expect(await screen.findByRole('heading', { name: 'Encounters' })).toBeInTheDocument();
	expect(await screen.findByText('Avery Morgan')).toBeInTheDocument();
	expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Created' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Patient' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Appointment Date' })).toBeInTheDocument();
	expect(screen.getByText('Backend Created Date')).toBeInTheDocument();
	expect(screen.getByText('Backend Appointment Date')).toBeInTheDocument();
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
	expect(await screen.findByRole('heading', { name: 'Firstname Lastname' })).toBeInTheDocument();
	expect(screen.getByText('Care Navigator:')).toBeInTheDocument();

	await act(async () => {
		await router.navigate(-1);
	});

	await waitFor(() => expect(router.state.location.pathname).toBe('/admin/encounters'));
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('renders static shelf details and switches shelf tabs without changing the URL', async () => {
	const router = renderEncounters('/admin/encounters/any-encounter-id?status=CLOSED');

	expect(await screen.findByRole('heading', { name: 'Firstname Lastname' })).toBeInTheDocument();
	expect(screen.getByText('Navigator Name')).toBeInTheDocument();
	expect(screen.getByText('Nov 12, 2022')).toBeInTheDocument();
	expect(screen.getByText('webform')).toBeInTheDocument();
	expect(screen.getByText('address@email.com')).toBeInTheDocument();
	expect(screen.getByText('Navigator Appointment')).toBeInTheDocument();
	expect(screen.getByText('Aetna Behavioral Health Network')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Close Encounter' })).toBeInTheDocument();
	expectTabToBeActive('Encounter Details');

	const shelfUrl = `${router.state.location.pathname}${router.state.location.search}`;
	fireEvent.click(screen.getByRole('button', { name: 'Contact History (0)' }));

	expect(await screen.findByRole('heading', { name: 'No Contact Attempts Logged' })).toBeInTheDocument();
	expectTabToBeActive('Contact History (0)');
	expect(`${router.state.location.pathname}${router.state.location.search}`).toBe(shelfUrl);

	fireEvent.click(screen.getByRole('button', { name: 'Notes (0)' }));

	expect(await screen.findByRole('heading', { name: 'No Notes' })).toBeInTheDocument();
	expectTabToBeActive('Notes (0)');
	expect(`${router.state.location.pathname}${router.state.location.search}`).toBe(shelfUrl);

	fireEvent.click(screen.getByRole('button', { name: 'Close encounter details' }));

	await waitFor(() => expect(router.state.location.pathname).toBe('/admin/encounters'));
	expect(router.state.location.search).toBe('?status=CLOSED');
});

it('opens the close encounter modal and resets its selection after cancellation', async () => {
	const router = renderEncounters('/admin/encounters/care-encounter-1?status=OPEN');

	const openModalButton = await screen.findByRole('button', { name: 'Close Encounter' });
	fireEvent.click(openModalButton);

	let dialog = await findCloseEncounterDialog();
	let modal = within(dialog);
	const closeEncounterButton = modal.getByRole('button', { name: 'Close Encounter' });

	expect(modal.getAllByText('Close Encounter')).toHaveLength(2);
	expect(modal.getByText('Reason for Closure:')).toBeInTheDocument();
	expect(modal.getAllByRole('radio')).toHaveLength(6);
	expect(modal.getAllByRole('radio', { name: 'Option' })).toHaveLength(5);
	expect(modal.getByRole('radio', { name: 'Other' })).toBeInTheDocument();
	expect(closeEncounterButton).toBeDisabled();

	fireEvent.click(modal.getByRole('radio', { name: 'Other' }));
	expect(closeEncounterButton).toBeEnabled();

	fireEvent.click(modal.getByRole('button', { name: 'Cancel' }));
	await waitFor(() => expect(screen.queryByText('Reason for Closure:')).not.toBeInTheDocument());
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?status=OPEN');

	fireEvent.click(openModalButton);
	dialog = await findCloseEncounterDialog();
	modal = within(dialog);
	expect(modal.getByRole('button', { name: 'Close Encounter' })).toBeDisabled();
});

it('dismisses the close encounter modal without changing the shelf route', async () => {
	const router = renderEncounters('/admin/encounters/care-encounter-1?source=admin&status=OPEN');

	const openModalButton = await screen.findByRole('button', { name: 'Close Encounter' });
	fireEvent.click(openModalButton);

	let dialog = await findCloseEncounterDialog();
	fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
	await waitFor(() => expect(screen.queryByText('Reason for Closure:')).not.toBeInTheDocument());

	fireEvent.click(openModalButton);
	dialog = await findCloseEncounterDialog();
	const modal = within(dialog);
	fireEvent.click(modal.getAllByRole('radio', { name: 'Option' })[0]);
	fireEvent.click(modal.getByRole('button', { name: 'Close Encounter' }));

	await waitFor(() => expect(screen.queryByText('Reason for Closure:')).not.toBeInTheDocument());
	expect(router.state.location.pathname).toBe('/admin/encounters/care-encounter-1');
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});

it('dismisses a directly linked shelf with Escape and preserves its query parameters', async () => {
	const router = renderEncounters('/admin/encounters/care-encounter-1?source=admin&status=OPEN');

	await screen.findByRole('heading', { name: 'Firstname Lastname' });
	fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

	await waitFor(() => expect(router.state.location.pathname).toBe('/admin/encounters'));
	expect(router.state.location.search).toBe('?source=admin&status=OPEN');
});
